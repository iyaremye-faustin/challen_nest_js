import { DataTypes, Sequelize } from 'sequelize';
import type { Migration } from '../umzug';
import { Tables } from '../tables';
import {
  PAYMENT_NOTIFICATION_STATUS,
  PAYMENT_CHANNEL,
} from '../../constants/general';

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable(Tables.Loan_Payment, {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    loan_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Tables.Loan,
        key: 'id',
      },
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PAYMENT_NOTIFICATION_STATUS)),
      allowNull: false,
      defaultValue: PAYMENT_NOTIFICATION_STATUS.PENDING,
    },
    payment_channel: {
      type: DataTypes.ENUM(...Object.values(PAYMENT_CHANNEL)),
      allowNull: false,
    },
    transaction_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
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
  await sequelize.getQueryInterface().dropTable(Tables.Loan_Payment);
};
