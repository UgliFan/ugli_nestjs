import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { Injectable, Inject, Scope, PipeTransform } from '@nestjs/common';
import { decodeBase64 } from '@app/transformers/codec.transformer';
import { CacheService } from '@app/processors/cache/cache.service';

/**
 * @class AuthPipe
 * @classdesc validate metatype class permission & guest default value
 */
@Injectable({ scope: Scope.REQUEST })
export class AuthPipe implements PipeTransform<any> {
  constructor(
    private readonly cacheService: CacheService,
    @Inject(REQUEST) protected readonly request: Request,
  ) {}

  async transform(value: any) {
    // admin > any request params
    if (this.request.isAuthenticated()) {
      const encodeJwtSign = this.request.headers.authorization?.split('.')[1] || '';
      if (encodeJwtSign) {
        const jwtSign = JSON.parse(decodeBase64(encodeJwtSign)).data;
        const region = await this.cacheService.get(`region.${jwtSign}`);
        value['auth'] = {
          id: jwtSign,
          region,
        };
      }
      return value;
    }

    return value;
  }
}
