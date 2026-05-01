import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Task = sequelize.define('Task', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [3, 200],
        notEmpty: true,
      },
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM('todo', 'in-progress', 'done'),
      defaultValue: 'todo',
      allowNull: false,
    },

    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium',
    },

    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    assigneeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },

  }, {
    tableName: 'tasks',
    timestamps: true,
    paranoid: true,

    indexes: [
      { fields: ['projectId'] },
      { fields: ['assigneeId'] },
      { fields: ['status'] },
      { fields: ['dueDate'] },
    ],
  });

  // associations
  Task.associate = (models) => {

    // Project relation
    Task.belongsTo(models.Project, {
      foreignKey: 'projectId',
      as: 'project',
      onDelete: 'CASCADE',
    });

    // Assigned user
    Task.belongsTo(models.User, {
      foreignKey: 'assigneeId',
      as: 'assignee',
    });

    // Creator
    Task.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator',
    });
  };

  return Task;
};