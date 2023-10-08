import { Injectable } from '@nestjs/common';
import { InjectModel } from '@app/transformers/model.transformer';
import { CacheService, CacheManualResult } from '@app/processors/cache/cache.service';
import { MongooseModel, MongooseDoc, MongooseID, MongooseObjectID, WithID } from '@app/interfaces/mongoose.interface';
import { CacheKeys } from '@app/constants/cache.constant';
import { SortType } from '@app/constants/biz.constant';
import { Memo } from '@app/modules/memo/memo.schema';
import logger from '@app/utils/logger';
import { Tag } from './tag.schema';

const log = logger.scope('TagService');

@Injectable()
export class TagService {
  private allTagsCache: CacheManualResult<Array<Tag>>;

  constructor(
    private readonly cacheService: CacheService,
    @InjectModel(Tag) private readonly tagModel: MongooseModel<Tag>,
    @InjectModel(Memo) private readonly memoModel: MongooseModel<Memo>,
  ) {
    this.allTagsCache = this.cacheService.manual<Array<Tag>>({
      key: CacheKeys.AllTags,
      promise: () => this.getAllTags(),
    });

    this.updateAllTagsCache().catch((error) => {
      log.warn('init tagPaginateCache failed!', error);
    });
  }

  private async aggregate(tags: Array<WithID<Tag>>) {
    const counts = await this.memoModel.aggregate<{ _id: MongooseObjectID; count: number }>([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
    ]);
    return tags.map<Tag>((tag) => {
      const found = counts.find((item) => item._id.equals(tag._id));
      return { ...tag, ref_count: found ? found.count : 0 };
    });
  }

  public async getAllTags(): Promise<Array<Tag>> {
    const allTags = await this.tagModel.find().lean().sort({ _id: SortType.Desc }).exec();
    return await this.aggregate(allTags);
  }

  public getAllTagsCache(): Promise<Array<Tag>> {
    return this.allTagsCache.get();
  }

  public updateAllTagsCache(): Promise<Array<Tag>> {
    return this.allTagsCache.update();
  }

  public async getDetailById(id: string): Promise<MongooseDoc<Tag>> {
    const result = await this.tagModel.findOne({ _id: id }).exec();
    if (!result) {
      throw `Tag '${id}' not found`;
    }
    return result;
  }

  public async create(newTag: Tag): Promise<MongooseDoc<Tag>> {
    const existedTag = await this.tagModel.findOne({ name: newTag.name }).exec();
    if (existedTag) {
      throw `Tag name '${newTag.name}' is existed`;
    }
    const tag = await this.tagModel.create(newTag);
    this.updateAllTagsCache();
    return tag;
  }

  public async update(tagID: MongooseID, newTag: Tag): Promise<MongooseDoc<Tag>> {
    const tag = await this.tagModel.findByIdAndUpdate(tagID, newTag as any, { new: true }).exec();
    if (!tag) {
      throw `Tag '${tagID}' not found`;
    }
    this.updateAllTagsCache();
    return tag;
  }

  public async delete(tagID: MongooseID): Promise<void> {
    const tag = await this.tagModel.findByIdAndRemove(tagID).exec();
    if (!tag) {
      throw `Tag '${tagID}' not found`;
    }
    this.updateAllTagsCache();
  }

  public async getTotalCount(): Promise<number> {
    return await this.tagModel.countDocuments().exec();
  }
}
