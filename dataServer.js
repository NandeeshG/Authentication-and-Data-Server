/* eslint-disable indent */
// to access env tokens
require('dotenv').config();
// express module makes routing easier (from npm)
const express = require('express');
// path used to join filename and __dirname
const path = require('path');
// bodyParser is to get body from req (from npm)
const bodyParser = require('body-parser');
// is env doesn't set any port then use 5000
const port = process.env.DATA_PORT;
const authServer = require('./authServer.js');

// 1. Ideally this should be in a database only.
// 2. Corressponding to id, the object is stored.
// 3. The actual data inside this can be controlled
// by the client.
// 4. Each data item has a head(id,username,iat) and body(as per client)
const data = [];

// express app
const app = express();
// to add the middleware that will parse json in req body
app.use(bodyParser.json());

// // to serve files from media folder (no other app.get needed)
// // simply localhost:PORT/media/[filename].[ext] will work
// app.use('/media', express.static('media'));

// Fetch user data
// It will call authenticate middleware before handling request.
app.get('/api/data', authServer.authenticate, (req, res) => {
  const HEAD = req.body.head;
  const BODY = req.body.body;
  if (HEAD.id == undefined) res.status(400).send({error: 'Invalid id'});
  else res.status(200).send(data.find((d) => d.id === HEAD.id));
});

// This will either add or update the data.
// I might wanna split these into two.
app.post('/api/data', authServer.authenticate, (req, res) => {
  const HEAD = req.body.head;
  const BODY = req.body.body;
  if (HEAD.id == undefined) res.status(400).send({error: 'Invalid id'});
  else {
    const d = data.find((d) => d.id === HEAD.id);
    if (d !== undefined) {
      d.body = BODY;
      res.status(200).send({success: 'Data updated!'});
    } else {
      data.push({id: HEAD.id, body: BODY});
      res.status(200).send({success: 'Data added!'});
    }
  }
});

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Get all users data - REMOVE WHEN NOT IN DEV
app.get('/dev/data/all', (req, res) => {
  res.status(200).send({data: data});
});
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

app.listen(port, () => console.log(`Data server running at ${port}`));
