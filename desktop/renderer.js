const theme=document.querySelector('#theme');
const savedTheme=localStorage.getItem('meshMarauder.theme');
const options=['neon','mocha','vibrant','dusk'];
function setTheme(value){const safe=options.includes(value)?value:'neon';document.body.dataset.theme=safe;theme.value=safe;localStorage.setItem('meshMarauder.theme',safe);}
setTheme(savedTheme);
theme.addEventListener('change',()=>setTheme(theme.value));
document.querySelector('#toggleDemo').addEventListener('click',()=>{
 const monitor=document.querySelector('#packetList');const empty=monitor.querySelector('.empty');if(empty)empty.remove();
 const row=document.createElement('div');row.className='packet';const label=document.createElement('strong');label.textContent='DEMO / SIMULATED';row.append(label,document.createTextNode('  '+new Date().toLocaleTimeString()+' · sample mesh packet · No radio traffic'));monitor.prepend(row);
});

const filter=document.querySelector('#packetFilter');const clearPackets=document.querySelector('#clearPackets');const packetList=document.querySelector('#packetList');
function applyFilter(){const term=filter.value.trim().toLowerCase();for(const item of packetList.querySelectorAll('.packet'))item.hidden=!item.textContent.toLowerCase().includes(term);}
filter.addEventListener('input',applyFilter);clearPackets.addEventListener('click',()=>{packetList.replaceChildren();});
const connectionBanner=document.querySelector('#connectionBanner');
function updateBanner(state){
 const labels={'disconnected':'NO RADIO CONNECTED · DEMO AVAILABLE','connecting':'CONNECTING TO RADIO','transport-open':'TCP OPEN · HANDSHAKE PENDING','initializing':'TCP OPEN · HANDSHAKE PENDING','session-ready':'LIVE RADIO · SESSION READY'};
 connectionBanner.textContent=labels[state]||'RADIO NEEDS ATTENTION';
 connectionBanner.dataset.connectionState=state;
}
const tcpStatus=document.querySelector('#tcpStatus');
const tcpMessage=document.querySelector('#tcpMessage');
const tcpConnect=document.querySelector('#connectTcp');
const tcpDisconnect=document.querySelector('#disconnectTcp');
if(window.marauder?.connectTcp){
 window.marauder.onStatus(({state})=>{updateBanner(state);tcpStatus.textContent=state==='transport-open'?'TCP socket open — handshake pending':state.replace(/-/g,' ');tcpConnect.disabled=state==='connecting'||state==='transport-open';if(state==='disconnected'){tcpConnect.disabled=false;tcpMessage.textContent='Radio disconnected. Reconnect when ready.';}});
 window.marauder.onError(message=>{tcpMessage.textContent='TCP error: '+message;});
 window.marauder.onBytes(({count})=>{tcpMessage.textContent='Received '+count+' transport bytes; awaiting Meshtastic configuration handshake.';});
 window.marauder.onSession?.(({state})=>{updateBanner(state);
  if(state==='initializing')tcpStatus.textContent='TCP open — Meshtastic handshake in progress';
  else if(state==='session-ready')tcpStatus.textContent='Session ready — decoding live packets';
  else if(state==='disconnected'){tcpStatus.textContent='Not connected';tcpConnect.disabled=false;}
  else tcpStatus.textContent=state.replace(/-/g,' ');
 });
 window.marauder.onPacket?.(packet=>{
  const monitor=document.querySelector('#packetList');const empty=monitor.querySelector('.empty');if(empty)empty.remove();
  if(packet.variant==='configCompleteId')return;
  const row=document.createElement('div');row.className='packet';
  const label=document.createElement('strong');label.textContent='LIVE';
  const summary=packet.summary||packet.variant||'packet';
  row.append(label,document.createTextNode('  '+new Date().toLocaleTimeString()+' · '+String(summary).slice(0,200)));
  if(packet.meta&&typeof packet.meta==='object'){
   const details=document.createElement('details');const heading=document.createElement('summary');heading.textContent='Packet metadata';details.append(heading);
   const fields=['from','to','channel','id','rxTime','rxSnr','rxRssi','hopLimit','portnum','encrypted'];
   for(const field of fields){const value=packet.meta[field];if(value===undefined||value===null)continue;const line=document.createElement('div');line.textContent=field+': '+String(value).slice(0,100);details.append(line);}
   row.append(details);
  }
  monitor.prepend(row);applyFilter();
  while(monitor.children.length>200)monitor.lastChild.remove();
 });
 tcpConnect.addEventListener('click',async()=>{
  tcpConnect.disabled=true;tcpMessage.textContent='Opening TCP socket…';
  try{const result=await window.marauder.connectTcp({host:document.querySelector('#tcpHost').value,port:Number(document.querySelector('#tcpPort').value)});tcpMessage.textContent=result.note;}
  catch(error){updateBanner('disconnected');tcpMessage.textContent='Connection failed: '+String(error.message).slice(0,300);tcpConnect.disabled=false;}
 });
 tcpDisconnect.addEventListener('click',async()=>{try{await window.marauder.disconnect();tcpStatus.textContent='Not connected';updateBanner('disconnected');tcpMessage.textContent='Disconnected';tcpConnect.disabled=false;}catch(error){tcpMessage.textContent='Disconnect error: '+String(error.message).slice(0,300);}});
}

const usbRefresh=document.querySelector('#refreshUsb');
const usbPorts=document.querySelector('#usbPorts');
const usbStatus=document.querySelector('#usbStatus');
usbRefresh.addEventListener('click',async()=>{
 usbRefresh.disabled=true;usbStatus.textContent='Searching for serial devices…';usbPorts.replaceChildren();
 try{
  const ports=await window.marauder.listUsbPorts();
  const empty=document.createElement('option');empty.value='';empty.textContent='Select a device';usbPorts.append(empty);
  for(const port of ports){const option=document.createElement('option');option.value=port.path;option.textContent=port.path+(port.manufacturer?' · '+port.manufacturer:'');usbPorts.append(option);}
  usbStatus.textContent=ports.length+' serial device(s) found · Not connected';
 }catch(error){usbStatus.textContent='Discovery failed: '+String(error.message).slice(0,160);}
 finally{usbRefresh.disabled=false;}
});
