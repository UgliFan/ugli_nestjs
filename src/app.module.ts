import { APP_INTERCEPTOR, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule, minutes } from '@nestjs/throttler';
import { AppController } from './app.controller';
// middlewares
import { CorsMiddleware } from '@app/middlewares/cors.middleware';
import { OriginMiddleware } from '@app/middlewares/origin.middleware';
// framework
import { CacheInterceptor } from '@app/interceptors/cache.interceptor';
import { ValidationPipe } from '@app/pipes/validation.pipe';
// biz modules
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: minutes(5),
        limit: 300,
        ignoreUserAgents: [/googlebot/gi, /bingbot/gi, /baidubot/gi],
      },
    ]),
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware, OriginMiddleware).forRoutes('*');
  }
}
