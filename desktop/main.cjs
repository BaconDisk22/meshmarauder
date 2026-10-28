const {app,BrowserWindow}=require('electron');
const path=require('node:path');
function createWindow(){
 const window=new BrowserWindow({width:1180,height:760,minWidth:780,minHeight:560,backgroundColor:'#10151e',webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
 window.loadFile(path.join(__dirname,'index.html'));
}
app.whenReady().then(()=>{createWindow();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
