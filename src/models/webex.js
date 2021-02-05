const fetch = require('./fetch')

async function me (token) {
  const url = 'https://webexapis.com/v1/people/me'
  const options = {
    headers: {
      Authorization: 'Bearer ' + token
    }
  }
  return fetch(url, options)
}

module.exports = {
  me
}