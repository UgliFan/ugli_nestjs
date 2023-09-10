import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@app/transformers/model.transformer';
import logger from '@app/utils/logger';
import axios from 'axios';
import Argvs from '@app/configs/secret';

const log = logger.scope('WeatherService');

@Injectable()
export class WeatherService {
  public async getNoramlData(): Promise<any> {
    const res = await axios.get(
      `https://api.caiyunapp.com/v2.6/${Argvs.cyWetherToken}/116.3176,39.9760/weather?alert=true&dailysteps=1&hourlysteps=24`,
    );
    log.debug('getNoramlData', res.data);
    return res.data;
  }
}
