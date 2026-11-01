/* CoreOS v6 — integrated local applications */
(() => {
'use strict';
const $=(s,r=document)=>r.querySelector(s), esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DB='CoreOSLocalFiles', STORE='files', DATA='coreos.v6.data';
const state=()=>{try{return JSON.parse(localStorage.getItem(DATA))||{notes:[],events:[]}}catch{return {notes:[],events:[]}}};
const persist=d=>localStorage.setItem(DATA,JSON.stringify(d));
const openUrl=u=>window.open(u,'_blank','noopener,noreferrer');
const dbReady=new Promise((resolve,reject)=>{const q=indexedDB.open(DB,1);q.onupgradeneeded=()=>{if(!q.result.objectStoreNames.contains(STORE))q.result.createObjectStore(STORE,{keyPath:'id',autoIncrement:true})};q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)});
async function db(method,fn){const d=await dbReady;return new Promise((resolve,reject)=>{const tx=d.transaction(STORE,method),s=tx.objectStore(STORE);let result;try{result=fn(s)}catch(e){reject(e);return}tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error)})}
async function getFiles(){const d=await dbReady;return new Promise((resolve,reject)=>{const q=d.transaction(STORE).objectStore(STORE).getAll();q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)})}
function define(name,title,html){apps[name]={title,html}}
window.CoreOSFiles={
 async addFiles(fileList){const incoming=Array.from(fileList||[]);if(!incoming.length)return getFiles();if(incoming.length>100)throw new Error('Puoi importare al massimo 100 file per volta.');if(incoming.some(file=>file.size>100*1024*1024))throw new Error('Ogni file deve essere inferiore a 100 MB.');const existing=(await getFiles()).length;if(existing+incoming.length>500)throw new Error('Archivio pieno: massimo 500 elementi.');for(const file of incoming){await db('readwrite',s=>s.add({name:file.name,type:file.type,size:file.size,blob:file,trash:false,created:Date.now()}))}return getFiles()},
 async list(){return getFiles()},
 async download(id){const x=(await getFiles()).find(f=>String(f.id)===String(id));if(!x)return;const u=URL.createObjectURL(x.blob),a=document.createElement('a');a.href=u;a.download=x.name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1200)},
 async rename(id,name){const x=(await getFiles()).find(f=>String(f.id)===String(id));if(!x||!name?.trim())return false;x.name=name.trim();await db('readwrite',s=>s.put(x));return true},
 async trash(id){const x=(await getFiles()).find(f=>String(f.id)===String(id));if(!x)return false;x.trash=true;await db('readwrite',s=>s.put(x));return true},
 async restore(id){const x=(await getFiles()).find(f=>String(f.id)===String(id));if(!x)return false;x.trash=false;await db('readwrite',s=>s.put(x));return true},
 async remove(id){await db('readwrite',s=>s.delete(Number(id)))}
};
define('browser','CoreOS Browser','<div class="v6-browser"><form id="v6BrowserForm"><input id="v6BrowserUrl" type="search" value="https://www.google.com" placeholder="Cerca sul web o inserisci un indirizzo"><button>Vai</button></form><div class="v6-tools"><button type="button" id="v6BrowserHome">Home</button><button type="button" id="v6BrowserBack">Indietro</button><button type="button" id="v6BrowserReload">Ricarica</button><button type="button" id="v6BrowserExternal">Apri scheda esterna ↗</button></div><div id="v6BrowserStatus" class="v6-browser-status">Browser web · Connessione in attesa</div><iframe id="v6BrowserFrame" title="Pagina web" referrerpolicy="strict-origin-when-cross-origin" sandbox="allow-forms allow-scripts allow-popups"></iframe><p class="v6-hint">Navigazione web reale. I siti che vietano l'inclusione (per esempio servizi bancari e alcuni motori) si aprono in una scheda esterna per i limiti di sicurezza dei browser web.</p></div>');
define('paint','CoreOS Paint','<div class="v6-tools"><label>Colore <input id="v6Color" type="color" value="#4f8cff"></label><label>Spessore <input id="v6Width" type="range" min="1" max="36" value="5"></label><button id="v6Clear">Pulisci</button><button id="v6Export">Esporta PNG</button></div><canvas id="v6Canvas" width="1000" height="620"></canvas>');
define('media','CoreOS Media Player','<div class="v6-media"><input id="v6MediaFiles" type="file" accept="audio/*,video/*" multiple><div id="v6Playlist"></div><video id="v6Player" controls playsinline></video><p class="v6-hint">Riproduzione locale: i file scelti restano sul dispositivo.</p></div>');
define('weather','Meteo CoreOS','<form id="v6WeatherForm" class="v6-tools"><input id="v6City" value="Milano" placeholder="Città"><button>Mostra meteo</button></form><div id="v6WeatherResult">Il meteo corrente richiede una connessione Internet.</div>');
define('files','File Manager','<div class="v6-tools"><label class="v6-upload">＋ Importa file<input id="v6Upload" type="file" multiple></label><button id="v6FilesView">File</button><button id="v6TrashView">Cestino</button></div><div class="v6-file-toolbar"><input id="v6FileSearch" type="search" placeholder="Cerca per nome o tipo…" aria-label="Cerca file"><select id="v6FileSort" aria-label="Ordina file"><option value="newest">Più recenti</option><option value="oldest">Più vecchi</option><option value="name">Nome A–Z</option><option value="size">Dimensione</option></select></div><div class="v6-storage-line"><div id="v6StorageUsage" class="v6-storage-usage">Archivio locale</div><button type="button" id="v6PersistStorage">Proteggi archivio</button></div><div id="v6FilesList" aria-live="polite">Archivio locale CoreOS</div><p class="v6-hint">I file importati sono salvati in IndexedDB di questo browser. Non vengono caricati su un server e non sono automaticamente visibili nella cartella File di iOS.</p>');
const original=window.openApp;

define('tasks','CoreOS Tasks','<section class="v6-tasks"><h3>Attività</h3><form id="v6TaskForm"><input id="v6TaskText" required maxlength="160" placeholder="Nuova attività…"><button>Aggiungi</button></form><div id="v6TaskList"></div></section>');
define('stopwatch','Cronometro CoreOS','<section class="v6-stopwatch"><div id="v6StopwatchDisplay">00:00.00</div><div class="v6-tools"><button id="v6StopwatchStart">Avvia</button><button id="v6StopwatchLap">Giro</button><button id="v6StopwatchReset">Azzera</button></div><ol id="v6StopwatchLaps"></ol></section>');
define('viewer','Visualizzatore immagini','<section class="v6-viewer"><label class="v6-upload">Apri immagini<input id="v6ViewerFiles" type="file" accept="image/*" multiple></label><div id="v6ViewerGallery"></div><img id="v6ViewerImage" alt="Anteprima immagine selezionata"><p id="v6ViewerName" class="v6-hint">Seleziona una o più immagini dal dispositivo.</p></section>');
define('minesweeper','CoreOS Minesweeper','<section class="v6-mines"><div class="v6-tools"><button id="mineNew">Nuova partita</button><span id="mineStatus">Trova le 10 mine</span></div><div id="mineGrid" class="mine-grid"></div></section>');

define('pomodoro','CoreOS Focus','<section class="v6-pomodoro"><p>Sessioni di concentrazione e pause, con timer locale.</p><div class="v6-tools"><label>Focus <select id="focusMinutes"><option value="25">25 min</option><option value="45">45 min</option><option value="50">50 min</option></select></label><label>Pausa <select id="breakMinutes"><option value="5">5 min</option><option value="10">10 min</option><option value="15">15 min</option></select></label></div><div id="focusMode">Concentrazione</div><output id="focusClock">25:00</output><div class="v6-tools"><button id="focusStart">Avvia</button><button id="focusPause">Pausa</button><button id="focusReset">Azzera</button></div><p id="focusStatus" class="v6-hint">Pronto per iniziare.</p></section>');
define('converter','Convertitore CoreOS','<section class="v6-converter"><p>Conversioni rapide di lunghezza, peso, temperatura e dati.</p><label>Categoria <select id="convertCategory"><option value="length">Lunghezza</option><option value="weight">Peso</option><option value="temperature">Temperatura</option><option value="data">Dati digitali</option></select></label><div class="v6-tools"><input id="convertValue" type="number" value="1" step="any" aria-label="Valore"><select id="convertFrom"></select><span>→</span><select id="convertTo"></select></div><output id="convertResult">—</output></section>');
define('passwords','Generatore password','<section class="v6-passwords"><p>Genera password casuali localmente: non vengono inviate in rete né salvate automaticamente.</p><label>Lunghezza <input id="passwordLength" type="range" min="8" max="64" value="20"><output id="passwordLengthValue">20</output></label><div class="v6-tools"><label><input id="passwordUpper" type="checkbox" checked> Maiuscole</label><label><input id="passwordLower" type="checkbox" checked> Minuscole</label><label><input id="passwordNumbers" type="checkbox" checked> Numeri</label><label><input id="passwordSymbols" type="checkbox" checked> Simboli</label></div><output id="passwordResult">Premi Genera password</output><div class="v6-tools"><button id="passwordGenerate">Genera password</button><button id="passwordCopy">Copia</button></div><p id="passwordStatus" class="v6-hint" aria-live="polite"></p></section>');

function initApp(name){
if(name==='browser'){const form=$('#v6BrowserForm'),url=$('#v6BrowserUrl'),frame=$('#v6BrowserFrame'),normal=()=>{let u=url.value.trim();if(!/^https?:\/\//i.test(u))u='https://'+u;url.value=u;frame.src=u};form.onsubmit=e=>{e.preventDefault();normal()};$('#v6BrowserExternal').onclick=()=>{let u=url.value.trim();if(!/^https?:\/\//i.test(u))u='https://'+u;openUrl(u)};normal()}
if(name==='browser'){
 const form=$('#v6BrowserForm'),url=$('#v6BrowserUrl'),frame=$('#v6BrowserFrame'),status=$('#v6BrowserStatus');
 const normalize=()=>{let u=url.value.trim();if(!u)return '';if(!/^https?:\\/\\//i.test(u)){if(u.includes('.')&&!u.includes(' '))u='https://'+u;else u='https://www.google.com/search?q='+encodeURIComponent(u)}try{const x=new URL(u);if(!['http:','https:'].includes(x.protocol))throw Error();return x.href}catch{return ''}};
 const navigate=()=>{if(!navigator.onLine){status.textContent='Sei offline: connettiti a Internet per navigare.';return}const u=normalize();if(!u){status.textContent='Indirizzo non valido.';return}url.value=u;status.textContent='Caricamento: '+u;frame.src=u;};
 form.onsubmit=e=>{e.preventDefault();navigate()};
 $('#v6BrowserHome').onclick=()=>{url.value='https://www.google.com';navigate()};
 $('#v6BrowserReload').onclick=()=>{try{frame.contentWindow.location.reload()}catch{frame.src=frame.src}};
 $('#v6BrowserBack').onclick=()=>{try{frame.contentWindow.history.back()}catch{status.textContent='Cronologia non disponibile per questa pagina.'}};
 $('#v6BrowserExternal').onclick=()=>{const u=normalize();if(u)openUrl(u);else status.textContent='Indirizzo non valido.'};
 frame.onload=()=>{status.textContent='Pagina caricata. Se resta vuota, il sito potrebbe bloccare le finestre incorporate: usa Apri scheda esterna.'};
 frame.onerror=()=>{status.textContent='Impossibile incorporare questa pagina. Prova ad aprirla esternamente.'};
 navigate();
}
if(name==='paint'){const c=$('#v6Canvas'),ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);let drawing=false;const point=e=>{const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*c.width/r.width,y:(e.clientY-r.top)*c.height/r.height}};c.onpointerdown=e=>{drawing=true;c.setPointerCapture(e.pointerId);const p=point(e);ctx.beginPath();ctx.moveTo(p.x,p.y)};c.onpointermove=e=>{if(!drawing)return;const p=point(e);ctx.strokeStyle=$('#v6Color').value;ctx.lineWidth=Number($('#v6Width').value);ctx.lineCap='round';ctx.lineJoin='round';ctx.lineTo(p.x,p.y);ctx.stroke()};c.onpointerup=()=>drawing=false;$('#v6Clear').onclick=()=>{ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height)};$('#v6Export').onclick=()=>{const a=document.createElement('a');a.download='CoreOS-Paint.png';a.href=c.toDataURL('image/png');a.click()}}
if(name==='media'){const input=$('#v6MediaFiles'),list=$('#v6Playlist'),player=$('#v6Player');let urls=[];input.onchange=()=>{urls.forEach(URL.revokeObjectURL);urls=[];list.innerHTML='';[...input.files].forEach((f,i)=>{const u=URL.createObjectURL(f);urls.push(u);const b=document.createElement('button');b.textContent=f.name;b.onclick=()=>{player.src=u;player.load();player.play().catch(()=>{})};list.append(b);if(i===0)player.src=u})}}
if(name==='weather'){$('#v6WeatherForm').onsubmit=async e=>{e.preventDefault();const city=$('#v6City').value.trim(),out=$('#v6WeatherResult');out.textContent='Caricamento…';try{const g=await fetch('https://geocoding-api.open-meteo.com/v1/search?name='+encodeURIComponent(city)+'&count=1&language=it&format=json').then(r=>r.json());if(!g.results?.length)throw Error('Città non trovata');const p=g.results[0],w=await fetch('https://api.open-meteo.com/v1/forecast?latitude='+p.latitude+'&longitude='+p.longitude+'&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m&timezone=auto').then(r=>r.json()),v=w.current;out.innerHTML='<h2>'+esc(p.name)+(p.country?', '+esc(p.country):'')+'</h2><strong class="v6-temp">'+Math.round(v.temperature_2m)+' °C</strong><p>Percepiti '+Math.round(v.apparent_temperature)+' °C · Umidità '+v.relative_humidity_2m+'% · Vento '+v.wind_speed_10m+' km/h</p><small>Aggiornato '+esc(v.time.replace('T',' '))+' · Open-Meteo</small>'}catch(err){out.textContent='Meteo non disponibile: '+err.message}}}
if(name==='files'){renderFiles(false);$('#v6Upload').onchange=async e=>{try{await window.CoreOSFiles.addFiles(e.target.files);e.target.value='';renderFiles(false)}catch(err){alert('Importazione non riuscita: '+err.message)}};$('#v6FilesView').onclick=()=>renderFiles(false);$('#v6TrashView').onclick=()=>renderFiles(true);$('#v6FileSearch').oninput=()=>renderFiles(document.querySelector('#v6FilesList')?.dataset.trash==='true');$('#v6FileSort').onchange=()=>renderFiles(document.querySelector('#v6FilesList')?.dataset.trash==='true');$('#v6PersistStorage').onclick=async()=>{const button=$('#v6PersistStorage');if(!navigator.storage?.persist){button.textContent='Non supportato';return}const granted=await navigator.storage.persist();button.textContent=granted?'Archiviazione protetta':'Richiesta non concessa'}}
if(name==='settings'){
 const root=document.documentElement,store='coreos.user.settings';
 let saved={};try{saved=JSON.parse(localStorage.getItem(store)||'{}')}catch{}let prefs={accent:'#9bbcff',theme:'dark',motion:'on',scale:'100',wallpaper:'aurora',sounds:'off',...saved};
 const apply=()=>{root.style.setProperty('--blue',prefs.accent);root.dataset.coreTheme=prefs.theme;root.style.fontSize=prefs.scale+'%';const actualTheme=prefs.theme==='system'?(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):prefs.theme;root.dataset.coreTheme=actualTheme;document.body.classList.toggle('core-motion-off',prefs.motion==='off');document.body.dataset.wallpaper=prefs.wallpaper;localStorage.setItem(store,JSON.stringify(prefs))};
 const options='<section class="v6-settings"><h3>Aspetto</h3><label>Colore accento <select id="v6Accent"><option value="#9bbcff">Blu</option><option value="#b7a6ef">Viola</option><option value="#8bd5b5">Verde</option><option value="#ffb86b">Ambra</option><option value="#f08aa6">Rosa</option></select></label><label>Tema <select id="v6Theme"><option value="dark">Scuro</option><option value="light">Chiaro</option><option value="system">Automatico</option></select></label><label>Dimensione interfaccia <select id="v6Scale"><option>90</option><option>100</option><option>110</option><option>120</option></select></label><label>Sfondo <select id="v6Wallpaper"><option value="aurora">Aurora</option><option value="midnight">Notte</option><option value="ocean">Oceano</option><option value="plain">Uniforme</option></select></label><label>Animazioni <select id="v6Motion"><option value="on">Attive</option><option value="off">Ridotte</option></select></label><label>Suoni interfaccia <select id="v6Sounds"><option value="off">Disattivati</option><option value="on">Attivati</option></select></label><h3>Dispositivo e dati</h3><p>Le preferenze e i file sono locali a questo browser e dispositivo.</p><button id="v6ExportData">Esporta dati CoreOS</button><label class="v6-upload">Importa backup<input id="v6ImportData" type="file" accept="application/json,.json"></label><button id="v6ClearPrefs">Ripristina preferenze</button></section>';
 const body=$('.window-body');body.insertAdjacentHTML('beforeend',options);
 $('#v6Accent').value=prefs.accent;$('#v6Theme').value=prefs.theme;$('#v6Scale').value=prefs.scale;$('#v6Wallpaper').value=prefs.wallpaper;$('#v6Motion').value=prefs.motion;$('#v6Sounds').value=prefs.sounds;apply();
 [['v6Accent','accent'],['v6Theme','theme'],['v6Scale','scale'],['v6Wallpaper','wallpaper'],['v6Motion','motion'],['v6Sounds','sounds']].forEach(([id,key])=>$('#'+id).onchange=e=>{prefs[key]=e.target.value;apply()});
 const blobToData=blob=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob)});
 $('#v6ExportData').onclick=async()=>{try{const rows=await getFiles(),savedFiles=await Promise.all(rows.map(async x=>({...x,blob:await blobToData(x.blob)})));const payload={version:1,preferences:prefs,appData:state(),files:savedFiles};const blob=new Blob([JSON.stringify(payload)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='coreos-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}catch(err){alert('Esportazione non riuscita: '+err.message)}};
 $('#v6ImportData').onchange=async e=>{try{const x=JSON.parse(await e.target.files[0].text());if(x.version!==1)throw Error('Versione backup non supportata');if(x.preferences){prefs={...prefs,...x.preferences};apply()}if(x.appData)persist(x.appData);if(Array.isArray(x.files)){for(const item of x.files){if(typeof item.blob==='string'&&item.blob.startsWith('data:')){const blob=await fetch(item.blob).then(r=>r.blob());await db('readwrite',s=>s.put({...item,blob}))}}}alert('Backup CoreOS importato, inclusi i file archiviati.')}catch(err){alert('Backup non valido o incompleto: '+err.message)}e.target.value=''};
 $('#v6ClearPrefs').onclick=()=>{if(confirm('Ripristinare le preferenze di CoreOS? I file e i documenti non verranno eliminati.')){localStorage.removeItem(store);location.reload()}};
}
if(name==='tasks'){
 const key='coreos.tasks';let items=[];try{items=JSON.parse(localStorage.getItem(key)||'[]')}catch{}
 const form=$('#v6TaskForm'),input=$('#v6TaskText'),list=$('#v6TaskList');
 const render=()=>{list.innerHTML='';items.forEach(item=>{const row=document.createElement('label');row.className='v6-row';const cb=document.createElement('input');cb.type='checkbox';cb.checked=item.done;cb.onchange=()=>{item.done=cb.checked;save()};const text=document.createElement('span');text.textContent=item.text;if(item.done)text.style.textDecoration='line-through';const del=document.createElement('button');del.textContent='Elimina';del.onclick=()=>{items=items.filter(x=>x.id!==item.id);save()};row.append(cb,text,del);list.append(row)})};
 const save=()=>{localStorage.setItem(key,JSON.stringify(items));render()};form.onsubmit=e=>{e.preventDefault();items.push({id:crypto.randomUUID(),text:input.value.trim(),done:false});input.value='';save()};render();
}
if(name==='stopwatch'){
 let elapsed=0,start=0,timer=null;const display=$('#v6StopwatchDisplay'),laps=$('#v6StopwatchLaps'),fmt=n=>{const cs=Math.floor(n/10)%100,s=Math.floor(n/1000)%60,m=Math.floor(n/60000);return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+'.'+String(cs).padStart(2,'0')};
 const tick=()=>display.textContent=fmt(elapsed+performance.now()-start);
 $('#v6StopwatchStart').onclick=()=>{if(timer){clearInterval(timer);timer=null;elapsed+=performance.now()-start;$('#v6StopwatchStart').textContent='Riprendi'}else{start=performance.now();timer=setInterval(tick,30);$('#v6StopwatchStart').textContent='Pausa'}};
 $('#v6StopwatchLap').onclick=()=>{if(timer){const li=document.createElement('li');li.textContent=fmt(elapsed+performance.now()-start);laps.append(li)}};
 $('#v6StopwatchReset').onclick=()=>{clearInterval(timer);timer=null;elapsed=0;display.textContent='00:00.00';laps.innerHTML='';$('#v6StopwatchStart').textContent='Avvia'};
}
if(name==='viewer'){
 const input=$('#v6ViewerFiles'),gallery=$('#v6ViewerGallery'),image=$('#v6ViewerImage'),name=$('#v6ViewerName');let urls=[];
 input.onchange=()=>{urls.forEach(URL.revokeObjectURL);urls=[];gallery.innerHTML='';[...input.files].forEach(file=>{const u=URL.createObjectURL(file);urls.push(u);const b=document.createElement('button');b.textContent=file.name;b.onclick=()=>{image.src=u;name.textContent=file.name};gallery.append(b)});if(urls[0]){image.src=urls[0];name.textContent=input.files[0].name}};
}

if(name==='pomodoro'){
 let remaining=1500,running=false,interval=null,mode='focus';
 const clock=$('#focusClock'),status=$('#focusStatus'),modeLabel=$('#focusMode'),start=$('#focusStart');
 const fmt=n=>String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
 const draw=()=>{clock.textContent=fmt(remaining);document.title=(running?fmt(remaining)+' · ':'')+'CoreOS'};
 const stop=()=>{clearInterval(interval);interval=null;running=false;start.textContent='Avvia';};
 const setMode=m=>{mode=m;remaining=Number($('#'+(m==='focus'?'focusMinutes':'breakMinutes')).value)*60;modeLabel.textContent=m==='focus'?'Concentrazione':'Pausa';status.textContent=m==='focus'?'Tempo di concentrarsi.':'Tempo per una pausa.';draw()};
 start.onclick=()=>{if(running)return;running=true;start.textContent='In corso';interval=setInterval(()=>{remaining--;draw();if(remaining<=0){stop();status.textContent=mode==='focus'?'Sessione completata! Fai una pausa.':'Pausa terminata: pronto a ripartire.';if(mode==='focus')setMode('break');else setMode('focus') }},1000)};
 $('#focusPause').onclick=()=>{stop();status.textContent='Timer in pausa.'};
 $('#focusReset').onclick=()=>{stop();setMode(mode)};
 $('#focusMinutes').onchange=()=>{if(mode==='focus'){stop();setMode('focus')}};
 $('#breakMinutes').onchange=()=>{if(mode==='break'){stop();setMode('break')}};
 setMode('focus');
}
if(name==='converter'){
 const sets={length:{m:1,km:1000,cm:.01,mm:.001,mi:1609.344,ft:.3048},weight:{kg:1,g:.001,mg:.000001,lb:.45359237,oz:.028349523125},data:{B:1,KB:1000,MB:1e6,GB:1e9,KiB:1024,MiB:1048576,GiB:1073741824}};
 const labels={m:'Metri',km:'Chilometri',cm:'Centimetri',mm:'Millimetri',mi:'Miglia',ft:'Piedi',kg:'Chilogrammi',g:'Grammi',mg:'Milligrammi',lb:'Libbre',oz:'Once',B:'Byte',KB:'KB',MB:'MB',GB:'GB',KiB:'KiB',MiB:'MiB',GiB:'GiB',C:'°C',F:'°F',K:'Kelvin'};
 const cat=$('#convertCategory'),from=$('#convertFrom'),to=$('#convertTo'),value=$('#convertValue'),out=$('#convertResult');
 const populate=()=>{const keys=cat.value==='temperature'?['C','F','K']:Object.keys(sets[cat.value]);from.innerHTML=to.innerHTML='';keys.forEach(k=>{for(const el of [from,to]){const o=document.createElement('option');o.value=k;o.textContent=labels[k];el.append(o)}});if(keys.length>1)to.selectedIndex=1;calculate()};
 const calculate=()=>{const n=Number(value.value);if(!Number.isFinite(n)){out.textContent='Inserisci un valore valido';return}let result;if(cat.value==='temperature'){const c=from.value==='C'?n:from.value==='F'?(n-32)*5/9:n-273.15;result=to.value==='C'?c:to.value==='F'?c*9/5+32:c+273.15}else result=n*sets[cat.value][from.value]/sets[cat.value][to.value];out.textContent=new Intl.NumberFormat('it-IT',{maximumFractionDigits:8}).format(result)+' '+labels[to.value]};
 cat.onchange=populate;[from,to,value].forEach(el=>el.addEventListener('input',calculate));populate();
}
if(name==='passwords'){
 const length=$('#passwordLength'),lengthOut=$('#passwordLengthValue'),result=$('#passwordResult'),status=$('#passwordStatus');
 length.oninput=()=>lengthOut.textContent=length.value;
 $('#passwordGenerate').onclick=()=>{let chars='';if($('#passwordUpper').checked)chars+='ABCDEFGHIJKLMNOPQRSTUVWXYZ';if($('#passwordLower').checked)chars+='abcdefghijklmnopqrstuvwxyz';if($('#passwordNumbers').checked)chars+='0123456789';if($('#passwordSymbols').checked)chars+='!@#$%^&*()-_=+[]{}?';if(!chars){status.textContent='Seleziona almeno un gruppo di caratteri.';return}const bytes=new Uint32Array(Number(length.value));crypto.getRandomValues(bytes);let password='';for(let i=0;i<bytes.length;i++)password+=chars[bytes[i]%chars.length];result.textContent=password;status.textContent='Generata localmente con il generatore crittografico del browser.'};
 $('#passwordCopy').onclick=async()=>{try{await navigator.clipboard.writeText(result.textContent);status.textContent='Password copiata negli appunti.'}catch{status.textContent='Copia non disponibile: seleziona il testo manualmente.'}};
}

if(name==='minesweeper'){
 const grid=$('#mineGrid'),status=$('#mineStatus'),size=9,mines=10;let cells=[],ended=false;
 const start=()=>{ended=false;status.textContent='Trova le 10 mine';cells=Array.from({length:size*size},()=>({mine:false,open:false,flag:false,count:0}));let placed=0;while(placed<mines){const i=Math.floor(Math.random()*cells.length);if(!cells[i].mine){cells[i].mine=true;placed++}}cells.forEach((cell,i)=>{if(cell.mine)return;const x=i%size,y=Math.floor(i/size);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if(nx>=0&&nx<size&&ny>=0&&ny<size&&cells[ny*size+nx].mine)cell.count++}});render()};
 const render=()=>{grid.innerHTML='';cells.forEach((cell,i)=>{const b=document.createElement('button');b.type='button';b.className='mine-cell';b.textContent=cell.flag?'⚑':cell.open?(cell.mine?'✹':cell.count||''):' ';b.disabled=cell.open||ended;b.oncontextmenu=e=>{e.preventDefault();if(!cell.open&&!ended){cell.flag=!cell.flag;render()}};b.onclick=()=>{if(ended||cell.flag)return;if(cell.mine){cell.open=true;ended=true;status.textContent='Partita terminata — hai trovato una mina';cells.forEach(x=>{if(x.mine)x.open=true});render();return}cell.open=true;if(cell.count===0){const queue=[i];while(queue.length){const at=queue.pop(),x=at%size,y=Math.floor(at/size);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy,j=ny*size+nx;if(nx>=0&&nx<size&&ny>=0&&ny<size&&!cells[j].open&&!cells[j].mine){cells[j].open=true;if(cells[j].count===0)queue.push(j)}}}}if(cells.filter(x=>x.open&&!x.mine).length===size*size-mines){ended=true;status.textContent='Complimenti! Hai vinto.'}render()};grid.append(b)})};
 $('#mineNew').onclick=start;start();
}
if(name==='notes'||name==='calendar'){const body=$('.window-body');if(body)body.innerHTML='';if(name==='notes')notesApp();else calendarApp();}
}
async function renderFiles(trash){
 const host=$('#v6FilesList'),search=$('#v6FileSearch'),sort=$('#v6FileSort'),usage=$('#v6StorageUsage');
 if(!host)return;
 try{
  host.dataset.trash=String(trash);
  const all=await getFiles(),query=(search?.value||'').trim().toLocaleLowerCase('it');
  let rows=all.filter(x=>!!x.trash===trash).filter(x=>!query||x.name.toLocaleLowerCase('it').includes(query)||(x.type||'').toLocaleLowerCase('it').includes(query));
  const order=sort?.value||'newest';
  rows.sort((a,b)=>order==='name'?a.name.localeCompare(b.name,'it'):order==='size'?(b.size||0)-(a.size||0):order==='oldest'?(a.created||0)-(b.created||0):(b.created||0)-(a.created||0));
  host.replaceChildren();
  if(usage&&navigator.storage?.estimate){const estimate=await navigator.storage.estimate();const used=estimate.usage||0,quota=estimate.quota||0;usage.textContent='Archivio CoreOS · '+formatBytes(all.filter(x=>!x.trash).reduce((n,x)=>n+(x.size||0),0))+' nei file · '+(quota?formatBytes(used)+' / '+formatBytes(quota)+' browser':'quota non disponibile');}
  if(!rows.length){const empty=document.createElement('div');empty.className='v6-file-empty';empty.textContent=query?'Nessun risultato per questa ricerca.':trash?'Il cestino è vuoto.':'Nessun file ancora. Importa documenti, immagini o altri file per iniziare.';host.append(empty);return;}
  rows.forEach(x=>{
   const row=document.createElement('article');row.className='v6-file-item';
   const icon=document.createElement('span');icon.className='v6-file-icon';icon.textContent=x.type?.startsWith('image/')?'▧':x.type?.startsWith('audio/')?'♫':x.type?.startsWith('video/')?'▶':x.type?.includes('pdf')?'PDF':'▤';
   const meta=document.createElement('div');meta.className='v6-file-meta';
   const title=document.createElement('strong');title.textContent=x.name;
   const detail=document.createElement('small');detail.textContent=[x.type||'File',formatBytes(x.size||0),x.created?new Date(x.created).toLocaleDateString('it-IT'):null].filter(Boolean).join(' · ');
   meta.append(title,detail);row.append(icon,meta);
   const actions=document.createElement('div');actions.className='v6-file-actions';
   const button=(label,fn,kind='')=>{const b=document.createElement('button');b.type='button';b.textContent=label;if(kind)b.className=kind;b.onclick=fn;actions.append(b)};
   if(trash){
    button('Ripristina',async()=>{await window.CoreOSFiles.restore(x.id);renderFiles(true)});
    button('Elimina per sempre',async()=>{if(confirm('Eliminare definitivamente '+x.name+'?')){await window.CoreOSFiles.remove(x.id);renderFiles(true)}},'danger');
   }else{
    button('Apri',()=>{if(x.type?.startsWith('image/')){const u=URL.createObjectURL(x.blob),w=window.open(u,'_blank','noopener');setTimeout(()=>URL.revokeObjectURL(u),60000);}else window.CoreOSFiles.download(x.id)});
    button('Scarica',()=>window.CoreOSFiles.download(x.id));
    button('Rinomina',async()=>{const n=prompt('Nuovo nome del file',x.name);if(n?.trim()){await window.CoreOSFiles.rename(x.id,n);renderFiles(false)}});
    button('Sposta nel cestino',async()=>{await window.CoreOSFiles.trash(x.id);renderFiles(false)});
   }
   row.append(actions);host.append(row);
  });
 }catch(e){host.textContent='Archivio locale non disponibile: '+(e?.message||'errore sconosciuto');}
}
function formatBytes(value){if(!Number.isFinite(value)||value<=0)return '0 B';const units=['B','KB','MB','GB'];const i=Math.min(Math.floor(Math.log(value)/Math.log(1024)),units.length-1);return (value/Math.pow(1024,i)).toFixed(i?1:0)+' '+units[i]}
function notesApp(){const host=$('.window-body'),d=state();host.insertAdjacentHTML('beforeend','<section class="v6-notes"><div class="v6-tools"><button id="v6NewNote">＋ Nuovo</button><select id="v6NoteSelect"></select><button id="v6DeleteNote">Elimina</button></div><input id="v6NoteTitle" placeholder="Titolo"><textarea id="v6NoteText" placeholder="Scrivi qui…"></textarea><small>Salvataggio automatico locale</small></section>');if(!d.notes.length)d.notes=[{id:crypto.randomUUID(),title:'Documento 1',text:''}];let active=d.notes[0].id;const select=$('#v6NoteSelect'),title=$('#v6NoteTitle'),area=$('#v6NoteText');const saveCurrent=()=>{const n=d.notes.find(x=>x.id===active);if(n){n.title=title.value;n.text=area.value;persist(d)}};const refresh=()=>{select.innerHTML='';d.notes.forEach(n=>{const o=document.createElement('option');o.value=n.id;o.textContent=n.title;select.append(o)});select.value=active;const n=d.notes.find(x=>x.id===active);title.value=n?.title||'';area.value=n?.text||''};persist(d);refresh();select.onchange=()=>{saveCurrent();active=select.value;refresh()};title.oninput=area.oninput=saveCurrent;$('#v6NewNote').onclick=()=>{saveCurrent();const n={id:crypto.randomUUID(),title:'Nuovo documento',text:''};d.notes.push(n);active=n.id;persist(d);refresh()};$('#v6DeleteNote').onclick=()=>{if(confirm('Eliminare il documento?')){d.notes=d.notes.filter(n=>n.id!==active);if(!d.notes.length)d.notes.push({id:crypto.randomUUID(),title:'Documento 1',text:''});active=d.notes[0].id;persist(d);refresh()}}}
function calendarApp(){const host=$('.window-body'),d=state();host.insertAdjacentHTML('beforeend','<section class="v6-events"><h3>Eventi e promemoria locali</h3><form id="v6EventForm"><input id="v6EventName" required placeholder="Nome evento"><input id="v6EventDate" type="datetime-local" required><button>Aggiungi</button></form><div id="v6EventList"></div></section>');const list=$('#v6EventList');const render=()=>{list.innerHTML='';d.events.sort((a,b)=>a.date.localeCompare(b.date)).forEach(x=>{const row=document.createElement('div');row.className='v6-row';row.textContent=x.name+' — '+new Date(x.date).toLocaleString('it-IT');const b=document.createElement('button');b.textContent='Rimuovi';b.onclick=()=>{d.events=d.events.filter(y=>y.id!==x.id);persist(d);render()};row.append(b);list.append(row)})};$('#v6EventForm').onsubmit=e=>{e.preventDefault();d.events.push({id:crypto.randomUUID(),name:$('#v6EventName').value,date:$('#v6EventDate').value});persist(d);e.target.reset();render()};render()}

const APP_PREFS_KEY='coreos.app.preferences.v1';
const APP_PREF_DEFAULTS={theme:'system',accent:'#6f9cff',fontSize:'100',spacing:'comfortable',corners:'rounded',motion:'on',contrast:'normal',textWrap:'on',toolbar:'normal',content:'normal'};
const APP_PREF_ACCENTS=['#6f9cff','#a78bfa','#34c99a','#f5a65b','#f078a6','#35c6d4'];
function addAppPreferences(name){
 const body=$('.window-body');if(!body||body.querySelector('.v6-app-preferences'))return;
 let all={};try{all=JSON.parse(localStorage.getItem(APP_PREFS_KEY)||'{}')}catch{}
 const prefs={...APP_PREF_DEFAULTS,...(all[name]||{})};
 const choices=(id,label,values)=>'<label class="v6-pref-row"><span>'+label+'</span><select data-pref="'+id+'">'+values.map(([v,t])=>'<option value="'+v+'">'+t+'</option>').join('')+'</select></label>';
 const toggle=(id,label)=>'<label class="v6-pref-row"><span>'+label+'</span><input type="checkbox" data-pref="'+id+'"></label>';
 const panel=document.createElement('details');panel.className='v6-app-preferences';
 panel.innerHTML='<summary>⚙ Preferenze di '+esc(apps[name]?.title||name)+'</summary><div class="v6-pref-grid">'+
 choices('theme','Tema',[['system','Come CoreOS'],['dark','Scuro'],['light','Chiaro']])+
 '<label class="v6-pref-row"><span>Colore accento</span><select data-pref="accent">'+APP_PREF_ACCENTS.map((v,i)=>'<option value="'+v+'">'+['Blu','Viola','Verde','Ambra','Rosa','Ciano'][i]+'</option>').join('')+'</select></label>'+
 choices('fontSize','Dimensione testo',[['90','Piccola'],['100','Normale'],['110','Grande'],['120','Molto grande']])+
 choices('spacing','Spaziatura',[['compact','Compatta'],['comfortable','Confortevole'],['wide','Ampia']])+
 choices('corners','Angoli',[['square','Netti'],['rounded','Arrotondati'],['soft','Molto arrotondati']])+
 toggle('motion','Animazioni attive')+toggle('contrast','Contrasto elevato')+toggle('textWrap','Testo a capo')+
 choices('toolbar','Barra strumenti',[['compact','Compatta'],['normal','Normale'],['large','Ampia']])+
 choices('content','Densità contenuti',[['compact','Compatta'],['normal','Normale'],['relaxed','Aria']])+
 '<div class="v6-pref-actions"><button type="button" data-pref-reset>Ripristina predefiniti</button><span>Salvataggio automatico</span></div></div>';
 body.append(panel);
 const win=body.closest('.app-window')||body;
 const apply=()=>{
  win.dataset.appTheme=prefs.theme;win.style.setProperty('--v6-app-accent',prefs.accent);
  win.style.setProperty('--v6-app-font',prefs.fontSize+'%');
  win.dataset.appSpacing=prefs.spacing;win.dataset.appCorners=prefs.corners;
  win.dataset.appMotion=prefs.motion;win.dataset.appContrast=prefs.contrast;
  win.dataset.appWrap=prefs.textWrap;win.dataset.appToolbar=prefs.toolbar;win.dataset.appContent=prefs.content;
  panel.querySelectorAll('[data-pref]').forEach(el=>{const k=el.dataset.pref;if(el.type==='checkbox')el.checked=prefs[k]==='on';else el.value=prefs[k]});
  all[name]={...prefs};try{localStorage.setItem(APP_PREFS_KEY,JSON.stringify(all))}catch{}
 };
 panel.querySelectorAll('[data-pref]').forEach(el=>el.addEventListener('change',()=>{prefs[el.dataset.pref]=el.type==='checkbox'?(el.checked?'on':'off'):el.value;apply()}));
 panel.querySelector('[data-pref-reset]').onclick=()=>{Object.assign(prefs,APP_PREF_DEFAULTS);apply()};
 apply();
}

window.openApp=function(name){original(name);initApp(name);addAppPreferences(name)};



const fileStorageLineStyle=document.createElement('style');fileStorageLineStyle.textContent='.v6-storage-line{display:flex;align-items:center;justify-content:space-between;gap:8px}.v6-storage-line button{font-size:10px;padding:7px 9px;border:1px solid var(--line);border-radius:9px;background:var(--panel2);color:var(--text)}';document.head.append(fileStorageLineStyle);
const fileManagerStyle=document.createElement('style');fileManagerStyle.textContent=`
.v6-file-toolbar{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:9px;margin:12px 0}
.v6-file-toolbar input,.v6-file-toolbar select{min-width:0;width:100%;padding:11px 12px;border:1px solid var(--line);border-radius:11px;background:var(--panel2);color:var(--text)}
.v6-storage-usage{font-size:11px;color:var(--muted);padding:8px 2px}
.v6-file-item{display:flex;align-items:center;gap:12px;padding:12px;margin:8px 0;border:1px solid var(--line);border-radius:13px;background:var(--panel2);min-width:0}
.v6-file-icon{display:grid;place-items:center;flex:0 0 38px;height:38px;border-radius:11px;background:var(--panel);font-weight:700;font-size:15px}
.v6-file-meta{display:grid;gap:4px;min-width:0;flex:1}
.v6-file-meta strong{font-size:13px;overflow-wrap:anywhere}
.v6-file-meta small{font-size:10px;color:var(--muted);overflow-wrap:anywhere}
.v6-file-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:5px}
.v6-file-actions button{font-size:10px;padding:7px 9px;border:1px solid var(--line);border-radius:9px;background:var(--panel);color:var(--text)}
.v6-file-actions .danger{color:#f08a8a}
.v6-file-empty{padding:24px 12px;text-align:center;color:var(--muted);border:1px dashed var(--line);border-radius:13px}
@media(max-width:560px){.v6-file-item{align-items:flex-start;flex-wrap:wrap}.v6-file-actions{width:100%;justify-content:flex-start}.v6-file-actions button{flex:1 1 auto}.v6-file-toolbar{grid-template-columns:1fr}}
`;document.head.append(fileManagerStyle);

const prefStyle=document.createElement('style');prefStyle.textContent=`
.v6-app-preferences{margin:18px 0 4px;padding:12px;border:1px solid var(--line);border-radius:14px;background:var(--panel);color:var(--text);font:inherit}
.v6-app-preferences summary{cursor:pointer;font-weight:650;padding:4px 2px}
.v6-pref-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px;padding-top:12px}
.v6-pref-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px;border:1px solid var(--line);border-radius:10px;background:var(--panel2);font-size:12px}
.v6-pref-row select{max-width:135px;min-width:105px;padding:7px;border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--text)}
.v6-pref-row input[type=checkbox]{width:19px;height:19px;accent-color:var(--v6-app-accent)}
.v6-pref-actions{display:flex;align-items:center;justify-content:space-between;gap:10px;grid-column:1/-1;font-size:11px;color:var(--muted)}
.v6-pref-actions button{padding:8px 12px;border:1px solid var(--line);border-radius:8px;background:var(--panel2);color:var(--text)}
.app-window[data-app-theme=dark] .window-body{background:#111827!important;color:#edf2fa!important}
.app-window[data-app-theme=light] .window-body{background:#f7f9fc!important;color:#172033!important}
.app-window .window-body{font-size:var(--v6-app-font,100%)}
.app-window[data-app-spacing=compact] .window-body{--v6-pref-gap:5px;padding:8px!important}
.app-window[data-app-spacing=wide] .window-body{--v6-pref-gap:18px;padding:22px!important}
.app-window[data-app-corners=square] .window-body button,.app-window[data-app-corners=square] .window-body input,.app-window[data-app-corners=square] .window-body textarea{border-radius:2px!important}
.app-window[data-app-corners=soft] .window-body button,.app-window[data-app-corners=soft] .window-body input,.app-window[data-app-corners=soft] .window-body textarea{border-radius:18px!important}
.app-window[data-app-motion=off] .window-body *{animation:none!important;transition:none!important}
.app-window[data-app-contrast=on] .window-body{filter:contrast(1.22)}
.app-window[data-app-wrap=off] .window-body{overflow-wrap:normal;white-space:normal}
.app-window[data-app-toolbar=compact] .window-body .v6-tools{gap:4px;margin:5px 0}
 .app-window[data-app-toolbar=large] .window-body .v6-tools button{padding:12px 16px;font-size:1.05em}\n.app-window[data-app-content=compact] .window-body .v6-row{padding:4px 0}\n.app-window[data-app-content=relaxed] .window-body .v6-row{padding:16px 0}\n.app-window[data-app-content=compact] .window-body .v6-tools{gap:4px;margin:5px 0}\n.app-window[data-app-content=relaxed] .window-body .v6-tools{gap:14px;margin:16px 0}
`;document.head.append(prefStyle);

const style=document.createElement('style');style.textContent='.mine-grid{display:grid;grid-template-columns:repeat(9,minmax(26px,1fr));gap:3px;max-width:420px;margin:14px auto}.mine-cell{aspect-ratio:1;border:2px outset #fff!important;background:#c0c0c0!important;color:#111!important;font-weight:bold}.mine-cell:disabled{border:1px solid #888!important;background:#ddd!important}.v6-mines{max-width:520px;margin:auto}'+'.v6-browser iframe{width:100%;height:48vh;border:1px solid var(--line);border-radius:12px;background:#fff}.v6-tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:10px 0}.v6-tools input:not([type=range]):not([type=color]){flex:1;min-width:100px;padding:10px;border:1px solid var(--line);border-radius:9px;background:var(--panel);color:var(--text)}.v6-tools button,.v6-row button,.v6-upload{padding:9px 12px;border:1px solid var(--line);border-radius:9px;background:var(--panel2);color:var(--text)}.v6-upload{cursor:pointer}.v6-upload input{display:none}.v6-hint{font-size:11px;color:var(--muted)}#v6Canvas{width:100%;height:auto;background:#fff;border:1px solid var(--line);border-radius:10px;touch-action:none}.v6-media video{width:100%;max-height:48vh;background:#000}.v6-media button{margin:4px;padding:8px}.v6-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:10px 0;border-bottom:1px solid var(--line)}.v6-row span{flex:1;overflow-wrap:anywhere}.v6-notes input,.v6-notes textarea{width:100%;margin:6px 0;padding:11px;border:1px solid var(--line);border-radius:9px;background:var(--panel);color:var(--text)}.v6-notes textarea{min-height:35vh;resize:vertical}.v6-events form{display:flex;gap:8px;flex-wrap:wrap}.v6-events form input{min-width:0;flex:1;padding:9px;border:1px solid var(--line);border-radius:9px;background:var(--panel);color:var(--text)}.v6-temp{font-size:42px}.core-device-panel.visible{display:block}'+ "\n.v6-browser iframe{display:block;width:100%;height:52vh;min-height:280px;border:1px solid var(--line);border-radius:12px;background:#fff}.v6-browser-status{font-size:12px;color:var(--muted);padding:8px 0}.v6-settings{display:grid;gap:12px}.v6-settings label{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--line);font-size:13px}.v6-settings select,.v6-settings button{padding:9px 12px;border:1px solid var(--line);border-radius:9px;background:var(--panel2);color:var(--text)}.v6-tasks form{display:flex;gap:8px}.v6-tasks form input{flex:1;min-width:0;padding:10px;border:1px solid var(--line);border-radius:9px;background:var(--panel);color:var(--text)}.v6-stopwatch{text-align:center;padding:20px}.v6-stopwatch>div:first-child{font:700 clamp(34px,8vw,58px) ui-monospace,monospace;padding:24px}.v6-viewer img{display:block;max-width:100%;max-height:55vh;object-fit:contain;margin:16px auto}.v6-viewer button{margin:4px;padding:8px;border:1px solid var(--line);border-radius:8px;background:var(--panel2);color:var(--text)}.core-motion-off *{animation:none!important;transition:none!important;scroll-behavior:auto!important}body[data-wallpaper=midnight]{background-image:radial-gradient(ellipse at 50% 0%,#1b3155,transparent 55%)}body[data-wallpaper=ocean]{background-image:radial-gradient(ellipse at 15% 20%,#12485b,transparent 50%)}body[data-wallpaper=plain]{background-image:none}\n";
document.head.append(style);
})();
