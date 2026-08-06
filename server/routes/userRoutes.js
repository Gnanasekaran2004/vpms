import express from 'express';
import { getAllUsers, createUser, updateUser, deleteUser, getEmployeeList } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const r = express.Router();

r.use(protect);

r.get('/employees/list', authorizeRoles('Administrator', 'Receptionist'), getEmployeeList);

r.use(authorizeRoles('Administrator'));

r.get('/', getAllUsers);
r.post('/', createUser);
r.put('/:id', updateUser);
r.delete('/:id', deleteUser);

export default r;
