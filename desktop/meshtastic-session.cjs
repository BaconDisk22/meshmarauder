'use strict';
const {EventEmitter}=require('node:events');
const {FrameDecoder,frame}=require('./meshtastic-framing.cjs');
class MeshtasticSession extends EventEmitter{
 constructor(transport,{timeoutMs=15000,codec}={}){
  super();if(!transport||typeof transport.send!=='function'||typeof transport.on!=='function')throw new TypeError('transport required');
  if(!codec||typeof codec.encodeWantConfig!=='function'||typeof codec.decodeFromRadio!=='function')throw new TypeError('Meshtastic protobuf codec required');
  this.transport=transport;this.codec=codec;this.timeoutMs=timeoutMs;this.state='disconnected';this.decoder=new FrameDecoder(bytes=>this.receive(bytes));this.onData=bytes=>this.decoder.push(bytes);this.onStatus=status=>{if(status==='disconnected')this.close();};
 }
 async start(){
  if(this.state!=='disconnected')throw new Error('Session already started');
  this.state='initializing';this.emit('status',this.state);
  this.transport.on('data',this.onData);this.transport.on('status',this.onStatus);
  const nonce=(Math.floor(Math.random()*0x7fffffff)+1)>>>0;this.nonce=nonce;
  return new Promise((resolve,reject)=>{
   this.pending={resolve,reject};
   this.timer=setTimeout(()=>{this.fail(new Error('Meshtastic config handshake timed out'));},this.timeoutMs);
   try{this.transport.send(frame(this.codec.encodeWantConfig(nonce)));}catch(error){this.fail(error);}
  });
 }
 receive(bytes){
  let message;try{message=this.codec.decodeFromRadio(bytes);}catch(error){this.emit('decode-error',error);return;}
  this.emit('message',message);
  if(this.state==='initializing'&&message&&message.configCompleteId===this.nonce){
   clearTimeout(this.timer);this.state='session-ready';this.emit('status',this.state);
   const pending=this.pending;this.pending=null;pending?.resolve();
  }
 }
 fail(error){const pending=this.pending;this.pending=null;clearTimeout(this.timer);this.close();pending?.reject(error);}
 close(){clearTimeout(this.timer);this.transport.off('data',this.onData);this.transport.off('status',this.onStatus);if(this.state!=='disconnected'){this.state='disconnected';this.emit('status',this.state);}const pending=this.pending;this.pending=null;pending?.reject(new Error('Session closed'));}
}
module.exports={MeshtasticSession};
