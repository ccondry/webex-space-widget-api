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

async function guestLogin (token) {
  const url = 'https://webexapis.com/v1/jwt/login'
  const options = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token
    }
  }
  return fetch(url, options)
}

async function getRoomName ({roomId, token}) {
  try {
    const room = await getRoom({roomId, token})
    return room.title
  } catch (e) {
    // console.log(`webex.getRoomName failed for roomId ${roomId} with token ${token}`)
    throw e
  }
}

async function getRoom ({roomId, token}) {
  const url = 'https://webexapis.com/v1/rooms/' + roomId
  const options = {
    headers: {
      Authorization: 'Bearer ' + token
    }
  }
  return fetch(url, options)
}

async function joinRoom ({roomId, email, token}) {
  const url = 'https://webexapis.com/v1/memberships/'
  const options = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token
    },
    body: {
      roomId,
      personEmail: email
    }
  }
  return fetch(url, options)
}

async function getMemberships ({token}) {
  // actually use the rooms API though
  const url = 'https://webexapis.com/v1/rooms'
  const options = {
    headers: {
      Authorization: 'Bearer ' + token
    }
  }
  return fetch(url, options)
}

async function createMembership ({
  token,
  roomId,
  personId,
  personEmail
}) {
  const url = 'https://webexapis.com/v1/memberships'
  const options = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token
    },
    body: {
      personId,
      personEmail,
      roomId
    }
  }
  return fetch(url, options)
}

async function createRoom ({token, title}) {
  const url = 'https://webexapis.com/v1/rooms'
  const options = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token
    },
    body: {
      title
    }
  }
  return fetch(url, options)
}

async function deleteRoom ({token, id}) {
  const url = 'https://webexapis.com/v1/rooms/' + id
  const options = {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer ' + token
    }
  }
  return fetch(url, options)
}

module.exports = {
  me,
  guestLogin,
  getMemberships,
  joinRoom,
  createRoom,
  getRoomName,
  createMembership,
  deleteRoom
}