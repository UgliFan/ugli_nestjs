import { Controller, Get } from '@nestjs/common';
import { Responser } from '@app/decorators/responser.decorator';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('query')
  @Responser.handle('Get weather info')
  getNoramlData() {
    return this.weatherService.getNoramlData();
  }
}
