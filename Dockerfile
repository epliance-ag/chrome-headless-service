FROM node:8-alpine

# Installs latest Chromium package.
RUN apk update && apk upgrade \
    && echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories \
    && echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories \
    && apk add --no-cache \
    chromium@edge \
    nss@edge \
    && rm -rf /var/lib/apt/lists/* \
    /var/cache/apk/* \
    /usr/share/man \
    /tmp/*

# Add Chrome as a user
RUN mkdir -p /server \
    && adduser -D chrome \
    && chown -R chrome:chrome /server
# Run Chrome as non-privileged
USER chrome

WORKDIR /server
ADD package.json /server/package.json
RUN npm i && npm cache clean --force

ADD start.sh /server/start.sh
ADD server.js /server/server.js

EXPOSE 8888

ENTRYPOINT ["./start.sh"]
