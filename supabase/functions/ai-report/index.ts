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
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "تنظیمات سرور ناقص است. با پشتیبانی تماس بگیرید." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate input data
    if (!transactions || !Array.isArray(transactions)) {
      return new Response(
        JSON.stringify({ error: "داده تراکنش‌ها معتبر نیست" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generating AI report for type:", type, "transactions count:", transactions.length);

    // Calculate summary stats
    const totalIncome = transactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
    
    const totalExpense = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

    // Check if there's enough data
    if (transactions.length === 0) {
      return new Response(
        JSON.stringify({ report: "📊 هنوز تراکنشی ثبت نشده است.\n\nبا ثبت تراکنش‌های درآمد و هزینه، می‌توانم تحلیل مالی هوشمند برایتان ارائه دهم." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Group expenses by category
    const categoryExpenses: Record<string, number> = {};
    transactions
      .filter((t: any) => t.type === 'expense')
      .forEach((t: any) => {
        categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + (t.amount || 0);
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
- لحن دوستانه و انگیزشی داشته باش
- اعداد را به فرمت فارسی بنویس`;

    let userPrompt = "";

    if (type === "summary") {
      if (totalIncome === 0 && totalExpense === 0) {
        return new Response(
          JSON.stringify({ report: "📊 هنوز درآمد یا هزینه‌ای ثبت نشده.\n\nبا ثبت تراکنش‌ها، تحلیل مالی دریافت کنید." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userPrompt = `خلاصه مالی ماه کاربر:
- مجموع درآمد: ${totalIncome.toLocaleString('fa-IR')} تومان
- مجموع هزینه: ${totalExpense.toLocaleString('fa-IR')} تومان  
- تراز: ${(totalIncome - totalExpense).toLocaleString('fa-IR')} تومان
- تعداد تراکنش: ${transactions.length}

${topCategories.length > 0 ? `دسته‌بندی‌های پرهزینه:
${topCategories.map((c, i) => `${i + 1}. ${c.name}: ${c.amount.toLocaleString('fa-IR')} تومان`).join('\n')}` : ''}

لطفاً یک تحلیل کوتاه از وضعیت مالی ارائه بده و ۳ پیشنهاد برای بهبود ارائه کن.`;

    } else if (type === "savings") {
      if (totalExpense === 0) {
        return new Response(
          JSON.stringify({ report: "💰 هنوز هزینه‌ای ثبت نشده.\n\nبرای پیشنهاد صرفه‌جویی، ابتدا هزینه‌ها را ثبت کنید." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userPrompt = `داده‌های مالی:
- درآمد ماهانه: ${totalIncome.toLocaleString('fa-IR')} تومان
- هزینه ماهانه: ${totalExpense.toLocaleString('fa-IR')} تومان
- نرخ پس‌انداز: ${totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0}%

دسته‌بندی‌های پرهزینه:
${topCategories.map((c, i) => `${i + 1}. ${c.name}: ${c.amount.toLocaleString('fa-IR')} تومان`).join('\n')}

لطفاً پیشنهادهای عملی برای صرفه‌جویی ارائه بده و بگو کاربر در کدام دسته‌ها می‌تواند کمتر خرج کند.`;

    } else if (type === "budget") {
      const budgetCategories = (categories || []).filter((c: any) => c.budget && c.budget > 0);
      
      if (budgetCategories.length === 0) {
        return new Response(
          JSON.stringify({ report: "📋 هنوز بودجه‌ای تعریف نشده.\n\nاز بخش دسته‌بندی‌ها، بودجه ماهانه تعیین کنید تا تحلیل بودجه دریافت کنید." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userPrompt = `بودجه‌های تعیین شده و میزان مصرف:
${budgetCategories
  .map((c: any) => {
    const spent = categoryExpenses[c.name] || 0;
    const percentage = c.budget > 0 ? Math.round((spent / c.budget) * 100) : 0;
    return `- ${c.name}: ${spent.toLocaleString('fa-IR')} از ${c.budget.toLocaleString('fa-IR')} تومان (${percentage}%)`;
  })
  .join('\n')}

لطفاً وضعیت بودجه‌ها را تحلیل کن و اگر بودجه‌ای در حال تمام شدن است هشدار بده.`;

    } else {
      userPrompt = `داده‌های مالی:
- درآمد: ${totalIncome.toLocaleString('fa-IR')} تومان
- هزینه: ${totalExpense.toLocaleString('fa-IR')} تومان
- تراز: ${(totalIncome - totalExpense).toLocaleString('fa-IR')} تومان

یک نکته کوتاه و انگیزشی برای مدیریت مالی بهتر بگو.`;
    }

    console.log("Calling AI gateway...");

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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
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
      
      return new Response(
        JSON.stringify({ error: "خطا در ارتباط با سرور AI. لطفاً دوباره تلاش کنید." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content;
    
    if (!aiMessage) {
      console.error("Empty AI response:", data);
      return new Response(
        JSON.stringify({ error: "پاسخ AI خالی بود. لطفاً دوباره تلاش کنید." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("AI report generated successfully");

    return new Response(
      JSON.stringify({ report: aiMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI report error:", error);
    return new Response(
      JSON.stringify({ error: "خطای سیستمی. لطفاً دوباره تلاش کنید." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
