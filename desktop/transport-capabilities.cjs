'use strict';
const {BleTransport}=require('./ble-transport.cjs');
const {UsbTransport}=require('./usb-transport.cjs');
function capabilities({bleAdapter,serialAdapter}={}){return {bluetooth:{available:!!bleAdapter,reason:bleAdapter?null:'Native macOS Bluetooth adapter not installed'},usb:{available:!!serialAdapter,reason:serialAdapter?null:'USB serial adapter not initialized'}};}
module.exports={capabilities,BleTransport,UsbTransport};
