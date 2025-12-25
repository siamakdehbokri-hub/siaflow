import { Home, ListOrdered, PieChart, Settings, Plus } from 'lucide-react';
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
      {/* Gradient Blur Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none" />
      
      {/* Navigation Container */}
      <div className="relative glass-heavy border-t-0 rounded-t-3xl mx-2 mb-0 pb-safe">
        <div className="flex items-center justify-around h-16 sm:h-18 max-w-lg mx-auto px-2">
          {navItems.map((item, index) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            if (item.isAction) {
              return (
                <button
                  key={item.id}
                  onClick={onAddClick}
                  className="group flex items-center justify-center w-14 h-14 -mt-8 rounded-2xl gradient-primary shadow-float hover:shadow-glow transition-all duration-300 active:scale-95 hover:scale-105"
                >
                  <Icon className="w-6 h-6 text-primary-foreground transition-transform duration-200 group-hover:rotate-90" />
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "group flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 relative min-w-[60px]",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Active Background */}
                <div className={cn(
                  "absolute inset-0 rounded-2xl transition-all duration-300",
                  isActive 
                    ? "bg-primary/10 scale-100" 
                    : "bg-transparent scale-95 group-hover:bg-accent/50 group-hover:scale-100"
                )} />
                
                {/* Icon with Animation */}
                <div className="relative z-10">
                  <Icon className={cn(
                    "w-5 h-5 transition-all duration-300",
                    isActive && "scale-110"
                  )} />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-pulse-soft" />
                  )}
                </div>
                
                {/* Label */}
                <span className={cn(
                  "relative z-10 text-[10px] sm:text-xs font-medium transition-all duration-300",
                  isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
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
