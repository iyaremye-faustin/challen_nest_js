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
import { Role } from './role.model';

@Table({
  tableName: Tname.RolePrivilege,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class RolePrivilege extends Model<
  InferAttributes<RolePrivilege>,
  InferCreationAttributes<RolePrivilege>
> {
  @Default(DataTypes.UUIDV4)
  @PrimaryKey
  @AllowNull(false)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @ForeignKey(() => Role)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare role_id: string;

  @BelongsTo(() => Role)
  declare role?: Role;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare privilege: string;

  @Default(Sequelize.fn('now'))
  @AllowNull(false)
  @Column(DataType.DATE)
  declare created_at: CreationOptional<Date>;

  @Default(Sequelize.fn('now'))
  @AllowNull(false)
  @Column(DataType.DATE)
  declare updated_at: CreationOptional<Date>;
}
