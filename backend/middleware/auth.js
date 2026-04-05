const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.status(401).json({ message: 'Authentication required' });
  }
};

const requireTeacher = (req, res, next) => {
  if (req.session && req.session.userId && req.session.role === 'teacher') {
    return next();
  } else {
    return res.status(403).json({ message: 'Teacher access required' });
  }
};

const requireStudent = (req, res, next) => {
  if (req.session && req.session.userId && req.session.role === 'student') {
    return next();
  } else {
    return res.status(403).json({ message: 'Student access required' });
  }
};

module.exports = {
  requireAuth,
  requireTeacher,
  requireStudent
};