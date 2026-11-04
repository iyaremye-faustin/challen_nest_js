import {
  AllowNull,
  Column,
  DataType,
  Table,
  PrimaryKey,
  Default,
  Model,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Tables as Tname } from '../tables';
import {
  InferCreationAttributes,
  InferAttributes,
  type CreationOptional,
  Sequelize,
  DataTypes,
} from 'sequelize';
import { User } from './user.model';

@Table({
  tableName: Tname.UserToken,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class UserToken extends Model<
  InferAttributes<UserToken>,
  InferCreationAttributes<UserToken>
> {
  @Default(DataTypes.UUIDV4)
  @PrimaryKey
  @AllowNull(false)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare user_id: string;

  @BelongsTo(() => User)
  declare user?: User;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare access_token: string;

  @Default(Sequelize.fn('now'))
  @AllowNull(false)
  @Column(DataType.DATE)
  declare created_at: CreationOptional<Date>;

  @Default(Sequelize.fn('now'))
  @AllowNull(false)
  @Column(DataType.DATE)
  declare updated_at: CreationOptional<Date>;
}
