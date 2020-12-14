// Dependencies
const fs = require('fs');
const path = require('path');
const Mime = require('mime');
const http = require('http');
const https = require('https');
const http2 = require('http2');
const express = require('express');
var favicon = require('serve-favicon');
var serveIndex = require('serve-index');




const Http2 = require('http2');


const app = express();
const imagesDir = '/media/pelis/www/public/img/';

//const lighthouse = require('lighthouse');
//const chromeLauncher = require('chrome-launcher');

const getFiles = () => {
    const files = new Map();

    fs.readdirSync(imagesDir).forEach(fileName => {
        const filePath = path.join(imagesDir, fileName);
        console.log(filePath);
        const fileDescriptor = fs.openSync(filePath, "r");
        const stat = fs.fstatSync(fileDescriptor);
        const contentType = Mime.lookup(filePath);
        files.set(`/${fileName}`, {
            filePath,
            fileDescriptor,
            headers: {
                "content-length": stat.size,
                "last-modified": stat.mtime.toUTCString(),
                "content-type": contentType,
            },
        });
    });
    return files;
};

const files = getFiles();

// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/martinrevert.com.ar/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/martinrevert.com.ar/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/martinrevert.com.ar/chain.pem', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

app.use(function (req, res, next) {
    if (req.secure) {
        // request was via https, so do no special handling
        next();
    } else {
        // request was via http, so redirect to https
        res.redirect('https://' + req.headers.host + req.url);
    }
});



/*
app.get('/lighthouse', async (req, res) => {
    // Check that the url query parameter exists
    if(req.query && req.query.url) {
        // decode the url
        const url = decodeURIComponent(req.query.url)    
        const chrome = await chromeLauncher.launch({chromeFlags: ['--headless', '--no-sandbox','--disable-gpu']});
        const options = {logLevel: 'info', output: 'html', port: chrome.port};
        const runnerResult = await lighthouse(url, options);

        await chrome.kill();
        res.json(runnerResult.lhr)
    }
});
*/

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
})

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
const httpsServer = https.createServer(credentials, app);

httpServer.listen(3000, () => {
    console.log('HTTP Server running on port 80');
});

httpsServer.listen(4000, () => {
    console.log('HTTPS Server running on port 443');
});

const PORT = 60000

Http2.createSecureServer({
    credentials
}, (req, res) => {
    // res.stream is the Duplex stream.
    for (let i = 1; i <= 100; i++) {
        // Server push feature
        const path = `/media/pelis/www/public/css`;
        const file = files.get(path)
        res.stream.pushStream({ [Http2.constants.HTTP2_HEADER_PATH]: path }, (err, pushStream) => {
            pushStream.respondWithFD(file.fileDescriptor, file.headers)
        })
    }
    stream.respond({ ':status': 200 });
}).listen(PORT, 'localhost', () => {
    console.log(`Native HTTP/2 running at https://localhost:${PORT}`)
})