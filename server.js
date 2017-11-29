const fs = require('fs');
const tmp = require('tmp');
const bodyParser = require('body-parser');
const express = require('express');
const CDP = require('chrome-remote-interface');

const cdpHost = process.env.CHROME_HEADLESS_PORT_9222_TCP_ADDR || 'localhost';
const cdpPort = process.env.CHROME_HEADLESS_PORT_9222_TCP_PORT || '9222';

async function print (file) {
	var buffer = null;
	try {
		// connect to endpoint
		var client = await CDP({host: cdpHost, port: cdpPort});
		// extract domains
		const {Network, Page} = client;
		// enable events then start!
		await Promise.all([Network.enable(), Page.enable()]);
		await Page.navigate({url: 'file://' + file});
		await Page.loadEventFired();
		const {data} = await Page.printToPDF({
			landscape: false,
			printBackground: true,
			marginTop: 0,
			marginBottom: 0,
			marginLeft: 0,
			marginRight: 0
		});
		buffer = Buffer.from(data, 'base64');
	} catch (err) {
		console.error(err);
		return null;
	} finally {
		if (client) {
			await client.close();
		}
	}
	return buffer;
}

function cleanupFiles(tmpDir, filename) {
	fs.unlinkSync(filename);
	tmpDir.removeCallback();
}

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/health', (req, res) => {
	try {
		var tmpDir = tmp.dirSync();
	    var filename = tmpDir.name + "/index.html";
	    var html = '<html><body>Hello World!</body></html>';

		fs.writeFile(filename, html, function(err) {
			if(err) {
				throw err;
			}

			print(filename).then(pdf => {
				var start = '%PDF-1.4';
				if (pdf.toString('utf8', 0, start.length) == start) {
					cleanupFiles(tmpDir, filename);
					  res.status(200).send('1');
				  } else {
					throw "invalid pdf";
				  }
			});

		});
	} catch (e) {
		cleanupFiles(tmpDir, filename);
		console.log(e);
		res.status(500).send('0');
		next(e)
	};
});

app.post('/', async (req, res, next) => {
	try {
		if (typeof req.body.html === 'undefined') {
			res.status(500).send('No html in request.');
			throw err;
		}

		var tmpDir = tmp.dirSync();
		var filename = tmpDir.name + "/index.html";
		
		var buf = Buffer.from(req.body.html, 'base64');
		fs.writeFile(filename, buf.toString('utf8'), function(err) {
			if(err) {
				throw err;
			}

			print(filename).then(pdf => {
				cleanupFiles(tmpDir, filename);
				if (pdf !== null) {
					res.status(200).type('application/pdf').send(pdf);
				} else {
					throw "got null pdf";
				}
			}).catch(err => {
				res.status(500).send('Error creating pdf');
			});
			
		});
	} catch (e) {
		cleanupFiles(tmpDir, filename);
		console.log(e);
		res.status(500).send('Error creating pdf');
		next(e)
	};
});

app.listen(process.env.NODE_PORT || 8888);
