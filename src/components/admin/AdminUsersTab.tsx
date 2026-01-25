import { Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users, Crown, Trash2, UserX, UserCheck, 
  ChevronDown, Eye, Search, Download 
} from 'lucide-react';
import { AdminUser } from '@/hooks/useAdmin';
import { formatDistanceToNow } from 'date-fns';
import { faIR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { User } from '@supabase/supabase-js';

interface AdminUsersTabProps {
  users: AdminUser[];
  filteredUsers: AdminUser[];
  usersLoading: boolean;
  currentUser: User | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: 'all' | 'active' | 'inactive';
  setStatusFilter: (filter: 'all' | 'active' | 'inactive') => void;
  roleFilter: 'all' | 'admin' | 'user';
  setRoleFilter: (filter: 'all' | 'admin' | 'user') => void;
  onToggleStatus: (userId: string) => void;
  onToggleAdmin: (user: AdminUser) => void;
  onDeleteUser: (user: AdminUser) => void;
  onViewUser: (user: AdminUser) => void;
  exportToCSV: () => void;
  actionLoading: string | null;
}

export function AdminUsersTab({
  users,
  filteredUsers,
  usersLoading,
  currentUser,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  roleFilter,
  setRoleFilter,
  onToggleStatus,
  onToggleAdmin,
  onDeleteUser,
  onViewUser,
  exportToCSV,
  actionLoading,
}: AdminUsersTabProps) {
  const formatLastLogin = (date: string | null) => {
    if (!date) return 'هرگز';
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: faIR });
    } catch {
      return 'نامشخص';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="glass">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="جستجوی کاربر..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger className="w-[120px] rounded-xl">
                  <SelectValue placeholder="وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه</SelectItem>
                  <SelectItem value="active">فعال</SelectItem>
                  <SelectItem value="inactive">غیرفعال</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
                <SelectTrigger className="w-[120px] rounded-xl">
                  <SelectValue placeholder="نقش" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه</SelectItem>
                  <SelectItem value="admin">ادمین</SelectItem>
                  <SelectItem value="user">کاربر</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                size="icon" 
                onClick={exportToCSV}
                className="rounded-xl"
                title="خروجی CSV"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              لیست کاربران
            </div>
            <Badge variant="outline" className="font-mono">
              {filteredUsers.length} / {users.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">کاربری یافت نشد</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">کاربر</TableHead>
                    <TableHead className="text-right">وضعیت</TableHead>
                    <TableHead className="text-right">نقش</TableHead>
                    <TableHead className="text-right">تراکنش‌ها</TableHead>
                    <TableHead className="text-right">آخرین ورود</TableHead>
                    <TableHead className="text-right">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((adminUser) => (
                    <TableRow key={adminUser.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 border-2 border-border">
                            <AvatarImage src={adminUser.avatarUrl || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {adminUser.displayName?.charAt(0)?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{adminUser.displayName}</p>
                            <p className="text-xs text-muted-foreground">{adminUser.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={adminUser.isActive ? 'default' : 'secondary'}
                          className={cn(
                            "rounded-lg",
                            adminUser.isActive 
                              ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" 
                              : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                          )}
                        >
                          {adminUser.isActive ? 'فعال' : 'غیرفعال'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {adminUser.roles.includes('admin') ? (
                          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 rounded-lg">
                            <Crown className="w-3 h-3 ml-1" />
                            ادمین
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="rounded-lg">کاربر</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm bg-muted px-2 py-1 rounded-lg">
                          {adminUser.transactionCount}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatLastLogin(adminUser.lastLogin)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {adminUser.id !== currentUser?.id ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="rounded-xl">
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>عملیات</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => onViewUser(adminUser)}>
                                <Eye className="w-4 h-4 ml-2" />
                                مشاهده جزئیات
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onToggleStatus(adminUser.id)}>
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
                              <DropdownMenuItem onClick={() => onToggleAdmin(adminUser)}>
                                <Crown className={cn(
                                  "w-4 h-4 ml-2",
                                  adminUser.roles.includes('admin') ? "text-amber-500" : "text-muted-foreground"
                                )} />
                                {adminUser.roles.includes('admin') ? 'حذف نقش ادمین' : 'افزودن نقش ادمین'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => onDeleteUser(adminUser)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 ml-2" />
                                حذف کاربر
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Badge variant="outline" className="text-xs rounded-lg">شما</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
