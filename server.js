const express = require('express');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
// Plesk will provide the port, so we use process.env.PORT
const port = process.env.PORT || 3000; 

// Create the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // ============== YOUR BACKEND API ROUTES START HERE ==============
  // This is where your backend code will go.
  // For now, here is the example from your old backend/app.js
  
  server.get('/api/test', (req, res) => {
    res.send('Hello from the backend API!');
  });


  // ============== YOUR BACKEND API ROUTES END HERE ==============

  // All other requests are handled by Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});