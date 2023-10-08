import { Controller, Get, Put, Post, Delete, Body, UseGuards } from '@nestjs/common';
import { AdminOnlyGuard } from '@app/guards/admin-only.guard';
import { Responser } from '@app/decorators/responser.decorator';
import { QueryParams, QueryParamsResult } from '@app/decorators/queryparams.decorator';
import { TagService } from './tag.service';
import { Tag } from './tag.schema';

@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  @UseGuards(AdminOnlyGuard)
  @Responser.handle('Get all tags')
  getAllTags(): Promise<Array<Tag>> {
    return this.tagService.getAllTagsCache();
  }

  @Post()
  @UseGuards(AdminOnlyGuard)
  @Responser.handle('Create tag')
  createTag(@Body() tag: Tag): Promise<Tag> {
    return this.tagService.create(tag);
  }

  @Put(':id')
  @UseGuards(AdminOnlyGuard)
  @Responser.handle('Update Tag')
  putTag(@QueryParams() { params }: QueryParamsResult, @Body() tag: Tag): Promise<Tag> {
    return this.tagService.update(params.id, tag);
  }

  @Delete(':id')
  @UseGuards(AdminOnlyGuard)
  @Responser.handle('Delete tag')
  delTag(@QueryParams() { params }: QueryParamsResult): Promise<void> {
    return this.tagService.delete(params.id);
  }
}
