const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const js=fs.readFileSync(path.join(__dirname,'../renderer.js'),'utf8');
test('both packet and node exports neutralize spreadsheet formulas',()=>{
 assert.equal(js.split('match=>"\'"+match').length-1,2);
 assert.equal(js.split('.replace(/"/g,\'""\')').length-1,2);
});
