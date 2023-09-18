import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@app/transformers/model.transformer';
import logger from '@app/utils/logger';
import { HttpService } from '@nestjs/axios';
import { APP } from '@app/configs/app.config';

const log = logger.scope('WeatherService');

@Injectable()
export class WeatherService {
  constructor(private readonly httpService: HttpService) {}

  public async getNoramlData(location?: string): Promise<any> {
    const res = await this.httpService.axiosRef.get(
      `https://api.caiyunapp.com/v2.6/${APP.cyToken}/${location || '116.3176,39.9760'}/weather?alert=true&dailysteps=1&hourlysteps=24`,
    );
    log.debug('getNoramlData', res);
    return res.data;
  }
}
