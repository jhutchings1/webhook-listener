// index.js

const express = require('express');
const https = require('https');
const fs = require('fs');

const app = express();
const PORT = 4000;

// --- HTTPS/mTLS Options ---
const httpsOptions = {
  // Server key and certificate
  key: fs.readFileSync('./server-key.pem'),
  cert: fs.readFileSync('./server-cert.pem'),

  // The CA certificate that signed the client certificates
  ca: fs.readFileSync('./ca-cert.pem'),

  // Request a certificate from the client
  requestCert: true,

  // Reject connections from clients whose certificates are not signed by our CA
  rejectUnauthorized: true 
};

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// A catch-all route to handle all incoming requests
app.all('/webhook', (req, res) => {
  console.log('--- New Webhook Request ---');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Method: ${req.method}`);
  console.log(`Path: ${req.originalUrl}`);
  console.log('Headers:');
  console.log(JSON.stringify(req.headers, null, 2));

  // --- Inspect the Client Certificate ---
  const clientCert = req.socket.getPeerCertificate();

  if (clientCert && Object.keys(clientCert).length > 0) {
    console.log('Client Certificate Info:');
    console.log(`- Subject: ${clientCert.subject.CN}`);
    console.log(`- Issuer: ${clientCert.issuer.CN}`);
    console.log(`- Valid From: ${clientCert.valid_from}`);
    console.log(`- Valid To: ${clientCert.valid_to}`);
    console.log(`- Fingerprint: ${clientCert.fingerprint}`);
  } else {
    console.log('Client Certificate: [None Provided or Invalid]');
  }

  if (Object.keys(req.body).length > 0) {
    console.log('Body:');
    console.log(JSON.stringify(req.body, null, 2));
  } else {
    console.log('Body: [Empty]');
  }
  
  console.log('---------------------------\n');

  res.status(200).json({ status: 'success', message: 'Webhook received!' });
});

// Create an HTTPS server instead of an HTTP server
const server = https.createServer(httpsOptions, app);

// Start the server
server.listen(PORT, () => {
  console.log(`🚀 mTLS Webhook listener is running on https://localhost:${PORT}`);
});