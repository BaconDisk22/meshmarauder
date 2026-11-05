'use strict';
const fs=require('node:fs');
const path=require('node:path');
function validatePng(file){
 const b=fs.readFileSync(file);
 if(b.length<24||!b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))||b.toString('ascii',12,16)!=='IHDR')throw new Error('Invalid PNG screenshot');
 const width=b.readUInt32BE(16),height=b.readUInt32BE(20);
 if(width<800||height<600)throw new Error('Screenshot dimensions too small: '+width+'x'+height);
 return {width,height};
}
if(require.main===module){
 const file=process.argv[2]||path.join(__dirname,'dist/screenshots/operations-overview.png');
 const dimensions=validatePng(file);
 console.log('Validated Electron screenshot '+dimensions.width+'x'+dimensions.height);
}
module.exports={validatePng};
