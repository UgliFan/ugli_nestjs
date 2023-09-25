import logger from '@app/utils/logger';
import path from 'path';
import yargs from 'yargs';

const argv = yargs.argv as Record<string, string | void>;
const ROOT_PATH = path.join(__dirname, '../..');
const packageJSON = require(path.resolve(ROOT_PATH, 'package.json'));

const log = logger.scope('APP CONFIG');

log.debug('argv', argv);

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
  cyToken: argv.cy_token || '',
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
  uri: argv.db_uri || '',
};

export const REDIS = {
  namespace: argv.redis_namespace || '',
  host: argv.server_host || '',
  port: 6379,
  username: 'default',
  password: argv.redis_password?.toString() || '',
};

export const AUTH = {
  expiresIn: 3600,
  jwtSecret: argv.auth_key || '',
};

export const EMAIL = {
  account: '625626423@qq.com',
  token: argv.email_token || '',
};
