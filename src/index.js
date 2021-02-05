// load environment file
require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const expressJwt = require('express-jwt')
const requestIp = require('request-ip')

const environment = require('./models/environment')
const teamsLogger = require('./models/teams-logger')
// set up Node.js HTTP port
const port = process.env.NODE_PORT

// init express app, and configure it
const app = express()
// parse JSON body into req.body, up to 256kb
app.use(bodyParser.json({limit: '256kb'}))
// enable CORS
app.use(cors())
// get remote IP address of request client as req.clientIp
app.use(requestIp.mw())
// require valid JWT for all paths unless in the exceptins list, and parse JWT payload into req.user

// run this code on every request
app.use(async function (req, res, next) {
  // continue processing
  next()
})

// error handling when JWT validation fails
app.use(function(err, req, res, next) {
  try {
    if (err) {
      // console.error(err.message)
      // return status to user
      res.status(err.status).send(err.message)
      // set up data for logging
      // const clientIp = req.clientIp
      // const method = req.method
      // const host = req.get('host')
      // const path = req.originalUrl
      // const url = req.protocol + '://' + host + path
      // there was an error
      // console.log('client at IP', clientIp, 'attempting to', method, 'at path', path, 'error', err.status, err.name, err.message)
      // console.log('auth header was', req.headers.authorization)
      // stop processing
      return
    } else {
      // no errors
    }
  } catch (e) {
    console.log(e.message)
  }

  // continue processing
  next()
})

/*****
Routes
*****/

// get this API version
app.use('/api/v1/version', require('./routes/version'))

// webex OAUTH2 SSO login
app.use('/api/v1/oauth2', require('./routes/oauth2'))

// start listening
const server = app.listen(port, () => {
  const message = `${environment.name} version ${environment.version} service started on ${environment.hostname}. Listening on port ${port}.`
  console.log(message)
  teamsLogger.log('service started on port ' + port)
})

// start web socket server on same port
const websocket = require('./models/websocket')
websocket.start(server)
