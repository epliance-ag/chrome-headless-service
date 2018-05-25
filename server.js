const fs = require('fs-extra');
const util = require('util');
const tmp = require('tmp');
const bodyParser = require('body-parser');
const express = require('express');
const CDP = require('chrome-remote-interface');
const stripJs = require('strip-js');
const PDFMerge = require('pdf-merge');

const cdpHost = process.env.CHROME_HEADLESS_PORT_9222_TCP_ADDR || 'localhost';
const cdpPort = process.env.CHROME_HEADLESS_PORT_9222_TCP_PORT || '9222';

async function printPage(file, Page, options) {
	await Page.navigate({ url: 'file://' + file });
	await Page.loadEventFired();
	const { data } = await Page.printToPDF({
		landscape: options.landscape,
		printBackground: true,
		marginTop: 0,
		marginBottom: 0,
		marginLeft: 0,
		marginRight: 0
	});
	return Buffer.from(data, 'base64');
}

async function print(files, fileCount, folder, options) {
	let data = null;
	try {
		// connect to endpoint
		var client = await CDP({ host: cdpHost, port: cdpPort });
		// extract domains
		const { Network, Page } = client;
		// enable events then start!
		await Promise.all([Network.enable(), Page.enable()]);
		let filesToMerge = [];
		for (let fileNr = 0; fileNr < fileCount; fileNr++) {
			let page = await printPage(folder + '/index' + String(fileNr), Page, options);
			fs.writeFileSync(folder + '/page' + String(fileNr), page);
			filesToMerge.push(folder + '/page' + String(fileNr));
		}
		if (fileCount == 1) {
			data = fs.readFileSync(folder + '/page0');
		} else {
			await PDFMerge(filesToMerge, {output: folder + '/page-final'});
			data = fs.readFileSync(folder + '/page-final');
		}
	} catch (err) {
		console.error('error in print function: ', err);
		return null;
	} finally {
		if (client) {
			await client.close();
		}
	}
	return data;
}

function cleanupFiles(tmpDir) {
	var files = fs.readdirSync(tmpDir.name);
	for(let file of files) {
		fs.unlinkSync(tmpDir.name + '/' + file);
	}
	tmpDir.removeCallback();
}

const app = express();

app.use(bodyParser({ limit: '30mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/health', (req, res) => {
	try {
		var tmpDir = tmp.dirSync();
		var filename = tmpDir.name + "/index0";
		var html = '<html><body>Hello World!</body></html>';

		fs.writeFile(filename, html, function (err) {
			if (err) {
				throw err;
			}

			print([filename], 1, tmpDir.name, {}).then(pdf => {
				var start = '%PDF-1.4';
				if (pdf.toString('utf8', 0, start.length) == start) {
					cleanupFiles(tmpDir);
					res.status(200).send('chrome_print_healthy 1');
				} else {
					throw "invalid pdf";
				}
			});

		});
	} catch (e) {
		cleanupFiles(tmpDir);
		console.log(e);
		res.status(500).send('chrome_print_healthy 0');
		next(e)
	};
});

app.post('/', async (req, res, next) => {
	try {
		if (typeof req.body.html === 'undefined') {
			res.status(500).send('No html in request.');
			throw err;
		}

		var options = {
			landscape: false,
		};

		if ("landscape" in req.body) {
			if (req.body.landscape == true) {
				options.landscape = true;
			}
		}

		var tmpDir = tmp.dirSync();

		let filesToPrint = [];
		let fileCount = 0;
		if (util.isArray(req.body.html)) {
			fileCount = req.body.html.length;
			for (let i=0; i<fileCount; i++) {
				var html = Buffer.from(req.body.html[i], 'base64').toString();
				fs.writeFileSync(tmpDir.name + '/index' + String(i), stripJs(html));
				filesToPrint.push(tmpDir.name + '/index' + String(i));	
			}
		} else {
			fileCount = 1;
			var html = Buffer.from(req.body.html, 'base64').toString();
			fs.writeFileSync(tmpDir.name + '/index0', stripJs(html));
			filesToPrint.push(tmpDir.name + '/index0');	
		}

		print(filesToPrint, fileCount, tmpDir.name, options).then(pdf => {
			cleanupFiles(tmpDir);
			if (pdf !== null) {
				res.status(200).type('application/pdf').send(pdf);
			} else {
				throw "got null pdf";
			}
		}).catch(err => {
			console.log(err);
			res.status(500).send('Error creating pdf');
		});

	} catch (e) {
		cleanupFiles(tmpDir);
		console.log(e);
		res.status(500).send('Error creating pdf');
		next(e)
	};
});

server = app.listen(process.env.NODE_PORT || 8888);
//10 minute timeout
server.timeout = 10 * 60 * 1000;
