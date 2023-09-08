import mongoose from 'mongoose';
import logger from '@app/utils/logger';
import { Provider } from '@nestjs/common';
import { DB_CONNECTION_TOKEN } from '@app/constants/system.constant';
import { MONGO_DB } from '@app/configs/app.config';

const log = logger.scope('MongoDB');

export const dbProvider: Provider = {
  inject: [],
  provide: DB_CONNECTION_TOKEN,
  useFactory: async () => {
    let reconnectionTask: NodeJS.Timeout | null = null;
    const RECONNECT_INTERVAL = 6000;

    const connection = () => {
      return mongoose.connect(MONGO_DB.uri, {});
    };

    mongoose.set('strictQuery', false);
    mongoose.connection.on('connecting', () => {
      log.info('connecting...');
    });
    mongoose.connection.on('open', () => {
      log.info('readied (open).');
      if (reconnectionTask) {
        clearTimeout(reconnectionTask);
        reconnectionTask = null;
      }
    });
    mongoose.connection.on('disconnected', () => {
      log.error(`disconnected! retry when after ${RECONNECT_INTERVAL / 1000}s`);
      reconnectionTask = setTimeout(connection, RECONNECT_INTERVAL);
    });
    mongoose.connection.on('error', (error) => {
      log.error('error!', error);
      mongoose.disconnect();
    });
    return await connection();
  },
};
