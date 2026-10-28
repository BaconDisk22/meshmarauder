'use strict';
const net=require('node:net');
const {EventEmitter}=require('node:events');
class TcpTransport extends EventEmitter{
 constructor({timeoutMs=10000}={}){super();this.timeoutMs=timeoutMs;this.socket=null;this.state='disconnected';}
 async connect({host,port=4403}={}){
  if(this.socket)throw new Error('TCP connection already active');
  if(typeof host!=='string'||!host.trim())throw new TypeError('Radio host is required');
  if(!Number.isInteger(port)||port<1||port>65535)throw new RangeError('Invalid TCP port');
  this.state='connecting';this.emit('status',this.state);
  const socket=net.createConnection({host,port});
  this.socket=socket;
  socket.on('data',data=>this.emit('data',Buffer.from(data)));
  socket.on('error',error=>this.emit('error',error));
  socket.on('close',()=>{if(this.socket===socket)this.socket=null;this.state='disconnected';this.emit('status',this.state);});
  return new Promise((resolve,reject)=>{
   let settled=false;
   const finish=(error)=>{if(settled)return;settled=true;clearTimeout(timer);socket.off('connect',onConnect);socket.off('error',onError);if(error){socket.destroy();reject(error);}else resolve();};
   const onConnect=()=>{this.state='transport-open';this.emit('status',this.state);finish();};
   const onError=error=>finish(error);
   const timer=setTimeout(()=>finish(new Error('TCP connection timed out')),this.timeoutMs);
   socket.once('connect',onConnect);socket.once('error',onError);
  });
 }
 send(bytes){if(!this.socket||this.socket.destroyed||!this.socket.writable)throw new Error('TCP not connected');this.socket.write(Buffer.from(bytes));}
 disconnect(){if(this.socket){const socket=this.socket;this.socket=null;socket.destroy();}this.state='disconnected';}
}
module.exports={TcpTransport};
