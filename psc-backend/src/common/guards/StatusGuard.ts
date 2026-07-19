import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MemberService } from 'src/member/member.service';

@Injectable()
export class StatusGuard implements CanActivate {
  constructor(private memberService: MemberService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user } = request;

    // JWT subject is authoritative for member flows.
    const membership_no = user?.id;

    if (membership_no) {
      // check member status
      const member = await this.memberService.checkMemberStatus(membership_no);
      if (member?.Status === 'deactivated') {
        throw new HttpException(
          'Your account has been deactivated, so you cannot make bookings. please contact PSC.',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return true;
  }
}
