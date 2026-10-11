const {contextBridge,ipcRenderer}=require('electron');
const send=(action,...args)=>ipcRenderer.invoke('siaflow:'+action,...args);
contextBridge.exposeInMainWorld('siaflowDesktop',Object.freeze({
 status:()=>send('status'),setup:(name,pin)=>send('setup',name,pin),unlock:pin=>send('unlock',pin),touchUnlock:()=>send('touchUnlock'),touchEnable:()=>send('touchEnable'),lock:()=>send('lock'),
 list:()=>send('list'),add:item=>send('add',item),update:(id,item)=>send('update',id,item),remove:id=>send('remove',id),
 budgets:()=>send('budgets'),setBudget:(category,amount)=>send('setBudget',category,amount),changePin:(a,b)=>send('changePin',a,b),
 exportBackup:pass=>send('export',pass),importBackup:pass=>send('import',pass),
 onLock:fn=>{const listener=()=>fn();ipcRenderer.on('siaflow:locked',listener);return()=>ipcRenderer.removeListener('siaflow:locked',listener)}
}));