import { Provider } from '@nestjs/common';
import { prop, modelOptions } from '@typegoose/typegoose';
import { IsString, IsDefined, IsOptional } from 'class-validator';
import { getProviderByTypegooseClass } from '@app/transformers/model.transformer';

export const DEFAULT_USER = Object.freeze<User>({
  email: '',
  name: '',
  phone: '',
  sex: 1,
  password: '',
});

@modelOptions({
  schemaOptions: {
    versionKey: false,
  },
})
export class User {
  @IsString({ message: '' })
  @IsDefined()
  @prop({ required: true })
  email: string;

  @IsString()
  @IsOptional()
  @prop({ default: '' })
  name: string;

  @IsString()
  @IsOptional()
  @prop({ default: '' })
  phone: string;

  @IsOptional()
  @prop({ default: 1 })
  sex: number;

  @IsString({ message: '' })
  @IsDefined()
  @prop({ required: true })
  password: string;
}

export const UserProvider: Provider = getProviderByTypegooseClass(User);
