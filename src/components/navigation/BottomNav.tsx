import { Home, BarChart3, Settings, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NavTab = 'home' | 'reports' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onAddClick: () => void;
}

const navItems: {
  id: NavTab;
  icon: typeof Home;
  label: string;
}[] = [
  { id: 'home', icon: Home, label: 'خانه' },
  { id: 'reports', icon: BarChart3, label: 'گزارش‌ها' },
  { id: 'settings', icon: Settings, label: 'تنظیمات' },
];

export function BottomNav({ activeTab, onTabChange, onAddClick }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Gradient Fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none h-28" />
      
      {/* Navigation Container */}
      <div className="relative mx-3 mb-2 pb-safe">
        <div className="glass-heavy rounded-2xl border border-border/20 shadow-float">
          {/* Subtle top highlight */}
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          
          <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
            {/* Home Tab */}
            <button
              onClick={() => onTabChange('home')}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 px-6 py-2 rounded-xl transition-all duration-300",
                activeTab === 'home'
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {activeTab === 'home' && (
                <div className="absolute inset-0 bg-primary/8 rounded-xl" />
              )}
              <Home className={cn(
                "relative z-10 w-5 h-5 transition-transform duration-300",
                activeTab === 'home' && "scale-110"
              )} />
              <span className={cn(
                "relative z-10 text-[10px] font-medium",
                activeTab === 'home' && "font-semibold"
              )}>
                خانه
              </span>
              {activeTab === 'home' && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>

            {/* FAB - Add Button */}
            <button
              onClick={onAddClick}
              className="group relative flex items-center justify-center w-14 h-14 -mt-8 rounded-2xl gradient-primary shadow-float hover:shadow-glow transition-all duration-400 active:scale-95 hover:scale-105"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
              <Plus className="relative w-7 h-7 text-primary-foreground transition-transform duration-300 group-hover:rotate-90" />
            </button>

            {/* Reports Tab */}
            <button
              onClick={() => onTabChange('reports')}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-300",
                activeTab === 'reports'
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {activeTab === 'reports' && (
                <div className="absolute inset-0 bg-primary/8 rounded-xl" />
              )}
              <BarChart3 className={cn(
                "relative z-10 w-5 h-5 transition-transform duration-300",
                activeTab === 'reports' && "scale-110"
              )} />
              <span className={cn(
                "relative z-10 text-[10px] font-medium",
                activeTab === 'reports' && "font-semibold"
              )}>
                گزارش‌ها
              </span>
              {activeTab === 'reports' && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>

            {/* Settings Tab */}
            <button
              onClick={() => onTabChange('settings')}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 px-6 py-2 rounded-xl transition-all duration-300",
                activeTab === 'settings'
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {activeTab === 'settings' && (
                <div className="absolute inset-0 bg-primary/8 rounded-xl" />
              )}
              <Settings className={cn(
                "relative z-10 w-5 h-5 transition-transform duration-300",
                activeTab === 'settings' && "scale-110"
              )} />
              <span className={cn(
                "relative z-10 text-[10px] font-medium",
                activeTab === 'settings' && "font-semibold"
              )}>
                تنظیمات
              </span>
              {activeTab === 'settings' && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
