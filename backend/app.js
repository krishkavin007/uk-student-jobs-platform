const express = require('express');
const app = express();
const port = 3000; // You can change this port if needed

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});