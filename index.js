/* eslint-disable indent */
// express module makes routing easier
const express = require('express');
// bcrypt used for pwd encryption
const bcrypt = require('bcrypt');
// path used to join filename and __dirname
const path = require('path');
// bodyParser is to get body from req
const bodyParser = require('body-parser');
// is env doesn't set any port then use 5000
const port = process.env.PORT || 5000;
// users data for temporary check, should be a database ideally
const users = [];
const app = express();
// to serve files from media folder
app.use('/media', express.static('media'));
// to add the middleware that will parse json in req body
app.use(bodyParser.json());

// Home page route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/home_page.html'));
});

// Get all users - REMOVE WHEN NOT IN DEV
app.get('/dev/all', (req, res) => {
  res.send(users);
});

// Login returns user details.
app.get('/api/login', async (req, res) => {
  try {
    // find by username in users array
    const user = users.find((user) => user.username === req.body.username);
    if (user) {
      // let bcrypt check if stored pwd and input pwd are same when encrypted
      if (await bcrypt.compare(req.body.password, user.password)) {
        res.send(user);
      } else {
        res.send('Username or Password was wrong');
      }
    } else {
      res.send('Username or Password was wrong');
    }
  } catch (err) {
    res.send(err);
  }
});

// Register returns successful
app.post('/api/register', async (req, res) => {
  try {
    if (users.find((user) => user && user.username === req.body.username)) {
      res.send('username already in use!');
    } else {
      // hash the inp password with some random salt & then prepend the salt too
      const pwd = await bcrypt.hash(req.body.password, 10);
      const newuser = req.body;
      newuser.password = pwd;
      users.push(newuser);
      res.send('registration success');
    }
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

app.listen(port, () => console.log(`Running at ${port}`));
