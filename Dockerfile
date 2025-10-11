FROM node:24-alpine3.22 as build
WORKDIR /app
COPY ./package.json /app/
RUN npm install -a --legacy-peer-deps
COPY . /app/
ARG CONFIG_ARG
ENV CONFIG_ENV=$CONFIG_ARG
RUN npm run ng build -- --configuration=${CONFIG_ENV} --output-hashing=all

FROM nginx as runtime
COPY .nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/pc-admin /usr/share/nginx/html
