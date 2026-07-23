import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Patch,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AffiliationService } from './affiliation.service';
import { BookingService } from 'src/booking/booking.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  CreateAffiliatedClubDto,
  UpdateAffiliatedClubDto,
  CreateAffiliatedClubRequestDto,
  UpdateRequestStatusDto,
  AffiliatedRoomBookingDto,
  UpdateAffiliatedRoomBookingDto,
} from './dtos/affiliation.dto';
import { JwtAccGuard } from 'src/common/guards/jwt-access.guard';
import { ModuleAccess } from 'src/common/decorators/module-access.decorator';
import { MODULES } from 'src/common/constants/modules.constants';

@Controller('affiliation')
export class AffiliationController {
  constructor(
    private affiliationService: AffiliationService,
    private bookingService: BookingService,
  ) { }

  // -------------------- AFFILIATED CLUBS --------------------

  @ModuleAccess(MODULES.AFFILIATED_CLUBS)
  @Get('clubs')
  async getAffiliatedClubs() {
    return await this.affiliationService.getAffiliatedClubs();
  }

  @ModuleAccess(MODULES.AFFILIATED_CLUBS)
  @Get('clubs/active')
  async getAffiliatedClubsActive() {
    return await this.affiliationService.getAffiliatedClubsActive();
  }

  @ModuleAccess(MODULES.AFFILIATED_CLUBS)
  @Get('clubs/:id')
  async getAffiliatedClubById(@Param('id') id: string) {
    return await this.affiliationService.getAffiliatedClubById(Number(id));
  }

  @ModuleAccess(MODULES.AFFILIATED_CLUBS)
  @Post('clubs')
  @UseInterceptors(FileInterceptor('image'))
  async createAffiliatedClub(
    @Body() body: CreateAffiliatedClubDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const adminName = req.user?.name || 'system';
    return await this.affiliationService.createAffiliatedClub(
      { ...body, order: body.order ? Number(body.order) : 0 },
      adminName,
      file,
    );
  }

  @ModuleAccess(MODULES.AFFILIATED_CLUBS)
  @Put('clubs')
  @UseInterceptors(FileInterceptor('image'))
  async updateAffiliatedClub(
    @Body() body: UpdateAffiliatedClubDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const adminName = req.user?.name || 'system';
    return await this.affiliationService.updateAffiliatedClub(
      { ...body, order: body.order ? Number(body.order) : undefined },
      adminName,
      file,
    );
  }

  @ModuleAccess(MODULES.AFFILIATED_CLUBS)
  @Delete('clubs/:id')
  async deleteAffiliatedClub(@Param('id') id: string) {
    return await this.affiliationService.deleteAffiliatedClub(Number(id));
  }

  // -------------------- AFFILIATED CLUB REQUESTS --------------------

  @ModuleAccess(MODULES.AFFILIATED_CLUBS)
  @Get('requests')
  async getAffiliatedClubRequests(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('clubId') clubId?: string,
  ) {
    return await this.affiliationService.getAffiliatedClubRequests(
      from,
      to,
      clubId ? Number(clubId) : undefined,
    );
  }

  @ModuleAccess(MODULES.AFFILIATED_CLUBS)
  @Get('requests/:id')
  async getRequestById(@Param('id') id: string) {
    return await this.affiliationService.getRequestById(Number(id));
  }

  @UseGuards(JwtAccGuard)
  @Post('requests')
  async createRequest(@Body() body: any, @Req() req: { user: { id: string } }) {
    const sender = req.user?.id;
    return await this.affiliationService.createRequest(
      { ...body, membershipNo: sender },
      sender,
    );
  }

  @ModuleAccess(MODULES.AFFILIATED_CLUBS)
  @Get('booking-stats')
  async getAffiliatedBookingStats(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return await this.affiliationService.getAffiliatedBookingStats(from, to);
  }

  @ModuleAccess(MODULES.AFFILIATED_CLUBS)
  @Get('bookings')
  async getRoomBookings(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('clubId') clubId?: string,
    @Query('status') status?: 'ACTIVE' | 'CANCELLED' | 'REQUESTS' | 'CLOSED',
    @Query('checkIn') checkIn?: string,
    @Query('checkOut') checkOut?: string,
  ) {
    return await this.affiliationService.getAffiliatedRoomBookings(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      clubId ? Number(clubId) : undefined,
      status,
      checkIn,
      checkOut,
    );
  }

  @ModuleAccess(MODULES.AFFILIATED_CLUBS)
  @Post('booking')
  async createRoomBooking(@Body() body: AffiliatedRoomBookingDto, @Req() req: any) {
    const adminName = req.user?.name || 'system';
    return await this.bookingService.cBookingRoomAff(body, adminName);
  }

  @ModuleAccess(MODULES.AFFILIATED_CLUBS)
  @Patch('booking/:id')
  async updateRoomBooking(
    @Param('id') id: string,
    @Body() body: UpdateAffiliatedRoomBookingDto,
    @Req() req: any,
  ) {
    const adminName = req.user?.name || 'system';
    return await this.bookingService.uBookingRoomAff({ ...body, id: Number(id) }, adminName);
  }
}
