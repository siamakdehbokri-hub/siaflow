/**
 * Encrypted SQLCipher database for native Android.
 * Database key is 256-bit random and lives in the plugin's native secure store,
 * never in localStorage or derived directly from the four-digit PIN.
 */
import { CapacitorSQLite, SQLiteConnection, type SQLiteDBConnection } from '@capacitor-community/sqlite';
import { randomBase64 } from './pin';

export type OfflineTransaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
};

const sqlite = new SQLiteConnection(CapacitorSQLite);
let connection: Promise<SQLiteDBConnection> | null = null;

async function openDatabase(): Promise<SQLiteDBConnection> {
  const encryption = await sqlite.isInConfigEncryption();
  if (!encryption.result) throw new Error('رمزگذاری دیتابیس اندروید فعال نیست.');
  const secret = await sqlite.isSecretStored();
  if (!secret.result) {
    await sqlite.setEncryptionSecret(randomBase64(32));
  }
  const db = await sqlite.createConnection('siaflow_offline', true, 'secret', 1, false);
  await db.open();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      amount INTEGER NOT NULL CHECK(amount > 0),
      category TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
  `);
  return db;
}

export function getDatabase(): Promise<SQLiteDBConnection> {
  if (!connection) {
    connection = openDatabase().catch(error => {
      connection = null;
      throw error;
    });
  }
  return connection;
}

export async function listTransactions(): Promise<OfflineTransaction[]> {
  const db = await getDatabase();
  const result = await db.query(
    'SELECT id, type, amount, category, description, date FROM transactions ORDER BY date DESC, created_at DESC LIMIT 500'
  );
  return (result.values ?? []) as OfflineTransaction[];
}

export async function addTransaction(
  data: Omit<OfflineTransaction, 'id'>
): Promise<void> {
  if (!Number.isSafeInteger(data.amount) || data.amount <= 0) {
    throw new Error('مبلغ باید عدد صحیح مثبت باشد.');
  }
  if (!data.category.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    throw new Error('دسته‌بندی یا تاریخ معتبر نیست.');
  }
  const db = await getDatabase();
  await db.run(
    'INSERT INTO transactions (id, type, amount, category, description, date) VALUES (?, ?, ?, ?, ?, ?)',
    [crypto.randomUUID(), data.type, data.amount, data.category.trim(), data.description.trim(), data.date],
  );
}

export async function removeTransaction(id: string): Promise<void> {
  const db = await getDatabase();
  await db.run('DELETE FROM transactions WHERE id = ?', [id]);
}
