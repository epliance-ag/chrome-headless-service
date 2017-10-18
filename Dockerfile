# multi-stage build new in Docker 17.05 (https://docs.docker.com/engine/userguide/eng-image/multistage-build/)
FROM knqz/chrome-headless
FROM node:8

# chrome dependencies
RUN apt-get update -y && apt-get install -y -q libnss3 libfontconfig && rm -rf /var/lib/apt/lists/*

COPY --from=0 /headless_shell /headless_shell

WORKDIR /server
ADD package.json /server/package.json
RUN npm i

ADD . /server
WORKDIR /server

RUN npm install

EXPOSE 8888

CMD ["/headless_shell/headless_shell", "--no-sandbox", "--hide-scrollbars", "--remote-debugging-address=0.0.0.0", "--remote-debugging-port=9222"]
ENTRYPOINT ["./start.sh"]
