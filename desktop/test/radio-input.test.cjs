const test=require('node:test');const assert=require('node:assert/strict');const {validateTcpOptions,validateUsbOptions}=require('../radio-input.cjs');
test('accepts IP and default Meshtastic TCP port',()=>assert.deepEqual(validateTcpOptions({host:'192.168.1.10'}),{host:'192.168.1.10',port:4403}));
test('rejects shell-like host values and invalid ports',()=>{assert.throws(()=>validateTcpOptions({host:'example.com;rm -rf'}));assert.throws(()=>validateTcpOptions({host:'node.local',port:70000}));});
test('USB path must be macOS tty or cu device',()=>{assert.deepEqual(validateUsbOptions({path:'/dev/cu.usbmodem123'}),{path:'/dev/cu.usbmodem123',baudRate:115200});assert.throws(()=>validateUsbOptions({path:'/etc/passwd'}));});
