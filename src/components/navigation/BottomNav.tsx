import { Home, Activity, Target, Sparkles, Settings, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NavTab = 'home' | 'activity' | 'plan' | 'insights' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onAddClick: () => void;
}

const navItems: { id: NavTab; icon: typeof Home; label: string }[] = [
  { id: 'home', icon: Home, label: 'خانه' },
  { id: 'activity', icon: Activity, label: 'فعالیت' },
  { id: 'plan', icon: Target, label: 'برنامه' },
  { id: 'insights', icon: Sparkles, label: 'بینش' },
  { id: 'settings', icon: Settings, label: 'تنظیمات' },
];

export function BottomNav({ activeTab, onTabChange, onAddClick }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 overflow-visible">
      {/* Gradient Fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none h-28" />
      
      {/* Navigation Container */}
      <div className="relative mx-3 mb-2 pb-safe overflow-visible">
        <div className="glass-heavy relative overflow-visible rounded-2xl border border-border/20 shadow-float">
          {/* Subtle top highlight */}
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          
          <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-1">
            {navItems.map((item, index) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              const isCenter = index === 2;

              // Center FAB for Plan
              if (isCenter) {
                return (
                  <div key={item.id} className="relative flex flex-col items-center overflow-visible min-w-[80px]">
                    {/* Quick Add FAB - responsive sizing */}
                    <button
                      onClick={onAddClick}
                      className="absolute left-1/2 -translate-x-1/2 -top-8 sm:-top-10 w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl gradient-primary shadow-glow flex items-center justify-center transition-all duration-300 active:scale-95 hover:scale-105"
                      aria-label="افزودن تراکنش"
                    >
                      <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                    </button>
                    
                    {/* Plan Tab */}
                    <button
                      onClick={() => onTabChange(item.id)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-300",
                        isActive 
                          ? "text-primary" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className={cn(
                        "w-5 h-5 transition-transform duration-300",
                        isActive && "scale-110"
                      )} />
                      <span className={cn(
                        "text-[10px] font-medium",
                        isActive && "font-semibold"
                      )}>
                        {item.label}
                      </span>
                      {isActive && (
                        <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
                      )}
                    </button>
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-300",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {/* Active indicator background */}
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/8 rounded-xl" />
                  )}
                  
                  <Icon className={cn(
                    "relative z-10 w-5 h-5 transition-transform duration-300",
                    isActive && "scale-110"
                  )} />
                  <span className={cn(
                    "relative z-10 text-[10px] font-medium",
                    isActive && "font-semibold"
                  )}>
                    {item.label}
                  </span>
                  
                  {isActive && (
                    <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
