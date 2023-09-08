import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthProvider } from './auth.schema';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AUTH } from '@app/configs/app.config';

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
  controllers: [AuthController],
  providers: [AuthProvider, AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
