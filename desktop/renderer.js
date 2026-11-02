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

const tcpStatus=document.querySelector('#tcpStatus');
const tcpMessage=document.querySelector('#tcpMessage');
const tcpConnect=document.querySelector('#connectTcp');
const tcpDisconnect=document.querySelector('#disconnectTcp');
if(window.marauder?.connectTcp){
 window.marauder.onStatus(({state})=>{tcpStatus.textContent=state==='transport-open'?'TCP socket open — handshake pending':state.replace(/-/g,' ');tcpConnect.disabled=state==='connecting'||state==='transport-open';});
 window.marauder.onError(message=>{tcpMessage.textContent='TCP error: '+message;});
 window.marauder.onBytes(({count})=>{tcpMessage.textContent='Received '+count+' transport bytes; awaiting Meshtastic configuration handshake.';});
 window.marauder.onSession?.(({state})=>{
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
  monitor.prepend(row);
  while(monitor.children.length>200)monitor.lastChild.remove();
 });
 tcpConnect.addEventListener('click',async()=>{
  tcpConnect.disabled=true;tcpMessage.textContent='Opening TCP socket…';
  try{const result=await window.marauder.connectTcp({host:document.querySelector('#tcpHost').value,port:Number(document.querySelector('#tcpPort').value)});tcpMessage.textContent=result.note;}
  catch(error){tcpMessage.textContent='Connection failed: '+String(error.message).slice(0,300);tcpConnect.disabled=false;}
 });
 tcpDisconnect.addEventListener('click',async()=>{try{await window.marauder.disconnect();tcpStatus.textContent='Not connected';tcpMessage.textContent='Disconnected';tcpConnect.disabled=false;}catch(error){tcpMessage.textContent='Disconnect error: '+String(error.message).slice(0,300);}});
}
