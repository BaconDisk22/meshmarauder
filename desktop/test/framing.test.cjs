const test=require('node:test');const assert=require('node:assert/strict');
const {frame,FrameDecoder}=require('../meshtastic-framing.cjs');
test('frame encoding uses 94c3 and network-order length',()=>{assert.deepEqual(frame(Buffer.from([1,2])),Buffer.from([0x94,0xc3,0,2,1,2]));});
test('decoder reassembles split TCP frames',()=>{const seen=[];const d=new FrameDecoder(x=>seen.push(x));const a=frame(Buffer.from('hello'));d.push(a.subarray(0,3));assert.equal(seen.length,0);d.push(a.subarray(3));assert.equal(seen[0].toString(),'hello');});
test('decoder handles concatenated frames and garbage prefix',()=>{const seen=[];const d=new FrameDecoder(x=>seen.push(x.toString()));d.push(Buffer.concat([Buffer.from([0,1]),frame('a'),frame('b')]));assert.deepEqual(seen,['a','b']);});
test('oversized frames rejected and decoder recovers',()=>{assert.throws(()=>frame(Buffer.alloc(513)),RangeError);const seen=[];const d=new FrameDecoder(x=>seen.push(x.toString()));d.push(Buffer.concat([Buffer.from([0x94,0xc3,2,1]),frame('ok')]));assert.deepEqual(seen,['ok']);});
