// Dependencies
const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
var favicon = require('serve-favicon');

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

//app.use((req, res) => {
//	res.send('Hello there, this site is under construction, come back soon!!!');
//});

//app.get("/", (req, res) => {
//	res.send('Hello there, this site is under construction, come back soon!!!');
//  });

app.use(express.static('public'));

app.use(favicon(__dirname + '/public/favicon.ico'));

/* final catch-all route to index.html defined last */
app.get('/*', (req, res) => {
	res.sendFile(__dirname + '/index.html');
  })


// Starting both http & https servers
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(3000, () => {
	console.log('HTTP Server running on port 80');
});

httpsServer.listen(4000, () => {
	console.log('HTTPS Server running on port 443');
});