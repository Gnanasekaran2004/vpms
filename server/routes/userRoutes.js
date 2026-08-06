import express from 'express';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getEmployeeList
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const userRouter = express.Router();

userRouter.use(protect);

userRouter.get('/employees/list', authorizeRoles('Administrator', 'Receptionist'), getEmployeeList);

userRouter.use(authorizeRoles('Administrator'));

userRouter.get('/', getAllUsers);
userRouter.post('/', createUser);
userRouter.put('/:id', updateUser);
userRouter.delete('/:id', deleteUser);

export default userRouter;
