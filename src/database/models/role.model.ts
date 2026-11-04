import {
  AllowNull,
  Column,
  DataType,
  Table,
  PrimaryKey,
  Default,
  Model,
  HasMany,
} from 'sequelize-typescript';
import { Tables as Tname } from '../tables';
import {
  InferCreationAttributes,
  InferAttributes,
  type CreationOptional,
  Sequelize,
  DataTypes,
} from 'sequelize';
import { RolePrivilege } from './role-privilege.model';

@Table({
  tableName: Tname.Role,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Role extends Model<
  InferAttributes<Role>,
  InferCreationAttributes<Role>
> {
  @Default(DataTypes.UUIDV4)
  @PrimaryKey
  @AllowNull(false)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare name: string;

  @HasMany(() => RolePrivilege)
  declare privileges?: RolePrivilege[];

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare is_superadmin: boolean;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare is_admin: boolean;

  @Default(Sequelize.fn('now'))
  @AllowNull(false)
  @Column(DataType.DATE)
  declare created_at: CreationOptional<Date>;

  @Default(Sequelize.fn('now'))
  @AllowNull(false)
  @Column(DataType.DATE)
  declare updated_at: CreationOptional<Date>;
}
