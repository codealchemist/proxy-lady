const net = require('net')

class Proxy {
  constructor() {
    this.debug = true
  }

  create() {
    this.proxy = net.createServer(client => {
      client.once('data', data => {
        client.write(Buffer.from([5, 0]));
    
        client.once('data', data => {
          data = [...data];
          let ver = data.shift();
          let cmd = data.shift(); //1: connect, 2: bind, 3: udp
          let rsv = data.shift();
          let atyp = data.shift(); //1: ipv4(4bytes followed), 3: domain, 4: ipv6(16 bytes followed)
          let dstAddr, dstPort, serverStr = '';
          if (atyp === 1) {
            dstAddr = data.splice(0, 4);
            serverStr = dstAddr.join('.');
          } else if (atyp === 3) {
            let domainLength = data.shift();
            dstAddr = data.splice(0, domainLength);
            serverStr = Buffer.from(dstAddr).toString();
            dstAddr.unshift(domainLength);
          } else if (atyp === 4) {
            dstAddr = data.splice(0, 16);
            serverStr = [];
            for(let i = 0; i < 8; i++) {
              serverStr.push(Buffer.from(dstAddr.slice(i * 2, 2)).toString('hex'));
            }
            serverStr = serverStr.join(':');
          } else {
            client.destroy();
            return;
          }
    
          dstPort = data.splice(0, 2);
          const portNum = dstPort[0] * 256 + dstPort[1];
    
          const serverName = `${serverStr}:${portNum}`;
          console.log('>', serverName);
          
          const dstServer = net.connect({
            host: serverStr,
            port: portNum
          });
    
          dstServer.on('error', err => {
            console.log(`!Server Error(${serverName}):`, err.message);
            client.destroy();
          });
    
          client.on('error', err=>{
            console.log(`!Client Error(${serverName}):`, err.message);
            dstServer.destroy();
          });
    
          if (data && data.length > 0) {
            dstServer.write(Buffer.from(data));
          }
    
          client.write(Buffer.concat([
            Buffer.from([ver, 0, 0, atyp]),
            Buffer.from(dstAddr),
            Buffer.from(dstPort)
          ]));
    
          dstServer.pipe(client);
          client.pipe(dstServer);
        });
      });
    })
    return this
  }

  listen(port, host='127.0.0.1') {
    this.proxy.listen(port, host)
    this.log(`Listening on ${host}:${port}`)
    return this
  }

  log() {
    if (!this.debug) return
    console.log('[ PROXY ]', ...arguments)
  }
}

module.exports = Proxy

