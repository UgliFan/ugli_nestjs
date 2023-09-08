// https://docs.nestjs.com/security/authentication#implementing-passport-jwt
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { HttpUnauthorizedError } from '@app/errors/unauthorized.error';
import { UserService } from '@app/services/user/user.service';
import * as APP_CONFIG from '@app/configs/app.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: APP_CONFIG.AUTH.jwtSecret,
    });
  }

  findAll() {
    const data = this.userService.findAll();
    if (data) {
      return data;
    } else {
      throw new HttpUnauthorizedError();
    }
  }
}
