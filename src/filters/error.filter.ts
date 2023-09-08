import { isString } from 'lodash';
import { ExceptionFilter, Catch, HttpException, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { ResponseStatus, HttpResponseError, ExceptionInfo, ResponseInfo } from '@app/interfaces/response.interface';
import { UNDEFINED } from '@app/constants/value.constant';
import { isDevEnv } from '@app/configs/app.environment';

/**
 * @class HttpExceptionFilter
 * @classdesc catch globally exceptions & formatting error message to <HttpErrorResponse>
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const request = host.switchToHttp().getRequest();
    const response = host.switchToHttp().getResponse();
    const exceptionStatus = exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponse: ExceptionInfo = exception.getResponse() as ExceptionInfo;
    const errorMessage = isString(errorResponse) ? errorResponse : (errorResponse as ResponseInfo).message;
    const errorInfo = isString(errorResponse) ? null : (errorResponse as ResponseInfo).error;

    const data: HttpResponseError = {
      status: ResponseStatus.Error,
      message: errorMessage,
      error: errorInfo?.message || (isString(errorInfo) ? errorInfo : JSON.stringify(errorInfo)),
      debug: isDevEnv ? errorInfo?.stack || exception.stack : UNDEFINED,
    };

    // default 404
    if (exceptionStatus === HttpStatus.NOT_FOUND) {
      data.error = data.error || `Not found`;
      data.message = data.message || `Invalid API: ${request.method} > ${request.url}`;
    }

    return response.status(errorInfo?.status || exceptionStatus).jsonp(data);
  }
}
