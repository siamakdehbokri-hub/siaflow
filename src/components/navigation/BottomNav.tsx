import { Home, BarChart3, Settings, Plus, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NavTab = 'home' | 'reports' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onAddClick: () => void;
}

export function BottomNav({ activeTab, onTabChange, onAddClick }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pointer-events-none">
      {/* Gradient fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent h-16" />
      
      {/* Navigation bar */}
      <div className="relative pointer-events-auto">
        <div className="bg-card/95 backdrop-blur-xl border-t border-border/40">
          {/* Safe area padding handled separately */}
          <div className="pb-safe">
            {/* Fixed 56px nav height - Material Design standard */}
            <div className="h-14 flex items-stretch">
              
              {/* 5-slot grid for perfect symmetry */}
              <div className="flex-1 grid grid-cols-5">
                
                {/* Slot 1: Home */}
                <NavItem
                  icon={Home}
                  label="خانه"
                  isActive={activeTab === 'home'}
                  onClick={() => onTabChange('home')}
                />
                
                {/* Slot 2: Reports */}
                <NavItem
                  icon={BarChart3}
                  label="گزارش‌ها"
                  isActive={activeTab === 'reports'}
                  onClick={() => onTabChange('reports')}
                />
                
                {/* Slot 3: Center FAB */}
                <div className="flex items-center justify-center">
                  <button
                    onClick={onAddClick}
                    className={cn(
                      "flex items-center justify-center",
                      "w-11 h-11 -mt-3 rounded-2xl",
                      "bg-primary text-primary-foreground",
                      "shadow-md active:scale-95 transition-transform duration-150"
                    )}
                    aria-label="افزودن تراکنش"
                  >
                    <Plus className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                </div>
                
                {/* Slot 4: Empty for balance (or future use) */}
                <div className="flex items-center justify-center">
                  {/* Reserved slot */}
                </div>
                
                {/* Slot 5: Settings */}
                <NavItem
                  icon={Settings}
                  label="تنظیمات"
                  isActive={activeTab === 'settings'}
                  onClick={() => onTabChange('settings')}
                />
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function NavItem({ icon: Icon, label, isActive, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1",
        "min-h-[48px] transition-colors duration-150",
        isActive 
          ? "text-primary" 
          : "text-muted-foreground active:text-foreground"
      )}
    >
      <Icon 
        className="w-5 h-5" 
        strokeWidth={isActive ? 2.25 : 1.75} 
      />
      <span 
        className={cn(
          "text-[10px] leading-none",
          isActive ? "font-semibold" : "font-normal"
        )}
      >
        {label}
      </span>
    </button>
  );
}
