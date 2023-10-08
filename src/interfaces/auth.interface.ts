import { Region } from '@app/constants/biz.constant';

export interface AuthInject {
  auth?: {
    id: string;
    region: Region;
  };
}
