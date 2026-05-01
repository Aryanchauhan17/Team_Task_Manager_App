import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 2000],
        notEmpty: true,
      },
    },

    taskId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

  }, {
    tableName: 'comments',
    timestamps: true,
    paranoid: true,

    indexes: [
      { fields: ['taskId'] },
      { fields: ['userId'] },
    ],
  });

  // associations
  Comment.associate = (models) => {

    // belongs to task
    Comment.belongsTo(models.Task, {
      foreignKey: 'taskId',
      as: 'task',
      onDelete: 'CASCADE',
    });

    // belongs to user
    Comment.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'author',
      onDelete: 'CASCADE',
    });
  };

  return Comment;
};