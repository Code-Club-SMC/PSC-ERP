import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestLogStatus, Role } from '@prisma/client';
import { from, Observable, throwError } from 'rxjs';
import { catchError, mergeMap, tap } from 'rxjs/operators';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from 'src/prisma/prisma.service';

type RequestUser = {
  id?: string | number;
  role?: string;
};

@Injectable()
export class UserRateLimitInterceptor implements NestInterceptor {
  private readonly windowSeconds = 60;

  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const user = request.user as RequestUser | undefined;

    if (!user?.id) {
      return next.handle();
    }

    const requiredModules = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    const isAdminRequest = this.isAdminRequest(user, requiredModules);
    const requestTo = this.resolveRequestTo(request, requiredModules);
    const madeAtCutoff = new Date(Date.now() - this.windowSeconds * 1000);
    const limit = this.resolveLimit(isAdminRequest);

    if (limit <= 0) {
      return next.handle();
    }

    const requestLog = isAdminRequest
      ? await this.checkAndCreateAdminLog(Number(user.id), requestTo, madeAtCutoff, limit)
      : await this.checkAndCreateMemberLog(String(user.id), requestTo, madeAtCutoff, limit);

    return next.handle().pipe(
      tap(() => {
        if (response.statusCode >= 400) {
          void this.markLogFailed(isAdminRequest, requestLog.reqid);
        }
      }),
      catchError((error) => {
        return from(this.markLogFailed(isAdminRequest, requestLog.reqid)).pipe(
          mergeMap(() => throwError(() => error)),
          catchError(() => throwError(() => error)),
        );
      }),
    );
  }

  private isAdminRequest(user: RequestUser, requiredModules?: string[]) {
    return Boolean(
      requiredModules?.length ||
        user.role === Role.ADMIN ||
        user.role === Role.SUPER_ADMIN,
    );
  }

  private resolveLimit(isAdminRequest: boolean) {
    const rawLimit = isAdminRequest
      ? process.env.API_RATE_LIMIT_ADMIN
      : process.env.API_RATE_LIMIT_MEMBER;
    const parsed = Number(rawLimit);

    if (Number.isInteger(parsed) && parsed >= 0) {
      return parsed;
    }

    return isAdminRequest ? 100 : 60;
  }

  private resolveRequestTo(request: any, requiredModules?: string[]) {
    if (requiredModules?.length) {
      return requiredModules[0];
    }

    const rawPath = String(request.originalUrl || request.url || request.path || '');
    const [pathWithoutQuery] = rawPath.split('?');
    const segments = pathWithoutQuery.split('/').filter(Boolean);
    const apiIndex = segments.findIndex((segment) => segment === 'api');

    return segments[apiIndex + 1] || segments[0] || 'unknown';
  }

  private markLogFailed(isAdminRequest: boolean, reqid: number) {
    return isAdminRequest
      ? this.prisma.adminRequestLog.update({
          where: { reqid },
          data: { responseStatus: RequestLogStatus.FAILED },
        })
      : this.prisma.memberRequestLog.update({
          where: { reqid },
          data: { responseStatus: RequestLogStatus.FAILED },
        });
  }

  private async checkAndCreateAdminLog(
    madeBy: number,
    requestTo: string,
    madeAt: Date,
    limit: number,
  ) {
    const requestCount = await this.prisma.adminRequestLog.count({
      where: {
        madeBy,
        requestTo,
        madeAt: { gte: madeAt },
      },
    });

    if (requestCount >= limit) {
      await this.prisma.adminRequestLog.create({
        data: {
          madeBy,
          requestTo,
          responseStatus: RequestLogStatus.FAILED,
        },
      });
      throw new HttpException(
        `Too many requests for ${requestTo}. Please try again after ${this.windowSeconds} seconds.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return this.prisma.adminRequestLog.create({
      data: {
        madeBy,
        requestTo,
        responseStatus: RequestLogStatus.SUCCEED,
      },
    });
  }

  private async checkAndCreateMemberLog(
    madeBy: string,
    requestTo: string,
    madeAt: Date,
    limit: number,
  ) {
    const requestCount = await this.prisma.memberRequestLog.count({
      where: {
        madeBy,
        requestTo,
        madeAt: { gte: madeAt },
      },
    });

    if (requestCount >= limit) {
      await this.prisma.memberRequestLog.create({
        data: {
          madeBy,
          requestTo,
          responseStatus: RequestLogStatus.FAILED,
        },
      });
      throw new HttpException(
        `Too many requests for ${requestTo}. Please try again after ${this.windowSeconds} seconds.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return this.prisma.memberRequestLog.create({
      data: {
        madeBy,
        requestTo,
        responseStatus: RequestLogStatus.SUCCEED,
      },
    });
  }
}
