# build stage
FROM node:21-bookworm as build-stage

# npm build dependencies
RUN apt update && apt upgrade -y
RUN apt install python3 make g++

WORKDIR /app

COPY package*.json ./

# buildx emulation is so slow that NPM install might time-out
RUN npm install --fetch-timeout=600000

# install project dependencies
RUN npm install --save-dev

COPY . .

RUN npm run test:unit
RUN npm run build

ARG APP_API_URL
ARG APP_BASE
ARG APP_NAME
ARG APP_FILEURL
ARG APP_SOCKETURL
ARG APP_BUILD

ENV VUE_APP_APIURL $APP_API_URL
ENV VUE_APP_BUILD $APP_BUILD
ENV VUE_APP_BASE $APP_BASE
ENV VUE_APP_NAME $APP_NAME
ENV VUE_APP_FILEURL $APP_FILEURL
ENV VUE_APP_SOCKETURL $APP_SOCKETURL

# production stage
FROM nginx:stable as production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY ./nginx.conf.default /etc/nginx/nginx.conf
#COPY .htpasswd /etc/nginx
RUN mkdir -p /recordings

EXPOSE 80

COPY docker-entrypoint.sh /usr/local/bin/

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
