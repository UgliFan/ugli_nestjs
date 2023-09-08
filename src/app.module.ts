import { APP_INTERCEPTOR, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule, minutes } from '@nestjs/throttler';
import { AppController } from './app.controller';
// middlewares
import { CorsMiddleware } from '@app/middlewares/cors.middleware';
import { OriginMiddleware } from '@app/middlewares/origin.middleware';
import { HelperModule } from '@app/processors/helper/helper.module';
// framework
import { CacheInterceptor } from '@app/interceptors/cache.interceptor';
import { ValidationPipe } from '@app/pipes/validation.pipe';
// global modules
import { DBModule } from './processors/db/db.module';
import { CacheModule } from './processors/cache/cache.module';
// biz modules
import { AuthModule } from '@app/modules/auth/auth.module';
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
    HelperModule,
    DBModule,
    CacheModule,
    // bizs
    AuthModule,
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
