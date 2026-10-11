const { app, BrowserWindow, ipcMain, dialog, safeStorage, session, systemPreferences } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

if (!app.requestSingleInstanceLock()) app.quit();

let mainWindow;
let unlocked = false;
let state;
const touchSupported = () => process.platform === 'darwin' && systemPreferences.canPromptTouchID();
const MAX_AMOUNT = 900_000_000_000_000;
const pinPattern = /^\d{4}$/;

function filePath() { return path.join(app.getPath('userData'), 'finance-data.enc'); }
function secureAvailable() {
  if (!safeStorage.isEncryptionAvailable()) throw Error('ذخیره‌سازی امن سیستم عامل در دسترس نیست.');
}
function readState() {
  secureAvailable();
  const p = filePath();
  if (!fs.existsSync(p)) return { version: 1, account: null, transactions: [], budgets: {} };
  const raw = fs.readFileSync(p);
  try {
    const data = JSON.parse(safeStorage.decryptString(raw));
    if (data.version !== 1 || !Array.isArray(data.transactions) || typeof data.budgets !== 'object') throw Error('invalid');
    return data;
  } catch {
    throw Error('خواندن اطلاعات رمزگذاری‌شده ممکن نیست. اطلاعات حذف نشده‌اند.');
  }
}
function persist() {
  secureAvailable();
  const file = filePath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = file + '.tmp';
  fs.writeFileSync(temp, safeStorage.encryptString(JSON.stringify(state)), { mode: 0o600 });
  fs.renameSync(temp, file);
}
function requireUnlock() { if (!unlocked) throw Error('برنامه قفل است.'); }
function newHash(pin, salt) {
  return crypto.scryptSync(pin, Buffer.from(salt, 'base64'), 32).toString('base64');
}
function checkPin(pin) {
  if (!pinPattern.test(pin)) return false;
  const actual = Buffer.from(newHash(pin, state.account.salt), 'base64');
  const expected = Buffer.from(state.account.hash, 'base64');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}
function cleanTransaction(t) {
  if (!t || !['income','expense'].includes(t.type) || !Number.isSafeInteger(t.amount) || t.amount <= 0 || t.amount > MAX_AMOUNT) throw Error('مبلغ یا نوع تراکنش نامعتبر است.');
  if (typeof t.category !== 'string' || !t.category.trim() || t.category.length > 90) throw Error('دسته‌بندی نامعتبر است.');
  if (typeof t.description !== 'string' || t.description.length > 600) throw Error('طول توضیحات بیش از حد مجاز است.');
  if (typeof t.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(t.date) || Number.isNaN(Date.parse(t.date + 'T12:00:00Z'))) throw Error('تاریخ نامعتبر است.');
  return { type: t.type, amount: t.amount, category: t.category.trim(), description: t.description, date: t.date };
}
function guarded(handler) {
  return async (_event, ...args) => {requireUnlock(); return handler(...args);};
}

