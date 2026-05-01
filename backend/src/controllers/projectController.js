import models from '../models/index.js';

const { Project, User, ProjectMember } = models;

// /api/projects
export const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      ownerId: req.user.id,
    });

    // add creator as admin member
    await ProjectMember.create({
      projectId: project.id,
      userId: req.user.id,
      role: 'admin',
    });

    res.status(201).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

// /api/projects
export const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.findAll({
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email'], through: { attributes: ['role'] } },
      ],
      where: { '$members.id$': req.user.id },
    });

    res.status(200).json({ success: true, projects });
  } catch (err) {
    next(err);
  }
};

// /api/projects/:id
export const getProject = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email'], through: { attributes: ['role'] } },
      ],
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.status(200).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

// /api/projects/:id
export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await project.update(req.body);
    res.status(200).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

// /api/projects/:id
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await project.destroy();
    res.status(200).json({ success: true, message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
};

// /api/projects/:id/members
export const addMember = async (req, res, next) => {
  try {
    const { email, role } = req.body  

    const project = await Project.findByPk(req.params.id)
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }

    if (project.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with this email' })
    }

    const existing = await ProjectMember.findOne({ 
      where: { projectId: project.id, userId: user.id } 
    })
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already a member' })
    }

    const member = await ProjectMember.create({ 
      projectId: project.id, 
      userId: user.id,  
      role: role || 'member' 
    })

    res.status(201).json({ success: true, member })
  } catch (err) {
    next(err)
  }
}

// /api/projects/:id/members/:userId
export const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await ProjectMember.destroy({ where: { projectId: project.id, userId: req.params.userId } });
    res.status(200).json({ success: true, message: 'Member removed' });
  } catch (err) {
    next(err);
  }
};