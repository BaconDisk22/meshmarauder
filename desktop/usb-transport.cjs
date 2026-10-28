'use strict';
const {EventEmitter}=require('node:events');
class UsbTransport extends EventEmitter{
 constructor({SerialPort,timeoutMs=10000}={}){
  super();this.SerialPort=SerialPort;this.timeoutMs=timeoutMs;this.port=null;this.state='disconnected';
 }
 getDriver(){return this.SerialPort||require('serialport').SerialPort;}
 async list(){return this.getDriver().list();}
 async connect({path,baudRate=115200}={}){
  if(this.port)throw new Error('USB connection already active');
  if(typeof path!=='string'||!path.startsWith('/dev/'))throw new TypeError('Select a macOS serial device path');
  if(!Number.isInteger(baudRate)||baudRate<=0)throw new RangeError('Invalid baud rate');
  this.state='connecting';this.emit('status',this.state);
  const port=new (this.getDriver())({path,baudRate,autoOpen:false});
  this.port=port;
  port.on('data',bytes=>this.emit('data',Buffer.from(bytes)));
  port.on('error',error=>this.emit('error',error));
  port.on('close',()=>{if(this.port===port)this.port=null;this.state='disconnected';this.emit('status',this.state);});
  return new Promise((resolve,reject)=>{
   let settled=false;
   const finish=error=>{if(settled)return;settled=true;clearTimeout(timer);if(error){this.port=null;port.close(()=>{});reject(error);}else{this.state='transport-open';this.emit('status',this.state);resolve();}};
   const timer=setTimeout(()=>finish(new Error('USB serial connection timed out')),this.timeoutMs);
   try{port.open(error=>finish(error));}catch(error){finish(error);}
  });
 }
 send(bytes){if(!this.port||!this.port.isOpen)throw new Error('USB not connected');this.port.write(Buffer.from(bytes));}
 disconnect(){if(this.port){const port=this.port;this.port=null;if(port.isOpen)port.close(()=>{});}this.state='disconnected';}
}
module.exports={UsbTransport};
