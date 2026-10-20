# Siaflow Android Offline — prototype milestone

Branch: android-offline. Main/web version remains untouched.

Implemented: Capacitor setup, native-only React screen, local single-account four-digit PIN enrollment, PBKDF2 salted PIN check, temporary five-attempt lockout, encrypted SQLite via native plugin secret, optional biometric unlock (prototype, not production-grade binding), local income/expense transaction storage.

Build on a computer with Node, Android Studio, Android SDK:
- npm install
- npm run build
- npm run android:add
- npm run android:sync
- npm run android:open

Android project and APK are **not generated yet**. Dependencies and compatibility must be verified with npm install and Android build.

Limitations: prototype is not a full port of the finance app. PIN is low-entropy; app-level lockout is insufficient against attackers with device/root access. Biometric setting is currently in-memory and resets after restarting the app. Native biometric cryptographic gating and recovery/backup are pending. The existing expense/debt/goals/report hooks remain Supabase-backed and must not be used from the offline screen. Clearing app storage or uninstalling can lose local data. Before release: disable Android system backup for sensitive data, add encrypted export/restore, migrate all screens, run native tests and check airplane-mode behavior. Web assets bundled in the app must also be audited for accidental network requests. The package-lock needs regeneration and Android platform folder needs creation by Capacitor.
