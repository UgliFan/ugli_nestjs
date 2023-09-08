import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './services/app.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forRoot('mongodb://192.168.17.129/ugli_test')],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
