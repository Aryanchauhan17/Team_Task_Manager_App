import express from 'express';
import { createTask, getTasks, getTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true }); 

router.use(protect);

router.post('/', createTask);
router.get('/', getTasks);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;