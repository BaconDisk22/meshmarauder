const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('marauder',{
 platform:process.platform,appVersion:'0.1.0',demo:true,
 connectTcp:options=>ipcRenderer.invoke('radio:tcp-connect',options),
 disconnect:()=>ipcRenderer.invoke('radio:disconnect'),
 onStatus:callback=>{if(typeof callback!=='function')throw new TypeError('Callback required');const handler=(_event,data)=>callback(data);ipcRenderer.on('radio:status',handler);return ()=>ipcRenderer.removeListener('radio:status',handler);},
 onError:callback=>{if(typeof callback!=='function')throw new TypeError('Callback required');const handler=(_event,data)=>callback(data);ipcRenderer.on('radio:error',handler);return ()=>ipcRenderer.removeListener('radio:error',handler);},
 onBytes:callback=>{if(typeof callback!=='function')throw new TypeError('Callback required');const handler=(_event,data)=>callback(data);ipcRenderer.on('radio:bytes',handler);return ()=>ipcRenderer.removeListener('radio:bytes',handler);},
 onSession:callback=>{if(typeof callback!=='function')throw new TypeError('Callback required');const handler=(_event,data)=>callback(data);ipcRenderer.on('radio:session',handler);return ()=>ipcRenderer.removeListener('radio:session',handler);},
 onPacket:callback=>{if(typeof callback!=='function')throw new TypeError('Callback required');const handler=(_event,data)=>callback(data);ipcRenderer.on('radio:packet',handler);return ()=>ipcRenderer.removeListener('radio:packet',handler);}
});
