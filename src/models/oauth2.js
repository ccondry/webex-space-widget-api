// Webex SSO oauth2
const fetch = require('./fetch')

// convert JSON object to url encoded string
const urlEncode = function (params) {
  const keys = Object.keys(params)
  let ret = ''
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const value = params[key]
    if (i !== 0) {
      // not first one
      ret += '&'
    }
    ret += `${key}=${value}`
  }
  return ret
}

module.exports = {
  async authorize ({code, redirectUri}) {
    // console.log('sso authorize:', code, redirectUri)
    // build body object
    const body = {
      grant_type: 'authorization_code',
      client_id: process.env.WEBEX_OAUTH_CLIENT_ID,
      client_secret: process.env.WEBEX_OAUTH_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri
    }
    // encode the body for x-www-form-urlencoded
    const encodedBody = urlEncode(body)
    // get the token from cisco
    try {
      const url = 'https://webexapis.com/v1/access_token'
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json'
        },
        body: encodedBody
      }
      const accessToken = await fetch(url, options)
      // console.log('got webex oauth2 access token:', accessToken)
      return accessToken
    } catch (e) {
      throw e
    }
  }
}