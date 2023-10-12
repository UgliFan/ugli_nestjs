import logger from '@app/utils/logger';
import path from 'path';

const ROOT_PATH = path.join(__dirname, '../..');
const packageJSON = require(path.resolve(ROOT_PATH, 'package.json'));
const env = process.env;

const log = logger.scope('APP CONFIG');

log.debug('env', env);

export const APP = {
  PORT: 8000,
  ROOT_PATH,
  DEFAULT_CACHE_TTL: 0,
  MASTER: 'UgliFan',
  NAME: 'UgliFan',
  URL: 'https://api.ugli.fans',
  FE_NAME: 'ugli.fans',
  FE_URL: 'https://ugli.fans',
  STATIC_URL: 'https://static.ugli.fans',
  cyToken: env.CY_TOKEN || '',
};

export const PROJECT = {
  name: packageJSON.name,
  version: packageJSON.version,
  author: packageJSON.author,
  homepage: packageJSON.homepage,
  documentation: packageJSON.documentation,
  repository: packageJSON.repository.url,
};

export const CROSS_DOMAIN = {
  allowedOrigins: [APP.FE_URL, APP.STATIC_URL],
  allowedReferer: APP.FE_NAME,
};

export const MONGO_DB = {
  uri: env.DB_URI || '',
};

export const REDIS = {
  namespace: env.REDIS_NAMESPACE || 'test',
  host: env.REDIS_HOST || '127.0.0.1',
  port: 6379,
  username: 'default',
  password: env.REDIS_PASSWORD || '123456',
};

export const AUTH = {
  expiresIn: 43200, // 12h
  jwtSecret: env.JWT_SECRET || 'test',
};

export const EMAIL = {
  account: '625626423@qq.com',
  token: env.EMAIL_TOKEN || '',
};
