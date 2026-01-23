import { useState } from 'react';
import { 
  ArrowRightLeft, Wallet, Plus, Trash2, Send, PiggyBank,
  CreditCard, Banknote, Building2, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Account, Transfer, useAccounts } from '@/hooks/useAccounts';
import { SavingGoal } from '@/hooks/useSavingGoals';
import { formatCurrency } from '@/utils/persianDate';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { faIR } from 'date-fns/locale';

interface TransferManagementProps {
  goals: SavingGoal[];
  onTransferToGoal?: (goalId: string, amount: number) => Promise<void>;
}

const accountTypes = [
  { id: 'checking', label: 'حساب جاری', icon: Building2 },
  { id: 'savings', label: 'حساب پس‌انداز', icon: PiggyBank },
  { id: 'cash', label: 'نقدی', icon: Banknote },
  { id: 'card', label: 'کارت بانکی', icon: CreditCard },
];

const accountColors = [
  'hsl(210, 80%, 55%)',
  'hsl(142, 71%, 45%)',
  'hsl(38, 92%, 50%)',
  'hsl(262, 83%, 58%)',
  'hsl(0, 72%, 51%)',
  'hsl(168, 76%, 42%)',
];

export function TransferManagement({ goals, onTransferToGoal }: TransferManagementProps) {
  const { 
    accounts, 
    transfers, 
    loading, 
    addAccount, 
    deleteAccount,
    transferBetweenAccounts,
    transferToGoal,
    totalBalance 
  } = useAccounts();

  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isTransferToGoalOpen, setIsTransferToGoalOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'checking' as Account['type'],
    balance: 0,
    color: accountColors[0],
  });
  const [transferData, setTransferData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: 0,
    description: '',
  });
  const [goalTransferData, setGoalTransferData] = useState({
    fromAccountId: '',
    toGoalId: '',
    amount: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddAccount = async () => {
    if (!newAccount.name.trim()) return;
    
    setIsSubmitting(true);
    await addAccount({
      name: newAccount.name,
      type: newAccount.type,
      balance: newAccount.balance,
      color: newAccount.color,
      icon: accountTypes.find(t => t.id === newAccount.type)?.icon.name || 'Wallet',
      isDefault: accounts.length === 0,
    });
    setIsSubmitting(false);
    setIsAddAccountOpen(false);
    setNewAccount({ name: '', type: 'checking', balance: 0, color: accountColors[0] });
  };

  const handleTransfer = async () => {
    if (!transferData.fromAccountId || !transferData.toAccountId || transferData.amount <= 0) return;
    
    setIsSubmitting(true);
    await transferBetweenAccounts(
      transferData.fromAccountId,
      transferData.toAccountId,
      transferData.amount,
      transferData.description
    );
    setIsSubmitting(false);
    setIsTransferOpen(false);
    setTransferData({ fromAccountId: '', toAccountId: '', amount: 0, description: '' });
  };

  const handleTransferToGoal = async () => {
    if (!goalTransferData.fromAccountId || !goalTransferData.toGoalId || goalTransferData.amount <= 0) return;
    
    setIsSubmitting(true);
    const success = await transferToGoal(
      goalTransferData.fromAccountId,
      goalTransferData.toGoalId,
      goalTransferData.amount
    );
    
    if (success && onTransferToGoal) {
      await onTransferToGoal(goalTransferData.toGoalId, goalTransferData.amount);
    }
    
    setIsSubmitting(false);
    setIsTransferToGoalOpen(false);
    setGoalTransferData({ fromAccountId: '', toGoalId: '', amount: 0 });
  };

  const getAccountName = (id: string | null) => {
    if (!id) return 'نامشخص';
    const account = accounts.find(a => a.id === id);
    return account?.name || 'حذف شده';
  };

  const getGoalName = (id: string | null) => {
    if (!id) return 'نامشخص';
    const goal = goals.find(g => g.id === id);
    return goal?.name || 'حذف شده';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl glass-glow">
            <ArrowRightLeft className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">مدیریت انتقال</h2>
            <p className="text-sm text-muted-foreground">انتقال پول بین حساب‌ها و اهداف</p>
          </div>
        </div>
      </div>

      {/* Total Balance Card */}
      <Card className="glass overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
        <CardContent className="relative p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">موجودی کل حساب‌ها</p>
            <p className="text-3xl font-bold text-primary">{formatCurrency(totalBalance)}</p>
            <p className="text-xs text-muted-foreground mt-1">تومان</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <Button 
          onClick={() => setIsAddAccountOpen(true)}
          className="h-auto py-4 flex-col gap-2 rounded-2xl"
          variant="outline"
        >
          <Plus className="w-5 h-5" />
          <span className="text-xs">حساب جدید</span>
        </Button>
        <Button 
          onClick={() => setIsTransferOpen(true)}
          className="h-auto py-4 flex-col gap-2 rounded-2xl gradient-primary"
          disabled={accounts.length < 2}
        >
          <ArrowRightLeft className="w-5 h-5" />
          <span className="text-xs">انتقال</span>
        </Button>
        <Button 
          onClick={() => setIsTransferToGoalOpen(true)}
          className="h-auto py-4 flex-col gap-2 rounded-2xl"
          variant="outline"
          disabled={accounts.length === 0 || goals.length === 0}
        >
          <PiggyBank className="w-5 h-5" />
          <span className="text-xs">به هدف</span>
        </Button>
      </div>

      {/* Accounts List */}
      <Card className="glass">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wallet className="w-5 h-5" />
            حساب‌های من
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {accounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>هنوز حسابی ندارید</p>
              <Button 
                variant="link" 
                onClick={() => setIsAddAccountOpen(true)}
                className="mt-2"
              >
                افزودن اولین حساب
              </Button>
            </div>
          ) : (
            accounts.map(account => {
              const typeInfo = accountTypes.find(t => t.id === account.type);
              const Icon = typeInfo?.icon || Wallet;
              
              return (
                <div 
                  key={account.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2.5 rounded-xl"
                      style={{ backgroundColor: `${account.color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: account.color }} />
                    </div>
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-xs text-muted-foreground">{typeInfo?.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <p className="font-bold">{formatCurrency(account.balance)}</p>
                      <p className="text-xs text-muted-foreground">تومان</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAccount(account.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Recent Transfers */}
      {transfers.length > 0 && (
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Send className="w-5 h-5" />
              انتقال‌های اخیر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {transfers.slice(0, 5).map(transfer => (
              <div 
                key={transfer.id}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {transfer.transferType === 'account_to_goal' ? (
                      <PiggyBank className="w-4 h-4 text-primary" />
                    ) : (
                      <ArrowRightLeft className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {getAccountName(transfer.fromAccountId)} ← {
                        transfer.transferType === 'account_to_goal' 
                          ? getGoalName(transfer.toGoalId)
                          : getAccountName(transfer.toAccountId)
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(transfer.createdAt), 'yyyy/MM/dd HH:mm', { locale: faIR })}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="font-mono">
                  {formatCurrency(transfer.amount)}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Add Account Dialog */}
      <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>افزودن حساب جدید</DialogTitle>
            <DialogDescription>
              یک حساب بانکی، کیف پول یا منبع مالی جدید اضافه کنید.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>نام حساب</Label>
              <Input
                value={newAccount.name}
                onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                placeholder="مثال: حساب بانک ملی"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>نوع حساب</Label>
              <Select 
                value={newAccount.type} 
                onValueChange={(v: Account['type']) => setNewAccount({ ...newAccount, type: v })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>موجودی اولیه (تومان)</Label>
              <Input
                type="number"
                value={newAccount.balance || ''}
                onChange={(e) => setNewAccount({ ...newAccount, balance: Number(e.target.value) || 0 })}
                placeholder="0"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>رنگ</Label>
              <div className="flex gap-2">
                {accountColors.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewAccount({ ...newAccount, color })}
                    className={cn(
                      "w-8 h-8 rounded-full transition-transform",
                      newAccount.color === color && "ring-2 ring-primary ring-offset-2 scale-110"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddAccountOpen(false)} className="rounded-xl">
              انصراف
            </Button>
            <Button onClick={handleAddAccount} disabled={isSubmitting || !newAccount.name.trim()} className="rounded-xl">
              {isSubmitting && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              ایجاد حساب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>انتقال بین حساب‌ها</DialogTitle>
            <DialogDescription>
              مبلغ مورد نظر را از یک حساب به حساب دیگر انتقال دهید.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>از حساب</Label>
              <Select 
                value={transferData.fromAccountId} 
                onValueChange={(v) => setTransferData({ ...transferData, fromAccountId: v })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="انتخاب حساب مبدأ" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.filter(a => a.id !== transferData.toAccountId).map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center justify-between w-full gap-4">
                        <span>{account.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(account.balance)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>به حساب</Label>
              <Select 
                value={transferData.toAccountId} 
                onValueChange={(v) => setTransferData({ ...transferData, toAccountId: v })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="انتخاب حساب مقصد" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.filter(a => a.id !== transferData.fromAccountId).map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>مبلغ (تومان)</Label>
              <Input
                type="number"
                value={transferData.amount || ''}
                onChange={(e) => setTransferData({ ...transferData, amount: Number(e.target.value) || 0 })}
                placeholder="0"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>توضیحات (اختیاری)</Label>
              <Input
                value={transferData.description}
                onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                placeholder="مثال: انتقال برای خرید"
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTransferOpen(false)} className="rounded-xl">
              انصراف
            </Button>
            <Button 
              onClick={handleTransfer} 
              disabled={isSubmitting || !transferData.fromAccountId || !transferData.toAccountId || transferData.amount <= 0}
              className="rounded-xl"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              انتقال
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer to Goal Dialog */}
      <Dialog open={isTransferToGoalOpen} onOpenChange={setIsTransferToGoalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>انتقال به هدف پس‌انداز</DialogTitle>
            <DialogDescription>
              از حساب خود به یک هدف پس‌انداز واریز کنید.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>از حساب</Label>
              <Select 
                value={goalTransferData.fromAccountId} 
                onValueChange={(v) => setGoalTransferData({ ...goalTransferData, fromAccountId: v })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="انتخاب حساب" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center justify-between w-full gap-4">
                        <span>{account.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(account.balance)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>هدف پس‌انداز</Label>
              <Select 
                value={goalTransferData.toGoalId} 
                onValueChange={(v) => setGoalTransferData({ ...goalTransferData, toGoalId: v })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="انتخاب هدف" />
                </SelectTrigger>
                <SelectContent>
                  {goals.map(goal => (
                    <SelectItem key={goal.id} value={goal.id}>
                      <div className="flex items-center justify-between w-full gap-4">
                        <span>{goal.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>مبلغ (تومان)</Label>
              <Input
                type="number"
                value={goalTransferData.amount || ''}
                onChange={(e) => setGoalTransferData({ ...goalTransferData, amount: Number(e.target.value) || 0 })}
                placeholder="0"
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTransferToGoalOpen(false)} className="rounded-xl">
              انصراف
            </Button>
            <Button 
              onClick={handleTransferToGoal} 
              disabled={isSubmitting || !goalTransferData.fromAccountId || !goalTransferData.toGoalId || goalTransferData.amount <= 0}
              className="rounded-xl"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              انتقال به هدف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
