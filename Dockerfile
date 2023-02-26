# build stage
FROM node:lts-alpine as build-stage

# npm build dependencies
RUN apk add --no-cache python3 py3-pip make g++

WORKDIR /app

COPY package*.json ./

# install project dependencies
RUN npm install --save-dev

COPY . .

ARG API_URL
ARG APP_BASE
ARG APP_NAME
ARG APP_FILEURL
ARG APP_SOCKETURL
ARG APP_BUILD

ENV VUE_APP_APIURL $API_URL
ENV VUE_APP_BUILD $APP_BUILD
ENV VUE_APP_BASE $APP_BASE
ENV VUE_APP_NAME $APP_NAME
ENV VUE_APP_FILEURL $APP_FILEURL
ENV VUE_APP_SOCKETURL $APP_SOCKETURL

RUN echo "VUE_APP_APIURL=$API_URL" >> .env
RUN echo "VUE_APP_BASE=$APP_BAS" >> .env
RUN echo "VUE_APP_NAME= $APP_NAME" >> .env
RUN echo "VUE_APP_SOCKETURL=$APP_SOCKETURL" >> .env
RUN echo "VUE_APP_FILEURL= $APP_FILEURL" >> .env
RUN echo "VUE_APP_BUILD=$APP_BUILD" >> .env

RUN npm run test:unit
RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY ./nginx.conf.default /etc/nginx/nginx.conf
#COPY .htpasswd /etc/nginx
RUN mkdir -p /recordings

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
