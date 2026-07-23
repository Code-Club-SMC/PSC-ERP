import { IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { NON_NEGATIVE_DECIMAL_PATTERN, VALIDATION_MESSAGES } from 'src/common/validation/patterns';

export class PhotoShootDto {
  @IsOptional()
  id?: string;
  @IsOptional()
  description?: string;
  @IsNotEmpty({ message: 'Member Charges should be provided' })
  @Matches(NON_NEGATIVE_DECIMAL_PATTERN, { message: VALIDATION_MESSAGES.decimal })
  memberCharges: string;
  @IsNotEmpty({ message: 'Guest Charges should be provided' })
  @Matches(NON_NEGATIVE_DECIMAL_PATTERN, { message: VALIDATION_MESSAGES.decimal })
  guestCharges: string;
  @IsOptional()
  outOfOrders?: any[];
}
