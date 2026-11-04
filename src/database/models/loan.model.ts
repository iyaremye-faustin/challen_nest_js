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
import { LOAN_STATUS, LOAN_PAYMENT_STATUS } from '../../constants/general';

@Table({
  tableName: Tname.Loan,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Loan extends Model<
  InferAttributes<Loan>,
  InferCreationAttributes<Loan>
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
  @Column(DataType.DECIMAL(15, 2))
  declare loan_amount: string;

  @AllowNull(false)
  @Default(LOAN_STATUS.PENDING)
  @Column(DataType.ENUM(...Object.values(LOAN_STATUS)))
  declare loan_status: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare currency: string;

  @AllowNull(false)
  @Default(LOAN_PAYMENT_STATUS.PENDING)
  @Column(DataType.ENUM(...Object.values(LOAN_PAYMENT_STATUS)))
  declare payment_status: string;

  @Default(Sequelize.fn('now'))
  @AllowNull(false)
  @Column(DataType.DATE)
  declare created_at: CreationOptional<Date>;

  @Default(Sequelize.fn('now'))
  @AllowNull(false)
  @Column(DataType.DATE)
  declare updated_at: CreationOptional<Date>;
}