app.whenReady().then(() => {
  state = readState();
  // The standalone desktop distribution has no server/API or permission to navigate to remote origins.
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    callback({ cancel: /^(https?|wss?):/i.test(details.url) });
  });
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  mainWindow = new BrowserWindow({
    width: 1060, height: 760, minWidth: 380, minHeight: 580,
    autoHideMenuBar: true,
    show: false,
    backgroundColor: '#11131f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    }
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({action:'deny'}));
  mainWindow.webContents.on('will-navigate', event => event.preventDefault());
  mainWindow.on('minimize',()=>{unlocked=false;mainWindow.webContents.send('siaflow:locked')});
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.loadFile(path.join(__dirname, '..', 'dist-desktop', 'index.html')).catch(err => {
    dialog.showErrorBox('Siaflow', 'خطا در بارگذاری رابط برنامه: ' + err.message);
  });
  mainWindow.on('closed', () => { unlocked = false; mainWindow = null; });

  ipcMain.handle('siaflow:status', () => ({ hasAccount: Boolean(state.account), name: state.account?.name ?? '', touchSupported: touchSupported(), touchEnabled: Boolean(state.account?.touchEnabled) }));
  ipcMain.handle('siaflow:setup', (_event, name, pin) => {
    if (state.account) throw Error('حساب محلی از قبل ساخته شده است.');
    if (typeof name !== 'string' || !name.trim() || name.length > 80 || !pinPattern.test(pin)) throw Error('نام یا PIN نامعتبر است.');
    const salt = crypto.randomBytes(32).toString('base64');
    state.account = { name: name.trim(), salt, hash: newHash(pin,salt), failed:0, lockedUntil:0, touchEnabled:false };
    persist(); unlocked = true;
    return {name: state.account.name};
  });
  ipcMain.handle('siaflow:unlock', (_event,pin) => {
    if (!state.account) throw Error('ابتدا حساب بسازید.');
    if (Date.now() < state.account.lockedUntil) throw Error('تلاش زیاد؛ یک دقیقه بعد دوباره امتحان کنید.');
    const ok = checkPin(pin);
    state.account.failed = ok ? 0 : state.account.failed + 1;
    state.account.lockedUntil = !ok && state.account.failed >= 5 ? Date.now() + 60_000 : 0;
    if (state.account.failed >= 5) state.account.failed = 0;
    persist();
    unlocked = ok;
    return ok;
  });
  ipcMain.handle('siaflow:touchEnable', guarded(async () => {
    if (!touchSupported()) throw Error('Touch ID unavailable');
    await systemPreferences.promptTouchID('Enable Touch ID for Siaflow');
    state.account.touchEnabled=true;persist();return true;
  }));
  ipcMain.handle('siaflow:touchUnlock', async () => {
    if (!touchSupported() || !state.account?.touchEnabled) throw Error('Touch ID not enabled');
    await systemPreferences.promptTouchID('Unlock Siaflow');
    unlocked=true;return true;
  });
  ipcMain.handle('siaflow:lock', () => {unlocked=false; return true;});
  ipcMain.handle('siaflow:list', guarded(() => state.transactions.slice().sort((a,b)=>b.date.localeCompare(a.date))));
  ipcMain.handle('siaflow:add', guarded(t => {
    const transaction = { id:crypto.randomUUID(), ...cleanTransaction(t) };
    state.transactions.push(transaction); persist(); return transaction.id;
  }));
  ipcMain.handle('siaflow:update', guarded((id,t) => {
    const index = state.transactions.findIndex(r=>r.id===id);
    if (index < 0) throw Error('تراکنش یافت نشد.');
    state.transactions[index] = { id, ...cleanTransaction(t) }; persist(); return true;
  }));
  ipcMain.handle('siaflow:remove', guarded(id => {
    const length=state.transactions.length; state.transactions=state.transactions.filter(t=>t.id!==id);
    if(state.transactions.length===length) throw Error('تراکنش یافت نشد.');
    persist(); return true;
  }));
  ipcMain.handle('siaflow:budgets', guarded(() => ({...state.budgets})));
  ipcMain.handle('siaflow:setBudget', guarded((category,amount) => {
    if (typeof category!=='string'||!category.trim()||category.length>90||!Number.isSafeInteger(amount)||amount<0||amount>MAX_AMOUNT) throw Error('بودجه نامعتبر است.');
    if(amount===0) delete state.budgets[category.trim()];
    else state.budgets[category.trim()]=amount;
    persist();return true;
  }));
  ipcMain.handle('siaflow:changePin', guarded((oldPin,newPin) => {
    if (!checkPin(oldPin) || !pinPattern.test(newPin)) throw Error('PIN نامعتبر است.');
    const salt=crypto.randomBytes(32).toString('base64');
    state.account.salt=salt; state.account.hash=newHash(newPin,salt);persist();return true;
  }));
  ipcMain.handle('siaflow:export', guarded(async password => {
    if (typeof password !== 'string' || password.length < 12 || password.length > 256) throw Error('گذرواژه بکاپ باید حداقل ۱۲ کاراکتر باشد.');
    const { canceled, filePath: dest }=await dialog.showSaveDialog(mainWindow, {
      title:'پشتیبان رمزگذاری‌شده Siaflow',
      defaultPath:'siaflow-backup.sfb',
      filters:[{name:'Siaflow backup',extensions:['sfb']}]
    });
    if (canceled || !dest) return false;
    const salt=crypto.randomBytes(16), iv=crypto.randomBytes(12);
    const key=crypto.scryptSync(password,salt,32);
    const cipher=crypto.createCipheriv('aes-256-gcm',key,iv);
    const data=Buffer.concat([cipher.update(JSON.stringify(state)),cipher.final()]);
    const wrapped={version:1,salt:salt.toString('base64'),iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),ciphertext:data.toString('base64')};
    fs.writeFileSync(dest,JSON.stringify(wrapped),{flag:'wx',mode:0o600});
    return true;
  }));
  ipcMain.handle('siaflow:import', guarded(async password => {
    if (typeof password !== 'string' || password.length < 12) throw Error('گذرواژه بکاپ لازم است.');
    const {canceled,filePaths}=await dialog.showOpenDialog(mainWindow,{
      title:'بازیابی پشتیبان Siaflow',properties:['openFile'],filters:[{name:'Siaflow backup',extensions:['sfb']}]
    });
    if(canceled || !filePaths?.length) return false;
    const stat=fs.statSync(filePaths[0]);if(stat.size>25*1024*1024)throw Error('فایل بیش از حد بزرگ است.');
    const backup=JSON.parse(fs.readFileSync(filePaths[0],'utf8'));
    if(backup.version!==1)throw Error('نسخه بکاپ پشتیبانی نمی‌شود.');
    const decipher=crypto.createDecipheriv('aes-256-gcm',crypto.scryptSync(password,Buffer.from(backup.salt,'base64'),32),Buffer.from(backup.iv,'base64'));
    decipher.setAuthTag(Buffer.from(backup.tag,'base64'));
    const data=JSON.parse(Buffer.concat([decipher.update(Buffer.from(backup.ciphertext,'base64')),decipher.final()]).toString('utf8'));
    if(data.version!==1||!data.account||!data.account.hash||!data.account.salt||!Array.isArray(data.transactions)||!data.budgets)throw Error('محتوای بکاپ نامعتبر است.');
    for(const t of data.transactions) cleanTransaction(t);
    const prior=state;state=data;try{persist();}catch(e){state=prior;throw e;}
    unlocked=false;
    return true;
  }));
}).catch(err=>{dialog.showErrorBox('Siaflow',err.message);app.quit();});

app.on('window-all-closed',()=>{unlocked=false;app.quit();});
