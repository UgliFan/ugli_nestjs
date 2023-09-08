import { Controller, Get } from '@nestjs/common';
import { Responser } from '@app/decorators/responser.decorator';
import { UserService } from '../../services/user/user.service';
import { User } from './user.schema';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('search')
  @Responser.handle('Get user list')
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }
}
