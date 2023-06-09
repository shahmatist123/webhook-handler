const shell = require('shelljs')

// Require express and body-parser
const express = require("express")
const bodyParser = require("body-parser")
// Initialize express and define a port
const app = express()
const PORT = 7777
const http = require('http');

const secret = 'asdasdQASDQWFxacgfdsa!@$reawr246qADFvzxcegafqwry'; // Replace with your actual webhook secret

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/hook') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      // Verify the webhook signature
      const signature = req.headers['x-hub-signature-256'];
      const computedSignature = computeSignature(secret, body);

      if (signature !== computedSignature) {
        res.statusCode = 401;
        res.end('Unauthorized');
        return;
      }

      // Process the webhook payload
      const payload = JSON.parse(body);

      shell.exec('../build-script.sh')

      res.statusCode = 200;
      res.end('Webhook received');
    });
  } else {
    res.statusCode = 404;
    res.end('Not found');
  }
});

function computeSignature(secret, body) {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body);
  return `sha256=${hmac.digest('hex')}`;
}
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});