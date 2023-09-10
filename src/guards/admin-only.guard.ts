import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { HttpUnauthorizedError } from '@app/errors/unauthorized.error';
import { UNDEFINED } from '@app/constants/value.constant';
import logger from '@app/utils/logger';

const log = logger.scope('AdminOnlyGuard');

/**
 * @class AdminOnlyGuard
 * @classdesc Token existed -> Token activated -> Token data validated
 * @example ```@UseGuards(AdminOnlyGuard)```
 */
@Injectable()
export class AdminOnlyGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(error, authInfo, errInfo) {
    log.debug('handleRequest', authInfo, errInfo?.message);
    if (authInfo && !error && !errInfo) {
      return authInfo;
    } else {
      throw error || new HttpUnauthorizedError(UNDEFINED, errInfo?.message);
    }
  }
}
