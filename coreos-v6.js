/* CoreOS v6 local enhancements — additive layer */
(() => {
  'use strict';
  const $ = (s, r=document) => r.querySelector(s);
  const root = document.documentElement;
  const profileKey = 'coreos.profile.v1';
  const configKey = 'coreos.config.v1';
  const pinKey = 'coreos.pinHash.v1';
  const pinSaltKey = 'coreos.pinSalt.v1';
  const backupKey = 'coreos.localBackup.v1';
  const prefsKey = 'coreos.v6.prefs';
  const read = (k, fallback={}) => { try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; } };
  const notify = (title, body='') => {
    let host = $('#coreNotifications');
    if (!host) { host=document.createElement('div'); host.id='coreNotifications'; host.className='core-notifications'; document.body.append(host); }
    const item=document.createElement('div'); item.className='core-notification';
    const strong=document.createElement('b'); strong.textContent=title;
    const p=document.createElement('p'); p.textContent=body;
    item.append(strong,p); host.append(item); setTimeout(()=>item.remove(),4500);
  };
  const prefs = read(prefsKey, {theme:'dark', bootSeen:false, desktopPositions:{}, pinEnabled:false});
  function savePrefs(){ localStorage.setItem(prefsKey, JSON.stringify(prefs)); }
  function applyTheme(value=prefs.theme) {
    prefs.theme=value; savePrefs();
    const actual=value==='auto' ? (matchMedia('(prefers-color-scheme: light)').matches?'light':'dark') : value;
    root.dataset.coreTheme=actual; root.style.colorScheme=actual;
    const meta=$('meta[name="theme-color"]'); if(meta) meta.content=actual==='light'?'#f3f6fb':'#101216';
  }
  applyTheme();
  if (prefs.theme==='auto') matchMedia('(prefers-color-scheme: light)').addEventListener?.('change',()=>applyTheme('auto'));

  function showBoot() {
    if (prefs.bootSeen || $('#accountGate')?.style.display!=='none') return;
    const boot=document.createElement('div'); boot.className='core-boot';
    boot.innerHTML='<div class="core-boot-mark">C</div><strong>COREOS</strong><span>Il tuo spazio. Il tuo dispositivo.</span><i></i>';
    document.body.append(boot);
    setTimeout(()=>{boot.classList.add('done');setTimeout(()=>boot.remove(),500);prefs.bootSeen=true;savePrefs();},1450);
  }
  window.addEventListener('load',()=>setTimeout(showBoot,120));

  async function digest(value, salt) {
    const data=new TextEncoder().encode(salt+':'+value);
    const hash=await crypto.subtle.digest('SHA-256',data);
    return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('');
  }
  function lockScreen() {
    if ($('#coreLock')) return;
    const overlay=document.createElement('div'); overlay.id='coreLock'; overlay.className='core-lock';
    overlay.innerHTML='<div class="core-lock-card"><div class="core-boot-mark">C</div><div class="core-lock-brand">COREOS</div><h2>Sessione bloccata</h2><p>Inserisci il PIN per tornare al desktop.</p><form id="corePinForm"><input id="corePinInput" type="password" inputmode="numeric" maxlength="5" pattern="[0-9]{5}" autocomplete="off" placeholder="PIN a 5 cifre" aria-label="PIN"><button class="core-primary">Sblocca</button></form><small id="corePinError" role="alert"></small></div>';
    document.body.append(overlay); $('#corePinInput').focus();
    $('#corePinForm').addEventListener('submit',async e=>{
      e.preventDefault(); const pin=$('#corePinInput').value; const salt=localStorage.getItem(pinSaltKey)||'';
      if(await digest(pin,salt)===localStorage.getItem(pinKey)){overlay.remove();notify('CoreOS','Sessione sbloccata.');}
      else $('#corePinError').textContent='PIN non corretto.';
    });
  }
  async function configurePin() {
    let pin=prompt('Imposta un PIN locale di esattamente 5 cifre (non usare il PIN della carta o del telefono):');
    if(pin===null)return;
    if(!/^\d{5}$/.test(pin)){alert('Il PIN deve contenere esattamente 5 cifre numeriche.');return;}
    const salt=crypto.randomUUID(); localStorage.setItem(pinSaltKey,salt); localStorage.setItem(pinKey,await digest(pin,salt)); prefs.pinEnabled=true;savePrefs();notify('PIN attivato','Il blocco sessione è pronto.');
  }

  function addSystemControls() {
    const top=$('.top-right'); if(!top || $('#coreLockButton')) return;
    const lock=document.createElement('button'); lock.id='coreLockButton'; lock.className='icon-button'; lock.textContent='⌑'; lock.title='Blocca CoreOS'; lock.onclick=lockScreen;
    const bell=document.createElement('button'); bell.id='coreBellButton'; bell.className='icon-button'; bell.textContent='♧'; bell.title='Notifiche'; bell.onclick=()=>notify('Centro notifiche','Le notifiche di CoreOS vengono gestite localmente.');
    top.prepend(bell,lock);
    const shortcuts=$('.desktop-shortcuts');
    if(shortcuts) {
      shortcuts.querySelectorAll('.desktop-shortcut').forEach((el,i)=>{
        el.draggable=true; el.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',el.dataset.open);});
        el.addEventListener('dragend',()=>{const r=el.getBoundingClientRect();prefs.desktopPositions[el.dataset.open]={x:r.left,y:r.top};savePrefs();});
        const saved=prefs.desktopPositions[el.dataset.open]; if(saved && innerWidth>700){el.style.position='fixed';el.style.left=saved.x+'px';el.style.top=saved.y+'px';}
      });
    }
  }
  function installSettingsTheme() {
    const original=window.openApp;
    if(typeof original!=='function' || window.__coreV6Wrapped)return;
    window.__coreV6Wrapped=true;
    window.openApp=function(name) {
      original(name);
      if(name==='settings') {
        const body=$('.window-body'); if(!body || $('#coreThemeSelect',body))return;
        const section=document.createElement('section'); section.className='core-v6-settings';
        section.innerHTML='<h3>Aspetto CoreOS v6</h3><div class="core-setting-row"><label for="coreThemeSelect">Tema</label><select id="coreThemeSelect"><option value="dark">Scuro</option><option value="light">Chiaro</option><option value="auto">Automatico</option></select></div><div class="core-setting-row"><label for="corePinToggle">Blocco con PIN</label><button id="corePinToggle" class="core-secondary">Configura PIN</button></div><div class="core-setting-row"><label>Notifiche</label><button id="coreTestNotice" class="core-secondary">Invia notifica di prova</button></div><div class="core-setting-row"><label>Backup locale</label><button id="coreBackupNow" class="core-secondary">Crea backup</button></div><p class="core-muted">Le preferenze restano su questo dispositivo. Il browser limita il controllo diretto di Wi-Fi e volume di sistema.</p>';
        body.append(section); $('#coreThemeSelect',section).value=prefs.theme;
        $('#coreThemeSelect',section).onchange=e=>{applyTheme(e.target.value);notify('Tema aggiornato',e.target.selectedOptions[0].text);};
        $('#corePinToggle',section).onclick=configurePin;
        $('#coreTestNotice',section).onclick=()=>notify('CoreOS','Notifica di sistema di prova.');
        $('#coreBackupNow',section).onclick=createBackup;
      }
    };
  }
  function createBackup() {
    const snapshot={format:'coreos-local-backup',version:1,createdAt:new Date().toISOString(),profile:read(profileKey,null),config:read(configKey,{}),notes:localStorage.getItem('coreos-notes')||'',prefs:read(prefsKey,{})};
    localStorage.setItem(backupKey,JSON.stringify(snapshot));
    const blob=new Blob([JSON.stringify(snapshot,null,2)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='CoreOS-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
    notify('Backup locale creato','Una copia è stata scaricata sul dispositivo.');
  }
  function scheduleBackup(){setInterval(()=>{const data={createdAt:new Date().toISOString(),profile:read(profileKey,null),config:read(configKey,{}),notes:localStorage.getItem('coreos-notes')||'',prefs:read(prefsKey,{})};localStorage.setItem(backupKey,JSON.stringify(data));},5*60*1000);}
  function terminalEnhancement() {
    const original=window.openApp;
    if(typeof original!=='function' || window.__coreTerminalWrapped)return;
    window.__coreTerminalWrapped=true;
    window.openApp=function(name) {
      original(name);
      if(name!=='terminal')return;
      const form=$('#termForm'),input=$('#termInput'),out=$('#termOut'); if(!form||!input||!out)return;
      out.textContent='CoreOS Terminal v6.0\\nTerminale locale · comandi consentiti: ls, admin, neofetch, del/user, shutdown, exit\\n\\n';
      form.onsubmit=async e=>{
        e.preventDefault(); const cmd=input.value.trim().toLowerCase(); if(!cmd)return;
        let result='';
        if(cmd==='ls') result='Desktop/  Documenti/  Immagini/  Download/  Cestino/';
        else if(cmd==='neofetch') result='   _________\\n  / ____/ ___/\\n / /   / /__  ___  ____\\n/ /___/ / _ \\/ _ \\/ __/\\n\\____/_/\\___/\\___/_/\\n\\nOS: CoreOS v6\\nMode: Local desktop\\nShell: CoreOS Terminal\\nTheme: '+(prefs.theme||'dark')+'\\nUser: '+(read(profileKey,{user:'utente'}).user||'utente');
        else if(cmd==='admin') {
          let salt=localStorage.getItem('coreos.admin.salt.v1'), hash=localStorage.getItem('coreos.admin.hash.v1');
          if(!hash){
            const first=prompt('Crea la password amministratore locale (almeno 10 caratteri):');
            if(first===null){result='Configurazione annullata.';}
            else if(first.length<10){result='Password troppo corta: servono almeno 10 caratteri.';}
            else {const again=prompt('Conferma la password amministratore:');if(first!==again){result='Le password non coincidono.';}else{salt=crypto.randomUUID();hash=await digest(first,salt);localStorage.setItem('coreos.admin.salt.v1',salt);localStorage.setItem('coreos.admin.hash.v1',hash);result='Password amministratore configurata. Accesso consentito.';}}
          } else {
            const pass=prompt('Password amministratore:');
            if(pass!==null && await digest(pass,salt)===hash) result='Accesso amministratore locale consentito.\\nUtente attivo: '+(read(profileKey,{user:'utente'}).user||'utente');
            else result='Autenticazione amministratore non riuscita.';
          }
        }
        else if(cmd==='del/user') { const p=read(profileKey,null); if(!p){result='Nessun utente locale trovato.';} else if(confirm('Eliminare il profilo '+p.user+' e i dati CoreOS locali? Operazione irreversibile.')){['coreos.profile.v1','coreos.config.v1','coreos.session.v1','coreos.notes','coreos.v6.prefs','coreos.pinHash.v1','coreos.pinSalt.v1','coreos.localBackup.v1','coreos.admin.salt.v1','coreos.admin.hash.v1'].forEach(k=>localStorage.removeItem(k));result='Profilo locale eliminato. CoreOS verrà riavviato.';out.textContent+='user@coreos:~$ '+cmd+'\\n'+result+'\\n';setTimeout(()=>location.reload(),900);input.value='';return;} else result='Operazione annullata.'; }
        else if(cmd==='shutdown') { result='Arresto di CoreOS…'; document.querySelector('.desktop')?.classList.add('core-hidden-desktop'); setTimeout(()=>{const s=$('#shutdownScreen');if(s){s.hidden=false;s.innerHTML='<div><div class="gate-mark">C</div><h1>CoreOS è spento.</h1><p>I dati locali sono stati conservati.</p><button class="gate-btn primary" onclick="location.reload()">Riaccendi CoreOS</button></div>';}},350); }
        else if(cmd==='exit') { result='Terminale chiuso.'; out.textContent+='user@coreos:~$ exit\\n'+result+'\\n'; if(typeof closeApp==='function')closeApp(); return; }
        else result='Comando non riconosciuto. I soli comandi disponibili sono: ls, admin, neofetch, del/user, shutdown, exit.';
        out.textContent+='user@coreos:~$ '+cmd+'\\n'+result+'\\n\\n';out.scrollTop=out.scrollHeight;input.value='';
      };
    };
  }
  function addStore() {
    if(typeof apps==='undefined' || apps.store)return;
    apps.store={title:'CoreOS Store',html:'<h3>CoreOS Store</h3><p>Catalogo locale delle applicazioni disponibili in questa versione.</p><div class="core-store-grid"><article><b>File Manager</b><span>Gestione dei file autorizzati</span><button data-store-app="files">Apri</button></article><article><b>Terminale</b><span>Comandi locali CoreOS</span><button data-store-app="terminal">Apri</button></article><article><b>Blocco note</b><span>Documenti locali</span><button data-store-app="notes">Apri</button></article><article><b>Calcolatrice</b><span>Calcoli rapidi</span><button data-store-app="calculator">Apri</button></article><article><b>Calendario</b><span>Eventi e promemoria locali</span><button data-store-app="calendar">Apri</button></article><article><b>Browser</b><span>Navigazione web con apertura esterna</span><button data-store-app="browser">Apri</button></article><article><b>Paint</b><span>Disegno ed esportazione PNG</span><button data-store-app="paint">Apri</button></article><article><b>Media Player</b><span>Riproduzione di file locali</span><button data-store-app="media">Apri</button></article><article><b>Meteo</b><span>Previsioni online</span><button data-store-app="weather">Apri</button></article></div><p class="core-muted">Le app sono componenti integrate: lo Store non installa software arbitrario.</p>'};
    document.addEventListener('click',e=>{const b=e.target.closest('[data-store-app]');if(b&&typeof window.openApp==='function')window.openApp(b.dataset.storeApp);});
    document.querySelectorAll('.launcher-app').forEach(()=>{});
    const grid=$('#launcherApps'); if(grid&&!grid.querySelector('[data-open="store"]')){const b=document.createElement('button');b.className='launcher-app';b.dataset.open='store';b.dataset.label='CoreOS Store';b.innerHTML='<span class="launcher-icon store">⬇</span><span>CoreOS Store</span>';grid.append(b);b.onclick=()=>{if(typeof window.openApp==='function')window.openApp('store');$('#cosmicLauncher').hidden=true;};}
  }
  function addDevicePanel() {
    if($('#coreDevicePanel'))return;
    const panel=document.createElement('div');panel.id='coreDevicePanel';panel.className='core-device-panel';
    panel.innerHTML='<b>Dispositivo</b><p id="coreNetworkState">Rete: verifica…</p><label>Volume dei contenuti multimediali <input id="coreMediaVolume" type="range" min="0" max="100" value="100"></label><small>Il volume controlla solo i contenuti audio/video riprodotti da CoreOS, non il volume generale del telefono o computer.</small>';
    document.body.append(panel);
    if($('#quickSettings')) $('#quickSettings').onclick=()=>panel.classList.toggle('visible');
    const update=()=>{$('#coreNetworkState').textContent='Rete: '+(navigator.onLine?'connesso (stato browser)':'offline');};
    update();window.addEventListener('online',update);window.addEventListener('offline',update);
    $('#coreMediaVolume').oninput=e=>{document.querySelectorAll('audio,video').forEach(m=>m.volume=Number(e.target.value)/100);};
  }
  function init() {
    addSystemControls(); installSettingsTheme(); terminalEnhancement(); addStore(); addDevicePanel(); scheduleBackup();
    if(prefs.pinEnabled) { const l=$('#coreLockButton'); if(l) l.title='Blocca sessione con PIN'; }
    document.addEventListener('keydown',e=>{if(e.ctrlKey&&e.altKey&&e.key.toLowerCase()==='l'){e.preventDefault();lockScreen();}});
    if(!prefs.welcomeNotice){setTimeout(()=>notify('Benvenuto in CoreOS v6','Nuove funzioni locali disponibili nelle Impostazioni. Premi Ctrl+Alt+L per bloccare la sessione.'));prefs.welcomeNotice=true;savePrefs();}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();