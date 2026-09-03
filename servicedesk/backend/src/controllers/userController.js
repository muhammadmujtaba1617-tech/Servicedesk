const userService = require('../services/userService');

const getUsers = async (req, res) => {
  try {
    const { role, page = 1, pageSize = 10 } = req.query;
    const result = await userService.listUsers({ role, page, pageSize });
    return res.json({ success: true, data: result });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message || 'Failed to fetch users' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const user = await userService.updateUserRole({
      userId: req.params.id,
      role: req.body.role,
    });

    return res.json({ success: true, data: user });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message || 'Failed to update user role' });
  }
};

module.exports = {
  getUsers,
  updateUserRole,
};
