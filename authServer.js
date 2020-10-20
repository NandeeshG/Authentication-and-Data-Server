/* eslint-disable indent */
// to access env tokens
require('dotenv').config();
// express module makes routing easier (from npm)
const express = require('express');
// bcrypt used for pwd encryption (from npm)
const bcrypt = require('bcrypt');
// path used to join filename and __dirname
const path = require('path');
// using uuid to add unique id to each user
const uuid = require('uuid');
// bodyParser is to get body from req (from npm)
const bodyParser = require('body-parser');
// to create jwt
const jwt = require('jsonwebtoken');
// is env doesn't set any port then use 5000
const port = process.env.PORT || process.env.AUTH_PORT;
// Automatically login after registration??
const NO_LOGIN_AFTER_REGISTER = true;

// 1. users data for temporary check, should be a database ideally.
// 2. users data will only contain id, username and password(hashed).
// 3. id can be used as PRIMARY_KEY in Databses. username can also be used,
// but its robustness needs to be verified.
// 4. The JWT generated token will be used on another server to access.
// other user data according to the application (eg - payment records)
let users = [];

// 1. This will contain id of users that are loggedIN.
// 2. Only loggingOut will remove them from this list.
// TODO: If I add expiring tokens, then take care of checking
// that token is not expired when authenticating.
let loggedIn = [];

// express app
const app = express();
// to add the middleware that will parse json in req body
app.use(bodyParser.json());

// CORS Policy, allowance
// For a specific domain, change '*' to that value
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});

// // to serve files from media folder (no other app.get needed)
// // simply localhost:PORT/media/[filename].[ext] will work
// app.use('/media', express.static('media'));

// Home page route
app.get('/api', (req, res) => {
  res.status(200).sendFile(path.join(__dirname + '/home_page.html'));
});

// -----
// // Fetch username,id,iat (not pwd)
// app.get('/api/auth/head', authenticate, (req, res) => {
//  res.status(200).send(req.body.head);
// });
// This is not required to client, as it can go through /api/data
// for data needs, and save their username locally. (no need to tell
// them their id and pwds)
// -----

// Login returns only the jwt token
app.post('/api/auth/login', async (req, res) => {
  // First Autheticate, then Authorise
  try {
    // find by username in users array
    const user = users.find((user) => user.username === req.body.username);
    if (user) {
      // let bcrypt check if stored pwd and input pwd are same when encrypted
      if (await bcrypt.compare(req.body.password, user.password)) {
        // Authentication done
        // Now Authorization
        // To do that make token and return that
        // The payload must not have sensitive info.
        // For most purposes id,username is enough
        // If using any other keys, prefer already declared ones in JWT
        res.status(200).send(loginUser(user));
      } else {
        res.status(401).send({error: 'Username or Password was wrong'});
      }
    } else {
      res.status(401).send({error: 'Username or Password was wrong'});
    }
  } catch (err) {
    res.status(500).send({error: err.name});
  }
});

// Register currently only returns a message - success
// Ideally it should call login and return token
app.post('/api/auth/register', async (req, res) => {
  try {
    if (users.find((user) => user && user.username === req.body.username)) {
      res.status(400).send({error: 'username already in use!'});
    } else {
      // hash the inp password with some random salt & then prepend the salt too
      const pwd = await bcrypt.hash(req.body.password, 10);
      const newuser = {
        username: req.body.username,
        password: pwd,
        id: uuid.v4(),
      };
      users.push(newuser);
      if (NO_LOGIN_AFTER_REGISTER === true) {
        res.status(200).send({success: 'Registration successful!'});
      } else {
        res.status(200).send(loginUser(newuser));
      }
    }
  } catch (err) {
    res.status(500).send({error: err.name});
  }
});

app.post('/api/auth/logout', authenticate, (req, res) => {
  // console.log(req);
  const id = req.body.head.id;
  loggedIn = loggedIn.filter((i) => i !== id);
  res.status(200).send({success: 'logged out!'});
});

// Authenticate and put username, id, iat in req head, rest in req body
// eslint-disable-next-line require-jsdoc
function authenticate(req, res, next) {
  // console.log(req.headers);

  const authHeader = req.headers['authorization'];

  // Send response as token wasn't found
  if (authHeader == undefined) {
    return res.status(401).send({error: 'Invalid call'});
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      // Send response as token wasn't verified
      return res.status(403).send({error: err.name});
    } else {
      const findUser = users.find((u) => u.id === user.id);
      if (findUser == undefined) {
        // User not registered
        return res.status(403).send({error: 'No such user!'});
      } else if (!loggedIn.includes(findUser.id)) {
        // User not loggedIn
        return res.status(403).send({error: 'Not loggedIn!'});
      }

      // Now user exists in database and is also loggedIn

      // Put details in req body for the routes to use however they want
      req.body = {
        head: {
          id: user.id,
          username: user.username,
          iat: user.iat,
        },
        body: req.body,
      };
    }
    // Continues back to from where it was called
    next();
  });
}

// Already authenticated, now return access token.
// eslint-disable-next-line require-jsdoc
const loginUser = ({username, id}) => {
  const payload = {username, id};
  const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
  loggedIn.push(id);
  return {accessToken: token};
};

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Only in dev
if (process.env.DEVELOPMENT === 'true') {
  app.get('/dev/auth/all', (req, res) => {
    res.status(200).send({users: users, loggedIn: loggedIn});
  });
  app.post('/dev/auth/reset', (req, res) => {
    users = [];
    loggedIn = [];
    res.status(200).send({success: 'Reset successful!'});
  });
}
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

app.listen(port, () => console.log(`Auth server running at ${port}`));

module.exports = {
  authenticate: authenticate,
};
