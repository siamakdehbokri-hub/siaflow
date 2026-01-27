import { Bell, Menu } from 'lucide-react';
import { formatPersianDateFull } from '@/utils/persianDate';
import { Button } from '@/components/ui/button';

interface AppHeaderProps {
  title: string;
  showDate?: boolean;
  onMenuClick?: () => void;
}

export function AppHeader({ title, showDate = true, onMenuClick }: AppHeaderProps) {
  const today = new Date();
  const persianDate = formatPersianDateFull(today.toISOString());
  
  return (
    <header className="bg-primary text-primary-foreground">
      {/* Safe area padding */}
      <div className="pt-safe" />
      
      {/* Header content */}
      <div className="flex items-center justify-between h-14 px-4">
        {/* Bell icon - Left side (RTL) */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-primary-foreground hover:bg-white/10 rounded-full"
        >
          <Bell className="w-5 h-5" />
        </Button>
        
        {/* Title - Center */}
        <h1 className="text-lg font-bold">{title}</h1>
        
        {/* Menu icon - Right side (RTL) */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onMenuClick}
          className="text-primary-foreground hover:bg-white/10 rounded-full"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>
      
      {/* Date strip */}
      {showDate && (
        <div className="text-center pb-3 text-sm opacity-90">
          ◂ {persianDate}
        </div>
      )}
    </header>
  );
}
