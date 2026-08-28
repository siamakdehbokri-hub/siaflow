const ALLOWED_ORIGINS = [
  'https://siaflow.lovable.app',
  'https://id-preview--b0641f68-27b4-4098-b46f-fab1a6247e46.lovable.app',
  'http://localhost:8080',
  'http://localhost:3000',
  'http://localhost:5173',
];

export function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  try {
    const { hostname, protocol } = new URL(origin);
    return protocol === 'https:' && (
      hostname.endsWith('.lovable.app') ||
      hostname.endsWith('.lovableproject.com') ||
      hostname.endsWith('.lovable.dev')
    );
  } catch {
    return false;
  }
}

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') || '';
  const allowedOrigin = isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Vary': 'Origin',
  };
}
