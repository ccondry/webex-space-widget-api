require('dotenv').config()
const makeJwt = require('../src/models/make-jwt')

const jwt = makeJwt({sub: 'guest-user-765', name: 'Coty Condry'})
console.log(jwt)
// .then(r => console.log('success', r.status))
// .catch(e => console.log('error', e))
