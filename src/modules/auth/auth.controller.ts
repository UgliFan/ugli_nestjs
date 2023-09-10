import { Controller, Get, Put, Post, Body, UseGuards, HttpStatus } from '@nestjs/common';
import { AdminOnlyGuard } from '@app/guards/admin-only.guard';
import { IPService } from '@app/processors/helper/helper.service.ip';
import { Responser } from '@app/decorators/responser.decorator';
import { QueryParams, QueryParamsResult } from '@app/decorators/queryparams.decorator';
import { AuthLoginDTO, AuthUpdateDTO } from './auth.dto';
import { AuthService } from './auth.service';
import { TokenResult } from './auth.interface';
import { Auth } from './auth.schema';
import logger from '@app/utils/logger';

const log = logger.scope('AuthController');

@Controller('auth')
export class AuthController {
  constructor(
    private readonly ipService: IPService,
    private readonly authService: AuthService,
  ) {}

  @Get('search')
  @Responser.handle('Get user list')
  getAllUsers(@QueryParams() { isAuthed }: QueryParamsResult) {
    return isAuthed ? this.authService.getAllUsers() : this.authService.getUserCacheForGuest();
  }

  @Post('login')
  @Responser.handle({ message: 'Login', error: HttpStatus.BAD_REQUEST })
  async login(@QueryParams() { visitor: { ip } }: QueryParamsResult, @Body() body: AuthLoginDTO): Promise<TokenResult> {
    log.debug('login', body);
    const token = await this.authService.adminLogin(body.email, body.password);
    if (ip) {
      this.ipService.queryLocation(ip).then((location) => {
        const subject = 'App has new login activity';
        const locationText = location ? [location.country, location.region, location.city].join(' · ') : 'unknow';
        const content = `${subject}, IP: ${ip}, location: ${locationText}`;
        log.debug(subject, {
          text: content,
          html: content,
        });
      });
    }
    return token;
  }

  @Get('admin')
  @Responser.handle('Get admin info')
  getAdminInfo(@QueryParams() { query }: QueryParamsResult): Promise<Auth> {
    return this.authService.getAdminInfo(query.email);
  }

  @Put('admin')
  @UseGuards(AdminOnlyGuard)
  @Responser.handle('Update admin info')
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
  @UseGuards(AdminOnlyGuard)
  @Responser.handle('Renewal Token')
  renewalToken(): TokenResult {
    return this.authService.createToken('');
  }
}
