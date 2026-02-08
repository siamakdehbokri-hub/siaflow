import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Cache rates for 30 minutes
let cachedRates: { usd_to_irr: number; usd_to_irt: number; timestamp: number } | null = null;
const CACHE_DURATION_MS = 30 * 60 * 1000;

async function fetchRatesFromTgju(): Promise<{ usd_to_irr: number; usd_to_irt: number }> {
  // Try tgju.org (Iranian financial data)
  const res = await fetch("https://api.tgju.org/v1/data/sana/json", {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  
  if (res.ok) {
    const data = await res.json();
    // tgju returns rates in Rial
    if (data?.spidr_summary?.items?.["price_dollar_rl"]?.p) {
      const rialRate = parseFloat(data.spidr_summary.items["price_dollar_rl"].p.replace(/,/g, ""));
      if (!isNaN(rialRate) && rialRate > 0) {
        return { usd_to_irr: rialRate, usd_to_irt: rialRate / 10 };
      }
    }
  }
  
  throw new Error("tgju failed");
}

async function fetchRatesFromOpenER(): Promise<{ usd_to_irr: number; usd_to_irt: number }> {
  // Fallback: open.er-api.com (free, no key)
  const res = await fetch("https://open.er-api.com/v6/latest/USD");
  if (res.ok) {
    const data = await res.json();
    if (data?.rates?.IRR) {
      const rialRate = data.rates.IRR;
      return { usd_to_irr: rialRate, usd_to_irt: rialRate / 10 };
    }
  }
  throw new Error("open.er-api failed");
}

async function fetchRatesFromBonbastScrape(): Promise<{ usd_to_irr: number; usd_to_irt: number }> {
  // Try fetching bonbast page and extracting USD rate
  const res = await fetch("https://www.bonbast.com/", {
    headers: { 
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "text/html",
    },
  });
  
  if (res.ok) {
    const html = await res.text();
    // Look for USD sell rate pattern in the HTML
    const match = html.match(/USD.*?(\d{2,3},?\d{3})/s);
    if (match) {
      const tomanRate = parseInt(match[1].replace(/,/g, ""));
      if (!isNaN(tomanRate) && tomanRate > 10000) {
        return { usd_to_irr: tomanRate * 10, usd_to_irt: tomanRate };
      }
    }
  }
  throw new Error("bonbast scrape failed");
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
        cached: true,
        updated_at: new Date(cachedRates.timestamp).toISOString(),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let rates: { usd_to_irr: number; usd_to_irt: number } | null = null;
    let source = "";

    // Try multiple sources in order
    try {
      rates = await fetchRatesFromTgju();
      source = "tgju";
    } catch {
      console.log("tgju failed, trying bonbast scrape...");
      try {
        rates = await fetchRatesFromBonbastScrape();
        source = "bonbast";
      } catch {
        console.log("bonbast failed, trying open.er-api...");
        try {
          rates = await fetchRatesFromOpenER();
          source = "open.er-api";
        } catch {
          console.log("all sources failed");
        }
      }
    }

    if (!rates) {
      // Fallback hardcoded approximate rate
      rates = { usd_to_irr: 1620000, usd_to_irt: 162000 };
      source = "fallback";
    }

    cachedRates = { ...rates, timestamp: Date.now() };

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
