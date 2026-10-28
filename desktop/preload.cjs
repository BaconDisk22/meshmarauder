const {contextBridge}=require('electron');
contextBridge.exposeInMainWorld('marauder',{platform:process.platform,appVersion:'0.1.0',demo:true});
