const Proxy = require('./proxy')
const WebSocketClient = require('./websocket')
const Peer = require('./webrtc')

const port = process.env.PORT || 8080
const proxy = new Proxy()
const peer = new Peer()
proxy.listen(port, '192.168.1.17')

//------------------------------------------------
// Connect to remote device.
const ws = new WebSocketClient()
// ws.connect('wss://proxy-lady.openode.io:443')
ws.connect('wss://proxy-lady.herokuapp.com:443')

ws.onMessage(message => {
	peer.signal(message)
})

peer.onSignal(signal => {
	ws.send(signal)
}) 
//------------------------------------------------

proxy.onRequest((req, res) => {
	const { url, headers, body, method, httpVersion } = req
	peer.send({ url, headers, method, httpVersion })
})

proxy.onConnect((req, socket, head) => {
	const { url, headers, method, httpVersion } = req
	peer.send({ url, headers, method, httpVersion })
})
