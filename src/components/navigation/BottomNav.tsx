import { Home, BarChart2, Settings2, Plus, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NavTab = 'home' | 'reports' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onAddClick: () => void;
}

const navItems: { id: NavTab; icon: LucideIcon; label: string }[] = [
  { id: 'home', icon: Home, label: 'داشبورد' },
  { id: 'reports', icon: BarChart2, label: 'گزارش‌ها' },
  { id: 'settings', icon: Settings2, label: 'تنظیمات' },
];

export function BottomNav({ activeTab, onTabChange, onAddClick }: BottomNavProps) {
  return (
    <>
      {/* Floating Add Button */}
      <button
        onClick={onAddClick}
        className="fixed z-50 flex items-center justify-center active:scale-90 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-[56px] h-[56px] rounded-full bg-primary text-primary-foreground shadow-lg"
        style={{ 
          bottom: 'calc(100px + env(safe-area-inset-bottom, 0px))',
          right: 'max(20px, env(safe-area-inset-right, 20px))',
        }}
        aria-label="افزودن تراکنش"
      >
        <Plus className="w-7 h-7" strokeWidth={2.5} />
      </button>

      {/* Bottom Navigation Bar */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-2xl"
        style={{ 
          background: 'hsl(var(--nav-bg))',
          borderTop: '1px solid rgba(255,255,255,0.04)',
        }}
      >
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
                    "flex-1 flex flex-col items-center justify-center gap-1.5 relative transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-xl transition-colors",
                    isActive && "bg-primary/10"
                  )}>
                    <Icon 
                      className="w-6 h-6" 
                      strokeWidth={isActive ? 2.5 : 2} 
                    />
                  </div>
                  <span 
                    className={cn(
                      "text-[12px] leading-relaxed",
                      isActive ? "font-black text-primary" : "font-medium"
                    )}
                  >
                    {item.label}
                  </span>
                  
                  {/* Active indicator - 3px purple line at top */}
                  {isActive && (
                    <div className="absolute top-0 left-1/4 right-1/4 h-[3px] rounded-b-full bg-primary" />
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
