const test=require('node:test');const assert=require('node:assert/strict');const net=require('node:net');const {once}=require('node:events');const {TcpTransport}=require('../tcp-transport.cjs');
test('TCP transport opens, sends and receives without claiming session ready',async()=>{
 const server=net.createServer(socket=>socket.on('data',data=>socket.write(data)));server.listen(0,'127.0.0.1');await once(server,'listening');
 const client=new TcpTransport({timeoutMs:2000});client.on('error',()=>{});
 try{
  await client.connect({host:'127.0.0.1',port:server.address().port});
  assert.equal(client.state,'transport-open');
  const data=once(client,'data');client.send(Buffer.from('ping'));assert.equal((await data)[0].toString(),'ping');
 }finally{client.disconnect();server.close();}
});
test('invalid connection arguments are rejected',async()=>{const client=new TcpTransport();await assert.rejects(client.connect({host:''}),/host/);await assert.rejects(client.connect({host:'127.0.0.1',port:0}),/port/);});
