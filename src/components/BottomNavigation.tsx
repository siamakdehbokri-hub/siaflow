import { Home, ListOrdered, PieChart, Settings, Plus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
}

const navItems = [
  { id: 'dashboard', icon: Home, label: 'خانه' },
  { id: 'transactions', icon: ListOrdered, label: 'تراکنش‌ها' },
  { id: 'add', icon: Plus, label: 'افزودن', isAction: true },
  { id: 'reports', icon: PieChart, label: 'گزارش‌ها' },
  { id: 'settings', icon: Settings, label: 'تنظیمات' },
];

export function BottomNavigation({ activeTab, onTabChange, onAddClick }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Gradient Fade Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/98 to-transparent pointer-events-none h-24" />
      
      {/* Navigation Container */}
      <div className="relative glass-heavy rounded-t-[2rem] mx-2 mb-0 pb-safe border-t-0">
        {/* Subtle top highlight */}
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        <div className="flex items-center justify-around h-18 sm:h-20 max-w-lg mx-auto px-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            if (item.isAction) {
              return (
                <button
                  key={item.id}
                  onClick={onAddClick}
                  className="group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 -mt-8 rounded-2xl gradient-primary shadow-float hover:shadow-glow transition-all duration-400 active:scale-95 hover:scale-105 btn-press"
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Icon container */}
                  <div className="relative">
                    <Plus className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground transition-transform duration-300 group-hover:rotate-90" />
                  </div>
                  
                  {/* Sparkle decoration */}
                  <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-primary-foreground/60 animate-pulse-soft" />
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "group flex flex-col items-center justify-center gap-1 px-2 sm:px-4 py-2 rounded-2xl transition-all duration-300 relative",
                  "min-w-[52px] sm:min-w-[64px] max-w-[72px]",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Active Background with glow */}
                <div className={cn(
                  "absolute inset-1 rounded-xl transition-all duration-300",
                  isActive 
                    ? "bg-primary/12 scale-100" 
                    : "bg-transparent scale-90 group-hover:bg-accent/50 group-hover:scale-100"
                )} />
                
                {/* Icon with Animation */}
                <div className="relative z-10">
                  <Icon className={cn(
                    "w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300",
                    isActive && "scale-110"
                  )} />
                  
                  {/* Active indicator dot */}
                  {isActive && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2">
                      <div className="w-1 h-1 rounded-full bg-primary" />
                    </div>
                  )}
                </div>
                
                {/* Label */}
                <span className={cn(
                  "relative z-10 text-[9px] sm:text-[10px] font-medium transition-opacity duration-300 truncate max-w-full",
                  isActive ? "opacity-100 font-semibold" : "opacity-70 group-hover:opacity-100"
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}