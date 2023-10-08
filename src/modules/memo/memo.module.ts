import { Module } from '@nestjs/common';
import { CategoryModule } from '@app/modules/category/category.module';
import { MemoController } from './memo.controller';
import { MemoProvider } from './memo.schema';
import { MemoService } from './memo.service';

@Module({
  imports: [CategoryModule],
  controllers: [MemoController],
  providers: [MemoProvider, MemoService],
  exports: [MemoService],
})
export class MemoModule {}
