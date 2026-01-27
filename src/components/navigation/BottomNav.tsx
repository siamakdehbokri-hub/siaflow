import { Home, BarChart3, Settings, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NavTab = 'home' | 'reports' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onAddClick: () => void;
}

const navItems = [
  { id: 'home' as NavTab, icon: Home, label: 'خانه' },
  { id: 'reports' as NavTab, icon: BarChart3, label: 'گزارش‌ها' },
  { id: 'settings' as NavTab, icon: Settings, label: 'تنظیمات' },
];

export function BottomNav({ activeTab, onTabChange, onAddClick }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Gradient fade for smooth transition */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none h-20" />
      
      {/* Navigation Container - Fixed height with safe area */}
      <div className="relative mx-3 mb-0 pb-safe">
        <div className="glass-heavy rounded-t-2xl border-t border-x border-border/30 shadow-lg">
          
          {/* Main navigation row - consistent 64px height */}
          <div className="flex items-center justify-between h-16 px-2">
            
            {/* Left nav item - Home */}
            <NavButton
              item={navItems[0]}
              isActive={activeTab === navItems[0].id}
              onClick={() => onTabChange(navItems[0].id)}
            />
            
            {/* Center section with FAB */}
            <div className="flex-1 flex justify-center relative">
              <button
                onClick={onAddClick}
                className="relative flex items-center justify-center w-12 h-12 -mt-4 rounded-full bg-primary shadow-lg active:scale-95 transition-transform duration-200"
                aria-label="افزودن تراکنش"
              >
                {/* Subtle glow */}
                <div className="absolute inset-0 rounded-full bg-primary/40 blur-md" />
                <Plus className="relative w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
              </button>
            </div>
            
            {/* Right nav items - Reports & Settings */}
            <div className="flex items-center gap-1">
              <NavButton
                item={navItems[1]}
                isActive={activeTab === navItems[1].id}
                onClick={() => onTabChange(navItems[1].id)}
              />
              <NavButton
                item={navItems[2]}
                isActive={activeTab === navItems[2].id}
                onClick={() => onTabChange(navItems[2].id)}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

interface NavButtonProps {
  item: typeof navItems[0];
  isActive: boolean;
  onClick: () => void;
}

function NavButton({ item, isActive, onClick }: NavButtonProps) {
  const Icon = item.icon;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 min-w-[56px] h-12 px-3 rounded-xl transition-colors duration-200",
        isActive
          ? "text-primary"
          : "text-muted-foreground active:text-foreground"
      )}
    >
      <Icon 
        className="w-[22px] h-[22px]" 
        strokeWidth={isActive ? 2.25 : 1.75} 
      />
      <span 
        className={cn(
          "text-[10px] leading-none",
          isActive ? "font-semibold" : "font-medium"
        )}
      >
        {item.label}
      </span>
    </button>
  );
}
