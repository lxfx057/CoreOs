const layer=document.getElementById('windowLayer');
const clock=document.getElementById('clock'),bigClock=document.getElementById('bigClock');
function updateTime(){
  const d=new Date();
  const t=d.toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});
  if(clock)clock.textContent=t;
  if(bigClock)bigClock.textContent=t;
  const topDate=document.getElementById('topDate');
  const fullDate=document.getElementById('fullDate');
  const timeDate=document.getElementById('timeDate');
  if(topDate)topDate.textContent=d.toLocaleDateString('it-IT',{weekday:'short',day:'numeric',month:'short'});
  if(fullDate)fullDate.textContent=d.toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  if(timeDate)timeDate.textContent=d.toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long'});
}
updateTime();setInterval(updateTime,1000);
function updateConnection(){
  const connection=document.getElementById('connection');
  if(connection)connection.textContent=navigator.onLine?'Connesso':'Offline';
}
updateConnection();
window.addEventListener('online',updateConnection);
window.addEventListener('offline',updateConnection);
const apps={
apps:{title:'Applicazioni',html:`<h3>Le tue applicazioni</h3><p>Apri uno strumento del tuo ambiente CoreOS.</p><div class="app-grid"><button data-open="files"><span>▤</span>File</button><button data-open="terminal"><span>›_</span>Terminale</button><button data-open="monitor"><span>◫</span>Monitor</button><button data-open="settings"><span>⚙</span>Impostazioni</button><button data-open="about"><span>ⓘ</span>Informazioni</button></div>`},
files:{title:'File manager',html:`<h3>I miei file</h3><p>Questa è una struttura dimostrativa locale: non legge i file privati del telefono.</p><div class="file-list"><div class="file-item"><span>📁</span><div><b>Documenti</b><small>Cartella · 3 elementi demo</small></div></div><div class="file-item"><span>🖼️</span><div><b>Immagini</b><small>Cartella · 8 elementi demo</small></div></div><div class="file-item"><span>⬇️</span><div><b>Download</b><small>Cartella · 2 elementi demo</small></div></div><div class="file-item"><span>📄</span><div><b>Benvenuto.txt</b><small>File di testo · 1 KB</small></div></div></div>`},
terminal:{title:'Terminale',html:`<h3>Core Terminal</h3><p>Console dimostrativa. I comandi sono simulati e non eseguono operazioni sul dispositivo.</p><div class="terminal"><div class="terminal-output" id="termOut">CoreOS Pro Terminal [versione demo 1.0]\nScrivi <b>help</b> per vedere i comandi disponibili.\n\n</div><form class="terminal-form" id="termForm"><input id="termInput" autocomplete="off" placeholder="Scrivi un comando…" aria-label="Comando"><button type="submit">Invio</button></form></div>`},
monitor:{title:'Monitor di sistema',html:`<h3>Panoramica sistema</h3><p>Informazioni che il browser può mostrare. Non sono disponibili metriche hardware complete.</p><div class="file-list"><div class="file-item"><span>🌐</span><div><b>Browser</b><small id="browserInfo"></small></div></div><div class="file-item"><span>📱</span><div><b>Dispositivo</b><small id="deviceInfo"></small></div></div><div class="file-item"><span>📡</span><div><b>Rete</b><small>${navigator.onLine?'Connessa':'Offline'}</small></div></div><div class="file-item"><span>⚙</span><div><b>Ambiente</b><small>CoreOS Pro · Web/PWA</small></div></div></div>`},
settings:{title:'Impostazioni',html:`<h3>Personalizza CoreOS</h3><p>Le preferenze vengono salvate in questo browser.</p><div class="setting-row"><span>Colore accento</span><select id="accentSelect"><option value="#9bbcff">Blu ghiaccio</option><option value="#b7a6ef">Viola soft</option><option value="#9ed5c4">Verde salvia</option></select></div><div class="setting-row"><span>Effetti animati</span><select id="motionSelect"><option value="on">Attivi</option><option value="off">Ridotti</option></select></div><div class="setting-row"><span>Versione</span><b>1.0.0 · Preview</b></div>`},
notes:{title:'Blocco note',html:`<h3>Blocco note</h3><p>Appunti salvati automaticamente su questo dispositivo e in questo browser.</p><div class="notes-toolbar"><span class="notes-status" id="notesStatus">Salvataggio locale attivo</span><button class="secondary-button" id="clearNotes" type="button">Svuota</button></div><textarea class="notes-editor" id="notesEditor" placeholder="Scrivi qui i tuoi appunti…"></textarea>`},
calculator:{title:'Calcolatrice',html:`<h3>Calcolatrice</h3><p>Calcoli rapidi direttamente in CoreOS.</p><div class="calc"><input class="calc-display" id="calcDisplay" value="0" readonly aria-label="Risultato"><div class="calc-keys">${['C','⌫','÷','×','7','8','9','−','4','5','6','+','1','2','3','=','0','.','%'].map(k=>`<button type="button" data-calc="${k}" class="${['÷','×','−','+','%'].includes(k)?'operator':''} ${k==='='?'equals':''}">${k}</button>`).join('')}</div></div>`},
calendar:{title:'Calendario',html:`<h3>Calendario</h3><p>Calendario locale. La data di oggi è evidenziata.</p><div class="calendar-head"><b id="calendarMonth"></b><span class="muted" id="calendarYear"></span></div><div class="calendar-grid" id="calendarGrid"></div>`},
about:{title:'Informazioni',html:`<h3>CoreOS Pro</h3><p>Un ambiente desktop web sperimentale, progettato per essere utilizzato su smartphone, tablet e computer.</p><div class="file-item"><span>✦</span><div><b>Non è un vero sistema operativo</b><small>Non sostituisce iOS o Android e non ha accesso privilegiato al dispositivo.</small></div></div><p>Progetto iniziale · Versione 1.0.0</p>`}
};
function openApp(name){const app=apps[name];if(!app)return;layer.classList.add('has-window');layer.innerHTML=`<section class="app-window" role="dialog" aria-modal="true" aria-label="${app.title}"><header class="window-head"><span class="window-title">${app.title}</span><button class="window-close" id="closeWindow" aria-label="Chiudi">×</button></header><div class="window-body">${app.html}</div></section>`;document.getElementById('closeWindow').onclick=closeApp;layer.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>openApp(b.dataset.open)));if(name==='terminal')setupTerminal();if(name==='monitor'){document.getElementById('browserInfo').textContent=navigator.userAgent.slice(0,95);document.getElementById('deviceInfo').textContent=`Schermo ${screen.width} × ${screen.height}`;}if(name==='settings')setupSettings();if(name==='notes')setupNotes();if(name==='calculator')setupCalculator();if(name==='calendar')setupCalendar();makeWindowDraggable(layer.querySelector('.app-window'));}
function closeApp(){layer.classList.remove('has-window');layer.innerHTML='';}
document.addEventListener('click',e=>{const b=e.target.closest('[data-open]');if(b)openApp(b.dataset.open);});
document.getElementById('homeBtn').onclick=closeApp;document.getElementById('quickSettings').onclick=()=>openApp('settings');
function setupTerminal(){const form=document.getElementById('termForm'),input=document.getElementById('termInput'),out=document.getElementById('termOut');form.onsubmit=e=>{e.preventDefault();const cmd=input.value.trim().toLowerCase();if(!cmd)return;let result='';const commands={help:'Comandi disponibili: help, clear, date, whoami, ls, neofetch, about',date:new Date().toString(),whoami:'guest@coreos-pro',ls:'Documenti/  Immagini/  Download/  Benvenuto.txt',neofetch:'COREOS PRO\\nAmbiente: browser web\\nVersione: 1.0.0 demo',about:'CoreOS Pro è una simulazione web, non un sistema operativo reale.'};if(cmd==='clear'){out.textContent='';input.value='';return;}result=commands[cmd]??'Comando non riconosciuto. Scrivi help.';out.textContent+=`guest@coreos:~$ ${cmd}\\n${result}\\n\\n`;out.scrollTop=out.scrollHeight;input.value='';};}
function setupSettings(){const a=document.getElementById('accentSelect'),m=document.getElementById('motionSelect');a.value=localStorage.getItem('coreos-accent')||'#9bbcff';m.value=localStorage.getItem('coreos-motion')||'on';a.onchange=()=>{document.documentElement.style.setProperty('--blue',a.value);localStorage.setItem('coreos-accent',a.value);toast('Colore aggiornato');};m.onchange=()=>{document.documentElement.style.setProperty('--motion',m.value==='off'?'0':'1');localStorage.setItem('coreos-motion',m.value);toast('Preferenza salvata');};}
const saved=localStorage.getItem('coreos-accent');if(saved)document.documentElement.style.setProperty('--blue',saved);
function toast(msg){const el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1800);}
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));


