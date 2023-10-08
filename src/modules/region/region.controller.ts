import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminOnlyGuard } from '@app/guards/admin-only.guard';
import { Responser } from '@app/decorators/responser.decorator';
import { Region } from '@app/constants/biz.constant';

@Controller('region')
export class RegionController {
  @Get()
  @UseGuards(AdminOnlyGuard)
  @Responser.handle({ message: 'Get region list' })
  getRegions() {
    return [Region.DEFAULT];
  }
}
