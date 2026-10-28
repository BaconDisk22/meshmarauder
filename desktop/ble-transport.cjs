'use strict';
const {EventEmitter}=require('node:events');
const SERVICE_UUID='6ba1b218-15a8-461f-9fa8-5dcae273eafd';
const TO_RADIO_UUID='f75c76d2-129e-4dad-a1dd-7866124401e7';
const FROM_RADIO_UUID='2c55e69e-4993-11ed-b878-0242ac120002';
const FROM_NUM_UUID='ed9da18c-a800-4f66-a670-aa7547e34453';
class BleTransport extends EventEmitter{
 constructor({adapter}={}){super();this.adapter=adapter;this.state='disconnected';}
 async list(){if(!this.adapter)throw new Error('BLE adapter not installed; Bluetooth hardware support pending');return this.adapter.list({serviceUuid:SERVICE_UUID});}
 async connect(deviceId){
  if(!this.adapter)throw new Error('BLE adapter not installed; Bluetooth hardware support pending');
  if(typeof deviceId!=='string'||!deviceId.trim())throw new TypeError('Select a Bluetooth radio');
  this.state='connecting';this.emit('status',this.state);
  try{await this.adapter.connect(deviceId,{serviceUuid:SERVICE_UUID,toRadioUuid:TO_RADIO_UUID,fromRadioUuid:FROM_RADIO_UUID,fromNumUuid:FROM_NUM_UUID,onData:data=>this.emit('data',Buffer.from(data))});this.state='transport-open';this.emit('status',this.state);}
  catch(error){this.state='disconnected';this.emit('status',this.state);throw error;}
 }
 async send(data){if(this.state!=='transport-open')throw new Error('BLE transport not open');return this.adapter.send(Buffer.from(data));}
 async disconnect(){await this.adapter?.disconnect?.();this.state='disconnected';this.emit('status',this.state);}
}
module.exports={BleTransport,SERVICE_UUID,TO_RADIO_UUID,FROM_RADIO_UUID,FROM_NUM_UUID};
