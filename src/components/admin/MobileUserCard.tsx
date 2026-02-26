import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Crown, MoreVertical, Eye, UserX, UserCheck, Trash2, 
  Activity, AlertTriangle, Clock
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
  const isInactive = !adminUser.isActive;
  const hasNoTransactions = adminUser.transactionCount === 0;
  const lastLoginText = formatLastLogin(adminUser.lastLogin);

  return (
    <div className={cn(
      "glass rounded-xl p-3 space-y-2.5 transition-all active:scale-[0.99]",
      isInactive && "border border-destructive/20 bg-destructive/5"
    )}>
      {/* Row 1: User Info + Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Avatar className="w-10 h-10 border border-border shrink-0">
            <AvatarImage src={adminUser.avatarUrl || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
              {adminUser.displayName?.charAt(0)?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-sm truncate text-foreground">
                {adminUser.displayName || 'بدون نام'}
              </p>
              {isAdmin && (
                <Crown className="w-3.5 h-3.5 text-warning shrink-0" strokeWidth={2} />
              )}
            </div>
            <p className="text-[11px] text-muted-foreground truncate" dir="ltr">
              {adminUser.email}
            </p>
          </div>
        </div>

        {!isCurrentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-lg shrink-0 text-muted-foreground hover:text-foreground"
              >
                <MoreVertical className="w-4 h-4" strokeWidth={2} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuLabel className="text-xs text-muted-foreground">عملیات</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewDetails(adminUser)} className="py-2.5 rounded-lg">
                <Eye className="w-4 h-4 ml-2" strokeWidth={2} />
                مشاهده جزئیات
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(adminUser.id)} className="py-2.5 rounded-lg">
                {adminUser.isActive ? (
                  <>
                    <UserX className="w-4 h-4 ml-2 text-warning" strokeWidth={2} />
                    غیرفعال کردن
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 ml-2 text-success" strokeWidth={2} />
                    فعال کردن
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleAdmin(adminUser)} className="py-2.5 rounded-lg">
                <Crown className={cn(
                  "w-4 h-4 ml-2",
                  isAdmin ? "text-warning" : "text-muted-foreground"
                )} strokeWidth={2} />
                {isAdmin ? 'حذف ادمین' : 'ادمین کردن'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(adminUser)}
                className="text-destructive focus:text-destructive py-2.5 rounded-lg"
              >
                <Trash2 className="w-4 h-4 ml-2" strokeWidth={2} />
                حذف کاربر
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Badge variant="outline" className="text-[10px] rounded-lg h-6 px-2 text-muted-foreground shrink-0">
            شما
          </Badge>
        )}
      </div>

      {/* Row 2: Status Badges */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge 
          variant="outline"
          className={cn(
            "rounded-lg text-[10px] h-6 px-2 font-medium",
            adminUser.isActive 
              ? "bg-success/10 text-success border-success/20" 
              : "bg-destructive/10 text-destructive border-destructive/20"
          )}
        >
          <span className={cn(
            "w-1.5 h-1.5 rounded-full ml-1.5",
            adminUser.isActive ? "bg-success" : "bg-destructive"
          )} />
          {adminUser.isActive ? 'فعال' : 'غیرفعال'}
        </Badge>

        {isAdmin && (
          <Badge className="bg-warning/10 text-warning border border-warning/20 rounded-lg text-[10px] h-6 px-2 font-medium">
            ادمین
          </Badge>
        )}

        <Badge variant="outline" className="rounded-lg text-[10px] h-6 px-2 font-mono text-muted-foreground">
          <Activity className="w-3 h-3 ml-1" strokeWidth={2} />
          {adminUser.transactionCount}
        </Badge>

        {hasNoTransactions && (
          <Badge variant="outline" className="rounded-lg text-[10px] h-6 px-2 border-warning/20 text-warning bg-warning/10">
            <AlertTriangle className="w-3 h-3 ml-1" strokeWidth={2} />
            بدون فعالیت
          </Badge>
        )}
      </div>

      {/* Row 3: Last Login */}
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Clock className="w-3.5 h-3.5" strokeWidth={2} />
        <span>آخرین ورود: {lastLoginText}</span>
      </div>
    </div>
  );
}
