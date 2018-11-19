#!/usr/bin/env bash

docker build -t laurenzgamper/chrome-print:unstable .
docker push laurenzgamper/chrome-print:unstable
