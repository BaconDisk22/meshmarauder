const test=require('node:test');const assert=require('node:assert/strict');const {describeConnection}=require('../connection-diagnostics.cjs');
test('socket-open is not radio-ready',()=>{const state=describeConnection({transport:'tcp',state:'transport-open'});assert.equal(state.ready,false);assert.match(state.tip,/not a ready radio session/);});
test('only completed Meshtastic session enables live monitor',()=>{assert.equal(describeConnection({state:'session-ready'}).ready,true);assert.equal(describeConnection({state:'initializing'}).ready,false);});
test('rejects unknown transport or state',()=>{assert.throws(()=>describeConnection({transport:'wifi'}),RangeError);assert.throws(()=>describeConnection({state:'ready'}),RangeError);});
