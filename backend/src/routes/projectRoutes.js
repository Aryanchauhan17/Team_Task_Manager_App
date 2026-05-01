import express from 'express';
import { createProject, getProjects, getProject, updateProject, deleteProject, addMember, removeMember } from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // all project routes require login

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

export default router;