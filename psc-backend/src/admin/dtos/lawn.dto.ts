import { IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { NON_NEGATIVE_DECIMAL_PATTERN, NON_NEGATIVE_INTEGER_PATTERN, VALIDATION_MESSAGES } from 'src/common/validation/patterns';

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
  @IsOptional() isOutOfService?: string | boolean;
  @IsOptional() outOfServiceReason?: string;
  @IsOptional() outOfServiceUntil?: string;
  @IsOptional() existingimgs?: string | string[];
  @IsOptional() files?: Express.Multer.File[];
}
