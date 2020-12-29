const SimplePeer = require('simple-peer')
const Proxy = require('./proxy')
const WebSocketClient = require('./websocket')

const port = process.env.PORT || 8080
const proxy = new Proxy()
proxy.create().listen(port)

const ws = new WebSocketClient()
// ws.connect('wss://proxy-lady.openode.io:443')
ws.connect('wss://proxy-lady.herokuapp.com:443')
