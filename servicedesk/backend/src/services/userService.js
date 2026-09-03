const User = require('../models/User');

const normalizeUsers = (users = []) =>
  users.map((user) => {
    const safeUser = user.toObject ? user.toObject() : { ...user };
    delete safeUser.password;
    return {
      ...safeUser,
      id: safeUser._id?.toString?.() || safeUser.id,
    };
  });

const listUsers = async ({ role, page = 1, pageSize = 10 } = {}) => {
  const query = {};
  if (role) {
    query.role = role;
  }

  const skip = (Number(page) - 1) * Number(pageSize);
  const [items, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(pageSize)),
    User.countDocuments(query),
  ]);

  return {
    items: normalizeUsers(items),
    total,
    page: Number(page),
    pageSize: Number(pageSize),
    totalPages: Math.ceil(total / Number(pageSize)) || 1,
  };
};

const updateUserRole = async ({ userId, role }) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (!['customer', 'agent', 'admin'].includes(role)) {
    const error = new Error('Invalid role');
    error.statusCode = 400;
    throw error;
  }

  user.role = role;
  await user.save();

  const safeUser = user.toObject();
  delete safeUser.password;
  return safeUser;
};

module.exports = {
  normalizeUsers,
  listUsers,
  updateUserRole,
};
