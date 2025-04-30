// src/utils/errorHandler.ts
import { Response } from 'express';
import mongoose from 'mongoose';

interface ErrorResponse {
  message: string;
  stack?: string;
  errors?: any;
}

/**
 * Handle errors and send appropriate response
 */
export const errorHandler = (error: any, res: Response): void => {
  console.error('Error:', error);
  
  const response: ErrorResponse = {
    message: 'Internal server error'
  };
  
  // Add stack trace in development environment
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }
  
  // Handle specific error types
  if (error instanceof mongoose.Error.ValidationError) {
    // Mongoose validation error
    response.message = 'Validation error';
    response.errors = Object.keys(error.errors).reduce((acc: any, key) => {
      acc[key] = error.errors[key].message;
      return acc;
    }, {});
    
    res.status(400).json(response);
    return;
  }
  
  if (error instanceof mongoose.Error.CastError) {
    // Invalid ID format
    response.message = `Invalid ${error.path}: ${error.value}`;
    res.status(400).json(response);
    return;
  }
  
  if (error.code === 11000) {
    // Duplicate key error
    response.message = 'Duplicate field value entered';
    response.errors = error.keyValue;
    res.status(400).json(response);
    return;
  }
  
  if (error.name === 'JsonWebTokenError') {
    // JWT error
    response.message = 'Invalid token';
    res.status(401).json(response);
    return;
  }
  
  if (error.name === 'TokenExpiredError') {
    // Token expired
    response.message = 'Token expired';
    res.status(401).json(response);
    return;
  }
  
  // Handle custom errors
  if (error.message) {
    response.message = error.message;
  }
  
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json(response);
};

/**
 * Create a custom error with status code
 */
export class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}