import { IntersectionType } from '@nestjs/mapped-types';
import { IsString, IsArray, IsOptional, ArrayNotEmpty, ArrayUnique } from 'class-validator';
import { AuthQueryDTO, DateQueryDTO, KeywordQueryDTO } from '@app/models/query.model';
import { PaginateOptionWithHotSortDTO } from '@app/models/paginate.model';

export class MemoPaginateQueryDTO extends IntersectionType(PaginateOptionWithHotSortDTO, KeywordQueryDTO, DateQueryDTO, AuthQueryDTO) {
  @IsString()
  @IsOptional()
  category_id?: string;

  @IsString()
  @IsOptional()
  tag_id?: string;
}

export class MemoIDsDTO {
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsArray()
  memo_ids: string[];
}
