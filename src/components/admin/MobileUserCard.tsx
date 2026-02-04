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
  
  // Risk indicators
  const isInactive = !adminUser.isActive;
  const hasNoTransactions = adminUser.transactionCount === 0;
  const lastLoginText = formatLastLogin(adminUser.lastLogin);

  return (
    <div className={cn(
      "bg-white dark:bg-slate-900 rounded-xl border-2 p-3 space-y-2.5 transition-all",
      isInactive 
        ? "border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20" 
        : "border-slate-200 dark:border-slate-800"
    )}>
      {/* Row 1: User Info + Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Avatar className="w-10 h-10 border-2 border-slate-200 dark:border-slate-700 shrink-0">
            <AvatarImage src={adminUser.avatarUrl || undefined} />
            <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm">
              {adminUser.displayName?.charAt(0)?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-sm truncate text-slate-900 dark:text-slate-100">
                {adminUser.displayName || 'بدون نام'}
              </p>
              {isAdmin && (
                <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" strokeWidth={2} />
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate" dir="ltr">
              {adminUser.email}
            </p>
          </div>
        </div>

        {/* Actions */}
        {!isCurrentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-lg shrink-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <MoreVertical className="w-4 h-4" strokeWidth={2} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuLabel className="text-xs text-slate-500">عملیات</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewDetails(adminUser)} className="py-2.5 rounded-lg">
                <Eye className="w-4 h-4 ml-2" strokeWidth={2} />
                مشاهده جزئیات
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(adminUser.id)} className="py-2.5 rounded-lg">
                {adminUser.isActive ? (
                  <>
                    <UserX className="w-4 h-4 ml-2 text-orange-500" strokeWidth={2} />
                    غیرفعال کردن
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 ml-2 text-emerald-500" strokeWidth={2} />
                    فعال کردن
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleAdmin(adminUser)} className="py-2.5 rounded-lg">
                <Crown className={cn(
                  "w-4 h-4 ml-2",
                  isAdmin ? "text-amber-500" : "text-slate-400"
                )} strokeWidth={2} />
                {isAdmin ? 'حذف ادمین' : 'ادمین کردن'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(adminUser)}
                className="text-red-600 focus:text-red-600 py-2.5 rounded-lg"
              >
                <Trash2 className="w-4 h-4 ml-2" strokeWidth={2} />
                حذف کاربر
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Badge variant="outline" className="text-[10px] rounded-lg h-6 px-2 border-slate-300 dark:border-slate-600 text-slate-500 shrink-0">
            شما
          </Badge>
        )}
      </div>

      {/* Row 2: Status Badges */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Status */}
        <Badge 
          variant="outline"
          className={cn(
            "rounded-lg text-[10px] h-6 px-2 font-medium border",
            adminUser.isActive 
              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" 
              : "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
          )}
        >
          <span className={cn(
            "w-1.5 h-1.5 rounded-full ml-1.5",
            adminUser.isActive ? "bg-emerald-500" : "bg-red-500"
          )} />
          {adminUser.isActive ? 'فعال' : 'غیرفعال'}
        </Badge>

        {/* Role */}
        {isAdmin && (
          <Badge className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-lg text-[10px] h-6 px-2 font-medium">
            ادمین
          </Badge>
        )}

        {/* Transaction Count */}
        <Badge variant="outline" className="rounded-lg text-[10px] h-6 px-2 font-mono border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
          <Activity className="w-3 h-3 ml-1" strokeWidth={2} />
          {adminUser.transactionCount}
        </Badge>

        {/* Warning indicators */}
        {hasNoTransactions && (
          <Badge variant="outline" className="rounded-lg text-[10px] h-6 px-2 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50">
            <AlertTriangle className="w-3 h-3 ml-1" strokeWidth={2} />
            بدون فعالیت
          </Badge>
        )}
      </div>

      {/* Row 3: Last Login */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
        <Clock className="w-3.5 h-3.5" strokeWidth={2} />
        <span>آخرین ورود: {lastLoginText}</span>
      </div>
    </div>
  );
}
