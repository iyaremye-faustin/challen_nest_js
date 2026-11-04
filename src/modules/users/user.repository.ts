import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseRepository } from '../../common/base.repository';
import { User } from '../../database/models/user.model';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(@InjectModel(User) userModel: typeof User) {
    super(userModel);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.findOne({ phone });
  }
}
