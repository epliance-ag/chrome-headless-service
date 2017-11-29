# multi-stage build new in Docker 17.05 (https://docs.docker.com/engine/userguide/eng-image/multistage-build/)
#replace chrome version number with most recent stable build
FROM yukinying/chrome-headless-browser:62.0.3202.18
FROM node:8

# chrome dependencies
RUN apt-get update -y && apt-get install -y -q libnss3 libfontconfig && rm -rf /var/lib/apt/lists/*

COPY --from=0 /headless_shell /headless_shell

WORKDIR /server
ADD package.json /server/package.json
RUN npm i

ADD start.sh /server/start.sh
ADD server.js /server/server.js

EXPOSE 8888

CMD ["/headless_shell/headless_shell", "--no-sandbox", "--hide-scrollbars", "--remote-debugging-address=0.0.0.0", "--remote-debugging-port=9222"]
ENTRYPOINT ["./start.sh"]
