import { DataTypes } from 'sequelize';
import type { Migration } from '../umzug';
import { Tables } from '../tables';

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().changeColumn(Tables.User, 'address', {
    type: DataTypes.JSON,
    allowNull: true,
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().changeColumn(Tables.User, 'address', {
    type: DataTypes.JSON,
    allowNull: false,
  });
};
