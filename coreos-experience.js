/* CoreOS Experience Layer — responsive desktop interactions */
(() => {
 'use strict';
 const $=(s,r=document)=>r.querySelector(s);
 const layer=$('#windowLayer'), dock=$('.dock'), launcher=$('#cosmicLauncher');
 if(!layer||window.__coreExperienceInstalled)return;
 window.__coreExperienceInstalled=true;
 let activeApp=null, minimized=new Map();
 const appLabels=()=>[...document.querySelectorAll('.launcher-app')];
 function closeLauncher(){if(launcher)launcher.hidden=true;}
 function enhanceWindow(name){
  const win=layer.querySelector('.app-window'),head=win?.querySelector('.window-head');
  if(!win||!head)return;
  activeApp=name;
  minimized.forEach(chip=>chip.remove());minimized.clear();
  layer.classList.add('has-window');
  win.dataset.app=name;
  win.setAttribute('aria-modal','false');
  win.querySelectorAll('.core-window-actions').forEach(x=>x.remove());
  const actions=document.createElement('div');actions.className='core-window-actions';
  actions.innerHTML='<button type="button" data-window-action="minimize" aria-label="Riduci finestra" title="Riduci">−</button><button type="button" data-window-action="maximize" aria-label="Espandi finestra" title="Espandi">□</button>';
  head.append(actions);
  actions.addEventListener('click',e=>{
   const b=e.target.closest('[data-window-action]');if(!b)return;
   if(b.dataset.windowAction==='minimize')minimize(win,name);
   if(b.dataset.windowAction==='maximize'){
    const full=win.classList.toggle('core-window-maximized');
    b.textContent=full?'❐':'□';b.title=full?'Ripristina':'Espandi';
   }
  });
  win.addEventListener('pointerdown',()=>{layer.querySelectorAll('.app-window').forEach(x=>x.classList.remove('core-window-focused'));win.classList.add('core-window-focused');},{once:true});
  const restore=minimized.get(name);if(restore){restore.remove();minimized.delete(name);}
  closeLauncher();
 }
 function minimize(win,name){
  win.hidden=true;layer.classList.remove('has-window');
  if(!dock)return;
  let chip=minimized.get(name);
  if(!chip){
   chip=document.createElement('button');chip.type='button';chip.className='core-dock-window';chip.textContent=win.querySelector('.window-title')?.textContent||name;
   chip.title='Ripristina '+name;chip.addEventListener('click',()=>{win.hidden=false;layer.classList.add('has-window');win.classList.add('core-window-focused');chip.remove();minimized.delete(name);});
   dock.append(chip);minimized.set(name,chip);
  }
 }
 const original=window.openApp;
 if(typeof original==='function'){
  window.openApp=function(name){original(name);enhanceWindow(name);};
 }
 function launcherSetup(){
  if(!launcher)return;
  const search=$('#launcherSearch'),buttons=appLabels(),categories=[...launcher.querySelectorAll('[data-category]')];
  const categoryFor=id=>({
   files:'system',terminal:'system',monitor:'system',settings:'system',apps:'system',store:'system',
   browser:'internet',weather:'internet',
   notes:'office',calendar:'office',tasks:'office',
   paint:'creative',media:'creative',viewer:'creative',
   calculator:'utilities',stopwatch:'utilities',pomodoro:'utilities',converter:'utilities',passwords:'utilities',
   minesweeper:'games'
  }[id]||'all');
  let category='all';
  function filter(){
   const q=(search?.value||'').trim().toLocaleLowerCase('it');
   buttons.forEach(b=>{
    const id=b.dataset.open||'',label=(b.dataset.label||b.textContent||'').toLocaleLowerCase('it');
    const ok=(category==='all'||categoryFor(id)===category)&&(!q||label.includes(q)||id.includes(q));
    b.hidden=!ok;
   });
  }
  search?.addEventListener('input',filter);
  categories.forEach(b=>b.addEventListener('click',()=>{
   const next=b.dataset.category;
   category=next==='all'?'all':next;
   categories.forEach(x=>x.classList.toggle('category-active',x===b));filter();
  }));
  filter();
 }
 function connectLauncher(){
  const trigger=$('#startButton'),appDock=$('.dock [data-open="apps"]');
  const toggle=()=>{if(!launcher)return;launcher.hidden=!launcher.hidden;if(!launcher.hidden){const s=$('#launcherSearch');s?.focus();s?.select();}};
  trigger?.addEventListener('click',toggle);
  appDock?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();toggle();});
  launcherSetup();
 }
 function addSystemClock(){
  const date=$('#topDate'),clock=$('#clock');
  const render=()=>{const d=new Date();if(date)date.textContent=d.toLocaleDateString('it-IT',{weekday:'short',day:'numeric',month:'short'});if(clock)clock.textContent=d.toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});};
  render();setInterval(render,15000);
 }
 document.addEventListener('keydown',e=>{
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(launcher?.hidden){launcher.hidden=false;$('#launcherSearch')?.focus();}else closeLauncher();}
  if(e.key==='Escape'&&launcher&&!launcher.hidden){closeLauncher();$('#startButton')?.focus();}
 });
 document.addEventListener('pointerdown',e=>{if(launcher&&!launcher.hidden&&!e.target.closest('#cosmicLauncher,#startButton,.dock [data-open="apps"]'))closeLauncher();});
 addSystemClock();connectLauncher();
 const css=document.createElement('style');css.textContent=`
 .core-window-actions{display:flex;align-items:center;gap:7px;margin-left:auto}
 .core-window-actions button{width:34px;height:34px;border:1px solid var(--core-border,rgba(130,150,180,.22));border-radius:10px;background:var(--core-surface-2,rgba(120,140,170,.12));color:inherit;font:inherit;cursor:pointer}
 .core-window-actions button:active{transform:scale(.94)}
 .app-window.core-window-maximized{position:fixed!important;inset:calc(env(safe-area-inset-top,0px) + 12px) 12px calc(78px + env(safe-area-inset-bottom,0px))!important;width:auto!important;height:auto!important;max-width:none!important;max-height:none!important;transform:none!important;z-index:20!important}
 .app-window[hidden]{display:none!important}
 .core-dock-window{max-width:120px;min-width:48px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:9px 12px;border:1px solid var(--core-border,rgba(140,160,190,.24));border-radius:12px;background:var(--core-surface-2,rgba(120,140,170,.14));color:inherit;font:inherit;font-size:12px}
 .window-layer.has-window .app-window{min-width:0;min-height:0}
 .window-layer .app-window .window-body{overscroll-behavior:contain;scrollbar-width:thin}
 .cosmic-launcher[hidden]{display:none!important}
 .launcher-app[hidden]{display:none!important}
 .launcher-app:focus-visible,.core-window-actions button:focus-visible,.core-dock-window:focus-visible{outline:2px solid var(--blue,#83aaff);outline-offset:3px}
 @media(max-width:700px){
  .core-window-actions{gap:4px}.core-window-actions button{width:32px;height:32px}
  .app-window.core-window-maximized{inset:calc(env(safe-area-inset-top,0px) + 6px) 6px calc(76px + env(safe-area-inset-bottom,0px))!important;border-radius:17px!important}
  .core-dock-window{max-width:82px;font-size:10px;padding:7px}
 }
 @media(prefers-reduced-motion:reduce){.core-window-actions button,.core-dock-window{transition:none!important;animation:none!important}}
 `;document.head.append(css);
})();
