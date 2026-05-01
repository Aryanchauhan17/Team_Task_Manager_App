import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';

export default (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { len: [2, 100], notEmpty: true },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
      set(value) {
        this.setDataValue('email', value.toLowerCase().trim());
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [6, 100] },
    },
    role: {
      type: DataTypes.ENUM('admin', 'member'),
      defaultValue: 'member',
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
    },
    refreshToken: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'users',
    timestamps: true,
    paranoid: true,

    indexes: [
      { unique: true, fields: ['email'] },
    ],

    defaultScope: {
      attributes: { exclude: ['password', 'refreshToken'] },
    },

    scopes: {
      withPassword: {
        attributes: { include: ['password'] },
      },
    },

    hooks: {
      beforeSave: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
  });

  // instance methods
  User.prototype.comparePassword = async function (plain) {
    return bcrypt.compare(plain, this.password);
  };

  // hide sensitive fields
  User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    delete values.refreshToken;
    return values;
  };

  User.associate = (models) => {
    User.hasMany(models.Project, { foreignKey: 'ownerId', as: 'ownedProjects' });
    User.hasMany(models.ProjectMember, { foreignKey: 'userId', as: 'memberships' });
    User.hasMany(models.Task, { foreignKey: 'assigneeId', as: 'assignedTasks' });
    User.hasMany(models.Task, { foreignKey: 'createdBy', as: 'createdTasks' });
    User.hasMany(models.Comment, { foreignKey: 'userId', as: 'comments' });
  };

  return User;
};