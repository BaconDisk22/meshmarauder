'use strict';
const HEADER=Buffer.from([0x94,0xc3]);
const MAX_PAYLOAD=512;
function frame(payload){
 if(!Buffer.isBuffer(payload))payload=Buffer.from(payload);
 if(payload.length>MAX_PAYLOAD)throw new RangeError('Meshtastic payload exceeds 512 bytes');
 const out=Buffer.allocUnsafe(payload.length+4);
 HEADER.copy(out,0);out.writeUInt16BE(payload.length,2);payload.copy(out,4);
 return out;
}
class FrameDecoder{
 constructor(onFrame){if(typeof onFrame!=='function')throw new TypeError('onFrame required');this.onFrame=onFrame;this.buffer=Buffer.alloc(0);}
 push(chunk){
  if(!Buffer.isBuffer(chunk))chunk=Buffer.from(chunk);
  this.buffer=Buffer.concat([this.buffer,chunk]);
  while(this.buffer.length>=4){
   const pos=this.buffer.indexOf(HEADER);
   if(pos<0){this.buffer=this.buffer.subarray(this.buffer.at(-1)===0x94?this.buffer.length-1:this.buffer.length);return;}
   if(pos>0)this.buffer=this.buffer.subarray(pos);
   if(this.buffer.length<4)return;
   const size=this.buffer.readUInt16BE(2);
   if(size>MAX_PAYLOAD){this.buffer=this.buffer.subarray(2);continue;}
   if(this.buffer.length<size+4)return;
   const payload=Buffer.from(this.buffer.subarray(4,size+4));
   this.buffer=this.buffer.subarray(size+4);
   this.onFrame(payload);
  }
  if(this.buffer.length>MAX_PAYLOAD+4)throw new RangeError('TCP frame buffer limit exceeded');
 }
 reset(){this.buffer=Buffer.alloc(0);}
}
module.exports={frame,FrameDecoder,MAX_PAYLOAD};
