#!/bin/bash
/headless_shell/headless_shell --no-sandbox --hide-scrollbars --remote-debugging-address=0.0.0.0 --remote-debugging-port=9222 &
npm start
