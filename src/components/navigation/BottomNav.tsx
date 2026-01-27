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
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Gradient Fade Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none h-24" />
      
      {/* Navigation Container */}
      <div className="relative mx-3 mb-0 pb-safe">
        <div className="glass-heavy rounded-t-2xl border-t border-x border-border/30 overflow-visible">
          {/* Subtle top highlight */}
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          {/* Navigation Items - Even 4-column grid */}
          <div className="grid grid-cols-4 items-center h-16">
            
            {/* Home */}
            <NavItem
              icon={Home}
              label="خانه"
              isActive={activeTab === 'home'}
              onClick={() => onTabChange('home')}
            />

            {/* Reports */}
            <NavItem
              icon={BarChart3}
              label="گزارش‌ها"
              isActive={activeTab === 'reports'}
              onClick={() => onTabChange('reports')}
            />

            {/* FAB - Centered between columns 2 & 3 */}
            <div className="relative flex justify-center">
              <button
                onClick={onAddClick}
                className="absolute -top-6 left-1/2 -translate-x-1/2 group flex items-center justify-center w-12 h-12 rounded-2xl gradient-primary shadow-float active:scale-95 transition-all duration-200"
                aria-label="افزودن"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-lg opacity-50 group-active:opacity-80 transition-opacity" />
                <Plus className="relative w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
              </button>
            </div>

            {/* Settings */}
            <NavItem
              icon={Settings}
              label="تنظیمات"
              isActive={activeTab === 'settings'}
              onClick={() => onTabChange('settings')}
            />

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
        "relative flex flex-col items-center justify-center gap-1 h-full px-2 transition-all duration-200",
        isActive 
          ? "text-primary" 
          : "text-muted-foreground active:text-foreground"
      )}
    >
      {/* Active background */}
      {isActive && (
        <div className="absolute inset-2 rounded-xl bg-primary/10" />
      )}
      
      {/* Icon */}
      <Icon 
        className={cn(
          "relative z-10 w-5 h-5 transition-transform duration-200",
          isActive && "scale-110"
        )}
        strokeWidth={isActive ? 2.25 : 1.75} 
      />
      
      {/* Label */}
      <span 
        className={cn(
          "relative z-10 text-[10px] leading-none whitespace-nowrap",
          isActive ? "font-semibold" : "font-medium opacity-80"
        )}
      >
        {label}
      </span>

      {/* Active indicator dot */}
      {isActive && (
        <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-primary" />
      )}
    </button>
  );
}
