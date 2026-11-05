'use strict';
// Capture the actual desktop UI in an isolated Electron process, without radio access.
const {app,BrowserWindow}=require('electron');
const path=require('node:path');
const fs=require('node:fs');
app.commandLine.appendSwitch('disable-gpu');
app.whenReady().then(async()=>{
 let window;
 try{
  window=new BrowserWindow({width:1440,height:1000,show:false,backgroundColor:'#090f16',webPreferences:{sandbox:true,contextIsolation:true,nodeIntegration:false}});
  await window.loadFile(path.join(__dirname,'index.html'));
  await new Promise(resolve=>setTimeout(resolve,800));
  const image=await window.webContents.capturePage();
  if(image.isEmpty())throw new Error('Electron captured an empty image');
  const target=path.join(__dirname,'dist','screenshots','operations-overview.png');
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.writeFileSync(target,image.toPNG());
  console.log('Captured '+target);
 }catch(error){console.error('Screenshot capture failed:',error);process.exitCode=1;}
 finally{window?.destroy();app.quit();}
}).catch(error=>{console.error(error);app.exit(1)});
