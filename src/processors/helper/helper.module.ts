import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IPService } from './helper.service.ip';
import { EmailService } from './helper.service.email';

const services = [EmailService, IPService];

@Global()
@Module({
  imports: [HttpModule],
  providers: services,
  exports: services,
})
export class HelperModule {}
