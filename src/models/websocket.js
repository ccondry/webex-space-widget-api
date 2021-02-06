// load WebSocket library
const WebSocket = require('ws')
// our current websocket connections
const agents = []
const customers = []
const webex = require('./webex')
const makeJwt = require('./make-jwt')
const url = require('url')

function start (server) {
  console.log('starting websocket server')
  //initialize the WebSocket server instance
  const wss = new WebSocket.Server({ server })
  wss.on('connection', newConnection)
}

async function startChat ({agent, customer}) {
  try {
    // create room with guest token
    const room = await webex.createRoom({
      token: customer.token,
      title: customer.request
    })
    console.log('created room for customer chat with agent', agent.email, ':', room.id)
    // cache room info
    customer.room = room
    agent.room = room
    // notify customer web client
    customer.ws.send(JSON.stringify({
      spaceId: room.id,
      token: customer.token,
      jwt: customer.jwt
    }))
    console.log('sent customer websocket message with room ID', room.id)
    // add agent to room
    await webex.createMembership({
      token: customer.token,
      personEmail: agent.email,
      roomId: room.id
    })
    console.log('added agent', agent.email, 'to room ID', room.id)
    // notify agent web clients
    agent.ws.send(JSON.stringify({
      spaceId: room.id
    }))
    console.log('sent agent websocket message with room ID', room.id)
  } catch (e) {
    console.log('failed during websocket.startChat:', e.message)
  }
}

function newConnection (ws, req) {
  const parsed = url.parse(req.url, true)
  console.log('new websocket connection - query =', parsed.query)
  ws.on('close', async (code) => {
    console.log('websocket closed:', code)
    // find the agent or customer this connection belongs to
    const wsAgent = agents.find(v => v.ws === ws)
    // console.log('wsAgent', wsAgent.email)
    const wsCustomer = customers.find(v => v.ws === ws)
    // console.log('wsCustomer', wsCustomer.name)
    // found customer with an existing room?
    let customer
    let agent
    if (wsCustomer && wsCustomer.room) {
      // websocket belongs to customer. use their token to close the room.
      console.log('customer websocket closed')
      customer = wsCustomer
      agent = agents.find(v => v.room === wsCustomer.room)
    } else if (wsAgent && wsAgent.room) {
      // websocket belongs to agent. find associated customer
      console.log('agent websocket closed')
      agent = wsAgent
      customer = customers.find(v => v.room === wsAgent.room)
    }
    // was there a room found?
    if (customer) {
      // use customer token to close the room
      try {
        await webex.deleteRoom({
          token: customer.token,
          id: customer.room.id
        })
        console.log('deleted room', customer.room.id, 'with agent', agent.email)
      } catch (e) {
        console.log('failed to delete room', customer.room.id, 'with agent', agent.email)
      }
    }
    // remove agent and customer from cache
    const ci = customers.findIndex(v => v === customer)
    if (ci >= 0) {
      customers.splice(ci, 1)
    }
    const ai = agents.findIndex(v => v === agent)
    if (ai >= 0) {
      agents.splice(ai, 1)
    }
  })
  // new websocket connection started - set up handler function for its messages
  ws.on('message', async (message) => {
    const json = JSON.parse(message)
    console.log('websocket message:', message)
    // agent or customer?
    if (json.token) {
      // agent - get agent webex user profile
      const token = json.token
      try {
        const me = await webex.me(token)
        // cache the connection details
        const email = me.emails[0]
        const agent = {email, token, ws}
        const index = agents.findIndex(agent => agent.email === email)
        if (index >= 0) {
          // replace existing connection with new one
          agents.splice(index, 1, agent)
        } else {
          // add
          agents.push(agent)
        }
        // see if any customers are waiting on this agent
        const waiting = customers.find(c => c.agent === email && c.waiting === true)
        if (waiting.length) {
          for (const customer of waiting) {
            // create room, add guest and agent
            startChat({agent, customer})
          }
        }
      } catch (e) {
        console.log('failed to get webex me details for websocket client:', e.message)
      }
    } else if (json.name) {
      // customer message
      // create guest issuer JWT
      // TODO generate sub
      const sub = 'guest-user-12345'
      const jwt = makeJwt({sub, name: json.name})
      // get api token for guest issuer
      const loggedIn = await webex.guestLogin(jwt)
      console.log('logged in guest issuer', json.name)
      const token = loggedIn.token
      // cache the token and connection details
      const customer = {
        agent: json.agent,
        name: json.name,
        request: json.request,
        token,
        jwt,
        ws
      }
      const index = customers.findIndex(v => v.id === id)
      if (index >= 0) {
        // replace existing connection with new one
        customers.splice(index, 1, customer)
      } else {
        // add
        customers.push(customer)
      }
      // find the agent
      const agent = agents.find(v => v.email === json.agent)
      if (agent) {
        // create room with guest token, add guest and agent
        startChat({agent, customer})
      } else {
        // wait for agent to connect
        customer.waiting = true
      }
    } else {
      // invalid message
      console.log('invalid websocket message syntax:', json)
    }
  })
}

module.exports = {
  start
}
