const test=require('node:test');const assert=require('node:assert/strict');const {EventEmitter}=require('node:events');const {UsbTransport}=require('../usb-transport.cjs');
class MockPort extends EventEmitter{
 static async list(){return [{path:'/dev/tty.usbmodem-test'}];}
 constructor(options){super();this.options=options;this.isOpen=false;}
 open(cb){this.isOpen=true;queueMicrotask(()=>cb(null));}
 write(data){this.lastWrite=data;}
 close(cb){this.isOpen=false;this.emit('close');cb?.();}
}
test('enumerates and opens an explicitly selected serial device',async()=>{const usb=new UsbTransport({SerialPort:MockPort});assert.equal((await usb.list()).length,1);await usb.connect({path:'/dev/tty.usbmodem-test'});assert.equal(usb.state,'transport-open');usb.send(Buffer.from('test'));assert.equal(usb.port.lastWrite.toString(),'test');usb.disconnect();assert.equal(usb.state,'disconnected');});
test('refuses invalid serial paths',async()=>{const usb=new UsbTransport({SerialPort:MockPort});await assert.rejects(usb.connect({path:'COM1'}),/macOS serial/);});
