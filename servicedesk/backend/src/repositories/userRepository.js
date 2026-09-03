const User = require('../models/User');

const findByEmail = async (email) => {
  return User.findOne({ email: String(email).toLowerCase() });
};

const findById = async (id) => {
  return User.findById(id).select('-password');
};

const create = async ({ name, email, password, role }) => {
  return User.create({
    name,
    email: String(email).toLowerCase(),
    password,
    role: role || 'customer',
  });
};

module.exports = {
  findByEmail,
  findById,
  create,
};
