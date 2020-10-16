/* eslint-disable indent */
const express = require('express');
const bcrypt = require('bcrypt'); // for pwd encryption
const path = require('path'); // to join path and __dirname
const bodyParser = require('body-parser'); // to get body from req

const port = process.env.PORT || 5000;
const users = [];

const app = express();
app.use('/media', express.static('media')); // to serve files from media folder
app.use(bodyParser.json()); // to parse json in req body

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/home_page.html'));
});

app.get('/dev/all', (req, res) => {
  res.send(users);
});

// Login returns user details.
app.get('/api/login', async (req, res) => {
  try {
    const user = users.find((user) => user.username === req.body.username);
    if (user) {
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
