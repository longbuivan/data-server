// Loads the configuration from config.env to process.env
require('dotenv').config({ path: './config.env' });
// const cors = require('cors')

var corsOptions = {
    origin: 'http://localhost:8080',
    methods: "GET,PUT"
}

// app.use(cors(corsOptions))

const express = require('express');
const cors = require('cors');
// get MongoDB driver connection
const dbo = require('./db/conn');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(require('./routes/record'));

// Global error handling
app.use(function (err, _req, res) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
var ip = require('ip');

console.log(ip.address());
// perform a database connection when the server starts
dbo.connectToServer(function (err) {
  if (err) {
    console.error(err);
    process.exit();
  }

  // start the Express server
  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
});