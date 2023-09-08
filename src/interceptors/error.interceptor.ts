import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Injectable, NestInterceptor, CallHandler, ExecutionContext } from '@nestjs/common';
import { getResponserOptions } from '@app/decorators/responser.decorator';
import { CustomError } from '@app/errors/custom.error';
import { HTTP_DEFAULT_ERROR_TEXT } from '@app/constants/text.constant';

/**
 * @class ErrorInterceptor
 * @classdesc catch error when controller Promise rejected
 */
@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const target = context.getHandler();
    const { errorCode, errorMessage } = getResponserOptions(target);
    return next.handle().pipe(
      catchError((error) => {
        return throwError(() => new CustomError({ message: errorMessage || HTTP_DEFAULT_ERROR_TEXT, error }, errorCode));
      }),
    );
  }
}
