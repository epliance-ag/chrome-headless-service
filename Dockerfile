FROM ubuntu:bionic
#install chrome
RUN apt-get update -qqy \
  && apt-get -qqy install dumb-init gnupg wget ca-certificates apt-transport-https nodejs npm software-properties-common \
  && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
  && add-apt-repository -y ppa:malteworld/ppa \
  && apt-get update -qqy \
  && apt-get -qqy install google-chrome-stable pdftk-java \
  && echo ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true | debconf-set-selections \
  && apt-get install -qqy ttf-mscorefonts-installer \
  && rm /etc/apt/sources.list.d/google-chrome.list \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt/*

RUN useradd headless --shell /bin/bash --create-home \
  && usermod -a -G sudo headless \
  && echo 'ALL ALL = (ALL) NOPASSWD: ALL' >> /etc/sudoers \
  && echo 'headless:nopassword' | chpasswd

RUN mkdir /data && chown -R headless:headless /data

WORKDIR /server
ADD package.json /server/package.json
RUN npm i && npm cache clean --force

ADD start.sh /server/start.sh
ADD server.js /server/server.js

USER headless

EXPOSE 8888

ENTRYPOINT ["./start.sh"]
