import { prop, modelOptions } from '@typegoose/typegoose';
import { IsString, IsDefined, IsOptional, IsBoolean } from 'class-validator';
import { getProviderByTypegooseClass } from '@app/transformers/model.transformer';

export const DEFAULT_AUTH = Object.freeze<Auth>({
  name: '',
  email: '',
  slogan: '',
  avatar: '',
  sex: 1,
});

@modelOptions({
  schemaOptions: {
    versionKey: false,
  },
})
export class Auth {
  @IsString({ message: "what's your name?" })
  @IsOptional()
  @prop({ default: '' })
  name: string;

  @IsString({ message: '' })
  @IsDefined()
  @prop({ required: true })
  email: string;

  @IsString()
  @IsOptional()
  @prop({ select: false })
  phone?: string;

  @IsString()
  @IsOptional()
  @prop({ default: '' })
  slogan?: string;

  @IsString()
  @IsOptional()
  @prop({ default: '' })
  avatar?: string;

  @IsOptional()
  @prop({ default: 1 })
  sex: number;

  @IsString()
  @prop({ select: false })
  password?: string;

  @IsBoolean()
  @IsOptional()
  @prop({ default: false, select: false })
  active?: boolean;
}

export const AuthProvider = getProviderByTypegooseClass(Auth);
