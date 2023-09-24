FROM node:20-alpine
LABEL maintainer="625626423@qq.com"

ARG CY_TOKEN
ARG DB_URI
ARG REDIS_NAMESPACE
ARG SERVER_HOST
ARG REDIS_PASSWORD
ARG AUTH_KEY
ARG EMAIL_TOKEN

ENV cy_token $CY_TOKEN
ENV db_uri $DB_URI
ENV redis_namespace $REDIS_NAMESPACE
ENV server_host $SERVER_HOST
ENV redis_password $REDIS_PASSWORD
ENV auth_key $AUTH_KEY
ENV email_token $EMAIL_TOKEN

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
#RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories
#RUN apk add curl

WORKDIR /home/node/app
COPY package*.json ./
USER node
RUN npm install
COPY --chown=node:node . .
RUN npm run build

CMD [
  "node",
  "dist/main.js",
  "--cy_token " + $cy_token,
  "--db_uri " + $db_uri,
  "--redis_namespace " + $redis_namespace,
  "--server_host " + $server_host,
  "--redis_password " + $redis_password,
  "--auth_key " + $auth_key,
  "--email_token" + $email_token
]