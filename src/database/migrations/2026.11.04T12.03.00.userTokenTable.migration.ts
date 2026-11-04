import { DataTypes, Sequelize } from 'sequelize';
import type { Migration } from '../umzug';
import { Tables } from '../tables';

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable(Tables.UserToken, {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Tables.User,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    access_token: {
      type: DataTypes.TEXT,
      allowNull: false,
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
  await sequelize.getQueryInterface().dropTable(Tables.UserToken);
};
