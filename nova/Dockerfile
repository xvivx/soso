FROM nginx:latest
RUN rm -rf /usr/share/nginx/html /etc/nginx/conf.d/default.conf
COPY build/ /usr/share/nginx/html
COPY 404.html /usr/share/nginx/html
RUN chown -R nginx:nginx /usr/share/nginx/html
ADD default.conf /etc/nginx/conf.d/default.conf
WORKDIR /logs
#CMD ["nginx","-c","/etc/nginx/nginx.conf"]