import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';
import config from '../config/index.js';

// export const authenticateToken = async (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
//     // fetch user from DB by id in decoded token
//     const user = await prisma.user.findUnique({
//       where: { id: decoded.userId }
//     });

//     if (!user) {
//       return res.status(401).json({ message: 'User not found' });
//     }

//     req.user = user;  // full user object
//     next();
//   } catch (err) {
//     res.status(403).json({ message: 'Invalid or expired token.' });
//   }
// };


// export const protect = async (req, res, next) => {
//   let token;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     try {
//       token = req.headers.authorization.split(' ')[1];
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       const user = await prisma.user.findUnique({
//         where: { id: decoded.userId },
//       });

//       if (!user) {
//         return res.status(401).json({ message: 'User not found' });
//       }

//       req.user = user;
//       next();
//     } catch (error) {
//       console.error('Auth error:', error);
//       res.status(401).json({ message: 'Not authorized, token failed' });
//     }
//   } else {
//     res.status(401).json({ message: 'Not authorized, no token' });
//   }
// };


export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // fetch user from DB by id in decoded token
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'User is blocked or inactive.' });
    }

    req.user = user;  // full user object
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

export const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (user.status !== 'active') {
        return res.status(403).json({ message: 'User is blocked or inactive.' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Auth error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.id === config.adminUserId) {
    next();
  } else {
    res.status(401).json({ message: 'Only admin can perform this action' });
  }
};