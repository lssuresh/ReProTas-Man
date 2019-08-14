FROM nginx:alpine

COPY ngnix/nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

COPY dist .
