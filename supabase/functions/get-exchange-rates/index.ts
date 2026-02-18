import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Cache rates for 30 minutes
let cachedRates: { usd_to_irr: number; usd_to_irt: number; timestamp: number; source: string } | null = null;
const CACHE_DURATION_MS = 30 * 60 * 1000;

// Manual override rate (Iranian free market rate - update periodically)
const MANUAL_MARKET_RATE_IRT = 158280;
const MANUAL_MARKET_RATE_IRR = MANUAL_MARKET_RATE_IRT * 10;

// Source 1: fawazahmed0 currency-api via CDN
async function fetchFromCurrencyApi(): Promise<{ usd_to_irr: number; usd_to_irt: number }> {
  const urls = [
    "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
    "https://latest.currency-api.pages.dev/v1/currencies/usd.json",
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!res.ok) continue;
      const data = await res.json();
      if (data?.usd?.irr) {
        const rialRate = data.usd.irr;
        if (rialRate > 100000) {
          // Check if rate is close to market rate (within 50%) - if too far off, it's official rate
          const ratio = rialRate / MANUAL_MARKET_RATE_IRR;
          if (ratio > 0.85 && ratio < 1.15) {
            return { usd_to_irr: rialRate, usd_to_irt: rialRate / 10 };
          }
          console.log(`currency-api rate ${rialRate} too far from market rate ${MANUAL_MARKET_RATE_IRR}, using manual`);
        }
      }
    } catch (e) {
      console.log(`currency-api error: ${e.message}`);
    }
  }
  throw new Error("currency-api: no accurate rate");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Accept manual rate update via POST (requires auth)
    if (req.method === "POST") {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      try {
        const body = await req.json();
        const rate = Number(body?.usd_to_irt);
        if (!rate || !isFinite(rate) || rate < 10000 || rate > 10000000) {
          return new Response(JSON.stringify({ error: "Invalid rate value" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        cachedRates = {
          usd_to_irr: rate * 10,
          usd_to_irt: rate,
          timestamp: Date.now(),
          source: "manual",
        };
        return new Response(JSON.stringify({
          usd_to_irr: cachedRates.usd_to_irr,
          usd_to_irt: cachedRates.usd_to_irt,
          source: "manual",
          cached: false,
          updated_at: new Date().toISOString(),
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify({ error: "Invalid request body" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Return cached rates if fresh
    if (cachedRates && Date.now() - cachedRates.timestamp < CACHE_DURATION_MS) {
      return new Response(JSON.stringify({
        usd_to_irr: cachedRates.usd_to_irr,
        usd_to_irt: cachedRates.usd_to_irt,
        source: cachedRates.source,
        cached: true,
        updated_at: new Date(cachedRates.timestamp).toISOString(),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let rates: { usd_to_irr: number; usd_to_irt: number } | null = null;
    let source = "";

    // Try API first
    try {
      rates = await fetchFromCurrencyApi();
      source = "currency-api";
      console.log(`✅ Got rates from currency-api: ${rates.usd_to_irt} IRT`);
    } catch (err) {
      console.log(`❌ currency-api failed: ${err.message}`);
    }

    // Use manual Iranian market rate as primary fallback
    if (!rates) {
      rates = { usd_to_irr: MANUAL_MARKET_RATE_IRR, usd_to_irt: MANUAL_MARKET_RATE_IRT };
      source = "بازار آزاد ایران";
      console.log(`📌 Using manual market rate: ${MANUAL_MARKET_RATE_IRT} IRT`);
    }

    cachedRates = { ...rates, timestamp: Date.now(), source };

    return new Response(JSON.stringify({
      usd_to_irr: rates.usd_to_irr,
      usd_to_irt: rates.usd_to_irt,
      source,
      cached: false,
      updated_at: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Exchange rate error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch rates" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
