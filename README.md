# chrome-print

A headless chrome process with an express-based API in front of it. Upload an
HTML file, specify width and height, get a PDF back.

## Run

```bash
docker-compose up
```

## Usage

### Send the request
```bash
curl -XPOST -H "Content-Type: application/json" -d @file.json http://localhost:8888 --output result.pdf
```

### JSON File Format

Simple Page with some HTML:

```json
{
	"html": "< base64 encoded html string >"
}
```

With the encoded String ``Hello <b>World</b>`` it looks like:

```json
{
	"html": "SGVsbG8gPGI+V29ybGQ8L2I+"
}

```

Landscape Pages:

```json
{
	"landscape": true,
	"html": "< base64 encoded html string >"
}
```

With Header and Footer:

```json
{
	"displayHeaderFooter": true,
	"files": {
		"html": "< base64 encoded html string >",
		"header": "< base64 encoded html string >",
		"footer": "< base64 encoded html string >"
	}
}
```

Multiple Pages:

```json
{
	"html": [
		"< base64 encoded html string >",
		"< base64 encoded html string >"
	]
}
```

## Attribution

The code is originally from https://github.com/ElasticSuite/chrome-print . 
