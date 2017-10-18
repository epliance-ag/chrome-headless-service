const fs = require('fs');
const tmp = require('tmp');
const bodyParser = require('body-parser');
const express = require('express');
const fileUpload = require('express-fileupload');
const CDP = require('chrome-remote-interface');

const cdpHost = process.env.CHROME_HEADLESS_PORT_9222_TCP_ADDR || 'localhost';
const cdpPort = process.env.CHROME_HEADLESS_PORT_9222_TCP_PORT || '9222';

async function print (file) {
	var buffer = false;
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
app.use(fileUpload());

app.get('/', (req, res) => {
	res.type('text/plain').send(`Here's a nice curl example of the api:
curl -F "htmlFile=@test.html" -X POST -H "Content-Type: multipart/form-data" -o result.pdf http://thisurl/
    `);
});

app.get('/health', (req, res) => {
	try {
		var tmpDir = tmp.dirSync();
	    var filename = tmpDir.name + "/index.html";
	    var html = '<html><body>Hello World!</body></html>';

		fs.writeFile(filename, html, function(err) {
			if(err) {
				throw err;
			}
		});

		print(filename).then(pdf => {
			var start = '%PDF-1.4';
			if (pdf.toString('utf8', 0, start.length) == start) {
		    	cleanupFiles(tmpDir, filename);
			  	res.status(200).send('1');
			  } else {
				throw "invalid pdf";
			  }
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
		const file = req.files.htmlFile;
		if (!file) {
			res.status(500).send('No htmlFile in request.');
			throw err;
		}

		var tmpDir = tmp.dirSync();
		var filename = tmpDir.name + "/index.html";

		file.mv(filename, (err) => {
			if(err) {
				res.status(500).send('Error handling file.');
				throw err;
			}
		
			print(filename).then(pdf => {
				res.status(200).type('application/pdf').send(pdf);
				cleanupFiles(tmpDir, filename);
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
