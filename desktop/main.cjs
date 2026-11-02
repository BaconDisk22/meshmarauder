const {app,BrowserWindow,ipcMain}=require('electron');
const path=require('node:path');
const {TcpTransport}=require('./tcp-transport.cjs');
const {validateTcpOptions}=require('./radio-input.cjs');
const {MeshtasticSession}=require('./meshtastic-session.cjs');
const {createMeshtasticCodec}=require('./meshtastic-codec.cjs');
let transport=null;
let session=null;
function teardown(){if(session){session.close();session=null;}if(transport){transport.disconnect();transport=null;}}
function createWindow(){
 const window=new BrowserWindow({width:1180,height:760,minWidth:780,minHeight:560,backgroundColor:'#10151e',webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
 window.loadFile(path.join(__dirname,'index.html'));
 window.on('closed',()=>{teardown();});
}
ipcMain.handle('radio:tcp-connect',async(event,options)=>{
 const win=BrowserWindow.fromWebContents(event.sender);
 if(!win||!win.webContents.getURL().startsWith('file://'))throw new Error('Unauthorized renderer');
 if(transport)throw new Error('Disconnect the existing radio transport first');
 const safe=validateTcpOptions(options);
 const next=new TcpTransport({timeoutMs:10000});
 next.on('status',state=>{if(!win.isDestroyed())win.webContents.send('radio:status',{transport:'tcp',state});if(state==='disconnected'&&transport===next)transport=null;});
 next.on('error',error=>{if(!win.isDestroyed())win.webContents.send('radio:error',String(error.message).slice(0,300));});
 next.on('data',bytes=>{if(!win.isDestroyed())win.webContents.send('radio:bytes',{count:bytes.length});});
 transport=next;
 try{await next.connect(safe);}
 catch(error){next.disconnect();if(transport===next)transport=null;throw new Error(String(error.message).slice(0,300));}
 // Socket is open; run the real Meshtastic configuration handshake before
 // claiming a session, and stream decoded FromRadio packets to the renderer.
 try{
  const codec=await createMeshtasticCodec();
  const next_session=new MeshtasticSession(next,{codec,timeoutMs:20000});
  session=next_session;
  next_session.on('status',state=>{if(!win.isDestroyed())win.webContents.send('radio:session',{state});});
  next_session.on('message',message=>{if(!win.isDestroyed())win.webContents.send('radio:packet',{variant:message.variant,summary:message.summary,meta:message.meta||null});});
  next_session.on('decode-error',error=>{if(!win.isDestroyed())win.webContents.send('radio:error','Decode error: '+String(error.message).slice(0,200));});
  await next_session.start();
  return {state:'session-ready',note:'Meshtastic configuration handshake complete; decoded packets are now live.'};
 }catch(error){teardown();throw new Error(String(error.message).slice(0,300));}
});
ipcMain.handle('radio:disconnect',()=>{teardown();return {state:'disconnected'};});
app.whenReady().then(()=>{createWindow();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
app.on('before-quit',()=>{teardown();});
