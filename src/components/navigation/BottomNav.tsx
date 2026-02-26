import { Home, BarChart2, Settings2, Plus, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NavTab = 'home' | 'reports' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onAddClick: () => void;
}

const navItems: { id: NavTab; icon: LucideIcon; label: string }[] = [
  { id: 'settings', icon: Settings2, label: 'تنظیمات' },
  { id: 'reports', icon: BarChart2, label: 'گزارش‌ها' },
  { id: 'home', icon: Home, label: 'داشبورد' },
];

export function BottomNav({ activeTab, onTabChange, onAddClick }: BottomNavProps) {
  return (
    <>
      {/* Floating Add Button */}
      <button
        onClick={onAddClick}
        className="fixed z-50 flex items-center justify-center w-16 h-16 rounded-full text-primary-foreground active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        style={{ 
          bottom: 'calc(100px + env(safe-area-inset-bottom, 0px))',
          right: 'max(20px, env(safe-area-inset-right, 20px))',
          background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) 100%)',
          boxShadow: '0 8px 32px hsl(var(--primary) / 0.5), 0 4px 16px hsl(var(--primary) / 0.3), inset 0 1px 0 hsl(0 0% 100% / 0.2)',
        }}
        aria-label="افزودن تراکنش"
      >
        <Plus className="w-7 h-7 relative z-10" strokeWidth={2.5} />
      </button>

      {/* Bottom Navigation Bar */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'linear-gradient(180deg, hsl(var(--card) / 0.85) 0%, hsl(var(--card) / 0.95) 100%)',
          backdropFilter: 'blur(30px) saturate(200%)',
          WebkitBackdropFilter: 'blur(30px) saturate(200%)',
          borderTop: '1px solid hsl(var(--border) / 0.4)',
          boxShadow: '0 -8px 32px hsl(0 0% 0% / 0.2), inset 0 1px 0 hsl(0 0% 100% / 0.04)',
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
                    "flex-1 flex flex-col items-center justify-center gap-1 relative transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground active:text-foreground"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-xl transition-all duration-300",
                    isActive && "bg-primary/15"
                  )}
                    style={isActive ? {
                      boxShadow: '0 0 16px hsl(var(--primary) / 0.3)',
                    } : undefined}
                  >
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
                  
                  {/* Active indicator glow */}
                  {isActive && (
                    <div 
                      className="absolute top-0 left-1/4 right-1/4 h-[3px] rounded-b-full"
                      style={{ 
                        background: 'hsl(var(--primary))',
                        boxShadow: '0 2px 12px hsl(var(--primary) / 0.6)' 
                      }}
                    />
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
