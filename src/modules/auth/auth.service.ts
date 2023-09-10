import lodash from 'lodash';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UNDEFINED } from '@app/constants/value.constant';
import { InjectModel } from '@app/transformers/model.transformer';
import { decodeMD5 } from '@app/transformers/codec.transformer';
import { MongooseModel } from '@app/interfaces/mongoose.interface';
import { TokenResult } from './auth.interface';
import { Auth, DEFAULT_AUTH } from './auth.schema';
import { AuthUpdateDTO } from './auth.dto';
import { AUTH } from '@app/configs/app.config';
import { CacheManualResult, CacheService } from '@app/processors/cache/cache.service';
import { CacheKeys } from '@app/constants/cache.constant';
import logger from '@app/utils/logger';

const log = logger.scope('AuthService');

@Injectable()
export class AuthService {
  private authCache: CacheManualResult<Auth[]>;
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(Auth) private readonly authModel: MongooseModel<Auth>,
    private readonly cacheService: CacheService,
  ) {
    this.authCache = this.cacheService.manual({
      key: CacheKeys.AllUsers,
      promise: () => this.getAllUsers(),
    });

    this.authCache.update().catch((error) => {
      log.warn('init getAllUsers failed!', error);
    });
  }

  public async getAllUsers(): Promise<Auth[]> {
    return await this.authModel.find().exec();
  }

  public async getUserCacheForGuest() {
    return await this.authCache.get();
  }

  public createToken(data: string): TokenResult {
    return {
      access_token: this.jwtService.sign({ data }),
      expires_in: AUTH.expiresIn as number,
    };
  }

  public validateAuthData(payload: any): Promise<any> {
    const isVerified = lodash.isEqual(payload.data, AUTH.salt);
    return isVerified ? payload.data : null;
  }

  public async getAdminInfo(email?: string): Promise<Auth> {
    const adminInfo = await this.authModel.findOne(email ? { email } : UNDEFINED, '-_id').exec();
    return adminInfo ? adminInfo.toObject() : DEFAULT_AUTH;
  }

  public async putAdminInfo(auth: AuthUpdateDTO): Promise<Auth> {
    const { password, new_password, email, ...restAuth } = auth;
    const existAuth = await this.authModel.findOne({ email }).exec();
    let newPassword: string | void = UNDEFINED;
    if (password || new_password) {
      // verify password
      if (!password || !new_password) {
        throw 'Incomplete passwords';
      }
      if (password === new_password) {
        throw 'Old password and new password cannot be same';
      }
      // update password
      const oldPassword = decodeMD5(password);
      const existedPassword = existAuth?.password || '';
      if (oldPassword !== existedPassword) {
        throw 'Old password incorrect';
      } else {
        newPassword = decodeMD5(new_password);
      }
    }

    // data
    const targetAuthData: Auth = { email, ...restAuth };
    if (newPassword) {
      targetAuthData.password = newPassword;
    }

    // save
    if (existAuth) {
      await Object.assign(existAuth, targetAuthData).save();
    } else {
      await this.authModel.create(targetAuthData);
    }

    return this.getAdminInfo(existAuth?.email);
  }

  public async adminLogin(email: string, password: string): Promise<TokenResult> {
    const auth = await this.authModel.findOne({ email }).exec();
    if (!auth) {
      throw 'User not exist';
    }
    const existedPassword = auth.password ?? '';
    const loginPassword = decodeMD5(password);
    if (!existedPassword || loginPassword === existedPassword) {
      return this.createToken(auth._id.toString());
    } else {
      throw 'Password incorrect';
    }
  }
}
