// Dependencies
const fs = require('fs');
const path = require('path');
const Mime = require('mime');
const http = require('http');
//const https = require('https');
const spdy = require('spdy'); 
const express = require('express');
var favicon = require('serve-favicon');
var serveIndex = require('serve-index');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

const app = express();



// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/martinrevert.com.ar/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/martinrevert.com.ar/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/martinrevert.com.ar/chain.pem', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

app.get("/lighthouse", async (req, res) => {
    // Check that the url query parameter exists
    if(req.query && req.query.url) {
        // decode the url
        const url = decodeURIComponent(req.query.url)    
        //const chrome = await chromeLauncher.launch({chromeFlags: ['--headless', '--no-sandbox','--disable-gpu']});
        const chrome = await chromeLauncher.launch({chromeFlags: ['--headless', '--no-sandbox','--force-fieldtrials=*BackgroundTracing/default/']});
        const options = {logLevel: 'info', onlyCategories: ['performance'], output: 'html', port: chrome.port};
        const runnerResult = await lighthouse(url, options);

        await chrome.kill();
        res.json(runnerResult.lhr)
    }
});

app.use(function (req, res, next) {
    if (req.secure) {
        // request was via https, so do no special handling
        next();
    } else {
        // request was via http, so redirect to https
        res.redirect('https://' + req.headers.host + req.url);
    }
});

app.get("/error404", (req, res) => {
    var d = domain.create();
    d.on('error', function (err) {
        res.sendStatus(404);
    });
    d.run(function () {
        setTimeout(function () {
            throw new Error("some 404 unexpected/uncaught async exception");
        }, 100);
    });
});

app.use('/.well-known', express.static('.well-known'), serveIndex('.well-known'));

app.use('service-worker.js', express.static('service-worker.js'));

app.get("/error500", (req, res) => {
    var d = domain.create();
    d.on('error', function (err) {
        res.status(500).send(err.message);
    });
    d.run(function () {
        setTimeout(function () {
            throw new Error("some 500 unexpected/uncaught async exception");
        }, 100);
    });
});

app.get("/iframe", (req, res) => {
    res.sendFile(__dirname + '/iframe.html');
});

app.get("/gmaps", (req, res) => {

});

app.get("/battery", (req, res) => {
    res.sendFile(__dirname + '/battery.html');
});

app.get("/poclighthouse", (req, res) => {
    res.sendFile(__dirname + '/poclighthouse.html');
});

app.use('/latorrentola', serveIndex(path.join(__dirname + '/latorrentola')));
app.use('/latorrentola', express.static(path.join(__dirname, 'latorrentola'))); // serve the actual files

//app.use((req, res) => {
//	res.send('Hello there, this site is under construction, come back soon!!!');
//});

//app.get("/", (req, res) => {
//	res.send('Hello there, this site is under construction, come back soon!!!');
//  });

app.use(express.static('public'));

app.use(favicon(__dirname + '/public/favicon.ico'));

/* final catch-all route to index.html defined last */
//app.get('/*', (req, res) => {
//        res.sendFile(__dirname + '/index.html');
//  })


// Starting both http & https servers
const httpServer = http.createServer(app);
const httpsServer = spdy.createServer(credentials, app);

httpServer.listen(3000, () => {
    console.log('HTTP Server running on port 80');
});

httpsServer.listen(4000, () => {
    console.log('HTTPS Server running on port 443');
});