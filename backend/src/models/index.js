import sequelize from '../config/db.js';

import UserModel from './User.js';
import ProjectModel from './Project.js';
import TaskModel from './Task.js';
import CommentModel from './Comment.js';
import ProjectMemberModel from './ProjectMember.js';

const models = {};

models.User = UserModel(sequelize);
models.Project = ProjectModel(sequelize);
models.Task = TaskModel(sequelize);
models.Comment = CommentModel(sequelize);
models.ProjectMember = ProjectMemberModel(sequelize);

// run associations
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

export default models;