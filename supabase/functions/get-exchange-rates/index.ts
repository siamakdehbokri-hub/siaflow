import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Cache rates for 30 minutes
let cachedRates: { usd_to_irr: number; usd_to_irt: number; timestamp: number; source: string } | null = null;
const CACHE_DURATION_MS = 30 * 60 * 1000;

// Source 1: fawazahmed0 currency-api via CDN (free, reliable, updates daily)
async function fetchFromCurrencyApi(): Promise<{ usd_to_irr: number; usd_to_irt: number }> {
  // Try latest first, then fallback URLs
  const urls = [
    "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
    "https://latest.currency-api.pages.dev/v1/currencies/usd.json",
  ];
  
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      if (!res.ok) continue;
      const data = await res.json();
      console.log("currency-api keys:", Object.keys(data));
      if (data?.usd?.irr) {
        const rialRate = data.usd.irr;
        console.log(`currency-api irr rate: ${rialRate}`);
        if (rialRate > 100000) {
          return { usd_to_irr: rialRate, usd_to_irt: rialRate / 10 };
        }
      }
    } catch (e) {
      console.log(`currency-api url ${url} error: ${e.message}`);
    }
  }
  throw new Error("currency-api: no IRR rate found");
}

// Source 2: exchangerate-api.com (global official rates)
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

// Source 3: open.er-api.com (free, no key)
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

    // Try sources in order - currency-api tends to have closer-to-market rates
    const sources = [
      { fn: fetchFromCurrencyApi, name: "currency-api" },
      { fn: fetchFromExchangeRateApi, name: "exchangerate-api" },
      { fn: fetchFromOpenER, name: "open.er-api" },
    ];

    for (const src of sources) {
      try {
        rates = await src.fn();
        source = src.name;
        console.log(`✅ Got rates from ${src.name}: ${rates.usd_to_irt} IRT (${rates.usd_to_irr} IRR)`);
        break;
      } catch (err) {
        console.log(`❌ ${src.name} failed: ${err.message}`);
      }
    }

    if (!rates) {
      rates = { usd_to_irr: 1590000, usd_to_irt: 159000 };
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
