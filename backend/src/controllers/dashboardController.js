import models from '../models/index.js';
import { Op } from 'sequelize';

const { Task, Project, User, ProjectMember } = models;

// /api/dashboard
export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // get all projects user is member of
    const memberships = await ProjectMember.findAll({ where: { userId } });
    const projectIds = memberships.map((m) => m.projectId);

    // total projects
    const totalProjects = projectIds.length;

    // tasks assigned to user
    const myTasks = await Task.findAll({
      where: { assigneeId: userId },
      include: [{ model: Project, as: 'project', attributes: ['id', 'name'] }],
    });

    // task counts by status
    const todoTasks = myTasks.filter((t) => t.status === 'todo').length;
    const inProgressTasks = myTasks.filter((t) => t.status === 'in-progress').length;
    const completedTasks = myTasks.filter((t) => t.status === 'done').length;

    // overdue tasks
    const now = new Date();
    const overdueTasks = myTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
    );

    // all tasks across user's projects
    const allProjectTasks = await Task.findAll({
      where: { projectId: { [Op.in]: projectIds } },
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: Project, as: 'project', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 10, 
    });

    res.status(200).json({
      success: true,
      dashboard: {
        totalProjects,
        myTasks: {
          total: myTasks.length,
          todo: todoTasks,
          inProgress: inProgressTasks,
          completed: completedTasks,
        },
        overdueTasks: {
          total: overdueTasks.length,
          tasks: overdueTasks,
        },
        recentTasks: allProjectTasks,
      },
    });
  } catch (err) {
    next(err);
  }
};