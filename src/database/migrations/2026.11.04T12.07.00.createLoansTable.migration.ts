import { DataTypes, Sequelize } from 'sequelize';
import type { Migration } from '../umzug';
import { Tables } from '../tables';
import { LOAN_STATUS, LOAN_PAYMENT_STATUS } from '../../constants/general';

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable(Tables.Loan, {
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
    },
    loan_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    loan_status: {
      type: DataTypes.ENUM(...Object.values(LOAN_STATUS)),
      allowNull: false,
      defaultValue: LOAN_STATUS.PENDING,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.ENUM(...Object.values(LOAN_PAYMENT_STATUS)),
      allowNull: false,
      defaultValue: LOAN_PAYMENT_STATUS.PENDING,
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
  await sequelize.getQueryInterface().dropTable(Tables.Loan);
};
