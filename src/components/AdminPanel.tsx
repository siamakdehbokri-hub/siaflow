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

// Mobile Card Components
import { MobileUserCard } from '@/components/admin/MobileUserCard';
import { MobileTransactionCard } from '@/components/admin/MobileTransactionCard';
import { MobileCategoryCard } from '@/components/admin/MobileCategoryCard';
import { MobileDebtCard } from '@/components/admin/MobileDebtCard';
import { MobileGoalCard } from '@/components/admin/MobileGoalCard';
import { MobileAccountCard } from '@/components/admin/MobileAccountCard';

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

      {/* Tabs - Horizontal Scroll for Mobile */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
        <ScrollArea className="w-full" dir="rtl">
          <div className="p-1 rounded-xl bg-muted/50 border-2 border-border">
            <TabsList className="inline-flex w-max min-w-full bg-transparent p-0 h-auto gap-1 flex-row-reverse">
              <TabsTrigger value="users" className="shrink-0 rounded-lg py-3 px-4 text-xs font-medium whitespace-nowrap data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20 data-[state=active]:shadow-sm">
                <Users className="w-4 h-4 ml-1.5" />
                کاربران
              </TabsTrigger>
              <TabsTrigger value="transactions" className="shrink-0 rounded-lg py-3 px-4 text-xs font-medium whitespace-nowrap data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20 data-[state=active]:shadow-sm">
                <CreditCard className="w-4 h-4 ml-1.5" />
                تراکنش‌ها
              </TabsTrigger>
              <TabsTrigger value="categories" className="shrink-0 rounded-lg py-3 px-4 text-xs font-medium whitespace-nowrap data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20 data-[state=active]:shadow-sm">
                <Tag className="w-4 h-4 ml-1.5" />
                دسته‌ها
              </TabsTrigger>
              <TabsTrigger value="debts" className="shrink-0 rounded-lg py-3 px-4 text-xs font-medium whitespace-nowrap data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20 data-[state=active]:shadow-sm">
                <Banknote className="w-4 h-4 ml-1.5" />
                بدهی‌ها
              </TabsTrigger>
              <TabsTrigger value="goals" className="shrink-0 rounded-lg py-3 px-4 text-xs font-medium whitespace-nowrap data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20 data-[state=active]:shadow-sm">
                <Target className="w-4 h-4 ml-1.5" />
                اهداف
              </TabsTrigger>
              <TabsTrigger value="accounts" className="shrink-0 rounded-lg py-3 px-4 text-xs font-medium whitespace-nowrap data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20 data-[state=active]:shadow-sm">
                <Wallet className="w-4 h-4 ml-1.5" />
                حساب‌ها
              </TabsTrigger>
              <TabsTrigger value="settings" className="shrink-0 rounded-lg py-3 px-4 text-xs font-medium whitespace-nowrap data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20 data-[state=active]:shadow-sm">
                <Settings className="w-4 h-4 ml-1.5" />
                تنظیمات
              </TabsTrigger>
            </TabsList>
          </div>
        </ScrollArea>

        {/* Users Tab */}
        <TabsContent value="users" className="mt-4 space-y-3">
          {/* Search & Filters */}
          <div className="bg-card rounded-xl border-2 border-border p-3">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="جستجوی کاربر..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 rounded-xl h-11"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                  <SelectTrigger className="flex-1 min-w-[100px] rounded-xl h-11">
                    <SelectValue placeholder="وضعیت" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه وضعیت</SelectItem>
                    <SelectItem value="active">فعال</SelectItem>
                    <SelectItem value="inactive">غیرفعال</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
                  <SelectTrigger className="flex-1 min-w-[100px] rounded-xl h-11">
                    <SelectValue placeholder="نقش" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه نقش‌ها</SelectItem>
                    <SelectItem value="admin">ادمین</SelectItem>
                    <SelectItem value="user">کاربر</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={exportToCSV}
                  className="rounded-xl h-11 w-11 shrink-0"
                  title="خروجی CSV"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Header with count */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="w-4 h-4 text-primary" />
              لیست کاربران
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              {filteredUsers.length} / {users.length}
            </Badge>
          </div>

          {/* User Cards */}
          {usersLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border-2 border-border">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">کاربری یافت نشد</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((adminUser) => (
                <MobileUserCard
                  key={adminUser.id}
                  adminUser={adminUser}
                  currentUserId={user?.id}
                  formatLastLogin={formatLastLogin}
                  onViewDetails={setSelectedUser}
                  onToggleStatus={handleToggleStatus}
                  onToggleAdmin={handleToggleAdmin}
                  onDelete={setDeleteConfirmUser}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="mt-4 space-y-3">
          {/* Search & Filters */}
          <div className="bg-card rounded-xl border-2 border-border p-3">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="جستجوی تراکنش..."
                  value={txSearchQuery}
                  onChange={(e) => setTxSearchQuery(e.target.value)}
                  className="pr-10 rounded-xl h-11"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select value={txTypeFilter} onValueChange={(v: any) => setTxTypeFilter(v)}>
                  <SelectTrigger className="flex-1 min-w-[100px] rounded-xl h-11">
                    <SelectValue placeholder="نوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه</SelectItem>
                    <SelectItem value="income">درآمد</SelectItem>
                    <SelectItem value="expense">هزینه</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={txUserFilter} onValueChange={setTxUserFilter}>
                  <SelectTrigger className="flex-1 min-w-[120px] rounded-xl h-11">
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
                  className="rounded-xl h-11 w-11 shrink-0"
                  title="خروجی CSV"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Header with count */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CreditCard className="w-4 h-4 text-primary" />
              تراکنش‌ها
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              {filteredTransactions.length} / {transactions.length}
            </Badge>
          </div>

          {/* Transaction Cards */}
          {transactionsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border-2 border-border">
              <CreditCard className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">تراکنشی یافت نشد</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map((tx) => (
                <MobileTransactionCard
                  key={tx.id}
                  transaction={tx}
                  onDelete={setDeleteConfirmTx}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="mt-4 space-y-3">
          {/* Header with count */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Tag className="w-4 h-4 text-primary" />
              دسته‌بندی‌ها
            </div>
            <Badge variant="outline" className="font-mono text-xs">{categories.length}</Badge>
          </div>

          {/* Category Cards */}
          {categoriesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border-2 border-border">
              <Tag className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">دسته‌بندی‌ای یافت نشد</p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <MobileCategoryCard
                  key={cat.id}
                  category={cat}
                  onDelete={setDeleteConfirmCat}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Debts Tab */}
        <TabsContent value="debts" className="mt-4 space-y-3">
          {/* Header with count */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Banknote className="w-4 h-4 text-primary" />
              بدهی‌ها
            </div>
            <Badge variant="outline" className="font-mono text-xs">{debts.length}</Badge>
          </div>

          {/* Debt Cards */}
          {debtsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : debts.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border-2 border-border">
              <Banknote className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">بدهی‌ای یافت نشد</p>
            </div>
          ) : (
            <div className="space-y-2">
              {debts.map((debt) => (
                <MobileDebtCard
                  key={debt.id}
                  debt={debt}
                  onDelete={setDeleteConfirmDebt}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="mt-4 space-y-3">
          {/* Header with count */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Target className="w-4 h-4 text-primary" />
              اهداف پس‌انداز
            </div>
            <Badge variant="outline" className="font-mono text-xs">{goals.length}</Badge>
          </div>

          {/* Goal Cards */}
          {goalsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border-2 border-border">
              <Target className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">هدفی یافت نشد</p>
            </div>
          ) : (
            <div className="space-y-2">
              {goals.map((goal) => (
                <MobileGoalCard
                  key={goal.id}
                  goal={goal}
                  onDelete={setDeleteConfirmGoal}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="mt-4 space-y-3">
          {/* Header with count */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Wallet className="w-4 h-4 text-primary" />
              حساب‌ها
            </div>
            <Badge variant="outline" className="font-mono text-xs">{accounts.length}</Badge>
          </div>

          {/* Account Cards */}
          {accountsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border-2 border-border">
              <Wallet className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">حسابی یافت نشد</p>
            </div>
          ) : (
            <div className="space-y-2">
              {accounts.map((acc) => (
                <MobileAccountCard
                  key={acc.id}
                  account={acc}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-4 space-y-3">
          {/* System Settings */}
          <div className="bg-card rounded-xl border-2 border-border p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold mb-2">
              <Settings className="w-4 h-4 text-primary" />
              تنظیمات سیستم
            </div>

            <div className="p-3 rounded-xl border border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm">احراز هویت</p>
                  <p className="text-xs text-muted-foreground">تأیید ایمیل خودکار فعال است</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10 shrink-0">
                  <Database className="w-4 h-4 text-green-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm">پایگاه داده</p>
                  <p className="text-xs text-muted-foreground">متصل و فعال</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 shrink-0">
                  <Activity className="w-4 h-4 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm">نسخه سیستم</p>
                  <p className="text-xs text-muted-foreground">SiaFlow v2.0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Export Reports */}
          <div className="bg-card rounded-xl border-2 border-border p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold mb-2">
              <FileText className="w-4 h-4 text-primary" />
              خروجی گزارشات
            </div>

            <Button 
              variant="outline" 
              className="w-full justify-start rounded-xl h-12"
              onClick={exportToCSV}
            >
              <Download className="w-4 h-4 ml-2" />
              خروجی لیست کاربران (CSV)
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start rounded-xl h-12"
              onClick={exportTransactionsToCSV}
            >
              <Download className="w-4 h-4 ml-2" />
              خروجی تراکنش‌ها (CSV)
            </Button>
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
