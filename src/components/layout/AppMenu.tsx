import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { 
  FolderOpen, 
  Target, 
  CreditCard, 
  ArrowLeftRight, 
  Shield, 
  HelpCircle,
  FileText,
  TrendingUp,
  PiggyBank,
  Home,
  BarChart3,
  Settings,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/hooks/useAdmin';
import { NavTab } from '@/components/navigation/BottomNav';

type SubView = 'main' | 'categories' | 'goals' | 'debts' | 'transfers';

interface AppMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: SubView) => void;
  onTabChange: (tab: NavTab) => void;
  onOpenAdmin?: () => void;
  onOpenHelp?: () => void;
}

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'warning';
}

function MenuItem({ icon: Icon, label, description, onClick, variant = 'default' }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-2xl transition-all",
        "active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        variant === 'default' && "bg-muted/50 hover:bg-muted",
        variant === 'primary' && "bg-primary/10 hover:bg-primary/15",
        variant === 'warning' && "bg-warning/10 hover:bg-warning/15"
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
        variant === 'default' && "bg-background",
        variant === 'primary' && "bg-primary",
        variant === 'warning' && "bg-warning"
      )}>
        <Icon 
          className={cn(
            "w-6 h-6",
            variant === 'default' && "text-foreground",
            variant === 'primary' && "text-primary-foreground",
            variant === 'warning' && "text-warning-foreground"
          )} 
          strokeWidth={2} 
        />
      </div>
      <div className="flex-1 text-right min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
        )}
      </div>
    </button>
  );
}

export function AppMenu({ 
  isOpen, 
  onClose, 
  onNavigate, 
  onTabChange,
  onOpenAdmin,
  onOpenHelp 
}: AppMenuProps) {
  const { isAdmin, loading: adminLoading } = useAdmin();

  const handleNavigation = (view: SubView) => {
    onNavigate(view);
    onClose();
  };

  const handleTabNavigation = (tab: NavTab) => {
    onTabChange(tab);
    onClose();
  };

  const handleAdminClick = () => {
    if (onOpenAdmin) {
      onOpenAdmin();
    }
    onClose();
  };

  const handleHelpClick = () => {
    if (onOpenHelp) {
      onOpenHelp();
    }
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[85vw] max-w-[360px] p-0">
        <SheetHeader className="p-6 pb-4 border-b border-border bg-primary text-primary-foreground">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <span className="text-2xl font-black">SF</span>
            </div>
            <div className="text-right">
              <SheetTitle className="text-lg font-bold text-primary-foreground">
                SiaFlow
              </SheetTitle>
              <p className="text-sm text-primary-foreground/70 mt-0.5">
                مدیریت مالی هوشمند
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-180px)] pb-20">
          {/* Quick Navigation */}
          <p className="text-xs font-semibold text-muted-foreground px-1 pt-2 pb-1">
            دسترسی سریع
          </p>
          
          <MenuItem
            icon={Home}
            label="داشبورد"
            description="صفحه اصلی و خلاصه وضعیت"
            onClick={() => handleTabNavigation('home')}
          />
          
          <MenuItem
            icon={BarChart3}
            label="گزارش‌ها"
            description="مشاهده تاریخچه و آمار تراکنش‌ها"
            onClick={() => handleTabNavigation('reports')}
          />
          
          <MenuItem
            icon={Settings}
            label="تنظیمات"
            description="شخصی‌سازی اپلیکیشن"
            onClick={() => handleTabNavigation('settings')}
          />

          {/* Main Features */}
          <p className="text-xs font-semibold text-muted-foreground px-1 pt-4 pb-1">
            امکانات اصلی
          </p>
          
          <MenuItem
            icon={FolderOpen}
            label="دسته‌بندی‌ها"
            description="مدیریت دسته‌بندی هزینه و درآمد"
            onClick={() => handleNavigation('categories')}
            variant="primary"
          />
          
          <MenuItem
            icon={Target}
            label="اهداف پس‌انداز"
            description="تعیین و پیگیری اهداف مالی"
            onClick={() => handleNavigation('goals')}
            variant="primary"
          />
          
          <MenuItem
            icon={CreditCard}
            label="مدیریت بدهی"
            description="ثبت و پیگیری بدهی‌ها"
            onClick={() => handleNavigation('debts')}
            variant="primary"
          />
          
          <MenuItem
            icon={ArrowLeftRight}
            label="انتقال پول"
            description="انتقال به اهداف پس‌انداز"
            onClick={() => handleNavigation('transfers')}
            variant="primary"
          />

          {/* Tools Section */}
          <p className="text-xs font-semibold text-muted-foreground px-1 pt-4 pb-1">
            ابزارها
          </p>
          
          <MenuItem
            icon={TrendingUp}
            label="تحلیل هوشمند AI"
            description="گزارش‌های هوش مصنوعی از وضعیت مالی"
            onClick={() => handleTabNavigation('reports')}
          />
          
          <MenuItem
            icon={PiggyBank}
            label="بودجه‌بندی"
            description="تنظیم سقف هزینه ماهانه"
            onClick={() => handleNavigation('categories')}
          />

          {/* Admin Section - Only for admins */}
          {!adminLoading && isAdmin && (
            <>
              <p className="text-xs font-semibold text-muted-foreground px-1 pt-4 pb-1">
                مدیریت
              </p>
              
              <MenuItem
                icon={Shield}
                label="پنل مدیریت"
                description="دسترسی ادمین سیستم"
                onClick={handleAdminClick}
                variant="warning"
              />
            </>
          )}

          {/* Help */}
          <p className="text-xs font-semibold text-muted-foreground px-1 pt-4 pb-1">
            راهنما
          </p>
          
          <MenuItem
            icon={HelpCircle}
            label="راهنمای استفاده"
            description="آموزش کار با اپلیکیشن"
            onClick={handleHelpClick}
          />
        </div>

        {/* Version Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
          <p className="text-[11px] text-center text-muted-foreground">
            نسخه ۲.۰.۱ • ساخته شده با ❤️
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
