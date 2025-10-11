FROM node:24-alpine3.22 as build
WORKDIR /app
COPY ./package.json /app/
RUN npm install -a --legacy-peer-deps
COPY . /app/
ARG CONFIG_ARG
ARG NG_BUILD_CONFIGURATION
ENV CONFIG_ENV=$CONFIG_ARG
RUN npm run ng build -- --configuration=${CONFIG_ENV} --output-hashing=all


