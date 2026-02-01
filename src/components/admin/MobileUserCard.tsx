import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Crown, ChevronDown, Eye, UserX, UserCheck, Trash2 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { AdminUser } from '@/hooks/useAdmin';

interface MobileUserCardProps {
  adminUser: AdminUser;
  currentUserId?: string;
  formatLastLogin: (date: string | null) => string;
  onViewDetails: (user: AdminUser) => void;
  onToggleStatus: (userId: string) => void;
  onToggleAdmin: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}

export function MobileUserCard({
  adminUser,
  currentUserId,
  formatLastLogin,
  onViewDetails,
  onToggleStatus,
  onToggleAdmin,
  onDelete,
}: MobileUserCardProps) {
  const isCurrentUser = adminUser.id === currentUserId;
  const isAdmin = adminUser.roles.includes('admin');

  return (
    <div className="bg-card rounded-2xl border-2 border-border p-4 space-y-3 hover:border-primary/30 transition-all active:scale-[0.99]">
      {/* Header: Avatar + Name */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar className="w-14 h-14 border-2 border-primary/20 shrink-0 shadow-sm">
            <AvatarImage src={adminUser.avatarUrl || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
              {adminUser.displayName?.charAt(0)?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-base truncate text-foreground">{adminUser.displayName}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5" dir="ltr">{adminUser.email}</p>
          </div>
        </div>

        {/* Actions Dropdown */}
        {!isCurrentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-xl h-11 w-11 shrink-0 border-2">
                <ChevronDown className="w-5 h-5" strokeWidth={2} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl">
              <DropdownMenuLabel className="text-xs text-muted-foreground">عملیات کاربر</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewDetails(adminUser)} className="py-3 rounded-lg">
                <Eye className="w-5 h-5 ml-3" strokeWidth={2} />
                مشاهده جزئیات
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(adminUser.id)} className="py-3 rounded-lg">
                {adminUser.isActive ? (
                  <>
                    <UserX className="w-5 h-5 ml-3 text-orange-500" strokeWidth={2} />
                    غیرفعال‌سازی
                  </>
                ) : (
                  <>
                    <UserCheck className="w-5 h-5 ml-3 text-green-500" strokeWidth={2} />
                    فعال‌سازی
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleAdmin(adminUser)} className="py-3 rounded-lg">
                <Crown className={cn(
                  "w-5 h-5 ml-3",
                  isAdmin ? "text-amber-500" : "text-muted-foreground"
                )} strokeWidth={2} />
                {isAdmin ? 'حذف نقش ادمین' : 'افزودن نقش ادمین'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(adminUser)}
                className="text-destructive focus:text-destructive py-3 rounded-lg"
              >
                <Trash2 className="w-5 h-5 ml-3" strokeWidth={2} />
                حذف کاربر
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Badge variant="outline" className="text-xs rounded-xl h-8 px-3 border-2 border-primary/30 bg-primary/5 text-primary shrink-0">شما</Badge>
        )}
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge 
          variant="outline"
          className={cn(
            "rounded-xl text-xs h-7 px-2.5 font-medium border-2",
            adminUser.isActive 
              ? "bg-success/10 text-success border-success/30" 
              : "bg-destructive/10 text-destructive border-destructive/30"
          )}
        >
          <span className={cn(
            "w-2 h-2 rounded-full ml-1.5",
            adminUser.isActive ? "bg-success" : "bg-destructive"
          )} />
          {adminUser.isActive ? 'فعال' : 'غیرفعال'}
        </Badge>

        {isAdmin && (
          <Badge className="bg-amber-500/10 text-amber-600 border-2 border-amber-500/30 rounded-xl text-xs h-7 px-2.5 font-medium">
            <Crown className="w-3.5 h-3.5 ml-1.5" strokeWidth={2} />
            ادمین
          </Badge>
        )}

        <Badge variant="outline" className="rounded-xl text-xs h-7 px-2.5 font-mono border-2">
          {adminUser.transactionCount} تراکنش
        </Badge>
      </div>

      {/* Last Login */}
      <div className="text-xs text-muted-foreground bg-muted/50 rounded-xl px-3 py-2">
        🕐 آخرین ورود: {formatLastLogin(adminUser.lastLogin)}
      </div>
    </div>
  );
}
