const theme=document.querySelector('#theme');
const savedTheme=localStorage.getItem('meshMarauder.theme');
const options=['neon','mocha','vibrant','dusk'];
function setTheme(value){const safe=options.includes(value)?value:'neon';document.body.dataset.theme=safe;theme.value=safe;localStorage.setItem('meshMarauder.theme',safe);}
setTheme(savedTheme);
theme.addEventListener('change',()=>setTheme(theme.value));
document.querySelector('#toggleDemo').addEventListener('click',()=>{
 const monitor=document.querySelector('#packetList');const empty=monitor.querySelector('.empty');if(empty)empty.remove();
 const row=document.createElement('div');row.className='packet';const label=document.createElement('strong');label.textContent='DEMO / SIMULATED';row.append(label,document.createTextNode('  '+new Date().toLocaleTimeString()+' · sample mesh packet · No radio traffic'));monitor.prepend(row);
});
