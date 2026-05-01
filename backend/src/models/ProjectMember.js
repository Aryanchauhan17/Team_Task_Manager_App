import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ProjectMember = sequelize.define('ProjectMember', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    role: {
      type: DataTypes.ENUM('admin', 'member'),
      defaultValue: 'member',
      allowNull: false,
    },

    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

  }, {
    tableName: 'project_members',
    timestamps: false,

    indexes: [
      { fields: ['projectId'] },
      { fields: ['userId'] },
      {
        unique: true,
        fields: ['projectId', 'userId'], 
      },
    ],
  });

  // associations
  ProjectMember.associate = (models) => {
    ProjectMember.belongsTo(models.Project, {
      foreignKey: 'projectId',
      onDelete: 'CASCADE',
    });

    ProjectMember.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
    });
  };

  return ProjectMember;
};