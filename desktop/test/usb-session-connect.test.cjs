const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const {EventEmitter}=require('node:events');
const {UsbTransport}=require('../usb-transport.cjs');
const {MeshtasticSession}=require('../meshtastic-session.cjs');
const {createMeshtasticCodec}=require('../meshtastic-codec.cjs');
const {frame}=require('../meshtastic-framing.cjs');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');

test('USB connect is wired through to the Meshtastic session',()=>{
 assert.match(read('main.cjs'),/radio:usb-connect/);
 // Unexpected serial drop must close the session and release the transport, same as TCP.
 assert.match(read('main.cjs'),/if\(state==='disconnected'&&transport===next\)\{if\(session\)\{session\.close\(\);session=null;\}transport=null;\}/);
 assert.match(read('preload.cjs'),/connectUsb:options=>ipcRenderer\.invoke\('radio:usb-connect',options\)/);
 assert.match(read('index.html'),/id="connectUsb"/);
 assert.match(read('renderer.js'),/window\.marauder\.connectUsb\(\{path\}\)/);
});

// A fake serial port that behaves like a Meshtastic radio: when it receives a
// framed ToRadio want_config, it answers with a decoded packet and then the
// matching config-complete, so the full USB -> handshake path can be exercised.
function fakeRadioPort(libs){
 const {create,toBinary,fromBinary,protobufs}=libs;
 const FR=protobufs.Mesh.FromRadioSchema,TR=protobufs.Mesh.ToRadioSchema,MP=protobufs.Mesh.MeshPacketSchema;
 class RadioPort extends EventEmitter{
  static async list(){return [{path:'/dev/cu.usbmodem-radio'}];}
  constructor(){super();this.isOpen=false;this._buf=Buffer.alloc(0);}
  open(cb){this.isOpen=true;queueMicrotask(()=>cb(null));}
  close(cb){this.isOpen=false;this.emit('close');cb?.();}
  write(data){
   this._buf=Buffer.concat([this._buf,Buffer.from(data)]);
   while(this._buf.length>=4){const size=this._buf.readUInt16BE(2);if(this._buf.length<size+4)break;const payload=Buffer.from(this._buf.subarray(4,size+4));this._buf=this._buf.subarray(size+4);
    const tr=fromBinary(TR,Uint8Array.from(payload));const nonce=tr.payloadVariant.value;
    const pkt=create(MP,{from:0xabc,to:0xffffffff,channel:1,id:7,payloadVariant:{case:'decoded',value:{portnum:protobufs.Portnums.PortNum.TEXT_MESSAGE_APP}}});
    this.emit('data',frame(Buffer.from(toBinary(FR,create(FR,{payloadVariant:{case:'packet',value:pkt}})))));
    this.emit('data',frame(Buffer.from(toBinary(FR,create(FR,{payloadVariant:{case:'configCompleteId',value:nonce}})))));
   }
  }
 }
 return RadioPort;
}

test('USB transport completes the real handshake and decodes a packet',async()=>{
 const [buf,protobufs]=await Promise.all([import('@bufbuild/protobuf'),import('@meshtastic/protobufs')]);
 const libs={create:buf.create,toBinary:buf.toBinary,fromBinary:buf.fromBinary,protobufs};
 const codec=await createMeshtasticCodec();
 const usb=new UsbTransport({SerialPort:fakeRadioPort(libs)});
 const session=new MeshtasticSession(usb,{codec,timeoutMs:1000});
 const seen=[];session.on('message',m=>seen.push(m));
 await usb.connect({path:'/dev/cu.usbmodem-radio'});
 await session.start();
 assert.equal(session.state,'session-ready');
 assert.ok(seen.some(m=>m.variant==='packet'&&/TEXT_MESSAGE_APP/.test(m.summary)));
 assert.ok(seen.some(m=>m.variant==='configCompleteId'));
 session.close();usb.disconnect();
});
