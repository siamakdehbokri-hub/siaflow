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
    <div className="bg-card rounded-xl border-2 border-border p-4 space-y-3">
      {/* Header: Avatar + Name */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar className="w-12 h-12 border-2 border-border shrink-0">
            <AvatarImage src={adminUser.avatarUrl || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
              {adminUser.displayName?.charAt(0)?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-base truncate">{adminUser.displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{adminUser.email}</p>
          </div>
        </div>

        {/* Actions Dropdown */}
        {!isCurrentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 shrink-0">
                <ChevronDown className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>عملیات</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewDetails(adminUser)} className="py-3">
                <Eye className="w-4 h-4 ml-2" />
                مشاهده جزئیات
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(adminUser.id)} className="py-3">
                {adminUser.isActive ? (
                  <>
                    <UserX className="w-4 h-4 ml-2 text-orange-500" />
                    غیرفعال‌سازی
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 ml-2 text-green-500" />
                    فعال‌سازی
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleAdmin(adminUser)} className="py-3">
                <Crown className={cn(
                  "w-4 h-4 ml-2",
                  isAdmin ? "text-amber-500" : "text-muted-foreground"
                )} />
                {isAdmin ? 'حذف نقش ادمین' : 'افزودن نقش ادمین'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(adminUser)}
                className="text-destructive focus:text-destructive py-3"
              >
                <Trash2 className="w-4 h-4 ml-2" />
                حذف کاربر
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Badge variant="outline" className="text-xs rounded-lg shrink-0">شما</Badge>
        )}
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge 
          variant={adminUser.isActive ? 'default' : 'secondary'}
          className={cn(
            "rounded-lg text-xs",
            adminUser.isActive 
              ? "bg-green-500/10 text-green-600" 
              : "bg-red-500/10 text-red-600"
          )}
        >
          {adminUser.isActive ? 'فعال' : 'غیرفعال'}
        </Badge>

        {isAdmin && (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 rounded-lg text-xs">
            <Crown className="w-3 h-3 ml-1" />
            ادمین
          </Badge>
        )}

        <span className="font-mono text-xs bg-muted px-2 py-1 rounded-lg">
          {adminUser.transactionCount} تراکنش
        </span>
      </div>

      {/* Last Login */}
      <div className="text-xs text-muted-foreground">
        آخرین ورود: {formatLastLogin(adminUser.lastLogin)}
      </div>
    </div>
  );
}
