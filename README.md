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
	"files": "< base64 encoded html string >"
}
```

With the encoded String ``Hello <b>World</b>`` it looks like:

```json
{
	"files": "SGVsbG8gPGI+V29ybGQ8L2I+"
}

```

Landscape Pages:

```json
{
	"landscape": true,
	"files": "< base64 encoded html string >"
}
```

With Header and Footer:

Make sure the page has enough margin or the header and footer won't show up in the pdf.
```css
<style>
@page{margin: 70px 0 40px; }
</style>
```

```json
{
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
	"files": [
		"< base64 encoded html string >",
		"< base64 encoded html string >"
	]
}
```

Multiple Pages with Header and Footer:

Make sure the page has enough margin or the header and footer won't show up in the pdf.
```css
<style>
@page{margin: 70px 0 40px; }
</style>
```

```json
{
	"files": [{
		"html": "< base64 encoded html string >",
		"header": "< base64 encoded html string >",
		"footer": "< base64 encoded html string >"
	},{
		"html": "< base64 encoded html string >",
		"header": "< base64 encoded html string >",
		"footer": "< base64 encoded html string >"
	}]
}
```

## Attribution

The code is originally from https://github.com/ElasticSuite/chrome-print . 
