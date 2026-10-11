import { useEffect, useState } from 'react';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { hasAccount, setup, unlock, getName } from './auth';
import { getDatabase, addTransaction, listTransactions, removeTransaction, type OfflineTransaction } from './database';
import { validPin } from './pin';

type Page='boot'|'setup'|'login'|'home';
export default function OfflineApp() {
 const [page,setPage]=useState<Page>('boot');
 const [name,setName]=useState('');
 const [pin,setPin]=useState('');
 const [confirm,setConfirm]=useState('');
 const [bio,setBio]=useState(false);
 const [error,setError]=useState('');
 const [rows,setRows]=useState<OfflineTransaction[]>([]);
 const [category,setCategory]=useState('');
 const [amount,setAmount]=useState('');
 const [type,setType]=useState<'income'|'expense'>('expense');
 const [busy,setBusy]=useState(false);
 useEffect(()=>{(async()=>{await getDatabase(); const exists=await hasAccount(); if(exists){setName(await getName());setPage('login');}else setPage('setup');})().catch(e=>setError(String(e)));},[]);
 async function enroll(){if(!validPin(pin)||pin!==confirm){setError('PIN باید چهار رقم یکسان باشد');return;}setBusy(true);try{await setup(name,pin);setPin('');setPage('home');}catch(e){setError(String(e));}finally{setBusy(false);}}
 async function login(){setBusy(true);try{if(await unlock(pin)){await refresh();setPage('home');}else setError('رمز اشتباه است');setPin('');}catch(e){setError(String(e));}finally{setBusy(false);}}
 async function refresh(){setRows(await listTransactions());}
 async function activateBio(){try{const r=await NativeBiometric.isAvailable();if(!r.isAvailable)throw Error('حسگر آماده نیست');await NativeBiometric.verifyIdentity({reason:'فعال‌سازی اثر انگشت',title:'Siaflow'});setBio(true);}catch(e){setError(String(e));}}
 async function save(){setBusy(true);try{await addTransaction({amount:Number(amount),category,type,description:'',date:new Date().toISOString().slice(0,10)});setAmount('');setCategory('');await refresh();}catch(e){setError(String(e));}finally{setBusy(false);}}
 const field='block w-full p-3 rounded-xl border border-border bg-background text-foreground';
 const button='p-3 w-full bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-40';
 return <main className="min-h-screen bg-background text-foreground p-5" dir="rtl"><div className="max-w-md mx-auto space-y-4">
 <header className="text-center py-6"><h1 className="text-3xl font-black">Siaflow Offline</h1><p className="text-muted-foreground">کاملاً بدون اینترنت</p></header>
 {page==='boot'&&<p>در حال آماده‌سازی پایگاه داده محلی...</p>}
 {page==='setup'&&<section className="space-y-3"><h2>حساب محلی بسازید</h2><input className={field} placeholder="نام" value={name} onChange={e=>setName(e.target.value)}/><input className={field} placeholder="PIN چهاررقمی" type="password" inputMode="numeric" maxLength={4} value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,'').slice(0,4))}/><input className={field} placeholder="تکرار PIN" type="password" inputMode="numeric" maxLength={4} value={confirm} onChange={e=>setConfirm(e.target.value.replace(/\D/g,'').slice(0,4))}/><button className={button} disabled={busy} onClick={enroll}>ساخت حساب</button></section>}
 {page==='login'&&<section className="space-y-3"><h2>سلام {name}</h2><input className={field} aria-label="PIN ورود" placeholder="PIN چهاررقمی" type="password" inputMode="numeric" maxLength={4} value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,'').slice(0,4))}/><button className={button} disabled={busy||pin.length!==4} onClick={login}>ورود</button>{bio&&<button className={button} onClick={async()=>{try{await NativeBiometric.verifyIdentity({reason:'ورود به Siaflow',title:'Siaflow'});await refresh();setPage('home');}catch(e){setError(String(e));}}}>اثر انگشت</button>}</section>}
 {page==='home'&&<section className="space-y-4"><div className="flex justify-between"><h2>سلام {name}</h2><button onClick={()=>{setPin('');setPage('login');}}>قفل برنامه</button></div>{!bio&&<button className={button} onClick={activateBio}>فعال‌کردن اثر انگشت</button>}<h3>ثبت تراکنش</h3><select className={field} value={type} onChange={e=>setType(e.target.value as 'income'|'expense')}><option value="expense">هزینه</option><option value="income">درآمد</option></select><input className={field} placeholder="مبلغ به تومان (عدد صحیح)" inputMode="numeric" value={amount} onChange={e=>setAmount(e.target.value.replace(/\D/g,''))}/><input className={field} placeholder="دسته‌بندی" value={category} onChange={e=>setCategory(e.target.value)}/><button className={button} disabled={busy} onClick={save}>ذخیره در گوشی</button><h3>تراکنش‌های محلی</h3>{rows.map(t=><div key={t.id} className="p-3 rounded-xl border flex justify-between"><span>{t.category}: {t.amount.toLocaleString('fa-IR')} تومان</span><button onClick={async()=>{await removeTransaction(t.id);await refresh();}}>حذف</button></div>)}</section>}
 {error&&<p className="text-destructive" role="alert">{error}</p>}
 </div></main>;
}
