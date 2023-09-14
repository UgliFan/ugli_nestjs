import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@app/transformers/model.transformer';
import { decodeMD5 } from '@app/transformers/codec.transformer';
import { MongooseModel } from '@app/interfaces/mongoose.interface';
import { RecoverBody, TokenResult, VerifyBody } from './auth.interface';
import { Auth, DEFAULT_AUTH } from './auth.schema';
import { AuthUpdateDTO } from './auth.dto';
import { APP, AUTH } from '@app/configs/app.config';
import { CacheManualResult, CacheService } from '@app/processors/cache/cache.service';
// import { CacheKeys } from '@app/constants/cache.constant';
import logger from '@app/utils/logger';
import { randomVerifyCode } from '@app/utils/math';
import { EmailService } from '@app/processors/helper/helper.service.email';

const log = logger.scope('AuthService');

@Injectable()
export class AuthService {
  private authCache: CacheManualResult<Auth[]>;
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(Auth) private readonly authModel: MongooseModel<Auth>,
    private readonly cacheService: CacheService,
    private readonly emailService: EmailService,
  ) {
    // this.authCache = this.cacheService.manual({
    //   key: CacheKeys.AllUsers,
    //   promise: () => this.getAllUsers(),
    // });
    // this.authCache.update().catch((error) => {
    //   log.warn('init getAllUsers failed!', error);
    // });
  }

  public async getAllUsers(): Promise<Auth[]> {
    return await this.authModel.find().exec();
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

  public async getUserInfo(userId: string): Promise<Auth> {
    const adminInfo = await this.authModel.findOne({ _id: userId }, '-_id').exec();
    if (!adminInfo) {
      throw 'User not existed';
    }
    return adminInfo.toObject();
  }

  public async sendCode(email: string, from: string): Promise<void> {
    const existAuth = await this.authModel.findOne({ email }).exec();
    if (!existAuth) {
      throw 'User not existed, please register first';
    }
    const code = randomVerifyCode();
    await this.cacheService.set(email, code, AUTH.expiresIn as number);
    this.emailService.sendMailAs(APP.NAME, {
      to: email,
      subject: `[${from}] Check your verify code`,
      text: `Verify Code: ${code}`,
      html: `Verify Code: ${code}`,
    });
    log.debug(`[${from}] Verify Code:`, code);
  }

  public async registerAdmin(auth: Auth): Promise<void> {
    auth.password = auth.password ? decodeMD5(auth.password) : '';
    const existAuth = await this.authModel.findOne({ email: auth.email, password: auth.password }, '+active').exec();
    if (existAuth && existAuth.active) {
      throw 'Exist user';
    }
    if (!existAuth) {
      await this.authModel.create(auth);
    }
    await this.sendCode(auth.email, 'Register');
  }

  public async verfiyRegister(data: VerifyBody): Promise<void> {
    const existAuth = await this.authModel.findOne({ email: data.email }).exec();
    if (!existAuth) {
      throw 'User not existed';
    }
    const code = await this.cacheService.get(data.email);
    if (data.code !== code) {
      throw 'Code verify failed, please try resend code';
    }
    await this.cacheService.delete(data.email);
    await this.authModel.findOneAndUpdate(existAuth._id, { active: true }, { new: false }).exec();
  }

  public async beforeRecoverPassword(email: string): Promise<void> {
    const existAuth = await this.authModel.findOne({ email }).exec();
    if (!existAuth) {
      throw 'User not existed';
    }
    await this.sendCode(email, 'Recover');
  }

  public async recoverPassword(data: RecoverBody): Promise<void> {
    const existAuth = await this.authModel.findOne({ email: data.email }, '+password').exec();
    if (!existAuth) {
      throw 'User not existed';
    }
    const code = await this.cacheService.get(data.email);
    if (data.code !== code) {
      throw 'Code verify failed, please retry';
    }
    await this.cacheService.delete(data.email);
    const newPassword = decodeMD5(data.password);
    await this.authModel.findOneAndUpdate(existAuth._id, { password: newPassword }, { new: false }).exec();
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
    const auth = await this.authModel.findOne({ email }, ['+password', '+active']).exec();
    if (!auth) {
      throw 'User not exist';
    }
    if (!auth.active) {
      throw 'User not active, please contact admin';
    }
    const existedPassword = auth.password ?? '';
    const loginPassword = password ? decodeMD5(password) : '';
    if (!existedPassword || loginPassword === existedPassword) {
      const token = await this.createToken(auth._id.toString());
      return token;
    } else {
      throw 'Password incorrect';
    }
  }
}
