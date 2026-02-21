import { Home, BarChart2, Settings2, Plus, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NavTab = 'home' | 'reports' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onAddClick: () => void;
}

const navItems: { id: NavTab; icon: LucideIcon; label: string; emoji: string }[] = [
  { id: 'home', icon: Home, label: 'داشبورد', emoji: '🏠' },
  { id: 'reports', icon: BarChart2, label: 'گزارش‌ها', emoji: '📊' },
  { id: 'settings', icon: Settings2, label: 'تنظیمات', emoji: '⚙️' },
];

export function BottomNav({ activeTab, onTabChange, onAddClick }: BottomNavProps) {
  return (
    <>
      {/* Floating Add Button - 3D style */}
      <button
        onClick={onAddClick}
        className="fixed z-50 flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        style={{ 
          bottom: 'calc(100px + env(safe-area-inset-bottom, 0px))',
          right: 'max(20px, env(safe-area-inset-right, 20px))'
        }}
        aria-label="افزودن تراکنش"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent rounded-full" />
        <Plus className="w-7 h-7 relative z-10" strokeWidth={2.5} />
      </button>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t-2 border-border shadow-lg shadow-foreground/5">
        <div className="pb-safe">
          <div className="flex items-stretch h-[72px]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center gap-1 relative transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground active:text-foreground active:bg-muted/30"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-xl transition-all duration-200",
                    isActive && "bg-primary/10 shadow-sm"
                  )}>
                    <Icon 
                      className="w-6 h-6" 
                      strokeWidth={isActive ? 2.5 : 2} 
                    />
                  </div>
                  <span 
                    className={cn(
                      "text-[11px] leading-relaxed",
                      isActive ? "font-black" : "font-medium"
                    )}
                  >
                    {item.label}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-primary rounded-b-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
