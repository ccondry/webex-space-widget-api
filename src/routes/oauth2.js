const express = require('express')
const router = express.Router()
const model = require('../models/oauth2')
const teamsLogger = require('../models/teams-logger')

// complete webex oauth2 SSO login
router.post('/', async (req, res, next) => {
  const code = req.body.code
  const redirectUri = req.headers.referer.split('?')[0].split('#')[0]
  // console.log('oauth 2 login', redirectUri, code)
  let token
  try {
    token = await model.authorize({
      code,
      redirectUri
    })
    return res.status(200).send(token)
  } catch (e) {
    // console.log('failed to get access token from authorization code', req.body.code, ':', e.message)
    if (e.status && e.text) {
      // forward webex REST response
      return res.status(e.status).send({message: e.text})
    } else {
      // log unexpected error
      const message = `Failed to complete OAUTH2 login: ${e.message}`
      console.log(message)
      teamsLogger.log(message)
      return res.status(500).send({message})
    }
  }
})

module.exports = router
