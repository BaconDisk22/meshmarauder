const test=require('node:test');const assert=require('node:assert/strict');const {describeConnection,STATES}=require('../connection-diagnostics.cjs');
test('only a completed session is ready',()=>{for(const state of STATES){const d=describeConnection({state,transport:'tcp'});assert.equal(d.ready,state==='session-ready');assert.ok(d.tip.length>10);}});
test('diagnostic details are bounded and invalid transports rejected',()=>{assert.equal(describeConnection({detail:'x'.repeat(2000)}).detail.length,500);assert.throws(()=>describeConnection({transport:'invalid'}),/Unknown transport/);});
