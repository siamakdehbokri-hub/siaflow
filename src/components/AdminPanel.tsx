import { useEffect, useState } from 'react';
import { 
  Users, BarChart3, Shield, Trash2, UserX, UserCheck,
  RefreshCw, Crown, Activity, Database, CreditCard, Target,
  AlertTriangle, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useAdmin, AdminUser } from '@/hooks/useAdmin';
import { formatDistanceToNow } from 'date-fns';
import { faIR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export function AdminPanel() {
  const { user } = useAuth();
  const { 
    isAdmin, 
    loading, 
    users, 
    stats,
    usersLoading, 
    statsLoading,
    fetchUsers, 
    fetchStats,
    toggleUserStatus,
    deleteUser,
    setUserAdmin
  } = useAdmin();

  const [deleteConfirmUser, setDeleteConfirmUser] = useState<AdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchStats();
    }
  }, [isAdmin, fetchUsers, fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Shield className="w-16 h-16 text-destructive mb-4" />
          <h2 className="text-xl font-bold text-destructive mb-2">دسترسی غیرمجاز</h2>
          <p className="text-muted-foreground text-center">
            شما مجوز دسترسی به پنل مدیریت را ندارید.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleToggleStatus = async (userId: string) => {
    setActionLoading(userId);
    try {
      await toggleUserStatus(userId);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    
    setActionLoading(deleteConfirmUser.id);
    try {
      await deleteUser(deleteConfirmUser.id);
    } finally {
      setActionLoading(null);
      setDeleteConfirmUser(null);
    }
  };

  const handleToggleAdmin = async (adminUser: AdminUser) => {
    setActionLoading(adminUser.id);
    try {
      const isCurrentlyAdmin = adminUser.roles.includes('admin');
      await setUserAdmin(adminUser.id, !isCurrentlyAdmin);
    } finally {
      setActionLoading(null);
    }
  };

  const formatLastLogin = (date: string | null) => {
    if (!date) return 'هرگز';
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: faIR });
    } catch {
      return 'نامشخص';
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">پنل مدیریت</h1>
            <p className="text-sm text-muted-foreground">نسخه 1.9</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            fetchUsers();
            fetchStats();
          }}
          disabled={usersLoading || statsLoading}
        >
          <RefreshCw className={cn("w-4 h-4 ml-2", (usersLoading || statsLoading) && "animate-spin")} />
          بروزرسانی
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalUsers ?? '-'}</p>
                <p className="text-xs text-muted-foreground">کاربران</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Activity className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.activeUsers ?? '-'}</p>
                <p className="text-xs text-muted-foreground">فعال</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <CreditCard className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalTransactions ?? '-'}</p>
                <p className="text-xs text-muted-foreground">تراکنش</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Database className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalCategories ?? '-'}</p>
                <p className="text-xs text-muted-foreground">دسته‌بندی</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <BarChart3 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalDebts ?? '-'}</p>
                <p className="text-xs text-muted-foreground">بدهی</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-500/10">
                <Target className="w-5 h-5 text-teal-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalGoals ?? '-'}</p>
                <p className="text-xs text-muted-foreground">هدف</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            کاربران
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            تنظیمات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                لیست کاربران ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : users.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  هیچ کاربری یافت نشد
                </p>
              ) : (
                <div className="overflow-x-auto">
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
                      {users.map((adminUser) => (
                        <TableRow key={adminUser.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={adminUser.avatarUrl || undefined} />
                                <AvatarFallback>
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
                            <Badge variant={adminUser.isActive ? 'default' : 'secondary'}>
                              {adminUser.isActive ? 'فعال' : 'غیرفعال'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {adminUser.roles.includes('admin') && (
                                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                                  <Crown className="w-3 h-3 ml-1" />
                                  ادمین
                                </Badge>
                              )}
                              {adminUser.roles.length === 0 && (
                                <Badge variant="outline">کاربر</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono">{adminUser.transactionCount}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {formatLastLogin(adminUser.lastLogin)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {/* Prevent self-modification */}
                              {adminUser.id !== user?.id && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleToggleStatus(adminUser.id)}
                                    disabled={actionLoading === adminUser.id}
                                    title={adminUser.isActive ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
                                  >
                                    {actionLoading === adminUser.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : adminUser.isActive ? (
                                      <UserX className="w-4 h-4 text-orange-500" />
                                    ) : (
                                      <UserCheck className="w-4 h-4 text-green-500" />
                                    )}
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleToggleAdmin(adminUser)}
                                    disabled={actionLoading === adminUser.id}
                                    title={adminUser.roles.includes('admin') ? 'حذف نقش ادمین' : 'اضافه کردن نقش ادمین'}
                                  >
                                    <Crown className={cn(
                                      "w-4 h-4",
                                      adminUser.roles.includes('admin') ? "text-yellow-500" : "text-muted-foreground"
                                    )} />
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteConfirmUser(adminUser)}
                                    disabled={actionLoading === adminUser.id}
                                    title="حذف کاربر"
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </>
                              )}
                              {adminUser.id === user?.id && (
                                <Badge variant="outline" className="text-xs">شما</Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>تنظیمات سیستم</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                تنظیمات پیشرفته در نسخه‌های بعدی اضافه خواهد شد.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmUser} onOpenChange={() => setDeleteConfirmUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              حذف کاربر
            </AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئن هستید که می‌خواهید کاربر <strong>{deleteConfirmUser?.displayName}</strong> را حذف کنید؟
              <br /><br />
              این عمل تمام داده‌های کاربر شامل تراکنش‌ها، دسته‌بندی‌ها، بدهی‌ها و اهداف پس‌انداز را به‌صورت دائمی حذف می‌کند و قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف کاربر
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
