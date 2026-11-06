'use strict';
const STATES=Object.freeze(['disconnected','connecting','transport-open','initializing','session-ready','needs-attention']);
const TIPS={
 disconnected:'Choose a radio and connect over supported TCP or USB. Bluetooth is not yet integrated.',
 connecting:'Opening a radio transport. Check TCP IP/port or USB cable and permissions if this stalls.',
 'transport-open':'Transport opened. Waiting for Meshtastic configuration; this is not a ready radio session.',
 initializing:'Meshtastic configuration handshake is in progress. Check for competing clients if it times out.',
 'session-ready':'Meshtastic configuration completed. Live monitoring may begin.',
 'needs-attention':'Review the transport error, radio power, TCP reachability, USB permissions and connection settings.'
};
function describeConnection({transport='tcp',state='disconnected',detail=''}={}){
 if(!STATES.includes(state))throw new RangeError('Unknown connection state');
 if(!['tcp','ble','usb'].includes(transport))throw new RangeError('Unknown transport');
 return {transport,state,ready:state==='session-ready',summary:transport.toUpperCase()+' · '+state.replace(/-/g,' '),tip:TIPS[state],detail:String(detail).slice(0,500)};
}
module.exports={describeConnection,STATES};
