const WebSocket = require('ws')

class WebSocketClient {
  constructor(options = {}) {
    this.debug = true
    this.options = options
  }

  connect(serverUrl) {
    this.log(`Connecting to ${serverUrl}...`)
    this.client = new WebSocket(serverUrl, this.options)
    this.setEvents()
  }

  setEvents() {
    this.client.on('connect', () => {
      this.log('Connected!')
    })

    this.client.on('open', () => {
      this.log('Open')
    })

    this.client.on('message', (data) => {
      this.log('Message', data)
    })

    this.client.on('close', () => {
      this.log('CLOSED')
      this.connect()
    });
  }

  send(message) {
    this.client.send(JSON.stringify(message))
  }

  log() {
    if (!this.debug) return
    console.log('[ WS-Client ]', ...arguments)
  }
}

module.exports = WebSocketClient
