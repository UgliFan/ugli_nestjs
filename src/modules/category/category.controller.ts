import { Controller, UseGuards, Get, Put, Post, Delete, Body } from '@nestjs/common';
import { AdminOnlyGuard } from '@app/guards/admin-only.guard';
import { QueryParams, QueryParamsResult } from '@app/decorators/queryparams.decorator';
import { Responser } from '@app/decorators/responser.decorator';
import { CategoryService } from './category.service';
import { Category } from './category.schema';
import { AuthPipe } from '@app/pipes/auth.pipe';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @UseGuards(AdminOnlyGuard)
  @Responser.handle('Get categories')
  getCategories(@QueryParams(AuthPipe) { auth }: QueryParamsResult): Promise<Array<Category>> {
    return this.categoryService.getAllFromCache(auth?.region);
  }

  @Post()
  @UseGuards(AdminOnlyGuard)
  @Responser.handle('Create category')
  createCategory(@QueryParams(AuthPipe) { auth }: QueryParamsResult, @Body() category: Category): Promise<Category> {
    category.region = auth?.region;
    return this.categoryService.create(category);
  }

  @Put(':id')
  @UseGuards(AdminOnlyGuard)
  @Responser.handle('Update category')
  putCategory(@QueryParams(AuthPipe) { params, auth }: QueryParamsResult, @Body() category: Category): Promise<Category> {
    return this.categoryService.update(params.id, category, auth?.region);
  }

  @Delete(':id')
  @UseGuards(AdminOnlyGuard)
  @Responser.handle('Delete category')
  delCategory(@QueryParams(AuthPipe) { params, auth }: QueryParamsResult) {
    return this.categoryService.delete(params.id, auth?.region);
  }
}
