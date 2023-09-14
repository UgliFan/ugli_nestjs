import { Controller, Get, UseGuards } from '@nestjs/common';
import { Responser } from '@app/decorators/responser.decorator';
import { WeatherService } from './weather.service';
import { AdminOnlyGuard } from '@app/guards/admin-only.guard';
import { QueryParams, QueryParamsResult } from '@app/decorators/queryparams.decorator';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('query')
  @UseGuards(AdminOnlyGuard)
  @Responser.handle('Get weather info')
  getNoramlData(@QueryParams() { query }: QueryParamsResult) {
    const { latitude, longitude } = query || {};
    return this.weatherService.getNoramlData(`${longitude},${latitude}`);
  }
}
