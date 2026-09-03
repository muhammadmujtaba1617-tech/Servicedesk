const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const { generateToken } = require('../config/jwt');

const registerUser = async ({ name, email, password, role }) => {
  if (!name || !email || !password) {
    const error = new Error('Name, email and password are required');
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    const error = new Error('User already exists');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await userRepository.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  const token = generateToken(user);
  const safeUser = user.toObject();
  delete safeUser.password;

  return { user: safeUser, token };
};

const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.statusCode = 400;
    throw error;
  }

  const user = await userRepository.findByEmail(email);
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);
  const safeUser = user.toObject();
  delete safeUser.password;

  return { user: safeUser, token };
};

module.exports = {
  registerUser,
  loginUser,
};
