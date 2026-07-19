import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Res,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAccGuard } from 'src/common/guards/jwt-access.guard';
import { CreateMemberDto } from './dtos/create-member.dto';
import { MemberService } from './member.service';
import { NotificationService } from 'src/notification/notification.service';
import { ModuleAccess } from 'src/common/decorators/module-access.decorator';
import { MODULES } from 'src/common/constants/modules.constants';

@Controller('member')
export class MemberController {
  constructor(
    private member: MemberService,
    private notifications: NotificationService,
  ) {}

  @ModuleAccess(MODULES.MEMBERS)
  @Post('create/member')
  async createMember(@Body() payload: CreateMemberDto, @Req() req: any) {
    const adminName = req.user?.name || 'system';
    return this.member.createMember(payload, adminName);
  }

  @ModuleAccess(MODULES.MEMBERS)
  @Post('create/bulk/members')
  async createBulkMembers(@Body() payload: CreateMemberDto[], @Req() req: any) {
    const adminName = req.user?.name || 'system';
    return this.member.createBulk(payload, adminName);
  }

  @ModuleAccess(MODULES.MEMBERS)
  @Patch('update/member')
  async updateMember(
    @Query('memberID') memberID: string,
    @Body() payload: Partial<CreateMemberDto>,
    @Req() req: any,
  ) {
    const adminName = req.user?.name || 'system';
    return this.member.updateMember(memberID, payload, adminName);
  }

  @UseGuards(JwtAccGuard)
  @Patch('/fcm-token')
  async updateFCMToken(
    @Req() req: { user: { id: string } },
    @Body() payload: { fcmToken: string },
  ) {
    return this.member.updateFCMToken(req.user?.id, payload.fcmToken);
  }

  @ModuleAccess(MODULES.MEMBERS)
  @Delete('remove/member')
  async removeMember(@Query('memberID') memberID: string) {
    return this.member.removeMember(memberID);
  }

  @ModuleAccess(MODULES.MEMBERS)
  @Get('search/members')
  async searchMembers(@Query('searchFor') searchFor: string) {
    return await this.member.searchMembers(searchFor);
  }

  @ModuleAccess(MODULES.MEMBERS)
  @Get('get/members')
  async getMembers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return await this.member.getMembers({
      page,
      limit,
      search,
      status,
    });
  }

  @ModuleAccess(MODULES.MEMBERS)
  @Get('admin/search')
  async searchMembersAdmin(@Query('searchFor') searchFor: string) {
    return await this.member.searchMembers(searchFor);
  }

  @ModuleAccess(MODULES.MEMBERS)
  @Get('admin/get/members')
  async getMembersAdmin(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return await this.member.getMembers({
      page,
      limit,
      search,
      status,
    });
  }


  @Get('get/member')
  @UseGuards(JwtAccGuard)
  async getMember(@Req() req: {user: {id: string}}) {
    return await this.member.getMember(req.user?.id);
  }

  @UseGuards(JwtAccGuard)
  @Get('notifications')
  async getNotifications(@Req() req: { user: { id: string } }) {
    return await this.notifications.getMemberNotifications(req.user?.id);
  }
  @UseGuards(JwtAccGuard)
  @Get('notifications/un-seen-count')
  async getUnseenCount(@Req() req: { user: { id: string } }) {
    return await this.notifications.getUnseenNotificationsCount(req.user?.id);
  }
}
