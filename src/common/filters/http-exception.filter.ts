// src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError } from 'mongodb';

@Catch(HttpException, Error)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException | Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    // 处理HTTP异常
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        error = (exceptionResponse as any).error || error;
      }
    }
    // 处理MongoDB错误
    else if (exception instanceof MongoError) {
      if (exception.code === 11000) {
        status = HttpStatus.CONFLICT;
        message = 'Duplicate key error';
      }
    }
    // 处理JWT错误
    else if (exception.name === 'JsonWebTokenError') {
      status = HttpStatus.UNAUTHORIZED;
      message = 'Invalid token';
      error = 'Unauthorized';
    } else if (exception.name === 'TokenExpiredError') {
      status = HttpStatus.UNAUTHORIZED;
      message = 'Token expired';
      error = 'Unauthorized';
    }

    // 记录错误
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception.stack,
    );

    // 返回统一格式的错误响应
    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
