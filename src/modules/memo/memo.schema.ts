import { prop, modelOptions, Ref, plugin, index } from '@typegoose/typegoose';
import { getProviderByTypegooseClass } from '@app/transformers/model.transformer';
import { ArrayNotEmpty, ArrayUnique, IsArray, IsDefined, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { MemoLevel } from './memo.interface';
import { Category } from '../category/category.schema';
import { Tag } from '../tag/tag.schema';
import { Region } from '@app/constants/biz.constant';
import { mongoosePaginate } from '@app/utils/paginate';

export const MEMO_LEVELS = [MemoLevel.Low, MemoLevel.Normal, MemoLevel.High] as const;

export const MEMO_FULL_QUERY_REF = ['categories', 'tags'];
export const MEMO_LIST_QUERY_PROJECTION = { content: false };

@plugin(mongoosePaginate)
@modelOptions({
  schemaOptions: {
    versionKey: false,
    toObject: { getters: true },
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
})
@index(
  { title: 'text', content: 'text', description: 'text' },
  {
    name: 'SearchIndex',
    weights: {
      title: 10,
      description: 18,
      content: 3,
    },
  },
)
export class Memo {
  @ArrayUnique()
  @ArrayNotEmpty()
  @IsArray()
  @prop({ ref: () => Category, required: true })
  categories?: Ref<Category>[];

  @prop({ ref: () => Tag })
  tags?: Ref<Tag>[];

  @IsDefined()
  @prop({ enum: MemoLevel, default: MemoLevel.Normal })
  level: MemoLevel;

  @MaxLength(50)
  @IsString()
  @IsNotEmpty({ message: 'title?' })
  @prop({ required: true, validate: /\S+/, text: true })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'content?' })
  @prop({ required: true, text: true })
  content: string;

  @prop({ default: '', text: true })
  description: string;

  @prop({ default: true })
  shown?: boolean;

  @prop({ default: 0, select: false })
  visit_count?: number;

  @prop({ default: Region.DEFAULT, select: false })
  region?: Region;

  @prop({ default: Date.now, immutable: true, select: false })
  created_at?: Date;

  @prop({ default: Date.now })
  updated_at?: Date;

  @prop({ select: false })
  owner?: string;
}

export const MemoProvider = getProviderByTypegooseClass(Memo);
