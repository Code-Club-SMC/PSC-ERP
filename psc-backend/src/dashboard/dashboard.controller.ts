import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ModuleAccess } from 'src/common/decorators/module-access.decorator';
import { MODULES } from 'src/common/constants/modules.constants';

@Controller('dashboard')
@ModuleAccess(MODULES.DASHBOARD)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(@Query('from') from?: string, @Query('to') to?: string) {
    return this.dashboardService.getStats(from, to);
  }
}
