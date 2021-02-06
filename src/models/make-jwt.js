const jwt = require('jsonwebtoken')

module.exports = function ({sub, name}) {
  const payload = {
    sub,
    name,
    iss: process.env.GUEST_ISSUER_ID
  }
  
  const secret = Buffer.from(process.env.GUEST_ISSUER_SECRET, 'base64')
  const options = { expiresIn: '1h' }
  const token = jwt.sign(payload, secret, options)
  return token
}