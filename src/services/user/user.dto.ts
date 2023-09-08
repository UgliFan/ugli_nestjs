import { IsString, IsDefined, IsNotEmpty } from 'class-validator';
import { User } from '@app/modules/user/user.schema';

export class AuthLoginDTO {
  @IsString({ message: 'password must be string type' })
  @IsNotEmpty({ message: 'password?' })
  @IsDefined()
  password: string;
}

export class UserCreateDTO extends User {
  new_password?: string;
}
