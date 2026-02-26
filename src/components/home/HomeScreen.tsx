import { useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, ChevronLeft, Plus, Receipt, PieChart, Landmark, TrendingUp, TrendingDown, Wallet, PiggyBank, BarChart3, type LucideIcon } from 'lucide-react';
import { Transaction, Category } from '@/types/expense';
import { isInCurrentJalaliMonth, formatPersianDateFull, isTodayJalali } from '@/utils/persianDate';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';

interface HomeScreenProps {
  transactions: Transaction[];
  categories: Category[];
  userName?: string;
  onAddTransaction: (type?: string) => void;
  onViewAllTransactions: () => void;
  onOpenDebts?: () => void;
  showAutoSavings?: boolean;
  onOpenAutoSavings?: () => void;
}

export function HomeScreen({
  transactions,
  categories,
  userName = 'کاربر',
  onAddTransaction,
  onViewAllTransactions,
  onOpenDebts,
  showAutoSavings,
  onOpenAutoSavings,
}: HomeScreenProps) {
  const { formatAmountCompact, currencyInfo } = useCurrency();
  const financialData = useMemo(() => {
    const monthlyTransactions = transactions.filter(t => isInCurrentJalaliMonth(t.date));
    
    const todayExpense = transactions
      .filter(t => t.type === 'expense' && isTodayJalali(t.date))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const saving = monthlyTransactions
      .filter(t => t.type === 'saving')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expense - saving;
    
    return {
      income,
      expense,
      saving,
      todayExpense,
      balance,
      recentTransactions: [...transactions]
        .sort((a, b) => {
          const dateCompare = b.date.localeCompare(a.date);
          if (dateCompare !== 0) return dateCompare;
          return b.id.localeCompare(a.id);
        })
        .slice(0, 3),
    };
  }, [transactions]);

  const today = new Date();
  const persianDate = formatPersianDateFull(today.toISOString());

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Welcome & Date */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-foreground leading-relaxed truncate">
            سلام، {userName}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
            {persianDate}
          </p>
        </div>
      </div>

      {/* Hero Card - Flat */}
      <div className="relative rounded-2xl p-6" style={{
        background: 'rgba(255,255,255,0.062)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 4px 36px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.09)',
      }}>
        {/* Top shine line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.24), transparent)' }} />
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground mb-2 leading-relaxed">
              امروز چقدر خرج کردی؟
            </p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-base text-muted-foreground">{currencyInfo.symbol}</span>
              <span className="text-4xl font-black tabular-nums tracking-tight" style={{ color: '#10B981' }}>
                {formatAmountCompact(financialData.todayExpense)}
              </span>
            </div>
          </div>
          
          {/* Add button - solid circle */}
          <button
            onClick={() => onAddTransaction()}
            className="flex items-center justify-center active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: '#7C3AED',
              color: 'white',
            }}
            aria-label="افزودن تراکنش"
          >
            <Plus className="w-7 h-7" strokeWidth={2.5} />
          </button>
        </div>
        
        {/* Quick actions - no background boxes */}
        <div className="flex items-center justify-around mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <QuickActionButton 
            icon={Receipt} 
            label="تراکنش‌ها"
            color="primary"
            onClick={onViewAllTransactions}
          />
          <QuickActionButton 
            icon={PieChart} 
            label="بودجه‌بندی"
            color="success"
            onClick={onViewAllTransactions}
          />
          <QuickActionButton 
            icon={Landmark} 
            label="بدهی‌ها"
            color="destructive"
            onClick={() => onOpenDebts?.()}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard
          icon={ArrowDownRight}
          label="هزینه ماه"
          value={formatAmountCompact(financialData.expense)}
          type="expense"
        />
        <SummaryCard
          icon={ArrowUpRight}
          label="درآمد ماه"
          value={formatAmountCompact(financialData.income)}
          type="income"
        />
      </div>

      {/* Balance Detail Card */}
      <div className="relative rounded-2xl" style={{
        background: 'rgba(255,255,255,0.062)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 4px 36px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.09)',
      }}>
        {/* Top shine line */}
        <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl overflow-hidden" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.24), transparent)' }} />
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.12)' }}>
              <Wallet className="w-5 h-5" style={{ color: '#7C3AED' }} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">مانده دارایی</p>
              <p className="text-xs text-muted-foreground">خلاصه مالی این ماه</p>
            </div>
          </div>

          {/* Balance Amount */}
          <div className="text-center mb-4 py-3.5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-xs text-muted-foreground mb-1">موجودی فعلی</p>
            <p className="text-3xl font-black tabular-nums tracking-tight" style={{ color: financialData.balance >= 0 ? '#10B981' : '#EF4444' }}>
              {financialData.balance >= 0 ? '+' : ''}{formatAmountCompact(financialData.balance)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{currencyInfo.symbol}</p>
          </div>

          {/* Detail Rows */}
          <div className="space-y-2">
            <DetailRow
              icon={<ArrowUpRight className="w-4 h-4" style={{ color: '#10B981' }} strokeWidth={2} />}
              iconBg="#10B981"
              label="کل درآمد"
              value={formatAmountCompact(financialData.income)}
              valueColor="#10B981"
            />
            <DetailRow
              icon={<ArrowDownRight className="w-4 h-4" style={{ color: '#EF4444' }} strokeWidth={2} />}
              iconBg="#EF4444"
              label="کل هزینه"
              value={formatAmountCompact(financialData.expense)}
              valueColor="#EF4444"
            />
            {financialData.saving > 0 && (
              <DetailRow
                icon={<PiggyBank className="w-4 h-4" style={{ color: '#7C3AED' }} strokeWidth={2} />}
                iconBg="#7C3AED"
                label="پس‌انداز"
                value={formatAmountCompact(financialData.saving)}
                valueColor="#7C3AED"
              />
            )}
            <DetailRow
              icon={<Wallet className="w-4 h-4" style={{ color: '#10B981' }} strokeWidth={2} />}
              iconBg="#10B981"
              label="مانده خالص"
              value={formatAmountCompact(Math.abs(financialData.balance))}
              valueColor={financialData.balance >= 0 ? '#10B981' : '#EF4444'}
            />
            {financialData.income > 0 && (
              <DetailRow
                icon={<BarChart3 className="w-4 h-4" style={{ color: '#F59E0B' }} strokeWidth={2} />}
                iconBg="#F59E0B"
                label="نرخ پس‌انداز"
                value={`${Math.round((financialData.saving / financialData.income) * 100)}%`}
                valueColor="#F59E0B"
              />
            )}
          </div>
        </div>
      </div>

      {/* Auto-Savings Banner */}
      {showAutoSavings && onOpenAutoSavings && (
        <button
          onClick={onOpenAutoSavings}
          className="w-full flex items-center gap-3 rounded-2xl p-4 active:opacity-80 transition-opacity text-right"
          style={{
            background: 'rgba(255,255,255,0.046)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(124,58,237,0.2)',
            boxShadow: '0 2px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(124,58,237,0.15)' }}>
            <PiggyBank className="w-5 h-5" style={{ color: '#7C3AED' }} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">پس‌انداز کن برای آینده‌ای بهتر!</p>
            <p className="text-xs text-muted-foreground mt-0.5">از مانده ماه قبل پس‌انداز کن</p>
          </div>
          <ChevronLeft className="w-5 h-5 text-muted-foreground shrink-0" strokeWidth={2} />
        </button>
      )}

      {/* Recent Transactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">فعالیت اخیر</h3>
          <button 
            onClick={onViewAllTransactions}
            className="flex items-center gap-1 text-xs font-medium py-2 px-1 -ml-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ color: '#7C3AED' }}
          >
            همه
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
        
        {financialData.recentTransactions.length === 0 ? (
          <div className="rounded-2xl p-6 text-center" style={{
            background: 'rgba(255,255,255,0.046)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: '0 2px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <Receipt className="w-7 h-7 text-muted-foreground/40" strokeWidth={1.5} />
            </div>
            <p className="text-xs font-medium text-muted-foreground">هنوز تراکنشی ثبت نشده</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{
            background: 'rgba(255,255,255,0.046)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: '0 2px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}>
            {financialData.recentTransactions.map((transaction, idx) => {
              const isIncome = transaction.type === 'income';
              
              return (
                <div 
                  key={transaction.id} 
                  className="flex items-center gap-3 p-4 active:bg-white/[0.02] transition-colors"
                  style={{ borderTop: idx > 0 ? '1px solid rgba(255,255,255,0.05)' : undefined }}
                >
                  <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: isIncome ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)' }}
                  >
                    {isIncome ? (
                      <ArrowUpRight className="w-5 h-5" style={{ color: '#10B981' }} strokeWidth={2} />
                    ) : (
                      <ArrowDownRight className="w-5 h-5" style={{ color: '#EF4444' }} strokeWidth={2} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {transaction.category}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {transaction.description || '—'}
                    </p>
                  </div>
                  
                  <div className="text-left shrink-0">
                    <p className="text-sm font-black tabular-nums" style={{ color: isIncome ? '#10B981' : '#EF4444' }}>
                      {isIncome ? '+' : '-'}{formatAmountCompact(transaction.amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Sub-components ---

interface SummaryCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  type: 'income' | 'expense';
}

function SummaryCard({ icon: Icon, label, value, type }: SummaryCardProps) {
  const isIncome = type === 'income';
  const color = isIncome ? '#10B981' : '#EF4444';
  
  return (
    <div className="relative rounded-2xl p-4" style={{
      background: 'rgba(255,255,255,0.046)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      border: '1px solid rgba(255,255,255,0.09)',
      boxShadow: '0 2px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
    }}>
      {/* Icon circle - top right */}
      <div className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: color }}>
        <Icon className="w-5 h-5 text-white" strokeWidth={2} />
      </div>
      
      <div className="pt-1">
        <p className="text-xs font-medium mb-8" style={{ color: '#9CA3AF' }}>{label}</p>
        <p className="text-[17px] font-bold tabular-nums truncate" style={{ color }}>
          {value}
        </p>
      </div>
    </div>
  );
}

