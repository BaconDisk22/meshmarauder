'use strict';
const {EventEmitter}=require('node:events');
class PacketMonitor extends EventEmitter{
 constructor({limit=200}={}){super();if(!Number.isInteger(limit)||limit<1||limit>10000)throw new RangeError('Invalid packet limit');this.limit=limit;this.items=[];this.mode='idle';}
 setMode(mode){if(!['idle','demo','live'].includes(mode))throw new RangeError('Invalid monitor mode');this.mode=mode;this.emit('mode',mode);}
 record(packet,{simulated=false}={}){
  if(this.mode==='idle')throw new Error('Monitor is idle');
  if(this.mode==='live'&&simulated)throw new Error('Simulated packets forbidden in live mode');
  if(this.mode==='demo'&&!simulated)throw new Error('Real packets forbidden in demo mode');
  const item={timestamp:new Date().toISOString(),mode:this.mode,simulated,summary:String(packet?.summary||'Packet').slice(0,240)};
  this.items.unshift(item);if(this.items.length>this.limit)this.items.length=this.limit;this.emit('packet',item);return item;
 }
 clear(){this.items=[];this.emit('clear');}
}
module.exports={PacketMonitor};
