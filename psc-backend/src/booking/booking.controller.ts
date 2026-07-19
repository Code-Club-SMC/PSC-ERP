import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { JwtAccGuard } from 'src/common/guards/jwt-access.guard';
import { BookingDto } from './dtos/booking.dto';
import { PaymentMode } from '@prisma/client';
import { ContentService } from 'src/content/content.service';
import {
  ActionAccess,
  ModuleAccess,
} from 'src/common/decorators/module-access.decorator';
import { MODULES } from 'src/common/constants/modules.constants';
import {
  hasPermissionAction,
  PermissionAction,
} from 'src/common/utils/permissions';
import { RolesEnum } from 'src/common/constants/roles.enum';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('booking')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly contentService: ContentService,
    private readonly prisma: PrismaService,
  ) { }

  private bookingModuleFromCategory(category?: string) {
    switch (category) {
      case 'Room':
        return MODULES.ROOM_BOOKINGS;
      case 'Hall':
        return MODULES.HALL_BOOKINGS;
      case 'Lawn':
        return MODULES.LAWN_BOOKINGS;
      case 'Photoshoot':
        return MODULES.PHOTOSHOOT_BOOKINGS;
      default:
        throw new BadRequestException('Invalid booking category');
    }
  }

  private bookingModuleFromBookingFor(bookingFor?: string) {
    switch (bookingFor) {
      case 'rooms':
      case 'room_aff':
        return MODULES.ROOM_BOOKINGS;
      case 'halls':
        return MODULES.HALL_BOOKINGS;
      case 'lawns':
        return MODULES.LAWN_BOOKINGS;
      case 'photoshoots':
        return MODULES.PHOTOSHOOT_BOOKINGS;
      default:
        throw new BadRequestException('Invalid booking type');
    }
  }

  private async assertBookingModuleAccess(
    req: { user?: { id?: string | number; role?: string; permissions?: unknown } },
    moduleName: string,
    action: PermissionAction,
  ) {
    const adminId = Number(req.user?.id);
    if (!Number.isInteger(adminId)) {
      throw new ForbiddenException('Invalid admin session');
    }

    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: { role: true, permissions: true },
    });
    if (!admin) throw new ForbiddenException('Admin account no longer exists');

    req.user = { ...req.user, role: admin.role, permissions: admin.permissions };
    if (admin.role === RolesEnum.SUPER_ADMIN) return;
    if (hasPermissionAction(admin.permissions, [moduleName], action)) return;

    throw new ForbiddenException(
      `${action.toUpperCase()} access is required for ${moduleName}`,
    );
  }

  @ModuleAccess(MODULES.BOOKINGS)
  @ActionAccess('update')
  @Get('lock')
  async lockBookings() {
    return await this.bookingService.lock();
  }

  @UseGuards(JwtAccGuard)
  @Get('voucher')
  async getVouchers(
    @Query('bookingType') bookingType: string,
    @Query('bookingId', new ParseIntPipe({ optional: true }))
    bookingId?: number,
  ) {
    if (!bookingId) {
      throw new BadRequestException(
        'bookingId is required and must be an integer',
      );
    }
    return await this.bookingService.getVouchersByBooking(
      bookingType,
      bookingId,
    );
  }

  @ModuleAccess(MODULES.BOOKINGS)
  @Patch('voucher/update-status')
  async updateVoucherStatus(
    @Body() payload: { voucherId: number; status: string },
    @Req() req: any,
  ) {
    const adminName = req.user?.name || 'system';
    return await this.bookingService.updateVoucherStatus(
      payload.voucherId.toString(),
      payload.status as 'PENDING' | 'CONFIRMED' | 'CANCELLED',
      adminName,
    );
  }

  // booking //

  @UseGuards(JwtAccGuard)
  @Post('create/booking')
  async createBooking(@Body() payload: BookingDto, @Req() req: any) {
    await this.assertBookingModuleAccess(
      req,
      this.bookingModuleFromCategory(payload.category),
      'create',
    );
    const adminName = req.user?.name || 'system';
    // console.log(payload)
    if (payload.category === 'Room')
      return await this.bookingService.cBookingRoom(
        {
          ...payload,
          paymentMode: payload.paymentMode || PaymentMode.CASH,
        },
        adminName,
      );
    else if (payload.category === 'Hall')
      return await this.bookingService.cBookingHall(
        {
          ...payload,
          paymentMode: payload.paymentMode || PaymentMode.CASH,
        },
        adminName,
      );
    else if (payload.category === 'Lawn')
      return await this.bookingService.cBookingLawn(
        {
          ...payload,
          paymentMode: payload.paymentMode || PaymentMode.CASH,
        },
        adminName,
      );
    else if (payload.category === 'Photoshoot')
      return await this.bookingService.cBookingPhotoshoot(
        {
          ...payload,
          paymentMode: payload.paymentMode || PaymentMode.CASH,
        },
        adminName,
      );
  }

  @UseGuards(JwtAccGuard)
  @Patch('update/booking')
  async updateBooking(@Body() payload: Partial<BookingDto>, @Req() req: any) {
    await this.assertBookingModuleAccess(
      req,
      this.bookingModuleFromCategory(payload.category),
      'update',
    );
    const adminName = req.user?.name || 'system';
    if (payload.category === 'Room')
      return await this.bookingService.uBookingRoom(
        {
          ...payload,
          paymentMode: payload.paymentMode || PaymentMode.CASH,
        },
        adminName,
      );
    else if (payload.category === 'Hall')
      return await this.bookingService.uBookingHall(
        {
          ...payload,
          paymentMode: payload.paymentMode || PaymentMode.CASH,
        },
        adminName,
      );
    else if (payload.category === 'Lawn')
      return await this.bookingService.uBookingLawn(
        {
          ...payload,
          paymentMode: payload.paymentMode || PaymentMode.CASH,
        },
        adminName,
      );
    else if (payload.category === 'Photoshoot')
      return await this.bookingService.uBookingPhotoshoot(
        {
          ...payload,
          paymentMode: payload.paymentMode || PaymentMode.CASH,
        },
        adminName,
      );
  }

  @UseGuards(JwtAccGuard)
  @Get('get/bookings/all')
  async getBookings(
    @Query('bookingsFor') bookingFor: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('membershipNo') membershipNo?: string,
    @Query('bookingId', new ParseIntPipe({ optional: true })) bookingId?: number,
    @Query('checkIn') checkIn?: string,
    @Query('checkOut') checkOut?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Req() req?: any,
  ) {
    await this.assertBookingModuleAccess(
      req,
      this.bookingModuleFromBookingFor(bookingFor),
      'read',
    );
    const search = { membershipNo, bookingId, checkIn, checkOut, paymentStatus };
    if (bookingFor === 'rooms')
      return this.bookingService.gBookingsRoom(page, limit, search);
    if (bookingFor === 'halls')
      return this.bookingService.gBookingsHall(page, limit, search);
    if (bookingFor === 'lawns')
      return this.bookingService.gBookingsLawn(page, limit, search);
    if (bookingFor === 'photoshoots')
      return this.bookingService.gBookingPhotoshoot(page, limit, search);
  }

  @UseGuards(JwtAccGuard)
  @Get('get/bookings/cancelled')
  async getCancelledBookings(
    @Query('bookingsFor') bookingFor: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('membershipNo') membershipNo?: string,
    @Query('bookingId', new ParseIntPipe({ optional: true })) bookingId?: number,
    @Query('checkIn') checkIn?: string,
    @Query('checkOut') checkOut?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Req() req?: any,
  ) {
    await this.assertBookingModuleAccess(
      req,
      this.bookingModuleFromBookingFor(bookingFor),
      'read',
    );
    const search = { membershipNo, bookingId, checkIn, checkOut, paymentStatus };
    if (bookingFor === 'rooms')
      return this.bookingService.gCancelledBookingsRoom(page, limit, search);
    if (bookingFor === 'halls')
      return this.bookingService.gCancelledBookingsHall(page, limit, search);
    if (bookingFor === 'lawns')
      return this.bookingService.gCancelledBookingsLawn(page, limit, search);
    if (bookingFor === 'photoshoots')
      return this.bookingService.gCancelledBookingsPhotoshoot(page, limit, search);
  }

  @UseGuards(JwtAccGuard)
  @Get('get/bookings/cancellation-requests')
  async getCancellationRequests(
    @Query('bookingsFor') bookingFor: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('membershipNo') membershipNo?: string,
    @Query('bookingId', new ParseIntPipe({ optional: true })) bookingId?: number,
    @Query('checkIn') checkIn?: string,
    @Query('checkOut') checkOut?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Req() req?: any,
  ) {
    await this.assertBookingModuleAccess(
      req,
      this.bookingModuleFromBookingFor(bookingFor),
      'read',
    );
    const search = { membershipNo, bookingId, checkIn, checkOut, paymentStatus };
    if (bookingFor === 'rooms')
      return this.bookingService.gCancellationRequestsRoom(page, limit, search);
    if (bookingFor === 'halls')
      return this.bookingService.gCancellationRequestsHall(page, limit, search);
    if (bookingFor === 'lawns')
      return this.bookingService.gCancellationRequestsLawn(page, limit, search);
  }

  @UseGuards(JwtAccGuard)
  @Get('get/bookings/closed')
  async getClosedBookings(
    @Query('bookingsFor') bookingFor: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('membershipNo') membershipNo?: string,
    @Query('bookingId', new ParseIntPipe({ optional: true })) bookingId?: number,
    @Query('checkIn') checkIn?: string,
    @Query('checkOut') checkOut?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Req() req?: any,
  ) {
    await this.assertBookingModuleAccess(
      req,
      this.bookingModuleFromBookingFor(bookingFor),
      'read',
    );
    const search = { membershipNo, bookingId, checkIn, checkOut, paymentStatus };
    if (bookingFor === 'rooms')
      return this.bookingService.gClosedBookingsRoom(page, limit, search);
    if (bookingFor === 'halls')
      return this.bookingService.gClosedBookingsHall(page, limit, search);
    if (bookingFor === 'lawns')
      return this.bookingService.gClosedBookingsLawn(page, limit, search);
  }

  @UseGuards(JwtAccGuard)
  @Post('close/booking')
  async closeBooking(
    @Query('bookingFor') bookingFor: string,
    @Query('bookID') bookID: string,
    @Body() body: {
      refund?: boolean;
      paymentMode?: string;
      transaction_id?: string;
      bank_name?: string;
      check_number?: string;
      paid_at?: string;
    },
    @Req() req: any,
  ) {
    await this.assertBookingModuleAccess(
      req,
      this.bookingModuleFromBookingFor(bookingFor),
      'update',
    );
    const adminName = req.user?.name || 'system';
    const refundPayload = body.refund ? {
      paymentMode: body.paymentMode || 'CASH',
      transaction_id: body.transaction_id,
      bank_name: body.bank_name,
      check_number: body.check_number,
      paid_at: body.paid_at,
    } : undefined;

    if (bookingFor === 'rooms')
      return this.bookingService.closeBookingRoom(Number(bookID), refundPayload, adminName);
    if (bookingFor === 'room_aff')
      return this.bookingService.closeBookingRoomAff(Number(bookID), refundPayload, adminName);
    if (bookingFor === 'halls')
      return this.bookingService.closeBookingHall(Number(bookID), refundPayload, adminName);
    if (bookingFor === 'lawns')
      return this.bookingService.closeBookingLawn(Number(bookID), refundPayload, adminName);
  }

  @UseGuards(JwtAccGuard)
  @Post('cancelReqBooking')
  async cancelReqBooking(
    @Query('bookingFor') bookingFor: string,
    @Query('bookID') bookID: string,
    @Query('reason') reason: string,
    @Req() req: { user: { id: string; name: string; role?: string } },
  ) {
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;
    const isAdminRequester = requesterRole === 'ADMIN' || requesterRole === 'SUPER_ADMIN';
    const requestedBy = req.user?.name || requesterId || 'Member';

    if (isAdminRequester) {
      await this.assertBookingModuleAccess(
        req,
        this.bookingModuleFromBookingFor(bookingFor),
        'delete',
      );
    } else {
      await this.bookingService.assertBookingOwnership(
        bookingFor,
        Number(bookID),
        requesterId,
      );
    }

    if (bookingFor === 'rooms')
      return this.bookingService.cCancellationRequestRoom(Number(bookID), reason, requestedBy);
    if (bookingFor === 'room_aff')
      return this.bookingService.cCancellationRequestRoomAff(Number(bookID), reason, requestedBy);
    if (bookingFor === 'halls')
      return this.bookingService.cCancellationRequestHall(Number(bookID), reason, requestedBy);
    if (bookingFor === 'lawns')
      return this.bookingService.cCancellationRequestLawn(Number(bookID), reason, requestedBy);
    if (bookingFor === 'photoshoots')
      return this.bookingService.cCancellationRequestPhotoshoot(Number(bookID), reason, requestedBy);
  }

  @UseGuards(JwtAccGuard)
  @Patch('updateCancellationReq')
  async updateCancellationReq(
    @Query('bookingFor') bookingFor: string,
    @Query('bookID') bookID: string,
    @Query('status') status: 'APPROVED' | 'REJECTED',
    @Query('remarks') remarks?: string,
    @Req() req?: any,
  ) {
    await this.assertBookingModuleAccess(
      req,
      this.bookingModuleFromBookingFor(bookingFor),
      'update',
    );
    return this.bookingService.updateCancellationReq(
      bookingFor,
      Number(bookID),
      status,
      remarks,
    );
  }

  @UseGuards(JwtAccGuard)
  @Get('member/bookings')
  async getMemberBookings(@Req() req: { user: { id: string } }) {
    return await this.bookingService.getMemberBookings(req.user?.id);
  }

  @ModuleAccess(MODULES.ACCOUNTS, MODULES.BOOKINGS)
  @Get('admin/member/bookings')
  async getMemberBookingsAdmin(@Query('membershipNo') membershipNo: string) {
    return await this.bookingService.getMemberBookings(membershipNo);
  }

  ////////////////////////////////////////////////////////////////////////////

  @UseGuards(JwtAccGuard)
  @Get('member/bookings/all')
  async memberBookings(
    @Req() req: { user: { id: string } },
    @Query('type') type: 'Room' | 'Hall' | 'Lawn' | 'Photoshoot',
  ) {
    return await this.bookingService.memberBookings(req.user?.id, type);
  }

  @ModuleAccess(MODULES.ACCOUNTS, MODULES.BOOKINGS)
  @Get('admin/member/bookings/all')
  async adminMemberBookings(
    @Query('type') type: 'Room' | 'Hall' | 'Lawn' | 'Photoshoot',
    @Query('membership_no') membershipNo: string,
  ) {
    return await this.bookingService.memberBookings(membershipNo, type);
  }

  // fetch unpaid online vouchers for timer
  @UseGuards(JwtAccGuard)
  @Get('vouchers/unpaid/countdown')
  async unpaidVouchersForTimer(@Req() req: { user: { id: string } }) {
    return await this.bookingService.unpaidTimerVouchers(req?.user?.id)
  }

  // rules
  @UseGuards(JwtAccGuard)
  @Get('hall/rule')
  async hallRule() {
    return await this.contentService.getClubRules('HALL');
  }
  @UseGuards(JwtAccGuard)
  @Get('room/rule')
  async RoomRule() {
    return await this.contentService.getClubRules('ROOM');
  }
  @UseGuards(JwtAccGuard)
  @Get('lawn/rule')
  async LawnRule() {
    return await this.contentService.getClubRules('LAWN');
  }
  @UseGuards(JwtAccGuard)
  @Get('photo/rule')
  async PhotoRule() {
    return await this.contentService.getClubRules('PHOTOSHOOT');
  }

  @UseGuards(JwtAccGuard)
  @Delete('cancel-unpaid')
  async cancelUnpaidBooking(
    @Query('consumer_number') consumer_number: string,
    @Req() req: { user: { id: string } },
  ) {
    return await this.bookingService.cancelUnpaidBooking(consumer_number, req.user?.id);
  }

  @ModuleAccess(MODULES.BOOKINGS)
  @ActionAccess('update')
  @Get('sync/guest-rooms')
  async getGuestRoomData() {
    return await this.bookingService.sync();
  }

  @ModuleAccess(MODULES.BOOKINGS)
  @ActionAccess('update')
  @Post('sync/response')
  async syncResponse(
    @Body()
    payload: {
      results: {
        booking_id: number;
        local_sync_id: string;
        local_sync_status: number;
        local_sync_message: string;
      }[];
    },
  ) {
    return await this.bookingService.syncResponse(payload);
  }


}
