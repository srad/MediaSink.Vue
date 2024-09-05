FROM node:22-bookworm as build-stage

RUN apt update && apt upgrade -y
RUN apt install python3 make g++

WORKDIR /app

COPY package*.json ./

# install dependencies. Timeout for buildx emulation, it is so slow that NPM install might time-out
RUN npm install --fetch-timeout=600000 --save-dev --legacy-peer-deps

COPY . .

RUN npm run test
RUN npm run build:ssr

ARG APP_API_URL
ARG APP_BASE
ARG APP_NAME=Streamsink
ARG APP_VERSION=1.0.0-alpha
ARG APP_FILEURL
ARG APP_SOCKETURL
ARG APP_BUILD
ARG NODE_ENV=production

# Vue env
ENV VUE_APP_APIURL $APP_API_URL
ENV VUE_APP_BASE $APP_BASE
ENV VUE_APP_NAME $APP_NAME
ENV VUE_APP_FILEURL $APP_FILEURL
ENV VUE_APP_SOCKETURL $APP_SOCKETURL
ENV VUE_APP_BUILD $APP_BUILD
ENV VUE_APP_VERSION $APP_VERSION
ENV NODE_ENV $NODE_ENV

# The build number is once written to a file after the build.
RUN cat >./dist/build.js <<EOL
window.VUE_APP_BUILD = "${APP_BUILD}";
window.VUE_APP_VERSION = "${APP_VERSION}";
EOL

RUN cat >./dist/.env <<EOL
VITE_VUE_APP_APIURL=${APP_API_URL}
VITE_VUE_APP_BASE=${APP_BASE}
VITE_VUE_APP_NAME=${APP_NAME}
VITE_VUE_APP_SOCKETURL=${APP_SOCKETURL}
VITE_VUE_APP_FILEURL=${APP_FILEURL}
VITE_VUE_APP_BUILD=${APP_BUILD}
VITE_VUE_APP_VERSION=${APP_VERSION}
EOL

# production stage
FROM node:22-bookworm as production-stage

COPY --from=build-stage /app /app

EXPOSE 80

ARG APP_API_URL
ARG APP_BASE
ARG APP_NAME=Streamsink
ARG APP_VERSION
ARG APP_FILEURL
ARG APP_SOCKETURL
ARG APP_BUILD
ARG NODE_ENV=production

ARG NODE_ENV

COPY docker-entrypoint.sh /usr/local/bin/

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

WORKDIR /app

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]