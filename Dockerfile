FROM node:18
RUN mkdir -p /var/www/users-service
WORKDIR /var/www/users-service
ADD . /var/www/users-service
RUN npm install
CMD npm run build && npm run start:prod