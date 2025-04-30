// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TokenData } from '../dtos/auth.dto';
import config from '../config/env.config';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: TokenData;
    }
  }
}

/**
 * Middleware to authenticate JWT tokens and attach user data to request
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authentication required. No token provided.' });
      return;
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET) as TokenData;
    
    // Attach user data to request
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Invalid token' });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expired' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

/**
 * Middleware to check if user has required roles
 */
export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Check if user exists on request (should be set by authMiddleware)
      if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      // Check if user has any of the required roles
      const hasRequiredRole = req.user.roles.some(role => roles.includes(role));
      
      if (!hasRequiredRole) {
        res.status(403).json({ message: 'Permission denied. Required role not found.' });
        return;
      }
      
      next();
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};