import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transactions, categories, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating AI report for type:", type);

    // Calculate summary stats
    const totalIncome = transactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    // Group expenses by category
    const categoryExpenses: Record<string, number> = {};
    transactions
      .filter((t: any) => t.type === 'expense')
      .forEach((t: any) => {
        categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
      });

    // Sort categories by spending
    const topCategories = Object.entries(categoryExpenses)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }));

    // Build system prompt for Persian financial assistant
    const systemPrompt = `تو یک مشاور مالی هوشمند هستی که به فارسی صحبت می‌کنی. 
وظیفه تو تحلیل داده‌های مالی کاربر و ارائه پیشنهادهای کاربردی برای بهبود مدیریت مالی است.
پاسخ‌هایت باید:
- مختصر و مفید باشد (حداکثر ۳۰۰ کلمه)
- شامل پیشنهادهای عملی باشد
- از ایموجی‌های مناسب استفاده کن
- لحن دوستانه و انگیزشی داشته باش`;

    let userPrompt = "";

    if (type === "summary") {
      userPrompt = `خلاصه مالی ماه کاربر:
- مجموع درآمد: ${totalIncome.toLocaleString()} تومان
- مجموع هزینه: ${totalExpense.toLocaleString()} تومان  
- تراز: ${(totalIncome - totalExpense).toLocaleString()} تومان
- تعداد تراکنش: ${transactions.length}

دسته‌بندی‌های پرهزینه:
${topCategories.map((c, i) => `${i + 1}. ${c.name}: ${c.amount.toLocaleString()} تومان`).join('\n')}

لطفاً یک تحلیل کوتاه از وضعیت مالی ارائه بده و ۳ پیشنهاد برای بهبود ارائه کن.`;
    } else if (type === "savings") {
      userPrompt = `داده‌های مالی:
- درآمد ماهانه: ${totalIncome.toLocaleString()} تومان
- هزینه ماهانه: ${totalExpense.toLocaleString()} تومان
- نرخ پس‌انداز: ${totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0}%

دسته‌بندی‌های پرهزینه:
${topCategories.map((c, i) => `${i + 1}. ${c.name}: ${c.amount.toLocaleString()} تومان`).join('\n')}

لطفاً پیشنهادهای عملی برای صرفه‌جویی ارائه بده و بگو کاربر در کدام دسته‌ها می‌تواند کمتر خرج کند.`;
    } else if (type === "budget") {
      userPrompt = `بودجه‌های تعیین شده و میزان مصرف:
${categories
  .filter((c: any) => c.budget)
  .map((c: any) => `- ${c.name}: ${(c.spent || 0).toLocaleString()} از ${c.budget.toLocaleString()} تومان (${c.budget > 0 ? Math.round(((c.spent || 0) / c.budget) * 100) : 0}%)`)
  .join('\n')}

لطفاً وضعیت بودجه‌ها را تحلیل کن و اگر بودجه‌ای در حال تمام شدن است هشدار بده.`;
    } else {
      userPrompt = `داده‌های مالی:
- درآمد: ${totalIncome.toLocaleString()} تومان
- هزینه: ${totalExpense.toLocaleString()} تومان
- تراز: ${(totalIncome - totalExpense).toLocaleString()} تومان

یک نکته کوتاه و انگیزشی برای مدیریت مالی بهتر بگو.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "محدودیت تعداد درخواست. لطفاً کمی صبر کنید." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "اعتبار AI تمام شده است." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || "خطا در دریافت پاسخ";

    console.log("AI report generated successfully");

    return new Response(
      JSON.stringify({ report: aiMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI report error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "خطای ناشناخته" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});