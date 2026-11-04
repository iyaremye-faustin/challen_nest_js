import { DataTypes, Sequelize } from 'sequelize';
import type { Migration } from '../umzug';
import { Tables } from '../tables';
import { USER_STATUS } from '../../constants/general';

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable(Tables.User, {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    salt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(USER_STATUS)),
      allowNull: false,
      defaultValue: USER_STATUS.PENDING,
    },
    address: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Tables.Role,
        key: 'id',
      },
    },
    account_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('now'),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('now'),
    },
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().dropTable(Tables.User);
};
