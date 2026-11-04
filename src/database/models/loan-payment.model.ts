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
  Unique,
} from 'sequelize-typescript';
import { Tables as Tname } from '../tables';
import {
  InferCreationAttributes,
  InferAttributes,
  type CreationOptional,
  Sequelize,
  DataTypes,
} from 'sequelize';
import { Loan } from './loan.model';
import {
  PAYMENT_NOTIFICATION_STATUS,
  PAYMENT_CHANNEL,
} from '../../constants/general';

@Table({
  tableName: Tname.Loan_Payment,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class LoanPayment extends Model<
  InferAttributes<LoanPayment>,
  InferCreationAttributes<LoanPayment>
> {
  @Default(DataTypes.UUIDV4)
  @PrimaryKey
  @AllowNull(false)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @ForeignKey(() => Loan)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare loan_id: string;

  @BelongsTo(() => Loan)
  declare loan?: Loan;

  @AllowNull(false)
  @Column(DataType.DECIMAL(15, 2))
  declare amount: string;

  @AllowNull(false)
  @Default(PAYMENT_NOTIFICATION_STATUS.PENDING)
  @Column(DataType.ENUM(...Object.values(PAYMENT_NOTIFICATION_STATUS)))
  declare status: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(PAYMENT_CHANNEL)))
  declare payment_channel: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  declare transaction_id: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare status_reason: string | null;

  @Default(Sequelize.fn('now'))
  @AllowNull(false)
  @Column(DataType.DATE)
  declare created_at: CreationOptional<Date>;

  @Default(Sequelize.fn('now'))
  @AllowNull(false)
  @Column(DataType.DATE)
  declare updated_at: CreationOptional<Date>;
}
