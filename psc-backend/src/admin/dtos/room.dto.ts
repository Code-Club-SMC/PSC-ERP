import { IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { NON_NEGATIVE_INTEGER_PATTERN, VALIDATION_MESSAGES } from 'src/common/validation/patterns';

export class RoomDto {
  @IsOptional()
  id?: string | number;
  @IsNotEmpty({ message: 'Room Number must be provied' })
  @Matches(NON_NEGATIVE_INTEGER_PATTERN, { message: VALIDATION_MESSAGES.integer })
  roomNumber: string;
  @IsNotEmpty({ message: 'Room type must be provided' })
  roomTypeId: string;
  @IsOptional()
  description?: string;

  @IsNotEmpty({ message: 'Activity must be provided' })
  isActive: boolean | string;
  @IsNotEmpty({ message: 'OutofOrder must be provided' })
  isOutOfOrder: boolean | string;

  @IsOptional()
  existingimgs?: string[];
  @IsOptional()
  files?: Express.Multer.File[];

  @IsOptional()
  outOfOrderFrom?: string;

  @IsOptional()
  outOfOrderUntil?: string;

  @IsOptional()
  outOfOrderReason?: string;
}
