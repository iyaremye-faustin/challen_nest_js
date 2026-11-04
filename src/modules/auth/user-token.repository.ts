import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseRepository } from '../../common/base.repository';
import { UserToken } from '../../database/models/user-token.model';

@Injectable()
export class UserTokenRepository extends BaseRepository<UserToken> {
  constructor(@InjectModel(UserToken) userTokenModel: typeof UserToken) {
    super(userTokenModel);
  }

  async deleteByUserId(user_id: string): Promise<number> {
    return this.model.destroy({ where: { user_id } });
  }
}
