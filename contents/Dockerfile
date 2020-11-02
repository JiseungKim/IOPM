FROM node:14-alpine
WORKDIR app
COPY . .

RUN npm install --silent
RUN npm install pm2 -g --silent

ENV ENVIRONMENT=local
CMD pm2-runtime start ecosystem.config.js --env ${ENVIRONMENT}