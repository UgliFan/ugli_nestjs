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
    const { alert, realtime, hourly, forecast_keypoint } = res.data.result;
    delete realtime?.status;
    delete realtime?.recipitation;
    return {
      locations: alert?.adcodes?.map((item: any) => item.name),
      alerts: alert?.content?.map((item: any) => ({
        title: item.title,
        desc: item.description,
        source: item.source,
      })),
      realtime,
      hourly: hourly?.temperature?.map((item: any, index: number) => {
        return {
          datetime: item.datetime,
          temperature: item.value,
          apparent_temperature: hourly?.apparent_temperature?.[index]?.value,
          precipitation_value: hourly?.precipitation?.[index]?.value,
          precipitation_probability: hourly?.precipitation?.[index]?.probability,
          wind_speed: hourly?.wind?.[index]?.speed,
          wind_direction: hourly?.wind?.[index]?.direction,
          humidity: hourly?.humidity?.[index]?.value,
          cloudrate: hourly?.cloudrate?.[index]?.value,
          skycon: hourly?.skycon?.[index]?.value,
          pressure: hourly?.pressure?.[index]?.value,
          visibility: hourly?.visibility?.[index]?.value,
          dswrf: hourly?.dswrf?.[index]?.value,
        };
      }),
      forecast_keypoint,
    };
  }
}
