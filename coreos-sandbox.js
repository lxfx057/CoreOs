/* CoreOS Sandbox Runtime
 * Isolated app documents with opaque origins and capability-based host APIs.
 * App code never receives the parent DOM, storage, or unrestricted host objects.
 */
(() => {
  'use strict';
  const VERSION = '1.0.0';
  const instances = new Map();
  const manifests = Object.freeze({
    files:       { permissions: ['files.read','files.write','downloads'] },
    browser:     { permissions: ['network.navigation'] },
    terminal:    { permissions: ['system.info','files.read'] },
    calculator:  { permissions: [] },
    calendar:    { permissions: ['storage.local'] },
    notes:       { permissions: ['storage.local','files.read','files.write'] },
    paint:       { permissions: ['downloads','files.read'] },
    media:       { permissions: ['files.read'] },
    weather:     { permissions: ['network.weather'] },
    tasks:       { permissions: ['storage.local'] },
    stopwatch:   { permissions: ['storage.local'] },
    viewer:      { permissions: ['files.read'] },
    minesweeper: { permissions: ['storage.local'] },
    settings:    { permissions: ['system.settings'] }
  });
  const clone = value => structuredClone(value);
  const safeId = value => String(value || '').replace(/[^a-z0-9_-]/gi, '').slice(0, 48);
  const instancesStore = 'coreos.sandbox.storage.v1';
  const readStore = () => { try { return JSON.parse(localStorage.getItem(instancesStore) || '{}'); } catch { return {}; } };
  const writeStore = value => localStorage.setItem(instancesStore, JSON.stringify(value));
  function requirePermission(instance, permission) {
    if (!instance.permissions.has(permission)) throw new Error('Permesso negato: ' + permission);
  }
  function respond(port, id, ok, value) {
    port.postMessage({ type: 'response', id, ok, value: ok ? value : String(value?.message || value) });
  }
  async function handle(instance, message) {
    const { method, args = [] } = message;
    switch (method) {
      case 'storage.get': {
        requirePermission(instance, 'storage.local');
        const data = readStore(); return data[instance.id]?.[String(args[0])] ?? null;
      }
      case 'storage.set': {
        requirePermission(instance, 'storage.local');
        const [key, value] = args;
        if (typeof key !== 'string' || key.length > 120) throw new Error('Chiave non valida');
        const data = readStore(); data[instance.id] ||= {}; data[instance.id][key] = clone(value); writeStore(data); return true;
      }
      case 'storage.remove': {
        requirePermission(instance, 'storage.local');
        const data = readStore(); if (data[instance.id]) delete data[instance.id][String(args[0])]; writeStore(data); return true;
      }
      case 'system.notify': {
        if (typeof args[0] !== 'string') throw new Error('Notifica non valida');
        const title = args[0].slice(0, 80), body = String(args[1] || '').slice(0, 300);
        const event = new CustomEvent('coreos:app-notification', { detail: { appId: instance.id, title, body } });
        window.dispatchEvent(event); return true;
      }
      case 'system.info': {
        requirePermission(instance, 'system.info');
        return { name: 'CoreOS', runtime: VERSION, online: navigator.onLine, language: navigator.language };
      }
      case 'files.list': {
        requirePermission(instance, 'files.read');
        return (await window.CoreOSFiles?.list?.() || []).filter(f => !f.trash).map(f => ({ id:f.id, name:f.name, type:f.type, size:f.size, created:f.created }));
      }
      case 'files.download': {
        requirePermission(instance, 'files.read');
        await window.CoreOSFiles?.download?.(Number(args[0])); return true;
      }
      case 'files.trash': {
        requirePermission(instance, 'files.write');
        return !!(await window.CoreOSFiles?.trash?.(Number(args[0])));
      }
      case 'downloads.save': {
        requirePermission(instance, 'downloads');
        const [name, data, mime='application/octet-stream'] = args;
        if (typeof name !== 'string' || name.length > 180 || typeof data !== 'string' || data.length > 12_000_000) throw new Error('Download non valido o troppo grande');
        const blob = new Blob([data], {type:String(mime).slice(0,120)});
        const url = URL.createObjectURL(blob), a = document.createElement('a');
        a.href=url; a.download=name.replace(/[\\/:*?"<>|]/g,'_'); a.click(); setTimeout(()=>URL.revokeObjectURL(url),1500); return true;
      }
      case 'network.fetch': {
        requirePermission(instance, 'network.weather');
        const url = new URL(String(args[0]));
        const allowed = ['api.open-meteo.com','geocoding-api.open-meteo.com'];
        if (url.protocol !== 'https:' || !allowed.includes(url.hostname)) throw new Error('Origine di rete non autorizzata');
        const response = await fetch(url.href, { method:'GET', mode:'cors', credentials:'omit', referrerPolicy:'no-referrer' });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return { status:response.status, data:await response.json() };
      }
      default: throw new Error('Metodo API non disponibile');
    }
  }
  function makeDocument(id, title, html, css, js, nonce) {
    const safeTitle = String(title || id).replace(/[<>&"]/g, '');
    const script = String(js || '').replace(/<\/script/gi, '<\\/script');
    const styles = String(css || '').replace(/<\/style/gi, '<\\/style');
    const body = String(html || '');
    const bootstrap = `
      (() => {
        'use strict';
        const channel = new MessageChannel();
        const pending = new Map(); let seq = 0;
        channel.port1.onmessage = event => {
          const m = event.data; if (m?.type !== 'response') return;
          const p = pending.get(m.id); if (!p) return; pending.delete(m.id);
          m.ok ? p.resolve(m.value) : p.reject(new Error(m.value));
        };
        const call = (method, ...args) => new Promise((resolve,reject) => {
          const id = ++seq; pending.set(id,{resolve,reject});
          channel.port1.postMessage({type:'request',id,method,args});
        });
        const CoreOS = Object.freeze({
          app: Object.freeze({id:${JSON.stringify(id)}, title:${JSON.stringify(safeTitle)}}),
          storage: Object.freeze({get:key=>call('storage.get',key),set:(key,value)=>call('storage.set',key,value),remove:key=>call('storage.remove',key)}),
          files: Object.freeze({list:()=>call('files.list'),download:id=>call('files.download',id),trash:id=>call('files.trash',id)}),
          downloads: Object.freeze({save:(name,data,mime)=>call('downloads.save',name,data,mime)}),
          network: Object.freeze({fetchJson:url=>call('network.fetch',url)}),
          system: Object.freeze({notify:(title,body)=>call('system.notify',title,body),info:()=>call('system.info')})
        });
        Object.defineProperty(window,'CoreOS',{value:CoreOS,writable:false,configurable:false});
        window.addEventListener('message', event => {
          if (event.data?.type === 'coreos:init' && event.ports?.[0]) {
            channel.port1.close(); channel.port2.close();
            const hostPort = event.ports[0];
            hostPort.onmessage = e => { const m=e.data; if(m?.type==='response'){const p=pending.get(m.id);if(p){pending.delete(m.id);m.ok?p.resolve(m.value):p.reject(new Error(m.value));}} };
            const oldCall = call;
            // Replace transport with the dedicated, unforgeable MessagePort.
            apiPort = hostPort;
            readyResolve();
          }
        });
        let apiPort = null, readyResolve;
        const ready = new Promise(resolve => { readyResolve=resolve; });
        const invoke = (method,...args) => ready.then(()=>new Promise((resolve,reject)=>{
          const id=++seq; pending.set(id,{resolve,reject}); apiPort.postMessage({type:'request',id,method,args});
        }));
        for (const group of ['storage','files','downloads','network','system']) {
          const target=CoreOS[group];
          for (const key of Object.keys(target)) Object.defineProperty(target,key,{value:(...args)=>invoke(group+'.'+key,...args)});
        }
        window.dispatchEvent(new Event('coreos:ready'));
      })();
      `;
    const csp = "default-src 'none'; img-src data: blob:; media-src blob: data:; style-src 'unsafe-inline'; script-src 'nonce-" + nonce + "'; connect-src 'none'; font-src data:; form-action 'none'; base-uri 'none'";
    return '<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="' + csp + '"><title>' + safeTitle + '</title><style nonce="' + nonce + '">html,body{margin:0;min-height:100%;font:14px system-ui;color:#e9edf5;background:#151922}body{padding:14px;box-sizing:border-box}button,input,textarea,select{font:inherit;max-width:100%}button{cursor:pointer}' + styles + '</style></head><body>' + body + '<script nonce="' + nonce + '">' + bootstrap + '<\/script><script nonce="' + nonce + '">' + script + '<\/script></body></html>';
  }
  function mount(options) {
    const id = safeId(options?.id);
    if (!id || !options.container) throw new Error('ID app e contenitore obbligatori');
    if (instances.has(id)) dispose(id);
    const declared = manifests[id]?.permissions || [];
    const requested = Array.isArray(options.permissions) ? options.permissions : declared;
    const allowed = new Set(declared);
    const permissions = new Set(requested.filter(p => allowed.has(p)));
    const frame = document.createElement('iframe');
    frame.title = 'CoreOS sandbox: ' + (options.title || id);
    frame.setAttribute('sandbox','allow-scripts');
    frame.setAttribute('referrerpolicy','no-referrer');
    frame.setAttribute('loading','lazy');
    frame.style.cssText='display:block;width:100%;height:100%;min-height:240px;border:0;background:#151922';
    const nonce = crypto.randomUUID().replace(/-/g,'');
    const instance = {id,frame,permissions,port:null,disposed:false};
    instances.set(id,instance);
    options.container.replaceChildren(frame);
    const channel = new MessageChannel(); instance.port=channel.port1;
    channel.port1.onmessage = async event => {
      const m=event.data; if(m?.type!=='request' || !Number.isInteger(m.id))return;
      try { const value=await handle(instance,m); respond(channel.port1,m.id,true,value); }
      catch(error){ respond(channel.port1,m.id,false,error); }
    };
    frame.srcdoc = makeDocument(id, options.title, options.html, options.css, options.js, nonce);
    frame.addEventListener('load',()=>{ if(!instance.disposed) frame.contentWindow.postMessage({type:'coreos:init'},'*',[channel.port2]); },{once:true});
    return Object.freeze({id,frame,dispose:()=>dispose(id),permissions:[...permissions]});
  }
  function dispose(id) {
    const instance=instances.get(safeId(id)); if(!instance)return false;
    instance.disposed=true; instance.port?.close(); instance.frame.remove(); instances.delete(instance.id); return true;
  }
  window.CoreOSSandbox = Object.freeze({version:VERSION, manifests, mount, dispose, list:()=>[...instances.keys()]});
  window.addEventListener('coreos:app-notification', event => {
    const {title,body}=event.detail||{};
    const toast=document.querySelector('.toast');
    if(toast){toast.textContent=body?title+': '+body:title;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),3200);}
  });
})();