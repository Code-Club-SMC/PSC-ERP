import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { EMAIL_WITH_MIN_LOCAL_PATTERN, VALIDATION_MESSAGES } from 'src/common/validation/patterns';

export class VerifyOtpDto {
  @IsNotEmpty({ message: 'Email is required' })
  @Matches(EMAIL_WITH_MIN_LOCAL_PATTERN, { message: VALIDATION_MESSAGES.email })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'OTP is required' })
  code: string;
}
