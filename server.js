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

async function printPage(file, Page, options, header, footer) {
	await Page.navigate({ url: 'file://' + file });
	await Page.loadEventFired();
	const { data } = await Page.printToPDF({
		format: 'A4',
		landscape: options.landscape,
        displayHeaderFooter: options.displayHeaderFooter,
        headerTemplate: header,
        footerTemplate: footer,
		printBackground: true,
		marginTop: 0, 
		marginBottom: 0, 
		marginLeft: 0, 
		marginRight: 0 
	});
	return Buffer.from(data, 'base64');
}

async function print(files, folder, options) {
	let data = null;
	try {
		// connect to endpoint
		var client = await CDP({ host: cdpHost, port: cdpPort });
		// extract domains
		const { Network, Page } = client;
		// enable events then start!
		await Promise.all([Network.enable(), Page.enable()]);
		let filesToMerge = [];
		for (let fileNr = 0; fileNr < files.length; fileNr++) {
			let page = await printPage(files[fileNr].filename, Page, options, files[fileNr].header, files[fileNr].footer);
			fs.writeFileSync(folder + '/page' + String(fileNr), page);
			filesToMerge.push(folder + '/page' + String(fileNr));
		}
		if (files.length == 1) {
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

function setOptions(body) {
	var options = {
		landscape: false,
		displayHeaderFooter: false
	};

	if ("landscape" in body) {
		if (body.landscape == true) {
			options.landscape = true;
		}
	}

	if ("displayHeaderFooter" in body) {
		if (body.displayHeaderFooter == true) {
			options.displayHeaderFooter = true;
		}
	}

	return options;
}

function prepareFile(file, dirname, fileNr) {
	let html = '';
	let header = '';
	let footer = '';
	if (util.isObject(file)) {
		if ("html" in file) {
			html = stripJs(Buffer.from(file.html, 'base64').toString());
		} else {
			throw "no html in file";
		}

		if ("header" in file) {
			header = stripJs(Buffer.from(file.header, 'base64').toString());
		}

		if ("footer" in file) {
			footer = stripJs(Buffer.from(file.footer, 'base64').toString());
		}
		fs.writeFileSync(dirname + '/index' + String(fileNr) + '.html', html);
		return {
			filename: dirname + '/index' + String(fileNr) + '.html',
			header: header,
			footer: footer
		};
	} else {
		html = stripJs(Buffer.from(file, 'base64').toString());
		fs.writeFileSync(dirname + '/index' + String(fileNr) + '.html', html);
		return {
			filename: dirname + '/index' + String(fileNr) + '.html',
			header: '',
			footer: ''
		};
	}
}

function prepareFiles(files, dirname) {
	let filesToPrint = [];
	if (util.isArray(files)) {
		for (let i=0; i<files.length; i++) {
			filesToPrint.push(prepareFile(files[i], dirname, i));
		}
	} else {
		filesToPrint.push(prepareFile(files, dirname));
	}
	return filesToPrint;
}

const app = express();

app.use(bodyParser({ limit: '30mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/health', (req, res) => {
	try {
		var tmpDir = tmp.dirSync();
		var filename = tmpDir.name + "/index0.html";
		var html = '<html><body>Hello World!</body></html>';

		data = {
			filename: filename,
			header: '',
			footer: ''
		};
		fs.writeFile(filename, html, function (err) {
			if (err) {
				throw err;
			}

			print([data], tmpDir.name, {}).then(pdf => {
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
		if (typeof req.body.files === 'undefined' && typeof req.body.html === 'undefined') {
			res.status(500).send('No files in request.');
			throw err;
		}
		let files;

		//backwards compatibility
		if (typeof req.body.files === 'undefined') {
			files = req.body.html;
		} else {
			files = req.body.files;
		}

		options = setOptions(req.body);

		var tmpDir = tmp.dirSync();
		let filesToPrint = prepareFiles(files, tmpDir.name);

		print(filesToPrint, tmpDir.name, options).then(pdf => {
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
