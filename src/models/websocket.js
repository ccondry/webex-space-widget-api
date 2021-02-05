// load WebSocket library
const WebSocket = require('ws')
// our current websocket connections
const agents = []
const customers = []
const webex = require('./webex')

function start (server) {
  console.log('starting websocket server')
  //initialize the WebSocket server instance
  const wss = new WebSocket.Server({ server })
  wss.on('connection', newConnection)
}

function startChat ({agent, customer}) {
  // console.log('startChat', agent, customer)
  // TODO create space, join agent and customer, then send websocket messages
  const spaceId = 'Y2lzY29zcGFyazovL3VzL1JPT00vMjNjOWIxMjAtMDU3My0xMWVhLWEyOGItODUwN2UzNDFmNTM1'
  agent.ws.send(JSON.stringify({spaceId}))
  customer.ws.send(JSON.stringify({spaceId}))
}

function newConnection (ws) {
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
        const waiting = customers.filter(c => c.waiting === email)
        if (waiting.length) {
          for (const customer of waiting) {
            // create room, add guest and agent
            startChat({agent, customer})
          }
        }
      } catch (e) {
        console.log('failed to get webex me details for websocket client:', e.message)
      }
    } else if (json.issuerId) {
      // customer message
      // cache the connection details
      const customer = {
        issuerId: json.issuerId,
        agent: json.agent,
        name: json.name,
        request: json.request,
        ws
      }
      customers[json.issuerId] = customer
      // find the agent
      const agent = agents.find(v => v.email === json.agent)
      if (agent) {
        // create room with guest token, add guest and agent
        startChat({agent, customer})
      } else {
        // wait for agent to connect
        customer.waiting = json.agent
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
