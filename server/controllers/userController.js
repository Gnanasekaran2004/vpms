import User from '../models/User.js';
import { ok, err } from '../utils/apiResponse.js';

const handleValidationError = (res, theError) => {
  const errorMessages = Object.values(theError.errors).map(singleError => singleError.message);
  const combinedErrorString = errorMessages.join('. ');
  return err(res, combinedErrorString, 400);
};

export const getAllUsers = async (req, res) => {
  try {
    let queryFilter = {};
    if (req.query.role) {
      queryFilter = { role: req.query.role };
    }
    const allTheUsers = await User.find(queryFilter).select('-password').sort({ createdAt: -1 });
    return ok(res, allTheUsers);
  } catch (caughtError) {
    if (caughtError.name === 'ValidationError') {
      return handleValidationError(res, caughtError);
    }
    return err(res, 'Server Error', 500);
  }
};

export const createUser = async (req, res) => {
  try {
    const newName = req.body.name;
    const newEmail = req.body.email;
    const newPassword = req.body.password;
    const newRole = req.body.role;
    const newDepartment = req.body.department;
    const newPhone = req.body.phone;

    if (!newName || !newEmail || !newPassword || !newRole || !newDepartment || !newPhone) {
      return err(res, 'Missing required fields', 400);
    }

    const existingUserWithEmail = await User.findOne({ email: newEmail });
    if (existingUserWithEmail) {
      return err(res, 'Email already registered', 400);
    }

    const newlyCreatedUser = await new User({ 
      name: newName, 
      email: newEmail, 
      password: newPassword, 
      role: newRole, 
      department: newDepartment, 
      phone: newPhone 
    }).save();

    const userObjectToSend = newlyCreatedUser.toObject();
    delete userObjectToSend.password;

    return ok(res, userObjectToSend, 'Success', 201);
  } catch (caughtError) {
    if (caughtError.name === 'ValidationError') {
      return handleValidationError(res, caughtError);
    }
    return err(res, 'Server Error', 500);
  }
};

export const updateUser = async (req, res) => {
  try {
    const userIdToUpdate = req.params.id;
    const userToUpdate = await User.findById(userIdToUpdate);

    if (!userToUpdate) {
      return err(res, 'User not found', 404);
    }

    const updatedName = req.body.name;
    const updatedEmail = req.body.email;
    const updatedPassword = req.body.password;
    const updatedRole = req.body.role;
    const updatedDepartment = req.body.department;
    const updatedPhone = req.body.phone;
    const updatedIsActive = req.body.isActive;

    if (!updatedName || !updatedEmail || !updatedPassword || !updatedRole || !updatedDepartment || !updatedPhone) {
      return err(res, 'Missing required fields', 400);
    }

    userToUpdate.name = updatedName;
    userToUpdate.email = updatedEmail;
    userToUpdate.role = updatedRole;
    userToUpdate.department = updatedDepartment;
    userToUpdate.phone = updatedPhone;
    userToUpdate.password = updatedPassword;
    if (updatedIsActive !== undefined) {
      userToUpdate.isActive = updatedIsActive;
    }

    const finallyUpdatedUser = await userToUpdate.save();

    const outputUser = finallyUpdatedUser.toObject();
    delete outputUser.password;

    return ok(res, outputUser);
  } catch (caughtError) {
    if (caughtError.name === 'ValidationError') {
      return handleValidationError(res, caughtError);
    }
    return err(res, 'Server Error', 500);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userIdToDelete = req.params.id;
    const userToDelete = await User.findById(userIdToDelete);

    if (!userToDelete) {
      return err(res, 'User not found', 404);
    }

    userToDelete.isActive = false;
    await userToDelete.save();

    return ok(res, null, 'User deactivated successfully');
  } catch (caughtError) {
    if (caughtError.name === 'ValidationError') {
      return handleValidationError(res, caughtError);
    }
    return err(res, 'Server Error', 500);
  }
};

export const getEmployeeList = async (req, res) => {
  try {
    const activeEmployees = await User.find({ role: 'Employee', isActive: true }).select('-password').sort({ name: 1 });
    return ok(res, activeEmployees);
  } catch (caughtError) {
    return err(res, 'Server Error', 500);
  }
};
