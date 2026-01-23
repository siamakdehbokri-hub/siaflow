import { useEffect, useState, useMemo } from 'react';
import { 
  Users, BarChart3, Shield, Trash2, UserX, UserCheck,
  RefreshCw, Crown, Activity, Database, CreditCard, Target,
  AlertTriangle, Loader2, Search, Download, Filter, Eye,
  Mail, Phone, Calendar, TrendingUp, Clock, ChevronDown,
  Settings, FileText, UserPlus, Bell, MessageSquare, 
  Server, HardDrive, Wallet, ArrowRightLeft, PieChart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
import { useAdmin, AdminUser } from '@/hooks/useAdmin';
import { formatDistanceToNow, format, subDays } from 'date-fns';
import { faIR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/utils/persianDate';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchStats();
    }
  }, [isAdmin, fetchUsers, fetchStats]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // Search filter
      const matchesSearch = 
        u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'active' && u.isActive) ||
        (statusFilter === 'inactive' && !u.isActive);
      
      // Role filter
      const matchesRole = 
        roleFilter === 'all' ||
        (roleFilter === 'admin' && u.roles.includes('admin')) ||
        (roleFilter === 'user' && !u.roles.includes('admin'));
      
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchQuery, statusFilter, roleFilter]);

  // Export users to CSV
  const exportToCSV = () => {
    const headers = ['نام', 'ایمیل', 'وضعیت', 'نقش', 'تعداد تراکنش', 'آخرین ورود', 'تاریخ ثبت‌نام'];
    const rows = filteredUsers.map(u => [
      u.displayName || '-',
      u.email || '-',
      u.isActive ? 'فعال' : 'غیرفعال',
      u.roles.includes('admin') ? 'ادمین' : 'کاربر',
      u.transactionCount.toString(),
      u.lastLogin ? format(new Date(u.lastLogin), 'yyyy/MM/dd HH:mm') : 'هرگز',
      u.createdAt ? format(new Date(u.createdAt), 'yyyy/MM/dd') : '-'
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="glass border-destructive/30">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="p-4 rounded-2xl bg-destructive/10 mb-4">
            <Shield className="w-12 h-12 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-destructive mb-2">دسترسی غیرمجاز</h2>
          <p className="text-muted-foreground text-center max-w-sm">
            شما مجوز دسترسی به پنل مدیریت را ندارید. لطفاً با مدیر سیستم تماس بگیرید.
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

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    try {
      return format(new Date(date), 'yyyy/MM/dd', { locale: faIR });
    } catch {
      return '-';
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl glass-glow">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">پنل مدیریت</h1>
            <p className="text-sm text-muted-foreground">مدیریت کاربران و سیستم • نسخه 1.9</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            fetchUsers();
            fetchStats();
          }}
          disabled={usersLoading || statsLoading}
          className="rounded-xl"
        >
          <RefreshCw className={cn("w-4 h-4 ml-2", (usersLoading || statsLoading) && "animate-spin")} />
          بروزرسانی
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="glass hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalUsers ?? '-'}</p>
                <p className="text-xs text-muted-foreground">کل کاربران</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-500/10">
                <Activity className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.activeUsers ?? '-'}</p>
                <p className="text-xs text-muted-foreground">کاربر فعال</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10">
                <CreditCard className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalTransactions ?? '-'}</p>
                <p className="text-xs text-muted-foreground">تراکنش</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-500/10">
                <Database className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalCategories ?? '-'}</p>
                <p className="text-xs text-muted-foreground">دسته‌بندی</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10">
                <BarChart3 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalDebts ?? '-'}</p>
                <p className="text-xs text-muted-foreground">بدهی</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/10">
                <Target className="w-5 h-5 text-teal-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalGoals ?? '-'}</p>
                <p className="text-xs text-muted-foreground">هدف پس‌انداز</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md glass">
          <TabsTrigger value="users" className="gap-2 rounded-xl">
            <Users className="w-4 h-4" />
            کاربران
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2 rounded-xl">
            <BarChart3 className="w-4 h-4" />
            گزارش‌ها
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2 rounded-xl">
            <Settings className="w-4 h-4" />
            تنظیمات
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="mt-4 space-y-4">
          {/* Search and Filters */}
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

          {/* Users Table */}
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
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter !== 'all' || roleFilter !== 'all' 
                      ? 'کاربری با این فیلترها یافت نشد' 
                      : 'هیچ کاربری یافت نشد'}
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right sticky top-0 bg-background">کاربر</TableHead>
                        <TableHead className="text-right sticky top-0 bg-background">وضعیت</TableHead>
                        <TableHead className="text-right sticky top-0 bg-background">نقش</TableHead>
                        <TableHead className="text-right sticky top-0 bg-background">تراکنش‌ها</TableHead>
                        <TableHead className="text-right sticky top-0 bg-background">آخرین ورود</TableHead>
                        <TableHead className="text-right sticky top-0 bg-background">عملیات</TableHead>
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
                            <div className="flex gap-1">
                              {adminUser.roles.includes('admin') ? (
                                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 rounded-lg">
                                  <Crown className="w-3 h-3 ml-1" />
                                  ادمین
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="rounded-lg">کاربر</Badge>
                              )}
                            </div>
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
                            <div className="flex items-center gap-1">
                              {adminUser.id !== user?.id ? (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="rounded-xl">
                                      <ChevronDown className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel>عملیات</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setSelectedUser(adminUser)}>
                                      <Eye className="w-4 h-4 ml-2" />
                                      مشاهده جزئیات
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleToggleStatus(adminUser.id)}>
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
                                    <DropdownMenuItem onClick={() => handleToggleAdmin(adminUser)}>
                                      <Crown className={cn(
                                        "w-4 h-4 ml-2",
                                        adminUser.roles.includes('admin') ? "text-amber-500" : "text-muted-foreground"
                                      )} />
                                      {adminUser.roles.includes('admin') ? 'حذف نقش ادمین' : 'افزودن نقش ادمین'}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => setDeleteConfirmUser(adminUser)}
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
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  آمار کلی سیستم
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-xl bg-muted/50">
                  <span className="text-muted-foreground">نرخ فعالیت کاربران</span>
                  <span className="font-bold text-primary">
                    {stats?.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-muted/50">
                  <span className="text-muted-foreground">میانگین تراکنش به ازای کاربر</span>
                  <span className="font-bold">
                    {stats?.totalUsers ? Math.round(stats.totalTransactions / stats.totalUsers) : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-muted/50">
                  <span className="text-muted-foreground">میانگین دسته‌بندی به ازای کاربر</span>
                  <span className="font-bold">
                    {stats?.totalUsers ? Math.round(stats.totalCategories / stats.totalUsers) : 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-primary" />
                  خروجی گزارش
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start rounded-xl"
                  onClick={exportToCSV}
                >
                  <Download className="w-4 h-4 ml-2" />
                  خروجی لیست کاربران (CSV)
                </Button>
                <p className="text-xs text-muted-foreground">
                  می‌توانید لیست کاربران را به فرمت CSV دانلود کنید.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                تنظیمات سیستم
              </CardTitle>
              <CardDescription>
                مدیریت تنظیمات کلی سیستم
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl border border-border bg-muted/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">احراز هویت</p>
                    <p className="text-xs text-muted-foreground">تأیید ایمیل خودکار فعال است</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-muted/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Database className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">پایگاه داده</p>
                    <p className="text-xs text-muted-foreground">متصل و فعال</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-muted/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Activity className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">نسخه سیستم</p>
                    <p className="text-xs text-muted-foreground">SiaFlow v1.9</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Details Dialog */}
      <AlertDialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={selectedUser?.avatarUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                  {selectedUser?.displayName?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p>{selectedUser?.displayName}</p>
                <p className="text-sm font-normal text-muted-foreground">{selectedUser?.email}</p>
              </div>
            </AlertDialogTitle>
          </AlertDialogHeader>
          
          <div className="space-y-3 py-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
              <span className="text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4" />
                وضعیت
              </span>
              <Badge variant={selectedUser?.isActive ? 'default' : 'secondary'}>
                {selectedUser?.isActive ? 'فعال' : 'غیرفعال'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
              <span className="text-muted-foreground flex items-center gap-2">
                <Crown className="w-4 h-4" />
                نقش
              </span>
              <span className="font-medium">
                {selectedUser?.roles.includes('admin') ? 'ادمین' : 'کاربر'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
              <span className="text-muted-foreground flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                تعداد تراکنش
              </span>
              <span className="font-mono font-medium">{selectedUser?.transactionCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
              <span className="text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                آخرین ورود
              </span>
              <span className="text-sm">{formatLastLogin(selectedUser?.lastLogin || null)}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                تاریخ ثبت‌نام
              </span>
              <span className="text-sm">{formatDate(selectedUser?.createdAt || null)}</span>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">بستن</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmUser} onOpenChange={() => setDeleteConfirmUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              حذف کاربر
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              آیا مطمئن هستید که می‌خواهید کاربر <strong className="text-foreground">{deleteConfirmUser?.displayName}</strong> را حذف کنید؟
              <br /><br />
              <span className="text-destructive">
                ⚠️ این عمل تمام داده‌های کاربر شامل تراکنش‌ها، دسته‌بندی‌ها، بدهی‌ها و اهداف پس‌انداز را به‌صورت دائمی حذف می‌کند و قابل بازگشت نیست.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={actionLoading === deleteConfirmUser?.id}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              {actionLoading === deleteConfirmUser?.id ? (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              ) : (
                <Trash2 className="w-4 h-4 ml-2" />
              )}
              حذف کاربر
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
