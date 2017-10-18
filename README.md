# chrome-print

A headless chrome process with an express-based API in front of it. Upload an
HTML file, specify width and height, get a PDF back.

## Run

```bash
docker-compose up
```

## Usage

```bash
# get the port the server is listening on
port=`docker ps |grep chromeprint_print |sed 's/.*:\([0-9]*\)-.*/\1/'`

# send the request
curl \
  -F "htmlFile=@test.html" \
  -X POST \
  -H "Content-Type: multipart/form-data" \
  -o test.pdf \
  http://localhost:$port/
```

## Attribution

The code is originally from https://github.com/ElasticSuite/chrome-print . 