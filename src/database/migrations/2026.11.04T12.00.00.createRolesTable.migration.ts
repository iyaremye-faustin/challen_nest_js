import { DataTypes, Sequelize } from 'sequelize';
import type { Migration } from '../umzug';
import { Tables } from '../tables';

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable(Tables.Role, {
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
    is_superadmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_admin: {
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
  await sequelize.getQueryInterface().dropTable(Tables.Role);
};
