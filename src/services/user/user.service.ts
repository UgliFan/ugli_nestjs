import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@app/transformers/model.transformer';
import { MongooseModel } from '@app/interfaces/mongoose.interface';
import { User } from '../../modules/user/user.schema';
import { UserCreateDTO } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User) private readonly userModel: MongooseModel<User>,
  ) {}

  async putUserInfo(payload: UserCreateDTO): Promise<User> {
    return this.userModel.create(payload);
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}
