import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { EMAIL_WITH_MIN_LOCAL_PATTERN, VALIDATION_MESSAGES } from 'src/common/validation/patterns';

enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
}

export class CreateAdminDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @Matches(EMAIL_WITH_MIN_LOCAL_PATTERN, { message: VALIDATION_MESSAGES.email })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsEnum(AdminRole, { message: 'Role must be either SUPER_ADMIN or ADMIN' })
  role: AdminRole;

  @IsOptional()
  updates?: any;
}
