import { Module } from '@nestjs/common';
import { MemoProvider } from '@app/modules/memo/memo.schema';
import { TagController } from './tag.controller';
import { TagProvider } from './tag.schema';
import { TagService } from './tag.service';

@Module({
  controllers: [TagController],
  providers: [MemoProvider, TagProvider, TagService],
  exports: [TagService],
})
export class TagModule {}
