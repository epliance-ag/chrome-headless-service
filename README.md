# chrome-print

A headless chrome process with an express-based API in front of it. Upload an
HTML file, specify width and height, get a PDF back.

## Run

```bash
docker-compose up
```

## Usage

# send the request
curl -XPOST -H "Content-Type: application/json" -d @file.json http://localhost:8888 --output result.pdf

## Attribution

The code is originally from https://github.com/ElasticSuite/chrome-print . 