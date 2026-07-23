import { IsNotEmpty, IsOptional, Matches, MaxLength } from 'class-validator';
import { MemberStatus } from '@prisma/client';
import {
  EMAIL_WITH_MIN_LOCAL_PATTERN,
  NON_NEGATIVE_DECIMAL_PATTERN,
  PAKISTAN_PHONE_PATTERN,
  VALIDATION_MESSAGES,
} from 'src/common/validation/patterns';

export class CreateMemberDto {
  @IsOptional()
  Sno?: number;
  @IsNotEmpty({ message: 'Member ID cannot be empty' })
  Membership_No: string;

  @IsNotEmpty({ message: 'Name cannot be empty' })
  @MaxLength(120, { message: 'Name cannot exceed 120 characters' })
  Name: string;

  @IsNotEmpty({ message: 'Email cannot be empty' })
  @Matches(EMAIL_WITH_MIN_LOCAL_PATTERN, { message: VALIDATION_MESSAGES.email })
  Email: string;

  @IsNotEmpty({ message: 'Phone cannot be empty' })
  @Matches(PAKISTAN_PHONE_PATTERN, { message: VALIDATION_MESSAGES.phone })
  Contact_No: string;

  @IsNotEmpty({ message: 'Status cannot be empty' })
  Actual_Status: MemberStatus;

  @IsOptional()
  @Matches(NON_NEGATIVE_DECIMAL_PATTERN, { message: VALIDATION_MESSAGES.decimal })
  Balance?: string;
  @IsOptional()
  memberType?: string;
  @IsOptional()
  Other_Details?: string;

  @IsOptional()
  otp?: string;
  @IsOptional()
  otpExpiry?: string;
}
