import { ArrowRight, Plus, Edit3, Trash2, PieChart, Download, Settings, FolderOpen, Moon, Sun, CreditCard, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface HelpGuideProps {
  onBack: () => void;
}

const guideItems = [
  {
    id: 'add-transaction',
    title: 'افزودن تراکنش جدید',
    icon: Plus,
    content: `برای افزودن تراکنش جدید:
1. دکمه + در پایین صفحه را بزنید
2. نوع تراکنش (هزینه یا درآمد) را انتخاب کنید
3. مبلغ را وارد کنید
4. دسته‌بندی مناسب را انتخاب کنید
5. در صورت نیاز زیردسته‌بندی و توضیحات را وارد کنید
6. تاریخ را با تقویم شمسی انتخاب کنید
7. دکمه ثبت را بزنید`
  },
  {
    id: 'edit-delete',
    title: 'ویرایش و حذف تراکنش',
    icon: Edit3,
    content: `برای ویرایش یا حذف تراکنش:
• در موبایل: تراکنش را به چپ بکشید تا دکمه‌های ویرایش و حذف ظاهر شوند
• در دسکتاپ: روی تراکنش کلیک کنید تا صفحه ویرایش باز شود
• برای حذف: دکمه سطل آشغال قرمز را بزنید`
  },
  {
    id: 'categories',
    title: 'مدیریت دسته‌بندی‌ها',
    icon: FolderOpen,
    content: `برای مدیریت دسته‌بندی‌ها:
1. به تنظیمات بروید
2. روی آیکون پوشه در بالای صفحه بزنید
3. می‌توانید دسته‌بندی جدید اضافه کنید
4. می‌توانید دسته‌بندی‌های موجود را ویرایش کنید
5. برای هر دسته‌بندی می‌توانید بودجه ماهانه تعیین کنید`
  },
  {
    id: 'reports',
    title: 'گزارشات و نمودارها',
    icon: PieChart,
    content: `برای مشاهده گزارشات:
1. به بخش گزارش‌ها بروید
2. بازه زمانی (هفتگی، ماهانه، سالانه) را انتخاب کنید
3. نمودار دایره‌ای هزینه‌ها را مشاهده کنید
4. نمودار روند ماهانه را بررسی کنید
5. مقایسه درآمد و هزینه‌های ماهانه را ببینید`
  },
  {
    id: 'export',
    title: 'خروجی گرفتن از داده‌ها',
    icon: Download,
    content: `برای دانلود گزارش:
• از بخش تراکنش‌ها: دکمه Excel یا PDF را بزنید
• از بخش گزارش‌ها: دکمه گزارش کامل یا گزارش بودجه را بزنید
• فایل به صورت خودکار دانلود می‌شود`
  },
  {
    id: 'budget',
    title: 'مدیریت بودجه',
    icon: CreditCard,
    content: `برای مدیریت بودجه:
1. به مدیریت دسته‌بندی‌ها بروید
2. برای هر دسته‌بندی هزینه، بودجه ماهانه تعیین کنید
3. در داشبورد، وضعیت مصرف بودجه را ببینید
4. هنگام نزدیک شدن به سقف بودجه هشدار دریافت کنید`
  },
  {
    id: 'date-filter',
    title: 'فیلتر تاریخی',
    icon: Calendar,
    content: `برای فیلتر کردن تراکنش‌ها بر اساس تاریخ:
1. به بخش تراکنش‌ها بروید
2. روی دکمه تقویم بزنید
3. بازه تاریخی شمسی مورد نظر را انتخاب کنید
4. تراکنش‌های آن بازه نمایش داده می‌شوند`
  },
  {
    id: 'theme',
    title: 'تغییر تم (روز/شب)',
    icon: Moon,
    content: `برای تغییر تم:
1. به تنظیمات بروید
2. گزینه حالت شب را پیدا کنید
3. با کلیک روی سوییچ، تم را تغییر دهید`
  }
];

export function HelpGuide({ onBack }: HelpGuideProps) {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={onBack}>
          <ArrowRight className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-semibold text-foreground">راهنمای استفاده</h2>
      </div>

      {/* Introduction */}
      <Card variant="glass">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl gradient-primary">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">به مدیریت هزینه خوش آمدید!</h3>
              <p className="text-sm text-muted-foreground">
                اینجا می‌توانید درآمد و هزینه‌های خود را مدیریت کنید
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guide Accordion */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-base">راهنمای کامل</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Accordion type="single" collapsible className="w-full">
            {guideItems.map((item) => {
              const Icon = item.icon;
              return (
                <AccordionItem key={item.id} value={item.id} className="border-b border-border last:border-0">
                  <AccordionTrigger className="px-4 py-3 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-muted">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{item.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed pr-9">
                      {item.content}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-base">نکات مهم</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-success/10 border border-success/20">
            <div className="w-2 h-2 rounded-full bg-success mt-1.5 shrink-0" />
            <p className="text-sm text-foreground">
              تراکنش‌های تکراری (مثل قبوض ماهانه) را علامت‌گذاری کنید تا یادآوری دریافت کنید
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
            <p className="text-sm text-foreground">
              برای هر دسته‌بندی بودجه ماهانه تعیین کنید تا مصرف خود را کنترل کنید
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-warning/10 border border-warning/20">
            <div className="w-2 h-2 rounded-full bg-warning mt-1.5 shrink-0" />
            <p className="text-sm text-foreground">
              از گزارش‌ها برای تحلیل عادات مالی خود استفاده کنید
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Version Info */}
      <p className="text-center text-xs text-muted-foreground">
        نسخه ۱.۴.۰ - تقویم شمسی کامل
      </p>
    </div>
  );
}