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

  public async createToken(authId: string): Promise<TokenResult> {
    const token = this.jwtService.sign({ data: authId });
    await this.cacheService.set(authId, token, +AUTH.expiresIn);
    return {
      access_token: token,
      expires_in: AUTH.expiresIn as number,
    };
  }

  public async validateAuthData(payload: any): Promise<any> {
    const isVerified = await this.cacheService.get(payload.data);
    return isVerified ? payload.data : null;
  }

  public async getAdminInfo(email?: string): Promise<Auth> {
    const adminInfo = await this.authModel.findOne(email ? { email } : UNDEFINED, '-_id').exec();
    return adminInfo ? adminInfo.toObject() : DEFAULT_AUTH;
  }

  public async putAdminInfo(auth: AuthUpdateDTO): Promise<Auth> {
    const { password = '', new_password, email, ...restAuth } = auth;
    const targetAuthData: Partial<Auth> = { ...restAuth };
    const existAuth = await this.authModel.findOne({ email }, '+password').exec();
    if (existAuth) {
      // save
      if (new_password) {
        const existedPassword = existAuth?.password || '';
        const oldPassword = password ? decodeMD5(password) : password;
        const newPassword: string = decodeMD5(new_password);
        // verify password
        if (!new_password) {
          throw 'Incomplete passwords';
        }
        if (existedPassword === newPassword) {
          throw 'Old password and new password cannot be same';
        }
        // update password
        if (oldPassword !== existedPassword) {
          throw 'Old password incorrect';
        } else {
          targetAuthData.password = newPassword;
        }
      }
      const result = await this.authModel.findByIdAndUpdate(existAuth._id, targetAuthData, { new: false }).exec();
      return result ? result.toObject() : DEFAULT_AUTH;
    }
    throw 'Auth not exist';
  }

  public async adminLogin(email: string, password: string): Promise<TokenResult> {
    const auth = await this.authModel.findOne({ email }).exec();
    if (!auth) {
      throw 'User not exist';
    }
    const existedPassword = auth.password ?? '';
    const loginPassword = decodeMD5(password);
    if (!existedPassword || loginPassword === existedPassword) {
      const token = await this.createToken(auth._id.toString());
      return token;
    } else {
      throw 'Password incorrect';
    }
  }
}
