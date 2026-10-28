'use strict';
function validateTcpOptions(input){
 if(!input||typeof input!=='object')throw new TypeError('TCP settings required');
 const host=String(input.host||'').trim();
 if(!host||host.length>253||! /^[a-zA-Z0-9.:-]+$/.test(host))throw new TypeError('Invalid TCP host');
 const port=input.port===undefined?4403:Number(input.port);
 if(!Number.isInteger(port)||port<1||port>65535)throw new RangeError('Invalid TCP port');
 return {host,port};
}
function validateUsbOptions(input){
 if(!input||typeof input.path!=='string'||!/^\/dev\/(tty|cu)\.[a-zA-Z0-9._-]+$/.test(input.path))throw new TypeError('Invalid macOS USB device path');
 return {path:input.path,baudRate:115200};
}
module.exports={validateTcpOptions,validateUsbOptions};
