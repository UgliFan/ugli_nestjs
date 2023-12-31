import { Controller, Get, Put, Post, Body, UseGuards, HttpStatus } from '@nestjs/common';
import { AdminOnlyGuard } from '@app/guards/admin-only.guard';
import { IPService } from '@app/processors/helper/helper.service.ip';
import { Responser } from '@app/decorators/responser.decorator';
import { QueryParams, QueryParamsResult } from '@app/decorators/queryparams.decorator';
import { AuthLoginDTO, AuthUpdateDTO } from './auth.dto';
import { AuthService } from './auth.service';
import { RecoverBody, TokenResult, VerifyBody } from './auth.interface';
import { Auth } from './auth.schema';
import logger from '@app/utils/logger';
import { decodeBase64 } from '@app/transformers/codec.transformer';
import { HttpUnauthorizedError } from '@app/errors/unauthorized.error';
import { AdminMaybeGuard } from '@app/guards/admin-maybe.guard';
import { AuthPipe } from '@app/pipes/auth.pipe';

const log = logger.scope('AuthController');

@Controller('auth')
export class AuthController {
  constructor(
    private readonly ipService: IPService,
    private readonly authService: AuthService,
  ) {}

  @Get('search')
  @UseGuards(AdminMaybeGuard)
  @Responser.handle('Get user list')
  getAllUsers(@QueryParams() { isAuthed }: QueryParamsResult) {
    return isAuthed ? this.authService.getAllUsers() : [];
  }

  @Post('login')
  @Responser.handle({ message: 'Login', success: HttpStatus.OK, error: HttpStatus.BAD_REQUEST })
  async login(@QueryParams() { visitor: { ip } }: QueryParamsResult, @Body() body: AuthLoginDTO): Promise<TokenResult> {
    const token = await this.authService.adminLogin(body.email, body.password);
    if (ip) {
      this.ipService.queryLocation(ip).then((location) => {
        const subject = 'App has new login activity';
        const locationText = location ? [location.country, location.region, location.city].join(' · ') : 'unknow';
        const content = `${subject}, IP: ${ip}, location: ${locationText}`;
        log.warn(subject, content);
      });
    }
    return token;
  }

  @Get('user')
  @UseGuards(AdminOnlyGuard)
  @Responser.handle({ message: 'Get user info', success: HttpStatus.OK, error: HttpStatus.UNAUTHORIZED })
  getUserInfo(@QueryParams() { request }: QueryParamsResult): Promise<Auth> {
    const encodeJwtSign = request.headers.authorization?.split('.')[1] || '';
    const userId = encodeJwtSign ? JSON.parse(decodeBase64(encodeJwtSign)).data : '';
    return this.authService.getUserInfo(userId);
  }

  @Post('register')
  @Responser.handle({ message: 'Register user', success: HttpStatus.OK })
  registerAdmin(@Body() auth: Auth): Promise<void> {
    return this.authService.registerAdmin(auth);
  }

  @Post('verify')
  @Responser.handle({ message: 'Verify code', success: HttpStatus.OK })
  verfiyRegister(@Body() body: VerifyBody): Promise<void> {
    return this.authService.verfiyRegister(body);
  }

  @Post('recode')
  @Responser.handle({ message: 'resend code', success: HttpStatus.OK })
  resendCode(@Body() body: { email: string }): Promise<void> {
    return this.authService.sendCode(body.email, 'Register');
  }

  @Post('recover')
  @Responser.handle({ message: 'before recover password', success: HttpStatus.OK })
  beforeRecoverPassword(@Body() body: { email: string }): Promise<void> {
    return this.authService.beforeRecoverPassword(body.email);
  }

  @Put('newpassword')
  @Responser.handle({ message: 'recover password', success: HttpStatus.OK })
  recoverPassword(@Body() body: RecoverBody): Promise<void> {
    return this.authService.recoverPassword(body);
  }

  @Put('update')
  @UseGuards(AdminOnlyGuard)
  @Responser.handle('Update user info')
  putAdminInfo(@Body() auth: AuthUpdateDTO): Promise<Auth> {
    return this.authService.putAdminInfo(auth);
  }

  // check token
  @Post('check')
  @UseGuards(AdminOnlyGuard)
  @Responser.handle('Check token')
  checkToken(): string {
    return 'ok';
  }

  // refresh token
  @Post('renewal')
  @Responser.handle('Renewal Token')
  renewalToken(@QueryParams(AuthPipe) { auth }: QueryParamsResult): Promise<TokenResult> {
    if (auth?.id) {
      return this.authService.createToken(auth.id);
    } else {
      throw new HttpUnauthorizedError();
    }
  }
}