function setupNotes(){
 const area=document.getElementById('notesEditor'),status=document.getElementById('notesStatus'),clear=document.getElementById('clearNotes');
 area.value=localStorage.getItem('coreos-notes')||'';
 area.addEventListener('input',()=>{localStorage.setItem('coreos-notes',area.value);status.textContent='Salvato su questo dispositivo';});
 clear.onclick=()=>{if(confirm('Vuoi cancellare tutti gli appunti?')){area.value='';localStorage.removeItem('coreos-notes');status.textContent='Appunti cancellati';}};
}
function setupCalculator(){
 const display=document.getElementById('calcDisplay');let expr='';
 document.querySelectorAll('[data-calc]').forEach(btn=>btn.onclick=()=>{
  const k=btn.dataset.calc;
  if(k==='C'){expr='';display.value='0';return;}
  if(k==='⌫'){expr=expr.slice(0,-1);display.value=expr||'0';return;}
  if(k==='='){
   try{
    const safe=expr.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/(\d+(?:\.\d+)?)%/g,'($1/100)');
    if(!/^[0-9+\-*/().\s]+$/.test(safe))throw Error();
    const result=Function('"use strict";return ('+safe+')')();
    if(!Number.isFinite(result))throw Error();
    expr=String(Number(result.toFixed(8)));display.value=expr;
   }catch{display.value='Errore';expr='';}
   return;
  }
  expr+=k;display.value=expr;
 });
}
function setupCalendar(){
 const now=new Date(),year=now.getFullYear(),month=now.getMonth();
 document.getElementById('calendarMonth').textContent=now.toLocaleDateString('it-IT',{month:'long'});
 document.getElementById('calendarYear').textContent=year;
 const grid=document.getElementById('calendarGrid'),names=['Lun','Mar','Mer','Gio','Ven','Sab','Dom'];
 names.forEach(n=>{const e=document.createElement('span');e.className='day-name';e.textContent=n;grid.appendChild(e);});
 const first=(new Date(year,month,1).getDay()+6)%7,days=new Date(year,month+1,0).getDate();
 for(let i=0;i<first;i++){const e=document.createElement('span');e.style.visibility='hidden';grid.appendChild(e);}
 for(let d=1;d<=days;d++){const e=document.createElement('span');e.textContent=d;if(d===now.getDate())e.className='today';grid.appendChild(e);}
}
function makeWindowDraggable(win){
 if(!win||matchMedia('(max-width:700px)').matches)return;
 const head=win.querySelector('.window-head');if(!head)return;
 let sx=0,sy=0,left=0,top=0,drag=false;
 head.addEventListener('pointerdown',e=>{
  if(e.target.closest('button'))return;drag=true;head.setPointerCapture(e.pointerId);
  const r=win.getBoundingClientRect();sx=e.clientX;sy=e.clientY;left=r.left;top=r.top;
  win.style.left=left+'px';win.style.top=top+'px';win.style.transform='none';
 });
 head.addEventListener('pointermove',e=>{if(!drag)return;win.style.left=Math.max(0,Math.min(innerWidth-win.offsetWidth,left+e.clientX-sx))+'px';win.style.top=Math.max(0,Math.min(innerHeight-80,top+e.clientY-sy))+'px';});
 head.addEventListener('pointerup',()=>drag=false);
}
const cursor=document.getElementById('customCursor');
if(cursor&&matchMedia('(hover:hover) and (pointer:fine)').matches){
 document.addEventListener('pointermove',e=>{cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';});
 document.addEventListener('pointerdown',()=>cursor.classList.add('pressed'));
 document.addEventListener('pointerup',()=>cursor.classList.remove('pressed'));
}


/* ===== CoreOS Builder layer (v3) ===== */
(() => {
  const gate = document.getElementById('accountGate');
  const shutdown = document.getElementById('shutdownScreen');
  const PROFILE_KEY = 'coreos.profile.v1';
  const CONFIG_KEY = 'coreos.config.v1';
  const SESSION_KEY = 'coreos.session.v1';
  const defaults = {
    accent:'#9bbcff', theme:'dark', wallpaper:'gradient', font:'system', scale:'100',
    dock:'bottom', dockSize:'medium', dockLabels:'off', blur:'on', animations:'on',
    clock:'24', showDate:'on', statusBar:'on', startMenu:'grid', corners:'rounded',
    shadows:'medium', sounds:'off', language:'it', desktopIcons:'on', iconSize:'medium',
    windowStyle:'modern', transparency:'off', snap:'on', multitasking:'on',
    touchGestures:'on', doubleTap:'on', notifications:'on', privacy:'standard',
    bootAnimation:'on', lockScreen:'on', homePage:'dashboard', searchEngine:'google',
    browserHome:'https://www.google.com', notesAutosave:'on', fileView:'grid',
    terminalTheme:'dark', calendarStart:'monday', reducedMotion:'off'
  };
  const optionGroups = [
    ['Aspetto',[
      ['theme','Tema',['dark|Scuro','light|Chiaro','auto|Automatico']],
      ['accent','Colore principale',['#9bbcff|Blu ghiaccio','#b7a6ef|Viola','#9ed5c4|Verde salvia','#f0b58d|Ambra','#e88da5|Rosa','#e7d98b|Oro']],
      ['wallpaper','Sfondo',['gradient|Gradiente CoreOS','midnight|Notte','slate|Grafite','ocean|Oceano','forest|Foresta']],
      ['font','Carattere',['system|Sistema','rounded|Morbido','mono|Monospace']],
      ['scale','Dimensione interfaccia',['90|90%','100|100%','110|110%','120|120%']],
      ['corners','Angoli finestre',['rounded|Arrotondati','square|Squadrati']],
      ['shadows','Ombre',['none|Nessuna','soft|Leggere','medium|Medie']],
      ['transparency','Trasparenze',['off|Disattivate','on|Attivate']]
    ]],
    ['Desktop e barra',[
      ['dock','Posizione dock',['bottom|In basso','left|A sinistra','right|A destra']],
      ['dockSize','Dimensione dock',['small|Piccola','medium|Media','large|Grande']],
      ['dockLabels','Etichette dock',['off|Nascoste','on|Visibili']],
      ['desktopIcons','Icone desktop',['on|Visibili','off|Nascoste']],
      ['iconSize','Dimensione icone',['small|Piccole','medium|Medie','large|Grandi']],
      ['statusBar','Barra superiore',['on|Visibile','off|Nascosta']],
      ['showDate','Mostra data',['on|Sì','off|No']],
      ['clock','Formato orologio',['24|24 ore','12|12 ore']],
      ['startMenu','Menu Start',['grid|Griglia app','list|Elenco app']]
    ]],
    ['Finestre e interazione',[
      ['windowStyle','Stile finestre',['modern|Moderno','classic|Classico','minimal|Minimale']],
      ['snap','Aggancio finestre',['on|Attivo','off|Disattivo']],
      ['multitasking','Più finestre',['on|Attivo','off|Disattivo']],
      ['touchGestures','Gesti touch',['on|Attivi','off|Disattivi']],
      ['doubleTap','Doppio tocco per aprire',['on|Attivo','off|Disattivo']],
      ['animations','Animazioni',['on|Attive','off|Disattive']],
      ['blur','Effetto vetro',['on|Attivo','off|Disattivo']],
      ['reducedMotion','Movimento ridotto',['off|No','on|Sì']]
    ]],
    ['Sistema e privacy',[
      ['privacy','Privacy',['standard|Standard','strict|Rafforzata']],
      ['lockScreen','Schermata di blocco',['on|Attiva','off|Disattiva']],
      ['notifications','Notifiche',['on|Attive','off|Disattive']],
      ['sounds','Suoni interfaccia',['off|Disattivati','on|Attivati']],
      ['bootAnimation','Animazione avvio',['on|Attiva','off|Disattiva']],
      ['language','Lingua',['it|Italiano','en|English','es|Español','fr|Français']],
      ['calendarStart','Inizio settimana',['monday|Lunedì','sunday|Domenica']]
    ]],
    ['App e strumenti',[
      ['homePage','Schermata iniziale',['dashboard|Dashboard','desktop|Desktop pulito']],
      ['searchEngine','Motore di ricerca',['google|Google','duckduckgo|DuckDuckGo','bing|Bing']],
      ['browserHome','Pagina browser',['https://www.google.com|Google','https://duckduckgo.com|DuckDuckGo','https://www.bing.com|Bing']],
      ['notesAutosave','Salvataggio note',['on|Automatico','off|Manuale']],
      ['fileView','Vista file',['grid|Griglia','list|Elenco']],
      ['terminalTheme','Tema terminale',['dark|Scuro','light|Chiaro']],
      ['dockLabels','Etichette applicazioni',['off|Nascondi','on|Mostra']]
    ]]
  ];
  // 40 impostazioni distinte, mantenendo dockLabels una sola volta nel pannello.
  const allOptions = [];
  const seen = new Set();
  optionGroups.forEach(([group, items]) => items.forEach(item => {
    if (!seen.has(item[0])) { seen.add(item[0]); allOptions.push({...item, group}); }
  }));
  // Due preferenze aggiuntive completano il set a 40.
  allOptions.push({0:'autoLock',1:'Blocco automatico',2:['off|Mai','5|Dopo 5 minuti','15|Dopo 15 minuti'],group:'Sistema e privacy'});
  allOptions.push({0:'startupApp',1:'App all’avvio',2:['none|Nessuna','notes|Blocco note','calendar|Calendario','files|File manager'],group:'App e strumenti'});
  defaults.autoLock='off'; defaults.startupApp='none';

  const readConfig = () => { try { return {...defaults,...JSON.parse(localStorage.getItem(CONFIG_KEY)||'{}')}; } catch { return {...defaults}; } };
  let config = readConfig();
  const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const optionMarkup = item => {
    const key = item[0], label = item[1], values = item[2];
    return `<div class="option-row"><label for="opt-${key}">${escapeHtml(label)}</label><select id="opt-${key}" data-config="${key}">${values.map(v=>{const [value,name]=v.split('|');return `<option value="${escapeHtml(value)}">${escapeHtml(name)}</option>`}).join('')}</select></div>`;
  };
  function showWelcome(){
    gate.style.display='grid';
    gate.innerHTML=`<section class="gate-card">
      <div class="gate-brand"><div class="gate-mark">C</div><div><strong>COREOS</strong><small>BUILD YOUR OWN OS</small></div></div>
      <div class="gate-eyebrow">IL TUO SISTEMA. LE TUE REGOLE.</div>
      <h1>Benvenuto in CoreOS<span style="color:#9bbcff">.</span></h1>
      <p class="gate-copy">Crea il tuo ambiente personale scegliendo colori, desktop, finestre, barra di stato e applicazioni. Puoi modificare le preferenze anche dopo la creazione.</p>
      <div class="gate-note">Ogni configurazione è indipendente su questo dispositivo. La sincronizzazione tra dispositivi e gli account online richiederanno il collegamento a un database e a un servizio di autenticazione.</div>
      <div class="gate-actions"><button class="gate-btn primary" id="createStart">Crea il mio CoreOS</button><button class="gate-btn ghost" id="loginStart">Accedi a un CoreOS esistente</button><button class="gate-btn ghost" id="importStart">Importa una clonazione</button></div>
    </section>`;
    document.getElementById('createStart').onclick=()=>showCreate();
    document.getElementById('loginStart').onclick=()=>showLogin();
    document.getElementById('importStart').onclick=importClone;
  }
  function showCreate(){
    gate.innerHTML=`<section class="gate-card"><div class="gate-brand"><div class="gate-mark">C</div><div><strong>COREOS</strong><small>NUOVO UTENTE</small></div></div>
      <div class="gate-eyebrow">PASSAGGIO 1 DI 2</div><h1>Crea il tuo utente.</h1><p class="gate-copy">Scegli un nome utente e imposta la password. Per questa versione la password viene impostata una sola volta: non esiste una procedura di reset.</p>
      <form id="createForm" class="gate-form">
        <div class="gate-field full"><label for="newOsName">Nome del tuo sistema</label><input id="newOsName" maxlength="32" placeholder="Es. LucaOS" required></div>
        <div class="gate-field"><label for="newUser">Username</label><input id="newUser" minlength="3" maxlength="24" autocomplete="username" placeholder="Il tuo username" required></div>
        <div class="gate-field"><label for="newPass">Password (minimo 8 caratteri)</label><input id="newPass" type="password" minlength="8" autocomplete="new-password" required></div>
        <div class="gate-field full"><label for="newPass2">Conferma password</label><input id="newPass2" type="password" minlength="8" autocomplete="new-password" required></div>
      </form><div class="gate-error" id="createError"></div>
      <div class="gate-actions"><button class="gate-btn ghost" id="backWelcome">Indietro</button><button class="gate-btn primary" id="nextOptions">Continua alle opzioni →</button></div>
    </section>`;
    document.getElementById('backWelcome').onclick=showWelcome;
    document.getElementById('nextOptions').onclick=async()=>{
      const name=document.getElementById('newOsName').value.trim(), user=document.getElementById('newUser').value.trim(), p=document.getElementById('newPass').value, p2=document.getElementById('newPass2').value;
      const err=document.getElementById('createError');
      if(!name||user.length<3||p.length<8||p!==p2){err.textContent='Controlla i campi: username di almeno 3 caratteri, password di almeno 8 e conferma identica.';return;}
      if(localStorage.getItem(PROFILE_KEY)){err.textContent='Esiste già un profilo su questo browser. Esci o ripristina il sistema prima di crearne un altro.';return;}
      const hash=await hashPassword(p);
      showOptions({name,user,hash,salt:window.__coreSalt});
    };
  }
  async function hashPassword(password, saltHex){
    const salt=saltHex?Uint8Array.from(saltHex.match(/.{1,2}/g).map(x=>parseInt(x,16))):crypto.getRandomValues(new Uint8Array(16));
    const saltString=Array.from(salt).map(x=>x.toString(16).padStart(2,'0')).join('');
    const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
    const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:180000,hash:'SHA-256'},key,256);
    const hash=Array.from(new Uint8Array(bits)).map(x=>x.toString(16).padStart(2,'0')).join('');
    window.__coreSalt=saltString;return hash;
  }
  function showOptions(profile){
    const groups=optionGroups.map(([group,items])=>`<div class="option-group"><h3>${escapeHtml(group)}</h3>${items.map(optionMarkup).join('')}</div>`).join('');
    const extra=allOptions.filter(x=>!optionGroups.some(([g,items])=>items.some(i=>i[0]===x[0]))).map(optionMarkup).join('');
    gate.innerHTML=`<section class="gate-card"><div class="gate-brand"><div class="gate-mark">C</div><div><strong>COREOS BUILDER</strong><small>PERSONALIZZA IL TUO SISTEMA</small></div></div>
      <div class="gate-eyebrow">PASSAGGIO 2 DI 2 · ${allOptions.length} OPZIONI</div><h1>Costruiamo il tuo OS.</h1><p class="gate-copy">Scegli le impostazioni iniziali. Potrai modificarle in seguito dal pannello Impostazioni.</p><div class="gate-progress"><span style="width:100%"></span></div>
      <div class="option-groups">${groups}<div class="option-group"><h3>Altre opzioni</h3>${extra}</div></div>
      <div class="gate-note">La password non viene caricata su un server: in questa anteprima il profilo è salvato solo nel browser/dispositivo in cui lo crei. Non cancellare i dati del browser se vuoi conservarlo.</div>
      <div class="gate-actions"><button class="gate-btn ghost" id="backCreate">Indietro</button><button class="gate-btn primary" id="finishCreate">Crea il mio sistema CoreOS</button></div>
    </section>`;
    gate.querySelectorAll('[data-config]').forEach(el=>el.value=config[el.dataset.config]??defaults[el.dataset.config]??'');
    document.getElementById('backCreate').onclick=showCreate;
    document.getElementById('finishCreate').onclick=()=>{
      gate.querySelectorAll('[data-config]').forEach(el=>config[el.dataset.config]=el.value);
      localStorage.setItem(CONFIG_KEY,JSON.stringify(config));
      localStorage.setItem(PROFILE_KEY,JSON.stringify({...profile,createdAt:new Date().toISOString()}));
      localStorage.setItem(SESSION_KEY,'1');
      applyConfig();enterDesktop(profile.user,profile.name);
    };
  }
  function showLogin(){
    gate.innerHTML=`<section class="gate-card" style="max-width:520px"><div class="gate-brand"><div class="gate-mark">C</div><div><strong>COREOS</strong><small>ACCESSO UTENTE</small></div></div><div class="gate-eyebrow">BENTORNATO</div><h1>Accedi al tuo OS.</h1><form id="loginForm" class="gate-form"><div class="gate-field full"><label>Username</label><input id="loginUser" autocomplete="username" required></div><div class="gate-field full"><label>Password</label><input id="loginPass" type="password" autocomplete="current-password" required></div></form><div class="gate-error" id="loginError"></div><div class="gate-actions"><button class="gate-btn ghost" id="loginBack">Indietro</button><button class="gate-btn primary" id="loginGo">Accedi</button></div></section>`;
    document.getElementById('loginBack').onclick=showWelcome;
    document.getElementById('loginGo').onclick=async()=>{
      let profile;try{profile=JSON.parse(localStorage.getItem(PROFILE_KEY)||'null')}catch{}
      const user=document.getElementById('loginUser').value.trim(), pass=document.getElementById('loginPass').value;
      if(!profile||profile.user!==user){document.getElementById('loginError').textContent='Profilo non trovato su questo browser.';return;}
      const hash=await hashPassword(pass,profile.salt);
      if(hash!==profile.hash){document.getElementById('loginError').textContent='Password non corretta. Non è previsto il reset della password.';return;}
      localStorage.setItem(SESSION_KEY,'1');enterDesktop(profile.user,profile.name);
    };
  }
  function enterDesktop(user,name){
    gate.style.display='none';
    const desktopRoot=document.querySelector('.desktop');
    if(desktopRoot)desktopRoot.style.display='block';
    const topUser=document.getElementById('topUser');
    if(topUser)topUser.textContent=user.slice(0,12);
    const heading=document.querySelector('.hero h1');if(heading)heading.innerHTML=`Benvenuto, ${escapeHtml(user)}<span class="accent">.</span>`;
    const welcome=document.querySelector('.welcome-content h2');if(welcome)welcome.textContent=`${name} è pronto.`;
    const sub=document.querySelector('.welcome-content p');if(sub)sub.textContent='Il tuo ambiente personale è stato creato.';
    const date=document.getElementById('topDate');if(date)date.textContent=name;
    const mode=document.querySelector('.status-panel .status-row:last-of-type b');if(mode)mode.textContent='CoreOS personalizzato';
    addAccountMenu();
  }
  function addAccountMenu(){
    const top=document.querySelector('.top-right');
    if(!top||document.getElementById('accountMenuButton'))return;
    const b=document.createElement('button');b.id='accountMenuButton';b.className='icon-button';b.textContent='⋯';b.setAttribute('aria-label','Menu sistema');top.appendChild(b);
    b.onclick=()=>openSystemMenu();
  }
  function openSystemMenu(){
    document.querySelector('.system-menu')?.remove();
    const menu=document.createElement('div');menu.className='start-menu system-menu';menu.style.left='auto';menu.style.right='12px';menu.style.bottom='72px';
    menu.innerHTML=`<h3>Il mio CoreOS</h3><div class="start-menu-grid">
      <button data-system="builder">Personalizza OS</button><button data-system="clone">Clona / esporta</button>
      <button data-system="restore">Ripristina da zero</button><button data-system="logout">Esci dall’utente</button>
      <button data-system="shutdown">Arresta sistema</button><button data-system="exit">Esci dal sito</button></div>`;
    document.body.appendChild(menu);
    menu.querySelectorAll('[data-system]').forEach(b=>b.onclick=()=>{menu.remove();systemAction(b.dataset.system)});
    document.addEventListener('pointerdown',function closeMenu(e){if(!menu.contains(e.target)&&e.target!==document.getElementById('accountMenuButton')){menu.remove();document.removeEventListener('pointerdown',closeMenu)}},{once:true});
  }
  function systemAction(action){
    if(action==='builder'){openBuilderWindow();return;}
    if(action==='clone'){exportClone();return;}
    if(action==='restore'){
      if(confirm('Ripristinare CoreOS da zero? Verranno eliminati profilo, password e personalizzazioni salvati in questo browser. Questa operazione non si può annullare.')){
        localStorage.removeItem(PROFILE_KEY);localStorage.removeItem(CONFIG_KEY);localStorage.removeItem(SESSION_KEY);location.reload();
      }return;
    }
    if(action==='logout'){localStorage.removeItem(SESSION_KEY);location.reload();return;}
    if(action==='shutdown'){
      document.querySelector('.desktop').style.display='none';document.getElementById('windowLayer').style.display='none';
      shutdown.hidden=false;shutdown.innerHTML=`<div><div class="gate-mark" style="margin:0 auto 22px">C</div><h1>CoreOS è spento.</h1><p>La sessione è stata arrestata. I tuoi dati restano salvati.</p><button class="gate-btn primary" id="powerOn">Riaccendi CoreOS</button><button class="gate-btn ghost" id="shutdownExit">Esci dal sito</button></div>`;
      document.getElementById('powerOn').onclick=()=>location.reload();
      document.getElementById('shutdownExit').onclick=()=>{shutdown.innerHTML='<div><h1>Puoi chiudere questa scheda.</h1><p>Il browser non consente a una pagina di chiudersi da sola in tutti i casi.</p></div>';};
      return;
    }
    if(action==='exit'){if(confirm('Vuoi uscire da CoreOS?')){localStorage.removeItem(SESSION_KEY);document.querySelector('.desktop').style.display='none';gate.style.display='grid';showWelcome();}return;}
  }
  function exportClone(){
    const cfg=readConfig();
    const payload={format:'coreos-clone',version:1,createdAt:new Date().toISOString(),config:cfg};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='coreos-clone.json';a.click();URL.revokeObjectURL(a.href);
    if(typeof toast==='function')toast('Clonazione esportata: contiene le impostazioni, non la password.');
  }
  function importClone(){
    const input=document.createElement('input');input.type='file';input.accept='.json,application/json';
    input.onchange=async()=>{
      const f=input.files?.[0];if(!f)return;
      try{const p=JSON.parse(await f.text());if(p.format!=='coreos-clone'||!p.config)throw new Error('Formato non valido');
        config={...defaults,...p.config};localStorage.setItem(CONFIG_KEY,JSON.stringify(config));
        if(localStorage.getItem(PROFILE_KEY)){applyConfig();alert('Configurazione clonata e applicata al profilo esistente.');location.reload();}
        else{showCreate();alert('Configurazione importata. Crea username e password per completare il nuovo CoreOS.');}
      }catch(e){alert('Impossibile importare il file: '+e.message);}
    };input.click();
  }
  function applyConfig(){
    config=readConfig();
    const root=document.documentElement;
    root.style.setProperty('--blue',config.accent);
    root.dataset.coreTheme=config.theme;
    root.dataset.coreWallpaper=config.wallpaper;
    root.dataset.coreScale=config.scale;
    root.dataset.coreCorners=config.corners;
    root.dataset.coreDock=config.dock;
    root.dataset.coreFont=config.font;
    root.dataset.coreDockSize=config.dockSize;
    root.dataset.coreWindowStyle=config.windowStyle;
    root.dataset.coreShadows=config.shadows;
    if(config.statusBar==='off')document.querySelector('.topbar')?.classList.add('core-hidden');
    else document.querySelector('.topbar')?.classList.remove('core-hidden');
    if(config.animations==='off'||config.reducedMotion==='on')root.classList.add('core-reduced-motion');
    else root.classList.remove('core-reduced-motion');
  }
  function openBuilderWindow(){
    const groups=optionGroups.map(([group,items])=>`<div class="option-group"><h3>${escapeHtml(group)}</h3>${items.map(optionMarkup).join('')}</div>`).join('');
    const body=`<h3>Personalizza il tuo CoreOS</h3><p>40 opzioni disponibili. Le modifiche vengono salvate in questo browser.</p><div class="option-groups">${groups}</div><div class="gate-actions"><button class="gate-btn primary" id="saveBuilder">Salva impostazioni</button><button class="gate-btn ghost" id="exportBuilder">Esporta clonazione</button></div>`;
    openApp('settings');
    const win=layer.querySelector('.window-body');if(!win)return;
    win.innerHTML=body;
    win.querySelectorAll('[data-config]').forEach(el=>el.value=config[el.dataset.config]??defaults[el.dataset.config]??'');
    win.querySelector('#saveBuilder').onclick=()=>{win.querySelectorAll('[data-config]').forEach(el=>config[el.dataset.config]=el.value);localStorage.setItem(CONFIG_KEY,JSON.stringify(config));applyConfig();toast('CoreOS personalizzato');};
    win.querySelector('#exportBuilder').onclick=exportClone;
  }
  function startMenu(){
    document.querySelector('.start-menu:not(.system-menu)')?.remove();
    const m=document.createElement('div');m.className='start-menu';m.innerHTML=`<h3>Start · CoreOS</h3><div class="start-menu-grid"><button data-open="apps">▦ Applicazioni</button><button data-open="files">▤ File</button><button data-open="notes">✎ Blocco note</button><button data-open="calculator">＋ Calcolatrice</button><button data-open="calendar">▦ Calendario</button><button data-open="settings">⚙ Impostazioni</button><button data-system="builder">✦ Crea / modifica OS</button><button data-system="shutdown">⏻ Arresta sistema</button></div>`;
    document.body.appendChild(m);
    m.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{m.remove();openApp(b.dataset.open)});
    m.querySelectorAll('[data-system]').forEach(b=>b.onclick=()=>{m.remove();systemAction(b.dataset.system)});
    document.addEventListener('pointerdown',function close(e){if(!m.contains(e.target)&&e.target!==document.getElementById('startButton')){m.remove();document.removeEventListener('pointerdown',close)}},{once:true});
  }
  document.getElementById('startButton')?.addEventListener('click',startMenu);
  const profile=(()=>{try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'null')}catch{return null}})();
  if(profile){
    if(localStorage.getItem(SESSION_KEY)==='1'){applyConfig();enterDesktop(profile.user,profile.name);}
    else{document.querySelector('.desktop').style.display='none';showLogin();}
  }else{
    document.querySelector('.desktop').style.display='none';showWelcome();
  }
})();


