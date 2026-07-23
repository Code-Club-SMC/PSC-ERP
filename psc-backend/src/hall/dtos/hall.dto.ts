import { IsNotEmpty, IsOptional, Matches } from 'class-validator';
import {
  NON_NEGATIVE_DECIMAL_PATTERN,
  NON_NEGATIVE_INTEGER_PATTERN,
  VALIDATION_MESSAGES,
} from 'src/common/validation/patterns';

export class OutOfOrderPeriod {
  @IsOptional()
  id?: string;
  @IsNotEmpty({ message: 'reason must be provided' })
  reason: string;
  @IsNotEmpty({ message: 'start date must be provided' })
  startDate: string;
  @IsNotEmpty({ message: 'end date must be provided' })
  endDate: string;
  @IsOptional()
  hallId?: string;
  @IsOptional()
  createdAt?: string;
  @IsOptional()
  updatedAt?: string;
}

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
  @IsOptional()
  @Matches(NON_NEGATIVE_DECIMAL_PATTERN, { message: VALIDATION_MESSAGES.decimal })
  chargesCorporate?: string;

  @IsNotEmpty({message: "order for hall must be provided"})
  order: number;

  @IsNotEmpty({ message: 'hall activity must be provided' })
  isActive: boolean | string;
  @IsOptional()
  isExclusive?: boolean | string;
  @IsOptional()
  isOutOfService?: boolean | string;
  @IsOptional()
  outOfOrders?: OutOfOrderPeriod[];
  @IsOptional()
  existingimgs?: string[];
  @IsOptional()
  files?: Express.Multer.File[];
}
