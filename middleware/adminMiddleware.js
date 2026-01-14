module.exports = (req, res, next) => {
  console.log('Admin check req.user:', req.user); // <-- debug line
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied: Admins only' });
  }
  next();
};
