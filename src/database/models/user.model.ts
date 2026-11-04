import {
  AllowNull,
  Column,
  DataType,
  Table,
  PrimaryKey,
  Default,
  Unique,
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
import { USER_STATUS, type CountryAddress } from '../../constants/general';
import { Role } from './role.model';

@Table({
  tableName: Tname.User,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  @Default(DataTypes.UUIDV4)
  @PrimaryKey
  @AllowNull(false)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare name: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  declare email: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare password: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare salt: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  declare phone: string;

  @AllowNull(false)
  @Default(USER_STATUS.PENDING)
  @Column(DataType.ENUM(...Object.values(USER_STATUS)))
  declare status: string;

  @AllowNull(true)
  @Column(DataType.JSON)
  declare address: CountryAddress | null;

  @ForeignKey(() => Role)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare role_id: string;

  @BelongsTo(() => Role)
  declare role?: Role;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare account_verified: boolean;

  @Default(Sequelize.fn('now'))
  @AllowNull(false)
  @Column(DataType.DATE)
  declare created_at: CreationOptional<Date>;

  @Default(Sequelize.fn('now'))
  @AllowNull(false)
  @Column(DataType.DATE)
  declare updated_at: CreationOptional<Date>;
}
