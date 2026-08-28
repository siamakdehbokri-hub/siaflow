import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { getCorsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface Rule {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  type: string;
  category: string;
  subcategory: string | null;
  account_id: string | null;
  description: string | null;
  frequency: string;
  interval_count: number;
  start_date: string;
  end_date: string | null;
  next_run_date: string;
  is_active: boolean;
}

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseISO(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function advance(dateStr: string, frequency: string, interval: number): string {
  const d = parseISO(dateStr);
  const step = Math.max(1, interval || 1);
  switch (frequency) {
    case "daily":
      d.setUTCDate(d.getUTCDate() + step);
      break;
    case "weekly":
      d.setUTCDate(d.getUTCDate() + 7 * step);
      break;
    case "yearly":
      d.setUTCFullYear(d.getUTCFullYear() + step);
      break;
    case "monthly":
    default: {
      const day = d.getUTCDate();
      const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + step, 1));
      const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
      target.setUTCDate(Math.min(day, lastDay));
      return toISO(target);
    }
  }
  return toISO(d);
}

serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();

    let scopedUserId: string | null = null;
    if (token && token !== SERVICE_ROLE) {
      const { data, error } = await admin.auth.getUser(token);
      if (error || !data.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      scopedUserId = data.user.id;
    }

    const today = toISO(new Date());

    let query = admin
      .from("recurring_rules")
      .select("*")
      .eq("is_active", true)
      .lte("next_run_date", today)
      .limit(500);

    if (scopedUserId) query = query.eq("user_id", scopedUserId);

    const { data: rules, error: rulesError } = await query;
    if (rulesError) throw rulesError;

    let created = 0;
    const createdRules: { name: string; amount: number; type: string; user_id: string }[] = [];

    for (const rule of (rules || []) as Rule[]) {
      let cursor = rule.next_run_date < rule.start_date ? rule.start_date : rule.next_run_date;
      let guard = 0;
      const rows: Record<string, unknown>[] = [];

      while (cursor <= today && guard < 60) {
        if (rule.end_date && cursor > rule.end_date) break;
        rows.push({
          user_id: rule.user_id,
          amount: rule.amount,
          type: rule.type,
          category: rule.category,
          subcategory: rule.subcategory,
          description: rule.description || rule.name,
          date: cursor,
          is_recurring: true,
          recurring_rule_id: rule.id,
        });
        cursor = advance(cursor, rule.frequency, rule.interval_count);
        guard++;
      }

      if (rows.length > 0) {
        const { error: insertError } = await admin.from("transactions").insert(rows);
        if (insertError) {
          console.error("insert failed for rule", rule.id, insertError.message);
          continue;
        }
        created += rows.length;
        createdRules.push({ name: rule.name, amount: rule.amount, type: rule.type, user_id: rule.user_id });

        if (rule.account_id) {
          const total = rows.length * Number(rule.amount);
          const delta = rule.type === "income" ? total : -total;
          const { data: acc } = await admin
            .from("accounts")
            .select("balance")
            .eq("id", rule.account_id)
            .maybeSingle();
          if (acc) {
            await admin
              .from("accounts")
              .update({ balance: Number(acc.balance) + delta })
              .eq("id", rule.account_id);
          }
        }
      }

      const finished = !!rule.end_date && cursor > rule.end_date;
      await admin
        .from("recurring_rules")
        .update({
          next_run_date: cursor,
          last_run_date: rows.length > 0 ? today : rule.next_run_date,
          is_active: !finished,
        })
        .eq("id", rule.id);
    }

    // Notify users about auto-created transactions (best effort)
    if (createdRules.length > 0) {
      const byUser = new Map<string, number>();
      for (const r of createdRules) byUser.set(r.user_id, (byUser.get(r.user_id) || 0) + 1);
      for (const [userId, count] of byUser) {
        try {
          await fetch(`${SUPABASE_URL}/functions/v1/push`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${SERVICE_ROLE}`,
            },
            body: JSON.stringify({
              action: "notify",
              user_id: userId,
              title: "قبض تکرارشونده ثبت شد",
              body: `${count} تراکنش دوره‌ای به‌صورت خودکار ثبت شد.`,
              url: "/",
            }),
          });
        } catch (_) {
          // push is best effort
        }
      }
    }

    return new Response(JSON.stringify({ success: true, created, rules: rules?.length || 0 }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("run-recurring error", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
