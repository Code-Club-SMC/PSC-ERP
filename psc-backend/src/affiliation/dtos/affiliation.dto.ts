import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsNotEmpty,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { PaymentMode, PaymentStatus } from '@prisma/client';
import {
  CNIC_PATTERN,
  EMAIL_WITH_MIN_LOCAL_PATTERN,
  NON_NEGATIVE_DECIMAL_PATTERN,
  NON_NEGATIVE_INTEGER_PATTERN,
  PAKISTAN_PHONE_PATTERN,
  VALIDATION_MESSAGES,
} from 'src/common/validation/patterns';

export class CreateAffiliatedClubDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  @Matches(PAKISTAN_PHONE_PATTERN, { message: VALIDATION_MESSAGES.phone })
  contactNo?: string;

  @IsOptional()
  @IsString()
  @Matches(EMAIL_WITH_MIN_LOCAL_PATTERN, { message: VALIDATION_MESSAGES.email })
  email?: string;

  @IsOptional()
  @IsString()
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @Type(() => Boolean)
  @IsNotEmpty()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  order?: number;
}

export class UpdateAffiliatedClubDto {
  @Type(() => Number)
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  @Matches(PAKISTAN_PHONE_PATTERN, { message: VALIDATION_MESSAGES.phone })
  contactNo?: string;

  @IsOptional()
  @IsString()
  @Matches(EMAIL_WITH_MIN_LOCAL_PATTERN, { message: VALIDATION_MESSAGES.email })
  email?: string;

  @IsOptional()
  @IsString()
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @Type(() => Boolean)
  @IsNotEmpty()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  order?: number;
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class CreateAffiliatedClubRequestDto {
  @IsNotEmpty({ message: 'membership number must be provided' })
  @Type(() => String)
  membershipNo: string;

  @IsNotEmpty({ message: 'affiliated club must be selected' })
  @Type(() => Number)
  affiliatedClubId: number;

  @IsNotEmpty({ message: 'requested date must be provided' })
  requestedDate: string;
}

export class UpdateRequestStatusDto {
  @IsNumber()
  id: number;

  @IsEnum(RequestStatus)
  status: RequestStatus;
}

export class CreateAffClubBookingCancellationDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateAffClubBookingCancellationDto {
  @IsEnum(RequestStatus)
  status: RequestStatus;

  @IsOptional()
  @IsString()
  adminRemarks?: string;
}
export class AffiliatedRoomBookingDto {
  @IsNotEmpty({ message: 'Affiliated club must be selected' })
  @Type(() => Number)
  @IsNumber()
  affiliatedClubId: number;

  @IsNotEmpty({ message: 'Affiliated membership number must be provided' })
  @IsString()
  affiliatedMembershipNo: string;

  @IsNotEmpty({ message: 'Total Price must be specified' })
  @Matches(NON_NEGATIVE_DECIMAL_PATTERN, { message: VALIDATION_MESSAGES.decimal })
  totalPrice: string;

  @IsEnum(PaymentStatus, {
    message: 'Payment status must be UNPAID, HALF_PAID, PAID, or TO_BILL',
  })
  paymentStatus: PaymentStatus;

  @IsEnum(PaymentMode, { message: 'payment mode must be provided' })
  paymentMode: PaymentMode;

  @IsOptional()
  paidAmount: string | number;

  @IsOptional()
  @IsString()
  checkIn?: string;

  @IsOptional()
  @IsString()
  checkOut?: string;

  @IsOptional()
  selectedRoomIds?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  numberOfAdults?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  numberOfChildren?: number;

  @IsOptional()
  specialRequests?: string;

  @IsOptional()
  @MaxLength(120, { message: 'Guest name cannot exceed 120 characters' })
  guestName?: string;

  @IsOptional()
  @Matches(PAKISTAN_PHONE_PATTERN, { message: VALIDATION_MESSAGES.phone })
  guestContact?: string;

  @IsOptional()
  @Matches(CNIC_PATTERN, { message: VALIDATION_MESSAGES.cnic })
  guestCNIC?: string;

  @IsOptional()
  heads?: { head: string; amount: number }[];

  @IsOptional()
  @IsString()
  @MaxLength(120, { message: 'Transaction ID cannot exceed 120 characters' })
  transaction_id?: string;
  @IsOptional()
  @IsString()
  @MaxLength(120, { message: 'Bank name cannot exceed 120 characters' })
  bank_name?: string;
  @IsOptional()
  @IsString()
  paid_at?: string;

  @IsOptional()
  @IsString()
  @Matches(NON_NEGATIVE_INTEGER_PATTERN, { message: VALIDATION_MESSAGES.integer })
  card_number?: string;

  @IsOptional()
  @IsString()
  @Matches(NON_NEGATIVE_INTEGER_PATTERN, { message: VALIDATION_MESSAGES.integer })
  check_number?: string;
}

export class UpdateAffiliatedRoomBookingDto extends AffiliatedRoomBookingDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  id: number;
}
