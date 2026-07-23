import { IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { NON_NEGATIVE_DECIMAL_PATTERN, VALIDATION_MESSAGES } from 'src/common/validation/patterns';

export class RoomTypeDto {
  @IsNotEmpty({ message: 'Room type cannot be empty' })
  type: string;

  @IsNotEmpty({ message: 'Price for Member must be provided' })
  @Matches(NON_NEGATIVE_DECIMAL_PATTERN, { message: VALIDATION_MESSAGES.decimal })
  priceMember: number;
  @IsNotEmpty({ message: 'Price for Guest must be provided' })
  @Matches(NON_NEGATIVE_DECIMAL_PATTERN, { message: VALIDATION_MESSAGES.decimal })
  priceGuest: number;
  @IsNotEmpty({ message: 'Price for Forces must be provided' })
  @Matches(NON_NEGATIVE_DECIMAL_PATTERN, { message: VALIDATION_MESSAGES.decimal })
  priceForces: number;
  @IsOptional()
  existingimgs?: string[];
}
