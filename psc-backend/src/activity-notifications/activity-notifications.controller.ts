import { Body, Controller, Delete, Get, Param, Patch, Query, Req } from '@nestjs/common';
import { ModuleAccess } from 'src/common/decorators/module-access.decorator';
import { ActivityNotificationsService } from './activity-notifications.service';

@ModuleAccess()
@Controller('activity-notifications')
export class ActivityNotificationsController {
  constructor(private readonly activityNotificationsService: ActivityNotificationsService) {}

  @Get()
  getMine(
    @Req() req: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
  ) {
    return this.activityNotificationsService.getForAdmin(Number(req.user.id), {
      from,
      to,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Patch(':id/read')
  markRead(@Req() req: any, @Param('id') id: string) {
    return this.activityNotificationsService.markRead(Number(req.user.id), Number(id));
  }

  @Patch('read-all')
  markAllRead(@Req() req: any) {
    return this.activityNotificationsService.markAllRead(Number(req.user.id));
  }

  @Delete(':id')
  deleteOne(@Req() req: any, @Param('id') id: string) {
    return this.activityNotificationsService.softDelete(Number(req.user.id), Number(id));
  }

  @Delete()
  deleteBulk(@Req() req: any, @Body() body: { ids?: number[] }) {
    return this.activityNotificationsService.softDeleteMany(Number(req.user.id), body?.ids || []);
  }
}
