import { Home, BarChart3, Settings, Plus, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NavTab = 'home' | 'reports' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onAddClick: () => void;
}

const navItems: { id: NavTab; icon: LucideIcon; label: string }[] = [
  { id: 'home', icon: Home, label: 'داشبورد' },
  { id: 'reports', icon: BarChart3, label: 'گزارش‌ها' },
  { id: 'settings', icon: Settings, label: 'تنظیمات' },
];

export function BottomNav({ activeTab, onTabChange, onAddClick }: BottomNavProps) {
  return (
    <>
      {/* Floating Add Button - Left side like reference */}
      <button
        onClick={onAddClick}
        className="fixed bottom-24 left-4 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-transform"
        aria-label="افزودن تراکنش"
      >
        <Plus className="w-7 h-7" strokeWidth={2.5} />
      </button>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
        <div className="pb-safe">
          <div className="flex items-stretch h-16">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground active:text-foreground"
                  )}
                >
                  <Icon 
                    className="w-6 h-6" 
                    strokeWidth={isActive ? 2 : 1.5} 
                  />
                  <span 
                    className={cn(
                      "text-[11px]",
                      isActive ? "font-semibold" : "font-normal"
                    )}
                  >
                    {item.label}
                  </span>
                  
                  {/* Active indicator line */}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full" />
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
