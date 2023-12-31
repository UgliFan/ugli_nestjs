import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Injectable, NestInterceptor, CallHandler, ExecutionContext } from '@nestjs/common';
import { HttpResponseSuccess, ResponseStatus } from '@app/interfaces/response.interface';
import { getResponserOptions } from '@app/decorators/responser.decorator';
import { HTTP_DEFAULT_SUCCESS_TEXT } from '@app/constants/text.constant';
import logger from '@app/utils/logger';

/**
 * @class TransformInterceptor
 * @classdesc transform `T` to `HttpResponseSuccess<T>` when controller `Promise` resolved
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, T | HttpResponseSuccess<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<T | HttpResponseSuccess<T>> {
    const target = context.getHandler();
    const { successMessage, transform, paginate } = getResponserOptions(target);
    if (!transform) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    logger.debug('TransformInterceptor', request.isAuthenticated());
    return next.handle().pipe(
      map((data: any) => {
        return {
          status: ResponseStatus.Success,
          message: successMessage || HTTP_DEFAULT_SUCCESS_TEXT,
          result: paginate
            ? {
                data: data.documents,
                pagination: {
                  total: data.total,
                  current_page: data.page,
                  per_page: data.perPage,
                  total_page: data.totalPage,
                },
              }
            : data,
        };
      }),
    );
  }
}
