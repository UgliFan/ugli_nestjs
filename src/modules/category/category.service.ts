import { Injectable } from '@nestjs/common';
import { InjectModel } from '@app/transformers/model.transformer';
import { MongooseModel, MongooseDoc, MongooseID, MongooseObjectID, WithID } from '@app/interfaces/mongoose.interface';
import { Memo } from '@app/modules/memo/memo.schema';
import { Category } from './category.schema';
import { Region, SortType } from '@app/constants/biz.constant';
import { CacheManualResult, CacheService } from '@app/processors/cache/cache.service';
import { CacheKeys } from '@app/constants/cache.constant';
import logger from '@app/utils/logger';

const log = logger.scope('CategoryService');

@Injectable()
export class CategoryService {
  private allCategoriesCache: CacheManualResult<Array<Category>>;

  constructor(
    private readonly cacheService: CacheService,
    @InjectModel(Memo) private readonly memoModel: MongooseModel<Memo>,
    @InjectModel(Category) private readonly categoryModel: MongooseModel<Category>,
  ) {
    this.allCategoriesCache = this.cacheService.manual<Array<Category>>({
      key: CacheKeys.AllCategories,
      promise: () => this.getAllCategories(),
    });

    this.updateAllCategoriesCache().catch((error) => {
      log.warn('init categoryPaginateCache failed!', error);
    });
  }

  private async aggregate(categories: Array<WithID<Category>>) {
    const counts = await this.memoModel.aggregate<{ _id: MongooseObjectID; count: number }>([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
    ]);
    return categories.map<Category>((category) => {
      const found = counts.find((item) => item._id.equals(category._id));
      return { ...category, ref_count: found ? found.count : 0 };
    });
  }

  public async getAllCategories(): Promise<Array<Category>> {
    const allTags = await this.categoryModel.find({}, '+region').lean().sort({ _id: SortType.Desc }).exec();
    return await this.aggregate(allTags);
  }

  public async getAllFromCache(region?: Region): Promise<Array<Category>> {
    const categories = await this.allCategoriesCache.get();
    return categories.filter((category) => category.region === region);
  }

  public updateAllCategoriesCache(): Promise<Array<Category>> {
    return this.allCategoriesCache.update();
  }

  public async create(newCategory: Category): Promise<MongooseDoc<Category>> {
    const existed = await this.categoryModel.findOne({ name: newCategory.name }).exec();
    if (existed) {
      throw `Category name '${newCategory.name}' is existed`;
    }
    const category = await this.categoryModel.create(newCategory);
    this.updateAllCategoriesCache();
    return category;
  }

  public async update(categoryID: MongooseID, newCategory: Category, region?: Region): Promise<MongooseDoc<Category>> {
    const category = await this.categoryModel.findOneAndUpdate({ _id: categoryID, region }, newCategory, { new: true }).exec();
    if (!category) {
      throw `Category '${categoryID}' not found`;
    }
    this.updateAllCategoriesCache();
    return category;
  }

  public async delete(categoryID: MongooseID, region?: Region) {
    const category = await this.categoryModel.findOneAndRemove({ _id: categoryID, region }).exec();
    if (!category) {
      throw `Category '${categoryID}' not found`;
    }
    this.updateAllCategoriesCache();
  }
}
