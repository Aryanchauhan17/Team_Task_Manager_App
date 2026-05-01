import models from '../models/index.js';

const { Task, User, Project, ProjectMember } = models;

// check if user is member of project
const isMember = async (projectId, userId) => {
  const member = await ProjectMember.findOne({ where: { projectId, userId } });
  return !!member;
};

// /api/projects/:projectId/tasks
export const createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;
    const { projectId } = req.params;

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const member = await isMember(projectId, req.user.id);
    if (!member) {
      return res.status(403).json({ success: false, message: 'Not a member of this project' });
    }

    
    if (assignedTo) {
      const assigneeMember = await isMember(projectId, assignedTo);
      if (!assigneeMember) {
        return res.status(400).json({ success: false, message: 'Assignee is not a member of this project' });
      }
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      assigneeId: assignedTo || null,
      createdBy: req.user.id,
      priority: priority || 'medium',
      dueDate: dueDate || null,
    });

    res.status(201).json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

// /api/projects/:projectId/tasks
export const getTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const member = await isMember(projectId, req.user.id);
    if (!member) {
      return res.status(403).json({ success: false, message: 'Not a member of this project' });
    }

    const tasks = await Task.findAll({
      where: { projectId },
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ success: true, tasks });
  } catch (err) {
    next(err);
  }
};

// /api/projects/:projectId/tasks/:id
export const getTask = async (req, res, next) => {
  try {
    const { projectId, id } = req.params;

    const member = await isMember(projectId, req.user.id);
    if (!member) {
      return res.status(403).json({ success: false, message: 'Not a member of this project' });
    }

    const task = await Task.findOne({
      where: { id, projectId },
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      ],
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

// /api/projects/:projectId/tasks/:id
export const updateTask = async (req, res, next) => {
  try {
    const { projectId, id } = req.params;

    const member = await isMember(projectId, req.user.id);
    if (!member) {
      return res.status(403).json({ success: false, message: 'Not a member of this project' });
    }

    const task = await Task.findOne({ where: { id, projectId } });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // only allow these fields to be updated
    const { title, description, status, priority, dueDate, assignedTo } = req.body;
    await task.update({
      ...(title && { title }),
      ...(description && { description }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(dueDate && { dueDate }),
      ...(assignedTo && { assigneeId: assignedTo }),
    });

    res.status(200).json({ success: true, task });
  } catch (err) {
   console.error('Update task error:', err.message, err.errors);
    next(err);
  }
};
// /api/projects/:projectId/tasks/:id
export const deleteTask = async (req, res, next) => {
  try {
    const { projectId, id } = req.params;

    const task = await Task.findOne({ where: { id, projectId } });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // only project owner or task creator can delete
    const project = await Project.findByPk(projectId);
    if (task.createdBy !== req.user.id && project.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this task' });
    }

    await task.destroy();
    res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};