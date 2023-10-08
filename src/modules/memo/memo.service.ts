import { Injectable } from '@nestjs/common';
import { InjectModel } from '@app/transformers/model.transformer';
import { MongooseModel, MongooseDoc, MongooseID } from '@app/interfaces/mongoose.interface';
import { PaginateResult, PaginateQuery, PaginateOptions } from '@app/utils/paginate';
import { Memo, MEMO_LIST_QUERY_PROJECTION, MEMO_FULL_QUERY_REF } from './memo.schema';
import { Region } from '@app/constants/biz.constant';

@Injectable()
export class MemoService {
  constructor(@InjectModel(Memo) private readonly memoModel: MongooseModel<Memo>) {}

  // get paginate memos
  public paginator(query: PaginateQuery<Memo>, options: PaginateOptions): Promise<PaginateResult<Memo>> {
    return this.memoModel.paginate(query, {
      ...options,
      projection: MEMO_LIST_QUERY_PROJECTION,
      populate: MEMO_FULL_QUERY_REF,
    });
  }

  // get memo by ids
  public getList(memoIDs: number[]): Promise<Array<Memo>> {
    return this.memoModel.find({ id: { $in: memoIDs } }).exec();
  }

  // get memo by ObjectID
  public async getDetailByObjectID(memoId: MongooseID, region?: Region): Promise<MongooseDoc<Memo>> {
    const result = await this.memoModel.findOne({ _id: memoId, region }).exec();
    if (!result) {
      throw `Memo '${memoId}' not found`;
    }
    this.increaseViewCount(memoId);
    return result;
  }

  public async create(newMemo: Memo): Promise<MongooseDoc<Memo>> {
    const existedMemo = await this.memoModel.findOne({ title: newMemo.title }).exec();
    if (existedMemo) {
      throw `Memo '${newMemo.title}' is existed`;
    }
    const memo = await this.memoModel.create(newMemo);
    return memo;
  }

  public async update(memoId: MongooseID, newMemo: Memo, region?: Region): Promise<MongooseDoc<Memo>> {
    const existedMemo = await this.memoModel.findOne({ _id: memoId, region }).exec();
    if (!existedMemo) {
      throw `Memo '${memoId}' not found`;
    }
    Reflect.deleteProperty(newMemo, 'updated_at');
    const memo = await this.memoModel.findByIdAndUpdate(memoId, newMemo, { new: true }).exec();
    if (!memo) {
      throw `Memo '${memoId}' not found`;
    }
    return memo;
  }

  public async delete(memoId: MongooseID, region?: Region): Promise<void> {
    const memo = await this.memoModel.findOneAndRemove({ _id: memoId, region }).exec();
    if (!memo) {
      throw `Memo '${memoId}' not found`;
    }
  }

  public async batchDelete(memoIds: MongooseID[], region?: Region): Promise<void> {
    await this.memoModel.deleteMany({ _id: { $in: memoIds }, region }).exec();
  }

  public async increaseViewCount(memoId: MongooseID): Promise<void> {
    const memo = await this.memoModel.findById(memoId, '+visit_count').exec();
    const count = memo?.visit_count ?? 0 + 1;
    await this.memoModel.findByIdAndUpdate(memoId, { visit_count: count }, { new: false }).exec();
  }

  public async getTotalCount(): Promise<number> {
    return await this.memoModel.countDocuments({}).exec();
  }
}
