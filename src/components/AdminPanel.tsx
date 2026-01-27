import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, BarChart3, Shield, Trash2, UserX, UserCheck,
  RefreshCw, Crown, Activity, Database, CreditCard, Target,
  AlertTriangle, Loader2, Search, Download, Filter, Eye,
  Mail, Phone, Calendar, TrendingUp, Clock, ChevronDown,
  Settings, FileText, UserPlus, Bell, MessageSquare, 
  Server, HardDrive, Wallet, ArrowRightLeft, PieChart,
  Banknote, TrendingDown, DollarSign, Receipt, Tag, Landmark,
  ArrowRight, Home
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
import { useAdmin, AdminUser, AdminTransaction, AdminCategory, AdminDebt, AdminGoal, AdminAccount } from '@/hooks/useAdmin';
import { formatDistanceToNow, format, subDays } from 'date-fns';
import { faIR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/utils/persianDate';

export function AdminPanel() {
  const navigate = useNavigate();
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
    setUserAdmin,
    // Extended data
    transactions,
    transactionsLoading,
    fetchAllTransactions,
    categories,
    categoriesLoading,
    fetchAllCategories,
    debts,
    debtsLoading,
    fetchAllDebts,
    goals,
    goalsLoading,
    fetchAllGoals,
    accounts,
    accountsLoading,
    fetchAllAccounts,
    financialSummary,
    financialSummaryLoading,
    fetchFinancialSummary,
    // Delete actions
    deleteTransaction,
    deleteCategory,
    deleteDebt,
    deleteGoal
  } = useAdmin();

  const [deleteConfirmUser, setDeleteConfirmUser] = useState<AdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState('users');
  
  // Filter states for transactions
  const [txSearchQuery, setTxSearchQuery] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [txUserFilter, setTxUserFilter] = useState<string>('all');

  // Delete confirm states
  const [deleteConfirmTx, setDeleteConfirmTx] = useState<AdminTransaction | null>(null);
  const [deleteConfirmCat, setDeleteConfirmCat] = useState<AdminCategory | null>(null);
  const [deleteConfirmDebt, setDeleteConfirmDebt] = useState<AdminDebt | null>(null);
  const [deleteConfirmGoal, setDeleteConfirmGoal] = useState<AdminGoal | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchStats();
      fetchFinancialSummary();
    }
  }, [isAdmin, fetchUsers, fetchStats, fetchFinancialSummary]);

  // Load data when tab changes
  useEffect(() => {
    if (!isAdmin) return;
    
    switch (activeTab) {
      case 'transactions':
        if (transactions.length === 0) fetchAllTransactions();
        break;
      case 'categories':
        if (categories.length === 0) fetchAllCategories();
        break;
      case 'debts':
        if (debts.length === 0) fetchAllDebts();
        break;
      case 'goals':
        if (goals.length === 0) fetchAllGoals();
        break;
      case 'accounts':
        if (accounts.length === 0) fetchAllAccounts();
        break;
    }
  }, [activeTab, isAdmin]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = 
        u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'active' && u.isActive) ||
        (statusFilter === 'inactive' && !u.isActive);
      
      const matchesRole = 
        roleFilter === 'all' ||
        (roleFilter === 'admin' && u.roles.includes('admin')) ||
        (roleFilter === 'user' && !u.roles.includes('admin'));
      
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchQuery, statusFilter, roleFilter]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = 
        t.category?.toLowerCase().includes(txSearchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(txSearchQuery.toLowerCase()) ||
        t.userName?.toLowerCase().includes(txSearchQuery.toLowerCase());
      
      const matchesType = txTypeFilter === 'all' || t.type === txTypeFilter;
      const matchesUser = txUserFilter === 'all' || t.user_id === txUserFilter;
      
      return matchesSearch && matchesType && matchesUser;
    });
  }, [transactions, txSearchQuery, txTypeFilter, txUserFilter]);

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

  // Export transactions to CSV
  const exportTransactionsToCSV = () => {
    const headers = ['تاریخ', 'کاربر', 'نوع', 'دسته‌بندی', 'مبلغ', 'توضیحات'];
    const rows = filteredTransactions.map(t => [
      t.date,
      t.userName,
      t.type === 'income' ? 'درآمد' : 'هزینه',
      t.category,
      t.amount.toString(),
      t.description || '-'
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
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

  const handleDeleteTransaction = async () => {
    if (!deleteConfirmTx) return;
    setActionLoading(deleteConfirmTx.id);
    try {
      await deleteTransaction(deleteConfirmTx.id);
    } finally {
      setActionLoading(null);
      setDeleteConfirmTx(null);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteConfirmCat) return;
    setActionLoading(deleteConfirmCat.id);
    try {
      await deleteCategory(deleteConfirmCat.id);
    } finally {
      setActionLoading(null);
      setDeleteConfirmCat(null);
    }
  };

  const handleDeleteDebt = async () => {
    if (!deleteConfirmDebt) return;
    setActionLoading(deleteConfirmDebt.id);
    try {
      await deleteDebt(deleteConfirmDebt.id);
    } finally {
      setActionLoading(null);
      setDeleteConfirmDebt(null);
    }
  };

  const handleDeleteGoal = async () => {
    if (!deleteConfirmGoal) return;
    setActionLoading(deleteConfirmGoal.id);
    try {
      await deleteGoal(deleteConfirmGoal.id);
    } finally {
      setActionLoading(null);
      setDeleteConfirmGoal(null);
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

  const refreshAll = () => {
    fetchUsers();
    fetchStats();
    fetchFinancialSummary();
    if (transactions.length > 0) fetchAllTransactions();
    if (categories.length > 0) fetchAllCategories();
    if (debts.length > 0) fetchAllDebts();
    if (goals.length > 0) fetchAllGoals();
    if (accounts.length > 0) fetchAllAccounts();
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="rounded-xl gap-2 border-2"
        >
          <Home className="w-4 h-4" />
          <span className="text-sm">خانه</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={refreshAll}
          disabled={usersLoading || statsLoading}
          className="rounded-xl border-2"
        >
          <RefreshCw className={cn("w-4 h-4 ml-2", (usersLoading || statsLoading) && "animate-spin")} />
          بروزرسانی
        </Button>
      </div>

      {/* Financial Summary Cards */}
      {financialSummary && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-card rounded-xl border-2 border-border p-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">کل درآمد</p>
                <p className="text-sm font-bold text-success truncate">{formatCurrency(financialSummary.totalIncome)}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border-2 border-border p-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                <TrendingDown className="w-4 h-4 text-destructive" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">کل هزینه</p>
                <p className="text-sm font-bold text-destructive truncate">{formatCurrency(financialSummary.totalExpense)}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border-2 border-border p-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">موجودی</p>
                <p className="text-sm font-bold text-primary truncate">{formatCurrency(financialSummary.totalAccountBalance)}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border-2 border-border p-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4 text-purple-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">پیشرفت اهداف</p>
                <p className="text-sm font-bold text-purple-500">{financialSummary.totalGoalProgress}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-card rounded-xl border-2 border-border p-3 text-center">
          <p className="text-lg font-bold text-primary">{stats?.totalUsers ?? '-'}</p>
          <p className="text-[10px] text-muted-foreground">کاربران</p>
        </div>
        <div className="bg-card rounded-xl border-2 border-border p-3 text-center">
          <p className="text-lg font-bold text-success">{stats?.activeUsers ?? '-'}</p>
          <p className="text-[10px] text-muted-foreground">فعال</p>
        </div>
        <div className="bg-card rounded-xl border-2 border-border p-3 text-center">
          <p className="text-lg font-bold text-foreground">{stats?.totalTransactions ?? '-'}</p>
          <p className="text-[10px] text-muted-foreground">تراکنش</p>
        </div>
        <div className="bg-card rounded-xl border-2 border-border p-3 text-center">
          <p className="text-lg font-bold text-foreground">{stats?.totalCategories ?? '-'}</p>
          <p className="text-[10px] text-muted-foreground">دسته‌بندی</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex gap-1 p-1 rounded-xl bg-muted/50 border-2 border-border overflow-x-auto">
          <TabsList className="inline-flex w-full bg-transparent p-0 h-auto gap-1">
            <TabsTrigger value="users" className="flex-1 rounded-lg py-2.5 px-2 text-xs font-medium data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20 data-[state=active]:shadow-sm">
              کاربران
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex-1 rounded-lg py-2.5 px-2 text-xs font-medium data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20 data-[state=active]:shadow-sm">
              تراکنش‌ها
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex-1 rounded-lg py-2.5 px-2 text-xs font-medium data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20 data-[state=active]:shadow-sm">
              دسته‌ها
            </TabsTrigger>
            <TabsTrigger value="debts" className="flex-1 rounded-lg py-2.5 px-2 text-xs font-medium data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20 data-[state=active]:shadow-sm">
              بدهی‌ها
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex-1 rounded-lg py-2.5 px-2 text-xs font-medium data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20 data-[state=active]:shadow-sm">
              اهداف
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex-1 rounded-lg py-2.5 px-2 text-xs font-medium data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20 data-[state=active]:shadow-sm">
              حساب‌ها
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 rounded-lg py-2.5 px-2 text-xs font-medium data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20 data-[state=active]:shadow-sm">
              تنظیمات
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Users Tab */}
        <TabsContent value="users" className="mt-4 space-y-4">
          <div className="bg-card rounded-xl border-2 border-border p-4">
            <div className="flex flex-col gap-3">
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
            </div>
          </div>

          <div className="bg-card rounded-xl border-2 border-border">
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
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="mt-4 space-y-4">
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="جستجوی تراکنش..."
                    value={txSearchQuery}
                    onChange={(e) => setTxSearchQuery(e.target.value)}
                    className="pr-10 rounded-xl"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={txTypeFilter} onValueChange={(v: any) => setTxTypeFilter(v)}>
                    <SelectTrigger className="w-[120px] rounded-xl">
                      <SelectValue placeholder="نوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه</SelectItem>
                      <SelectItem value="income">درآمد</SelectItem>
                      <SelectItem value="expense">هزینه</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={txUserFilter} onValueChange={setTxUserFilter}>
                    <SelectTrigger className="w-[150px] rounded-xl">
                      <SelectValue placeholder="کاربر" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه کاربران</SelectItem>
                      {users.map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.displayName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={exportTransactionsToCSV}
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
                  <CreditCard className="w-5 h-5" />
                  تمام تراکنش‌ها
                </div>
                <Badge variant="outline" className="font-mono">
                  {filteredTransactions.length} / {transactions.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">تراکنشی یافت نشد</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">تاریخ</TableHead>
                        <TableHead className="text-right">کاربر</TableHead>
                        <TableHead className="text-right">نوع</TableHead>
                        <TableHead className="text-right">دسته‌بندی</TableHead>
                        <TableHead className="text-right">مبلغ</TableHead>
                        <TableHead className="text-right">عملیات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((tx) => (
                        <TableRow key={tx.id} className="hover:bg-muted/50">
                          <TableCell className="text-sm">{tx.date}</TableCell>
                          <TableCell className="text-sm">{tx.userName}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "rounded-lg",
                                tx.type === 'income' 
                                  ? "bg-green-500/10 text-green-600" 
                                  : "bg-red-500/10 text-red-600"
                              )}
                            >
                              {tx.type === 'income' ? 'درآمد' : 'هزینه'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{tx.category}</TableCell>
                          <TableCell className={cn(
                            "font-mono font-medium",
                            tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                          )}>
                            {formatCurrency(tx.amount)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirmTx(tx)}
                              className="text-destructive hover:text-destructive rounded-xl"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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

        {/* Categories Tab */}
        <TabsContent value="categories" className="mt-4">
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  تمام دسته‌بندی‌ها
                </div>
                <Badge variant="outline" className="font-mono">{categories.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-12">
                  <Tag className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">دسته‌بندی‌ای یافت نشد</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">نام</TableHead>
                        <TableHead className="text-right">کاربر</TableHead>
                        <TableHead className="text-right">نوع</TableHead>
                        <TableHead className="text-right">بودجه</TableHead>
                        <TableHead className="text-right">عملیات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((cat) => (
                        <TableRow key={cat.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: cat.color + '20' }}
                              >
                                <span style={{ color: cat.color }}>●</span>
                              </div>
                              <span className="font-medium">{cat.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{cat.userName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="rounded-lg">
                              {cat.type === 'income' ? 'درآمد' : 'هزینه'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {cat.budget ? formatCurrency(cat.budget) : '-'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirmCat(cat)}
                              className="text-destructive hover:text-destructive rounded-xl"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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

        {/* Debts Tab */}
        <TabsContent value="debts" className="mt-4">
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Banknote className="w-5 h-5" />
                  تمام بدهی‌ها
                </div>
                <Badge variant="outline" className="font-mono">{debts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {debtsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : debts.length === 0 ? (
                <div className="text-center py-12">
                  <Banknote className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">بدهی‌ای یافت نشد</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">نام</TableHead>
                        <TableHead className="text-right">کاربر</TableHead>
                        <TableHead className="text-right">طلبکار</TableHead>
                        <TableHead className="text-right">کل مبلغ</TableHead>
                        <TableHead className="text-right">پرداخت شده</TableHead>
                        <TableHead className="text-right">سررسید</TableHead>
                        <TableHead className="text-right">عملیات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {debts.map((debt) => (
                        <TableRow key={debt.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{debt.name}</TableCell>
                          <TableCell className="text-sm">{debt.userName}</TableCell>
                          <TableCell className="text-sm">{debt.creditor}</TableCell>
                          <TableCell className="font-mono text-sm">{formatCurrency(debt.total_amount)}</TableCell>
                          <TableCell className="font-mono text-sm text-green-600">{formatCurrency(debt.paid_amount)}</TableCell>
                          <TableCell className="text-sm">{debt.due_date || '-'}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirmDebt(debt)}
                              className="text-destructive hover:text-destructive rounded-xl"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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

        {/* Goals Tab */}
        <TabsContent value="goals" className="mt-4">
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  تمام اهداف پس‌انداز
                </div>
                <Badge variant="outline" className="font-mono">{goals.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {goalsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : goals.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">هدفی یافت نشد</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">نام</TableHead>
                        <TableHead className="text-right">کاربر</TableHead>
                        <TableHead className="text-right">هدف</TableHead>
                        <TableHead className="text-right">پس‌انداز</TableHead>
                        <TableHead className="text-right">پیشرفت</TableHead>
                        <TableHead className="text-right">عملیات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {goals.map((goal) => {
                        const progress = goal.target_amount > 0 
                          ? Math.round((goal.current_amount / goal.target_amount) * 100) 
                          : 0;
                        return (
                          <TableRow key={goal.id} className="hover:bg-muted/50">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                                  style={{ backgroundColor: goal.color + '20' }}
                                >
                                  <span style={{ color: goal.color }}>●</span>
                                </div>
                                <span className="font-medium">{goal.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{goal.userName}</TableCell>
                            <TableCell className="font-mono text-sm">{formatCurrency(goal.target_amount)}</TableCell>
                            <TableCell className="font-mono text-sm text-green-600">{formatCurrency(goal.current_amount)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={progress} className="w-16 h-2" />
                                <span className="text-xs font-mono">{progress}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteConfirmGoal(goal)}
                                className="text-destructive hover:text-destructive rounded-xl"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="mt-4">
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  تمام حساب‌ها
                </div>
                <Badge variant="outline" className="font-mono">{accounts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {accountsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : accounts.length === 0 ? (
                <div className="text-center py-12">
                  <Wallet className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">حسابی یافت نشد</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">نام</TableHead>
                        <TableHead className="text-right">کاربر</TableHead>
                        <TableHead className="text-right">نوع</TableHead>
                        <TableHead className="text-right">موجودی</TableHead>
                        <TableHead className="text-right">پیش‌فرض</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accounts.map((acc) => (
                        <TableRow key={acc.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: acc.color + '20' }}
                              >
                                <span style={{ color: acc.color }}>●</span>
                              </div>
                              <span className="font-medium">{acc.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{acc.userName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="rounded-lg">{acc.type}</Badge>
                          </TableCell>
                          <TableCell className={cn(
                            "font-mono text-sm",
                            acc.balance >= 0 ? 'text-green-600' : 'text-red-600'
                          )}>
                            {formatCurrency(acc.balance)}
                          </TableCell>
                          <TableCell>
                            {acc.is_default && (
                              <Badge className="bg-primary/10 text-primary rounded-lg">پیش‌فرض</Badge>
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
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  تنظیمات سیستم
                </CardTitle>
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
                      <p className="text-xs text-muted-foreground">SiaFlow v2.0</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  خروجی گزارشات
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
                <Button 
                  variant="outline" 
                  className="w-full justify-start rounded-xl"
                  onClick={exportTransactionsToCSV}
                >
                  <Download className="w-4 h-4 ml-2" />
                  خروجی تراکنش‌ها (CSV)
                </Button>
              </CardContent>
            </Card>
          </div>
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

      {/* Delete User Dialog */}
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
                ⚠️ این عمل تمام داده‌های کاربر را به‌صورت دائمی حذف می‌کند.
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
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Transaction Dialog */}
      <AlertDialog open={!!deleteConfirmTx} onOpenChange={() => setDeleteConfirmTx(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              حذف تراکنش
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              آیا مطمئن هستید که می‌خواهید این تراکنش را حذف کنید؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTransaction}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              <Trash2 className="w-4 h-4 ml-2" />
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Category Dialog */}
      <AlertDialog open={!!deleteConfirmCat} onOpenChange={() => setDeleteConfirmCat(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              حذف دسته‌بندی
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              آیا مطمئن هستید که می‌خواهید دسته‌بندی <strong className="text-foreground">{deleteConfirmCat?.name}</strong> را حذف کنید؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              <Trash2 className="w-4 h-4 ml-2" />
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Debt Dialog */}
      <AlertDialog open={!!deleteConfirmDebt} onOpenChange={() => setDeleteConfirmDebt(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              حذف بدهی
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              آیا مطمئن هستید که می‌خواهید بدهی <strong className="text-foreground">{deleteConfirmDebt?.name}</strong> را حذف کنید؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDebt}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              <Trash2 className="w-4 h-4 ml-2" />
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Goal Dialog */}
      <AlertDialog open={!!deleteConfirmGoal} onOpenChange={() => setDeleteConfirmGoal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              حذف هدف
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              آیا مطمئن هستید که می‌خواهید هدف <strong className="text-foreground">{deleteConfirmGoal?.name}</strong> را حذف کنید؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGoal}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              <Trash2 className="w-4 h-4 ml-2" />
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
