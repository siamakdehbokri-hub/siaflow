# Siaflow macOS Offline

Independent native macOS application (Electron) using local encrypted file storage via Electron safeStorage, a four-digit local PIN, optional Touch ID, transactions, categories, budgets, and encrypted import/export.

## Build
Run `npm install`, then `npm run mac:package` on macOS.

GitHub Actions on branch `mac-offline` builds unsigned macOS DMG and ZIP installers for Apple Silicon and Intel.

## Security and limitations
The app operates offline and blocks HTTP(s) requests from its webview. It does not connect to Supabase.
Financial data is stored in the macOS application data directory using safeStorage encryption. Data is not synced across machines automatically.
Four-digit PINs have limited entropy. This is a prototype, not independently audited financial software.
The unsigned builds are not notarized by Apple and may trigger macOS Gatekeeper warnings.
Backups require a separate password of at least 12 characters, and restoring a backup replaces local data.
The existing full Siaflow web feature set has not been ported; debt management, recurring rules, advanced AI reporting and receipt scanning remain outside this initial Mac build.
