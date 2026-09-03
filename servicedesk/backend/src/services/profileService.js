const sanitizeUserProfile = (user = {}) => {
  const safeUser = user.toObject ? user.toObject() : { ...user };
  delete safeUser.password;

  return {
    ...safeUser,
    id: safeUser._id?.toString?.() || safeUser.id,
  };
};

module.exports = {
  sanitizeUserProfile,
};
