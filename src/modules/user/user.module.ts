import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserController } from './user.controller';
import { UserService } from '@app/services/user/user.service';
import { AUTH } from '@app/configs/app.config';
import { UserProvider } from './user.schema';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      privateKey: AUTH.jwtSecret,
      signOptions: {
        expiresIn: AUTH.expiresIn,
      },
    }),
  ],
  controllers: [UserController],
  providers: [UserProvider, UserService, JwtStrategy],
  exports: [UserService],
})
export class UserModule {}
