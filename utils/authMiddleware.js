import jwt from 'jsonwebtoken';
import User from '../model/userModel.js';

export const verifyToken = async (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Access denied. Token missing.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.id });

    if (!user || !user.isBlocked) {
      return res.status(401).json({ error: 'User not found or blocked.' });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Invalid token.' });
  }
};


export const verifyAdminToken = async (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Access denied. Token missing.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
    if (decoded.email === 'rahulrjev@gmail.com') {
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized.' });
    }
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Invalid token.' });
  }
};
