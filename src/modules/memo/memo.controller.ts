import lodash from 'lodash';
import { Controller, Get, Put, Post, Delete, Query, Body, UseGuards, HttpStatus } from '@nestjs/common';
import { QueryParams, QueryParamsResult } from '@app/decorators/queryparams.decorator';
import { Responser } from '@app/decorators/responser.decorator';
import { AdminOnlyGuard } from '@app/guards/admin-only.guard';
import { AuthPipe } from '@app/pipes/auth.pipe';
import { ExposePipe } from '@app/pipes/expose.pipe';
import { PaginateResult, PaginateQuery, PaginateOptions } from '@app/utils/paginate';
import { MemoPaginateQueryDTO, MemoIDsDTO } from './memo.dto';
import { MemoService } from './memo.service';
import { Memo } from './memo.schema';

@Controller('memo')
export class MemoController {
  constructor(private readonly memoService: MemoService) {}

  @Get()
  @UseGuards(AdminOnlyGuard)
  @Responser.paginate()
  @Responser.handle('Get memos')
  async getMemos(@Query(AuthPipe, ExposePipe) query: MemoPaginateQueryDTO): Promise<PaginateResult<Memo>> {
    const { page, per_page, sort, auth, ...filters } = query;
    const paginateQuery: PaginateQuery<Memo> = {};
    const paginateOptions: PaginateOptions = { page, perPage: per_page };

    // region
    paginateQuery.region = auth?.region;
    // sort
    if (sort) {
      paginateOptions.dateSort = sort;
    }
    // search
    if (filters.keyword) {
      const trimmed = lodash.trim(filters.keyword);
      const keywordRegExp = new RegExp(trimmed, 'i');
      paginateQuery.$or = [{ title: keywordRegExp }, { content: keywordRegExp }, { description: keywordRegExp }];
    }
    // date
    if (filters.date) {
      const queryDateMS = new Date(filters.date).getTime();
      paginateQuery.created_at = {
        $gte: new Date((queryDateMS / 1000 - 60 * 60 * 8) * 1000),
        $lt: new Date((queryDateMS / 1000 + 60 * 60 * 16) * 1000),
      };
    }
    // category
    if (filters.category_id) {
      paginateQuery.categories = filters.category_id;
    }
    // tag
    if (filters.tag_id) {
      paginateQuery.tags = filters.tag_id;
    }
    // paginate
    return this.memoService.paginator(paginateQuery, paginateOptions);
  }

  @Get(':id')
  @UseGuards(AdminOnlyGuard)
  @Responser.handle({
    message: 'Get memo detail',
    error: HttpStatus.NOT_FOUND,
  })
  getMemo(@QueryParams(AuthPipe) { params, auth }: QueryParamsResult): Promise<Memo> {
    return this.memoService.getDetailByObjectID(params.id, auth?.region);
  }

  @Post()
  @UseGuards(AdminOnlyGuard)
  @Responser.handle('Create memo')
  createMemo(@Query(AuthPipe) { auth }: QueryParamsResult, @Body() memo: Memo): Promise<Memo> {
    memo.region = auth?.region;
    memo.owner = auth?.id;
    return this.memoService.create(memo);
  }

  @Put(':id')
  @UseGuards(AdminOnlyGuard)
  @Responser.handle('Update memo')
  putMemo(@QueryParams(AuthPipe) { params, auth }: QueryParamsResult, @Body() memo: Memo): Promise<Memo> {
    return this.memoService.update(params.id, memo, auth?.region);
  }

  @Delete(':id')
  @UseGuards(AdminOnlyGuard)
  @Responser.handle('Delete memo')
  async delMemo(@QueryParams(AuthPipe) { params, auth }: QueryParamsResult): Promise<void> {
    return this.memoService.delete(params.id, auth?.region);
  }

  @Delete()
  @UseGuards(AdminOnlyGuard)
  @Responser.handle('Delete memos')
  delMemos(@QueryParams(AuthPipe) { auth }: QueryParamsResult, @Body() body: MemoIDsDTO) {
    return this.memoService.batchDelete(body.memo_ids, auth?.region);
  }
}
