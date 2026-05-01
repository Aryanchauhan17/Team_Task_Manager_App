import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Project = sequelize.define('Project', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        len: [3, 150],
        notEmpty: true,
      },
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM('active', 'archived'),
      defaultValue: 'active',
    },

  }, {
    tableName: 'projects',
    timestamps: true,
    paranoid: true,

    indexes: [
      { fields: ['ownerId'] },
      { fields: ['status'] },
    ],
  });

  // associations
  Project.associate = (models) => {

    // Owner
    Project.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'owner',
      onDelete: 'CASCADE',
    });

    // Members (many-to-many)
    Project.belongsToMany(models.User, {
      through: models.ProjectMember,
      foreignKey: 'projectId',
      otherKey: 'userId',
      as: 'members',
    });

    // Tasks
    Project.hasMany(models.Task, {
      foreignKey: 'projectId',
      as: 'tasks',
      onDelete: 'CASCADE',
    });
  };

  return Project;
};