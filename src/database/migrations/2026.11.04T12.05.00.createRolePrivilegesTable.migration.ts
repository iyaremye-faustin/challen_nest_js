import { DataTypes, Sequelize } from 'sequelize';
import type { Migration } from '../umzug';
import { Tables } from '../tables';

export const up: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.createTable(Tables.RolePrivilege, {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Tables.Role,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    privilege: {
      type: DataTypes.STRING,
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

  await queryInterface.addConstraint(Tables.RolePrivilege, {
    fields: ['role_id', 'privilege'],
    type: 'unique',
    name: 'uq_role_privileges_role_privilege',
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().dropTable(Tables.RolePrivilege);
};
