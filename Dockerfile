FROM node:current-alpine3.18

USER node

# Create app directory
WORKDIR /home/node/timetracker

COPY --chown=node:node . .

WORKDIR /home/node/timetracker/frontend

RUN npm install
RUN npm run build:all

WORKDIR /home/node/timetracker/backend

RUN npm install

EXPOSE 7667

CMD [ "npm", "run", "start" ]