/* COSMIC-style launcher interactions */
(() => {
  const launcher=document.getElementById('cosmicLauncher');
  const search=document.getElementById('launcherSearch');
  const appButtons=[...document.querySelectorAll('.launcher-app')];
  const start=document.getElementById('startButton');
  function closeLauncher(){launcher.hidden=true;}
  function toggleLauncher(){
    launcher.hidden=!launcher.hidden;
    if(!launcher.hidden){search.value='';filterApps();setTimeout(()=>search.focus(),50);}
  }
  function filterApps(){
    const q=(search.value||'').trim().toLowerCase();
    appButtons.forEach(b=>b.hidden=!b.dataset.label.toLowerCase().includes(q));
  }
  start?.addEventListener('click',toggleLauncher);
  document.getElementById('homeBtn')?.addEventListener('click',()=>{closeLauncher();document.querySelector('.desktop-shortcuts')?.scrollIntoView({block:'nearest'});});
  search?.addEventListener('input',filterApps);
  appButtons.forEach(b=>b.addEventListener('click',()=>{
    const app=b.dataset.open;
    closeLauncher();
    if(app==='browser'){window.open('https://www.google.com','_blank','noopener');return;}
    if(typeof openApp==='function')openApp(app);
  }));
  document.querySelectorAll('.desktop-shortcut').forEach(b=>b.addEventListener('click',()=>{if(typeof openApp==='function')openApp(b.dataset.open)}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!launcher.hidden)closeLauncher();if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='a'){e.preventDefault();toggleLauncher();}});
  document.querySelectorAll('.launcher-categories button').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('.launcher-categories button').forEach(x=>x.classList.remove('category-active'));
    b.classList.add('category-active');
    const category=b.dataset.category;
    appButtons.forEach((x,i)=>{x.hidden=category==='all'?false:category==='office'?!['COSMIC Text Editor','Thunderbird'].includes(x.dataset.label):category==='system'?!['COSMIC Settings','COSMIC Terminal','Input Method Selector','nheko'].includes(x.dataset.label):category==='utilities'?!['COSMIC Files','COSMIC Media Player','Firefox','Rhythmbox'].includes(x.dataset.label):false;});
  }));
  // Show the applications grid as the first desktop view, like the supplied reference.
  const observer=new MutationObserver(()=>{if(document.querySelector('.desktop')?.style.display!=='none' && !sessionStorage.getItem('coreosLauncherShown')){launcher.hidden=false;sessionStorage.setItem('coreosLauncherShown','1');}});
  const gate=document.getElementById('accountGate');
  if(gate){observer.observe(gate,{attributes:true,attributeFilter:['style']});}
  if(gate && gate.style.display==='none' && !sessionStorage.getItem('coreosLauncherShown')){launcher.hidden=false;sessionStorage.setItem('coreosLauncherShown','1');}
})();
