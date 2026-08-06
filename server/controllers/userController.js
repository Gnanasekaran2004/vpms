import User from '../models/User.js';
import { ok, err } from '../utils/apiResponse.js';

const validationErr = (res, e) => {
  const msgs = Object.values(e.errors).map(v => v.message);
  return err(res, msgs.join('. '), 400);
};

export const getAllUsers = async (req, res) => {
  try {
    const filter = req.query.role ? { role: req.query.role } : {};
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    return ok(res, users);
  } catch (e) {
    if (e.name === 'ValidationError') return validationErr(res, e);
    return err(res, 'Server Error', 500);
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, phone } = req.body;

    if (!name || !email || !password || !role || !department || !phone)
      return err(res, 'Missing required fields', 400);

    const taken = await User.findOne({ email });
    if (taken) return err(res, 'Email already registered', 400);

    const created = await new User({ name, email, password, role, department, phone }).save();

    const out = created.toObject();
    delete out.password;

    return ok(res, out, 'Success', 201);
  } catch (e) {
    if (e.name === 'ValidationError') return validationErr(res, e);
    return err(res, 'Server Error', 500);
  }
};

export const updateUser = async (req, res) => {
  try {
    const uid = req.params.id;
    const user = await User.findById(uid);

    if (!user) return err(res, 'User not found', 404);

    const { name, email, password, role, department, phone, isActive } = req.body;

    if (!name || !email || !password || !role || !department || !phone)
      return err(res, 'Missing required fields', 400);

    user.name = name;
    user.email = email;
    user.role = role;
    user.department = department;
    user.phone = phone;
    user.password = password;
    if (isActive !== undefined) user.isActive = isActive;

    const updated = await user.save();

    const out = updated.toObject();
    delete out.password;

    return ok(res, out);
  } catch (e) {
    if (e.name === 'ValidationError') return validationErr(res, e);
    return err(res, 'Server Error', 500);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const uid = req.params.id;
    const user = await User.findById(uid);

    if (!user) return err(res, 'User not found', 404);

    user.isActive = false;
    await user.save();

    return ok(res, null, 'User deactivated successfully');
  } catch (e) {
    if (e.name === 'ValidationError') return validationErr(res, e);
    return err(res, 'Server Error', 500);
  }
};

export const getEmployeeList = async (req, res) => {
  try {
    const employees = await User.find({ role: 'Employee', isActive: true }).select('-password').sort({ name: 1 });
    return ok(res, employees);
  } catch (e) {
    return err(res, 'Server Error', 500);
  }
};
