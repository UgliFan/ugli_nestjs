FROM node:18-alpine
LABEL maintainer="625626423@qq.com"

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories
RUN apk add curl
RUN curl -L https://unpkg.com/@pnpm/self-installer | node
RUN pnpm --version

WORKDIR /home/node/app
COPY package*.json ./
USER node
RUN pnpm install
COPY --chown=node:node . .
RUN pnpm run build

CMD "node" "dist/main.js"