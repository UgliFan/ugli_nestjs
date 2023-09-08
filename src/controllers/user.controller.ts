import { Controller, Get } from '@nestjs/common';
import { UserService } from '../services/user/user.service';

@Controller()
export class UserController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
