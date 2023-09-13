import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { AUTH } from '@app/configs/app.config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      privateKey: AUTH.jwtSecret,
      signOptions: {
        expiresIn: AUTH.expiresIn,
      },
    }),
  ],
  controllers: [WeatherController],
  providers: [WeatherService],
  exports: [WeatherService],
})
export class WeatherModule {}
