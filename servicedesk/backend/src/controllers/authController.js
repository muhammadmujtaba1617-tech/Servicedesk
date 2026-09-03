const { registerUser, loginUser } = require('../services/authService');

const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message || 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);
    return res.json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message || 'Login failed' });
  }
};

const getCurrentUser = async (req, res) => {
  return res.json({
    success: true,
    data: { user: req.user },
  });
};

module.exports = {
  register,
  login,
  getCurrentUser,
};
