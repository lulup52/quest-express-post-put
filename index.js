// dotenv loads parameters (port and database config) from .env
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const connection = require('./db');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// respond to requests on `/api/users`
app.get('/api/users', (req, res) => {
  // send an SQL query to get all users
  connection.query('SELECT * FROM user', (err, results) => {
    if (err) {
      // If an error has occurred, then the client is informed of the error
      res.status(500).json({
        error: err.message,
        sql: err.sql,
      });
    } else {
      // If everything went well, we send the result of the SQL query as JSON
      res.json(results);
    }
  });
});

app.post('/api/users', (req, res) => {
  const emailRegex = /[a-z0-9._]+@[a-z0-9-]+\.[a-z]{2,3}/;
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(422).json({
      error: 'at least one of the required fields is missing'
    });
  };
  if (!emailRegex.test(email)) {
    return res.status(422).json({
      error: 'Invalid email',
    });
  };
  if (password.length < 8) {
    return res.status(422).json({
      error: 'password to short',
    });
  }
  connection.query('INSERT INTO user SET ?', req.body, (err, results) => {
    if (err) {
      res.status(500).json({
        error: err.message,
        sql: err.sql,
      });
    } else {
      res.json(results);
    }
  });
});

app.listen(process.env.PORT, (err) => {
  if (err) {
    throw new Error('Something bad happened...');
  }
  console.log(`Server is listening on ${process.env.PORT}`);
});
