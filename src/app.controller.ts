import { Controller, Get } from '@nestjs/common';
import { PROJECT } from './configs/app.config';

@Controller()
export class AppController {
  @Get()
  root(): any {
    return PROJECT;
  }
}
