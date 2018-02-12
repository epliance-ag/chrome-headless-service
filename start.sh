#!/usr/bin/dumb-init /bin/sh
/usr/bin/google-chrome-stable --no-sandbox --disable-gpu --headless --hide-scrollbars --disable-dev-shm-usage \
--remote-debugging-address=0.0.0.0 --remote-debugging-port=9222 --user-data-dir=/data &  # launch chrome in the background

npm start