interface DetailRowProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  valueColor: string;
}

function DetailRow({ icon, iconBg, label, value, valueColor }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${iconBg}20` }}>
          {icon}
        </div>
        <span className="text-xs font-medium" style={{ color: '#9CA3AF' }}>{label}</span>
      </div>
      <span className="text-sm font-bold tabular-nums" style={{ color: valueColor }}>{value}</span>
    </div>
  );
}

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  color: 'primary' | 'success' | 'destructive';
  onClick: () => void;
  disabled?: boolean;
}

function QuickActionButton({ icon: Icon, label, color, onClick, disabled }: QuickActionButtonProps) {
  const colorMap = {
    primary: '#7C3AED',
    success: '#10B981',
    destructive: '#EF4444',
  };
  const iconColor = colorMap[color];

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={cn(
        "flex flex-col items-center gap-2.5 min-w-0 py-2 px-3 rounded-2xl transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        disabled ? "opacity-50 cursor-not-allowed" : "active:scale-95"
      )}
    >
      {/* No background container - direct icon */}
      <Icon style={{ width: 28, height: 28, color: iconColor }} strokeWidth={2} />
      <span className="text-xs font-bold truncate max-w-[80px] leading-relaxed" style={{ color: '#9CA3AF' }}>{label}</span>
    </button>
  );
}
