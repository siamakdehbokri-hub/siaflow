import { getDatabase } from './database';
import { derivePinHash, pinMatches, randomBase64, validPin } from './pin';
export async function hasAccount() {
 const db = await getDatabase();
 await db.execute("CREATE TABLE IF NOT EXISTS local_account (id INTEGER PRIMARY KEY CHECK(id=1), name TEXT NOT NULL, salt TEXT NOT NULL, hash TEXT NOT NULL, failed INTEGER NOT NULL DEFAULT 0, locked_until INTEGER NOT NULL DEFAULT 0)");
 const r = await db.query("SELECT id FROM local_account WHERE id=1");
 return Boolean(r.values?.length);
}
export async function setup(name: string, pin: string) {
 if (!name.trim() || !validPin(pin)) throw Error("نام یا رمز نامعتبر است");
 if (await hasAccount()) throw Error("حساب از قبل وجود دارد");
 const salt = randomBase64();
 const db = await getDatabase();
 await db.run("INSERT INTO local_account(id,name,salt,hash) VALUES(1,?,?,?)",[name.trim(),salt,await derivePinHash(pin,salt)]);
}
export async function getName() {
 const db=await getDatabase(); const r=await db.query("SELECT name FROM local_account WHERE id=1");
 return String(r.values?.[0]?.name ?? "");
}
export async function unlock(pin: string) {
 const db=await getDatabase();
 const r=await db.query("SELECT salt,hash,failed,locked_until FROM local_account WHERE id=1");
 const a=r.values?.[0]; if (!a) return false;
 if (Date.now()<a.locked_until) throw Error("ورود موقتاً قفل شده است");
 const correct=await pinMatches(pin,a.salt,a.hash);
 const failures=correct?0:Number(a.failed)+1;
 await db.run("UPDATE local_account SET failed=?,locked_until=? WHERE id=1",[failures>=5?0:failures,!correct && failures>=5?Date.now()+60000:0]);
 return correct;
}
