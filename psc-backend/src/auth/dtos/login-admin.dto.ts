import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { EMAIL_WITH_MIN_LOCAL_PATTERN, VALIDATION_MESSAGES } from 'src/common/validation/patterns';

export class LoginAdminDto {
  @IsNotEmpty({ message: 'Email is required' })
  @Matches(EMAIL_WITH_MIN_LOCAL_PATTERN, { message: VALIDATION_MESSAGES.email })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
