import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Cache rates for 30 minutes
let cachedRates: { usd_to_irr: number; usd_to_irt: number; timestamp: number; source: string } | null = null;
const CACHE_DURATION_MS = 30 * 60 * 1000;

// Source 1: exchangerate-api.com (free, reliable, no key needed)
async function fetchFromExchangeRateApi(): Promise<{ usd_to_irr: number; usd_to_irt: number }> {
  const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD", {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) throw new Error(`exchangerate-api status ${res.status}`);
  const data = await res.json();
  if (data?.rates?.IRR) {
    const rialRate = data.rates.IRR;
    if (rialRate > 100000) {
      return { usd_to_irr: rialRate, usd_to_irt: rialRate / 10 };
    }
  }
  throw new Error("exchangerate-api: no IRR rate");
}

// Source 2: open.er-api.com (free, no key)
async function fetchFromOpenER(): Promise<{ usd_to_irr: number; usd_to_irt: number }> {
  const res = await fetch("https://open.er-api.com/v6/latest/USD", {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) throw new Error(`open.er-api status ${res.status}`);
  const data = await res.json();
  if (data?.rates?.IRR) {
    const rialRate = data.rates.IRR;
    if (rialRate > 100000) {
      return { usd_to_irr: rialRate, usd_to_irt: rialRate / 10 };
    }
  }
  throw new Error("open.er-api: no IRR rate");
}

// Source 3: fawazahmed0 currency-api (free, GitHub-hosted, reliable)
async function fetchFromCurrencyApi(): Promise<{ usd_to_irr: number; usd_to_irt: number }> {
  const res = await fetch("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json", {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) throw new Error(`currency-api status ${res.status}`);
  const data = await res.json();
  if (data?.usd?.irr) {
    const rialRate = data.usd.irr;
    if (rialRate > 100000) {
      return { usd_to_irr: rialRate, usd_to_irt: rialRate / 10 };
    }
  }
  throw new Error("currency-api: no IRR rate");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Try multiple sources in order of reliability
    const sources = [
      { fn: fetchFromExchangeRateApi, name: "exchangerate-api" },
      { fn: fetchFromOpenER, name: "open.er-api" },
      { fn: fetchFromCurrencyApi, name: "currency-api" },
    ];

    for (const src of sources) {
      try {
        rates = await src.fn();
        source = src.name;
        console.log(`✅ Got rates from ${src.name}: ${rates.usd_to_irt} IRT`);
        break;
      } catch (err) {
        console.log(`❌ ${src.name} failed: ${err.message}`);
      }
    }

    if (!rates) {
      // Last resort fallback
      rates = { usd_to_irr: 850000, usd_to_irt: 85000 };
      source = "fallback";
      console.log("⚠️ All sources failed, using fallback rate");
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
