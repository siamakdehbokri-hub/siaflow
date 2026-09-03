// Single source of truth for the app version across the whole system.
export const APP_VERSION = '2.1.0';

// Persian-digit version string for UI display.
export const APP_VERSION_FA = APP_VERSION.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
