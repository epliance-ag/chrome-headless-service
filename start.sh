#!/usr/bin/dumb-init /bin/sh
/usr/bin/google-chrome-stable --version
/usr/bin/google-chrome-stable --no-sandbox --disable-gpu --bwsi --disable-3d-apis --disable-cloud-import --disable-databases \
            --disable-es3-apis --disable-es3-gl-context --disable-extensions --disable-local-storage --disable-reading-from-canvas \
              --disable-remote-fonts --headless --hide-scrollbars --disable-dev-shm-usage \
--remote-debugging-address=0.0.0.0 --remote-debugging-port=9222 --user-data-dir=/data &  # launch chrome in the background

npm start
