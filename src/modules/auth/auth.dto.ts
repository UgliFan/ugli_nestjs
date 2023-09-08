import { IsString, IsDefined, IsNotEmpty } from 'class-validator';
import { Auth } from './auth.schema';

export class AuthLoginDTO {
  @IsString({ message: 'password must be string type' })
  @IsNotEmpty({ message: 'password?' })
  @IsDefined()
  password: string;
}

export class AuthUpdateDTO extends Auth {
  new_password?: string;
}
