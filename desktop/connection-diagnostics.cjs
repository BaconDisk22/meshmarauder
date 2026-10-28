'use strict';
const STATES=Object.freeze(['disconnected','connecting','transport-open','initializing','session-ready','needs-attention']);
const TIPS={
 disconnected:'Choose a radio and connect over TCP, Bluetooth or USB.',
 connecting:'Opening a radio transport. Check IP address, Bluetooth selection or USB cable if it stalls.',
 'transport-open':'Transport opened. Waiting for Meshtastic configuration; this is not a ready radio session.',
 initializing:'Meshtastic configuration handshake is in progress. Check for competing clients if it times out.',
 'session-ready':'Meshtastic configuration completed. Live monitoring may begin.',
 'needs-attention':'Review the transport error, radio power, permissions and connection settings.'
};
function describeConnection({transport='tcp',state='disconnected',detail=''}={}){
 if(!STATES.includes(state))throw new RangeError('Unknown connection state');
 if(!['tcp','ble','usb'].includes(transport))throw new RangeError('Unknown transport');
 return {transport,state,ready:state==='session-ready',summary:transport.toUpperCase()+' · '+state.replace(/-/g,' '),tip:TIPS[state],detail:String(detail).slice(0,500)};
}
module.exports={describeConnection,STATES};
