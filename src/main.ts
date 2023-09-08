import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import passport from 'passport';
import { HttpExceptionFilter } from '@app/filters/error.filter';
import { TransformInterceptor } from '@app/interceptors/transform.interceptor';
import { LoggingInterceptor } from '@app/interceptors/logging.interceptor';
import { ErrorInterceptor } from '@app/interceptors/error.interceptor';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { environment, isProdEnv } from '@app/configs/app.environment';
import logger from '@app/utils/logger';
import { APP } from '@app/configs/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, isProdEnv ? { logger: false } : {});
  // Helmet helps secure Express apps by setting HTTP response headers.
  app.use(helmet);
  // gzip or deflate
  app.use(compression);
  app.use(cookieParser());
  app.use(bodyParser.json({ limit: '1mb' }));
  app.use(bodyParser.urlencoded({ extended: true }));
  // MARK: Beware of upgrades!
  // v0.5.0 > v0.5.1 > v0.5.3 produced a breaking change!
  // https://github.com/jaredhanson/passport/blob/master/CHANGELOG.md#changed
  // Simple, unobtrusive authentication for Node.js.
  app.use(passport.initialize());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor(), new ErrorInterceptor(), new LoggingInterceptor());
  // https://github.com/nestjs/nest/issues/528#issuecomment-403212561
  // https://stackoverflow.com/a/60141437/6222535
  // MARK: can't used!
  // useContainer(app.select(AppModule), { fallbackOnErrors: true, fallback: true })
  return await app.listen(APP.PORT);
}
bootstrap().then(() => {
  logger.info(`Running on ${APP.PORT}, env: ${environment}.`);
});
