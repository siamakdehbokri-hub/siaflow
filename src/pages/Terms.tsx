import { Link } from "react-router-dom";
import { ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden" dir="rtl">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute rounded-full" style={{ top: '-80px', right: '-60px', width: '340px', height: '340px', background: 'rgba(90,68,200,0.20)', filter: 'blur(80px)' }} />
        <div className="absolute rounded-full" style={{ bottom: '-60px', left: '-50px', width: '280px', height: '280px', background: 'rgba(18,108,92,0.14)', filter: 'blur(80px)' }} />
      </div>

      {/* Header */}
      <header className="relative z-10" style={{ background: 'linear-gradient(135deg, var(--header-from), var(--header-to))' }}>
        <div className="pt-safe" />
        <div className="h-14 px-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" asChild className="h-10 w-10 rounded-xl text-white/80 hover:text-white hover:bg-white/10">
            <Link to="/auth">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-white/80" />
            <h1 className="text-lg font-bold text-white">قوانین و شرایط</h1>
          </div>
          <div className="w-10" />
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-lg mx-auto px-5 py-6 space-y-6">
        <div className="glass rounded-2xl p-5 space-y-4">
          <h2 className="text-base font-bold text-foreground">شرایط استفاده از SiaFlow</h2>
          <p className="text-sm text-muted-foreground leading-7">
            با استفاده از اپلیکیشن SiaFlow، شما موافقت خود را با شرایط زیر اعلام می‌کنید:
          </p>

          <div className="space-y-4">
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-1">۱. پذیرش شرایط</h3>
              <p className="text-sm text-muted-foreground leading-7">
                با ایجاد حساب کاربری و استفاده از خدمات SiaFlow، شما شرایط و ضوابط این توافقنامه را پذیرفته‌اید.
              </p>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-foreground mb-1">۲. حفظ حریم خصوصی</h3>
              <p className="text-sm text-muted-foreground leading-7">
                اطلاعات مالی شما به صورت رمزنگاری‌شده ذخیره می‌شود و هرگز با اشخاص ثالث به اشتراک گذاشته نمی‌شود.
              </p>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-foreground mb-1">۳. مسئولیت کاربر</h3>
              <p className="text-sm text-muted-foreground leading-7">
                کاربر مسئول حفظ امنیت حساب کاربری و رمز عبور خود است. هرگونه فعالیت انجام‌شده از طریق حساب شما بر عهده شماست.
              </p>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-foreground mb-1">۴. استفاده مجاز</h3>
              <p className="text-sm text-muted-foreground leading-7">
                استفاده از این سرویس فقط برای مدیریت امور مالی شخصی مجاز است. هرگونه سوءاستفاده منجر به مسدود شدن حساب خواهد شد.
              </p>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-foreground mb-1">۵. تغییرات</h3>
              <p className="text-sm text-muted-foreground leading-7">
                SiaFlow حق تغییر این شرایط را در هر زمان برای خود محفوظ می‌دارد. تغییرات از طریق اپلیکیشن اطلاع‌رسانی خواهد شد.
              </p>
            </section>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          آخرین بروزرسانی: اسفند ۱۴۰۴
        </p>
      </main>
    </div>
  );
};

export default Terms;
