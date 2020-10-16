## NodeJS + ExpressJS Authentication and Data Server

### Utilising

1. bcrypt for storing hashed passwords
2. JWT for token based server-client communication
3. different data and authentication servers at different ports

### Features 
1. Register a user with username, password
2. Login with username and password
3. Access/Update user data - only if accessToken is verified
4. logout
5. Multiple users may login at a time, but they can only access their own data from the server

### Build

1. Clone repo
2. npm install
3. npm run serverDataAuth
4. Make own requests, or check out node_auth_api.postman for a headstart

### Limitations

1. Not connected to any database, server restart causes data loss.
   (However I think adding a database connection to this api will not be super hard)

### Todos

1. Add expiring tokens. (currently only user logouts will cancel access of a token)

**THIS IS ONLY BACKEND - USE POSTMAN or SIMILAR TOOLS FOR TESTING**
