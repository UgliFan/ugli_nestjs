import { Module } from '@nestjs/common';
import { MemoProvider } from '@app/modules/memo/memo.schema';
import { CategoryController } from './category.controller';
import { CategoryProvider } from './category.schema';
import { CategoryService } from './category.service';

@Module({
  controllers: [CategoryController],
  providers: [MemoProvider, CategoryProvider, CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
