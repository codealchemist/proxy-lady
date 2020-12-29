FROM node:14-alpine

WORKDIR /opt/app

# ENV PORT=80

# daemon for cron jobs
RUN echo 'crond' > /boot.sh
# RUN echo 'crontab .openode.cron' >> /boot.sh

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)

COPY package*.json ./

RUN npm i -g pm2
RUN npm i -g websocket-broadcast
RUN npm install --production


# Bundle app source
COPY . .
RUN echo "-- CERT --"
RUN cat /opt/app/server.cert
CMD sh /boot.sh && pm2-runtime websocket-broadcast --noid -p 443 --cert /opt/app/server.cert --key /opt/app/server.key
