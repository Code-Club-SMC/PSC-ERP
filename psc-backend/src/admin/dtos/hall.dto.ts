import { IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { NON_NEGATIVE_DECIMAL_PATTERN, NON_NEGATIVE_INTEGER_PATTERN, VALIDATION_MESSAGES } from 'src/common/validation/patterns';

export class HallDto {
  @IsOptional()
  id?: string;
  @IsNotEmpty({ message: 'hall name must be provided' })
  name: string;
  @IsOptional()
  description?: string;

  @IsNotEmpty({ message: 'hall capacity must be provided' })
  @Matches(NON_NEGATIVE_INTEGER_PATTERN, { message: VALIDATION_MESSAGES.integer })
  capacity: string;
  @IsNotEmpty({ message: 'hall charges for members must be provided' })
  @Matches(NON_NEGATIVE_DECIMAL_PATTERN, { message: VALIDATION_MESSAGES.decimal })
  chargesMembers: string;
  @IsNotEmpty({ message: 'hall charges for guests must be provided' })
  @Matches(NON_NEGATIVE_DECIMAL_PATTERN, { message: VALIDATION_MESSAGES.decimal })
  chargesGuests: string;

  @IsNotEmpty({ message: 'hall activity must be provided' })
  isActive: boolean | string;
  @IsNotEmpty({ message: 'hall activity must be provided' })
  isOutOfService: boolean | string;

  @IsOptional()
  outOfServiceReason?: string;
  @IsOptional()
  outOfServiceFrom?: string;
  @IsOptional()
  outOfServiceUntil?: string;

  @IsOptional()
  existingimgs?: string[];
  @IsOptional()
  files?: Express.Multer.File[];
}
