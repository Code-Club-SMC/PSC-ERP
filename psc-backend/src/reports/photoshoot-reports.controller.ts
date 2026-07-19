import { Controller, Get, Query } from '@nestjs/common';
import { PhotoshootReportsService } from './photoshoot-reports.service';
import { ModuleAccess } from 'src/common/decorators/module-access.decorator';
import { MODULES } from 'src/common/constants/modules.constants';

@Controller('reports/photoshoot')
@ModuleAccess(MODULES.PHOTOSHOOT_REPORTS)
export class PhotoshootReportsController {
  constructor(
    private readonly photoshootReportsService: PhotoshootReportsService,
  ) {}

  @Get('bookings')
  async getPhotoshootBookings(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('bookedBy') bookedBy?: string,
    @Query('memberNumber') memberNumber?: string,
    @Query('canceledBy') canceledBy?: string,
    @Query('bookedFor') bookedFor?: string,
  ) {
    return this.photoshootReportsService.getPhotoshootBookings({
      fromDate,
      toDate,
      bookedBy,
      memberNumber,
      canceledBy,
      bookedFor,
    });
  }
}
