FROM nginx:alpine

COPY nginx/nginx.conf /etc/nginx/nginx.conf

RUN mkdir /etc/nginx/logs

WORKDIR /usr/share/nginx/html

COPY dist .
