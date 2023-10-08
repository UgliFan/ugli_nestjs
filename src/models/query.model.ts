import { AuthInject } from '@app/interfaces/auth.interface';
import { IsOptional, IsNotEmpty, IsDateString, IsString } from 'class-validator';

// https://www.progress.com/blogs/understanding-iso-8601-date-and-time-format
export class DateQueryDTO {
  @IsDateString()
  @IsNotEmpty()
  @IsOptional()
  date?: string;
}

export class KeywordQueryDTO {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  keyword?: string;
}

// MARK: example
export class AuthQueryDTO {
  auth?: AuthInject['auth'];
}
