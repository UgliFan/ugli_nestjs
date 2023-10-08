import { prop, plugin, modelOptions } from '@typegoose/typegoose';
import { IsString, IsNotEmpty } from 'class-validator';
import { getProviderByTypegooseClass } from '@app/transformers/model.transformer';
import { mongoosePaginate } from '@app/utils/paginate';

@plugin(mongoosePaginate)
@modelOptions({
  schemaOptions: {
    versionKey: false,
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
})
export class Tag {
  @IsNotEmpty()
  @IsString()
  @prop({ required: true, validate: /\S+/ })
  name: string;

  @IsString()
  @prop({ default: '' })
  description: string;

  @prop({ default: Date.now, immutable: true, select: false })
  created_at?: Date;

  @prop({ default: Date.now })
  updated_at?: Date;

  // for ref aggregate
  ref_count?: number;
}

export const TagProvider = getProviderByTypegooseClass(Tag);
