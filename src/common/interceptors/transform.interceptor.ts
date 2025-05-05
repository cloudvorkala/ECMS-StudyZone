// src/common/interceptors/transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode || HttpStatus.OK;

    return next.handle().pipe(
      map((data) => {
        // 如果数据中包含message属性，则使用它
        let message = 'Success';
        let responseData = data;

        // 处理包含message和其他数据的响应
        if (data && typeof data === 'object' && 'message' in data) {
          message = data.message;

          // 如果只有message，则不包含data字段
          if (Object.keys(data).length === 1) {
            responseData = null;
          } else {
            // 保留除message外的其他数据
            const { message: _, ...rest } = data;
            responseData = rest;
          }
        }

        return {
          success: true,
          statusCode,
          message,
          data: responseData,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
