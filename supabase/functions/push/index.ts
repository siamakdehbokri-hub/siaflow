import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import * as webpush from "https://esm.sh/jsr/@negrel/webpush@0.3.0";
import { getCorsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_KEYS_JSON = Deno.env.get("VAPID_KEYS_JSON")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:support@siaflow.app";

function rawPublicKey(): string {
  const jwk = JSON.parse(VAPID_KEYS_JSON).publicKey;
  const b64uToBytes = (s: string) => {
    const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "="));
    return Uint8Array.from(bin, (c) => c.charCodeAt(0));
  };
  const x = b64uToBytes(jwk.x);
  const y = b64uToBytes(jwk.y);
  const raw = new Uint8Array(65);
  raw[0] = 4;
  raw.set(x, 1);
  raw.set(y, 33);
  let bin = "";
  for (const b of raw) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

let appServer: Awaited<ReturnType<typeof webpush.ApplicationServer.new>> | null = null;
async function getServer() {
  if (!appServer) {
    const vapidKeys = await webpush.importVapidKeys(JSON.parse(VAPID_KEYS_JSON), { extractable: false });
    appServer = await webpush.ApplicationServer.new({
      contactInformation: VAPID_SUBJECT,
      vapidKeys,
    });
  }
  return appServer;
}

interface SubRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

async function sendToUser(
  admin: ReturnType<typeof createClient>,
  userId: string,
  payload: { title: string; body: string; url?: string },
) {
  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (!subs || subs.length === 0) return { sent: 0 };

  const server = await getServer();
  let sent = 0;

  for (const sub of subs as unknown as SubRow[]) {
    try {
      const subscriber = server.subscribe({
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      });
      await subscriber.pushTextMessage(JSON.stringify(payload), {});
      sent++;
    } catch (err) {
      const message = (err as Error).message || "";
      console.error("push failed", sub.endpoint.slice(0, 40), message);
      if (message.includes("410") || message.includes("404") || message.includes("gone")) {
        await admin.from("push_subscriptions").delete().eq("id", sub.id);
      }
    }
  }
  return { sent };
}

serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const action = (body as { action?: string }).action || new URL(req.url).searchParams.get("action") || "public-key";

    if (action === "public-key") {
      return json({ publicKey: rawPublicKey() });
    }

    const token = (req.headers.get("Authorization") || "").replace("Bearer ", "").trim();
    const isService = token === SERVICE_ROLE;

    if (action === "notify") {
      if (!isService) return json({ error: "Forbidden" }, 403);
      const { user_id, title, body: text, url } = body as Record<string, string>;
      if (!user_id || !title || !text) return json({ error: "Invalid payload" }, 400);
      const result = await sendToUser(admin, user_id, { title, body: text, url });
      return json({ success: true, ...result });
    }

    // User-scoped actions
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) return json({ error: "Unauthorized" }, 401);
    const userId = userData.user.id;

    if (action === "test") {
      const result = await sendToUser(admin, userId, {
        title: "SiaFlow",
        body: "نوتیفیکیشن آزمایشی با موفقیت دریافت شد ✓",
        url: "/",
      });
      return json({ success: true, ...result });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (error) {
    console.error("push error", error);
    return json({ error: (error as Error).message }, 500);
  }
});
