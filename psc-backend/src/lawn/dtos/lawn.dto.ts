import { IsNotEmpty, IsOptional, Matches } from 'class-validator';
import {
  NON_NEGATIVE_DECIMAL_PATTERN,
  NON_NEGATIVE_INTEGER_PATTERN,
  VALIDATION_MESSAGES,
} from 'src/common/validation/patterns';

export class LawnOutOfOrderDto {
  @IsOptional()
  id?: number;
  @IsNotEmpty({ message: 'reason must be provided' })
  reason: string;
  @IsNotEmpty({ message: 'start date must be provided' })
  startDate: string;
  @IsNotEmpty({ message: 'end date must be provided' })
  endDate: string;
}

export class LawnDto {
  @IsOptional() id?: string;
  @IsOptional() description?: string;
  @IsNotEmpty() lawnCategoryId: string;
  @Matches(NON_NEGATIVE_INTEGER_PATTERN, { message: VALIDATION_MESSAGES.integer })
  @IsNotEmpty() minGuests: string;
  @Matches(NON_NEGATIVE_INTEGER_PATTERN, { message: VALIDATION_MESSAGES.integer })
  @IsNotEmpty() maxGuests: string;
  @Matches(NON_NEGATIVE_DECIMAL_PATTERN, { message: VALIDATION_MESSAGES.decimal })
  @IsNotEmpty() memberCharges: string;
  @Matches(NON_NEGATIVE_DECIMAL_PATTERN, { message: VALIDATION_MESSAGES.decimal })
  @IsNotEmpty() guestCharges: string;
  @Matches(NON_NEGATIVE_DECIMAL_PATTERN, { message: VALIDATION_MESSAGES.decimal })
  @IsNotEmpty() corporateCharges: string;
  @Matches(NON_NEGATIVE_INTEGER_PATTERN, { message: VALIDATION_MESSAGES.integer })
  @IsNotEmpty() order: string;
  @IsNotEmpty({ message: 'lawn activity must be provided' })
  isActive: boolean | string;
  @IsOptional()
  isOutOfService?: boolean;
  @IsOptional() outOfOrders?: LawnOutOfOrderDto[];
}
