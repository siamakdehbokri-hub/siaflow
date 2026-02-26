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

      {/* Hero Card - Deep Glass */}
      <div className="relative overflow-hidden rounded-3xl p-6"
        style={{
          background: 'linear-gradient(145deg, hsl(var(--card) / 0.8) 0%, hsl(var(--card) / 0.5) 100%)',
          backdropFilter: 'blur(30px) saturate(180%)',
          border: '1px solid hsl(var(--border) / 0.6)',
          boxShadow: '0 12px 40px hsl(var(--primary) / 0.08), inset 0 1px 0 hsl(0 0% 100% / 0.06)',
        }}
      >
        {/* Decorative gradient orbs */}
        <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: 'hsl(var(--primary) / 0.15)' }} />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-3xl pointer-events-none" style={{ background: 'hsl(var(--chart-5) / 0.1)' }} />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground mb-2 leading-relaxed">
                امروز چقدر خرج کردی؟
              </p>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-4xl font-black tabular-nums tracking-tight text-foreground">
                  {formatAmountCompact(financialData.todayExpense)}
                </span>
                <span className="text-base text-muted-foreground">{currencyInfo.symbol}</span>
              </div>
            </div>
            
            {/* Add button */}
            <button
              onClick={() => onAddTransaction()}
              className="relative w-14 h-14 rounded-2xl flex items-center justify-center active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) 100%)',
                boxShadow: '0 8px 24px hsl(var(--primary) / 0.4), inset 0 1px 0 hsl(0 0% 100% / 0.2)',
              }}
              aria-label="افزودن تراکنش"
            >
              <Plus className="w-7 h-7 text-primary-foreground" strokeWidth={2.5} />
            </button>
          </div>
          
          {/* Quick actions */}
          <div className="flex items-center justify-around mt-6 pt-5 border-t border-border/20">
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard
          icon={ArrowUpRight}
          label="درآمد ماه"
          value={formatAmountCompact(financialData.income)}
          valueColor="text-success"
          iconColor="text-success"
          glowColor="var(--success)"
        />
        <SummaryCard
          icon={ArrowDownRight}
          label="هزینه ماه"
          value={formatAmountCompact(financialData.expense)}
          valueColor="text-destructive"
          iconColor="text-destructive"
          glowColor="var(--destructive)"
        />
      </div>

      {/* Balance Detail Card */}
      <div className="relative overflow-hidden rounded-3xl"
        style={{
          background: 'linear-gradient(160deg, hsl(var(--card) / 0.8) 0%, hsl(var(--card) / 0.5) 100%)',
          backdropFilter: 'blur(30px) saturate(180%)',
          border: '1px solid hsl(var(--border) / 0.5)',
          boxShadow: '0 12px 40px hsl(var(--primary) / 0.06), inset 0 1px 0 hsl(0 0% 100% / 0.05)',
        }}
      >
        <div className="absolute -top-10 -left-10 w-28 h-28 rounded-full blur-3xl pointer-events-none" style={{ background: 'hsl(var(--primary) / 0.1)' }} />
        
        <div className="relative z-10 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{
                background: 'hsl(var(--primary) / 0.12)',
                border: '1px solid hsl(var(--primary) / 0.2)',
              }}
            >
              <Wallet className="w-5 h-5 text-primary" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">مانده دارایی</p>
              <p className="text-xs text-muted-foreground">خلاصه مالی این ماه</p>
            </div>
          </div>

          {/* Balance Amount */}
          <div className="text-center mb-4 py-3.5 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--card) / 0.6) 0%, hsl(var(--card) / 0.3) 100%)',
              border: '1px solid hsl(var(--border) / 0.3)',
            }}
          >
            <p className="text-xs text-muted-foreground mb-1">موجودی فعلی</p>
            <p className={cn(
              "text-3xl font-black tabular-nums tracking-tight",
              financialData.balance >= 0 ? "text-success" : "text-destructive"
            )}>
              {financialData.balance >= 0 ? '+' : ''}{formatAmountCompact(financialData.balance)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{currencyInfo.symbol}</p>
          </div>

          {/* Detail Rows */}
          <div className="space-y-2">
            <DetailRow
              icon={<ArrowUpRight className="w-4 h-4 text-success" strokeWidth={2} />}
              label="کل درآمد"
              value={formatAmountCompact(financialData.income)}
              valueColor="text-success"
            />
            <DetailRow
              icon={<ArrowDownRight className="w-4 h-4 text-destructive" strokeWidth={2} />}
              label="کل هزینه"
              value={formatAmountCompact(financialData.expense)}
              valueColor="text-destructive"
            />
            {financialData.saving > 0 && (
              <DetailRow
                icon={<PiggyBank className="w-4 h-4 text-chart-4" strokeWidth={2} />}
                label="پس‌انداز"
                value={formatAmountCompact(financialData.saving)}
                valueColor="text-chart-4"
              />
            )}
            <DetailRow
              icon={<Wallet className="w-4 h-4 text-primary" strokeWidth={2} />}
              label="مانده خالص"
              value={formatAmountCompact(Math.abs(financialData.balance))}
              valueColor={financialData.balance >= 0 ? "text-primary" : "text-destructive"}
            />
            {financialData.income > 0 && (
              <DetailRow
                icon={<BarChart3 className="w-4 h-4 text-chart-3" strokeWidth={2} />}
                label="نرخ پس‌انداز"
                value={`${Math.round((financialData.saving / financialData.income) * 100)}%`}
                valueColor="text-chart-3"
              />
            )}
          </div>
        </div>
      </div>

      {/* Auto-Savings Banner */}
      {showAutoSavings && onOpenAutoSavings && (
        <button
          onClick={onOpenAutoSavings}
          className="w-full relative overflow-hidden flex items-center gap-3 rounded-2xl p-4 active:opacity-80 transition-opacity text-right"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--card) / 0.7) 0%, hsl(var(--card) / 0.4) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid hsl(var(--primary) / 0.2)',
          }}
        >
          <div className="relative z-10 w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'hsl(var(--primary) / 0.15)', border: '1px solid hsl(var(--primary) / 0.2)' }}
          >
            <PiggyBank className="w-5 h-5 text-primary" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0 relative z-10">
            <p className="text-sm font-bold text-foreground">پس‌انداز کن برای آینده‌ای بهتر!</p>
            <p className="text-xs text-muted-foreground mt-0.5">از مانده ماه قبل پس‌انداز کن</p>
          </div>
          <ChevronLeft className="w-5 h-5 text-muted-foreground shrink-0 relative z-10" strokeWidth={2} />
        </button>
      )}

      {/* Recent Transactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">فعالیت اخیر</h3>
          <button 
            onClick={onViewAllTransactions}
            className="flex items-center gap-1 text-xs font-medium text-primary py-2 px-1 -ml-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            همه
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
        
        {financialData.recentTransactions.length === 0 ? (
          <div className="rounded-2xl p-6 text-center"
            style={{
              background: 'hsl(var(--card) / 0.5)',
              border: '1px solid hsl(var(--border) / 0.4)',
            }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'hsl(var(--muted) / 0.3)' }}
            >
              <Receipt className="w-7 h-7 text-muted-foreground/40" strokeWidth={1.5} />
            </div>
            <p className="text-xs font-medium text-muted-foreground">هنوز تراکنشی ثبت نشده</p>
          </div>
        ) : (
          <div className="rounded-2xl divide-y divide-border/20 overflow-hidden"
            style={{
              background: 'hsl(var(--card) / 0.5)',
              border: '1px solid hsl(var(--border) / 0.4)',
            }}
          >
            {financialData.recentTransactions.map((transaction) => {
              const isIncome = transaction.type === 'income';
              
              return (
                <div 
                  key={transaction.id} 
                  className="flex items-center gap-3 p-4 active:bg-muted/10 transition-colors"
                >
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                    isIncome 
                      ? "bg-success/12 border border-success/20" 
                      : "bg-destructive/12 border border-destructive/20"
                  )}>
                    {isIncome ? (
                      <ArrowUpRight className="w-5 h-5 text-success" strokeWidth={2} />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-destructive" strokeWidth={2} />
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
                    <p className={cn(
                      "text-sm font-black tabular-nums",
                      isIncome ? "text-success" : "text-destructive"
                    )}>
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
  valueColor: string;
  iconColor: string;
  glowColor: string;
}

function SummaryCard({ icon: Icon, label, value, valueColor, iconColor, glowColor }: SummaryCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-4"
      style={{
        background: 'linear-gradient(145deg, hsl(var(--card) / 0.7) 0%, hsl(var(--card) / 0.4) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid hsl(var(--border) / 0.4)',
      }}
    >
      <div className="relative z-10">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: `hsl(${glowColor} / 0.12)`,
              border: `1px solid hsl(${glowColor} / 0.2)`,
            }}
          >
            <Icon className={cn("w-5 h-5", iconColor)} strokeWidth={2} />
          </div>
          <p className="text-xs font-medium text-muted-foreground leading-relaxed">{label}</p>
        </div>
        <p className={cn("text-lg font-black tabular-nums truncate", valueColor)}>
          {value}
        </p>
      </div>
    </div>
  );
}

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor: string;
}

function DetailRow({ icon, label, value, valueColor }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl"
      style={{
        background: 'hsl(var(--card) / 0.4)',
        border: '1px solid hsl(var(--border) / 0.25)',
      }}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <span className={cn("text-sm font-bold tabular-nums", valueColor)}>{value}</span>
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
    primary: { bg: 'hsl(var(--primary) / 0.12)', border: 'hsl(var(--primary) / 0.25)', text: 'text-primary' },
    success: { bg: 'hsl(var(--success) / 0.12)', border: 'hsl(var(--success) / 0.25)', text: 'text-success' },
    destructive: { bg: 'hsl(var(--destructive) / 0.12)', border: 'hsl(var(--destructive) / 0.25)', text: 'text-destructive' },
  };
  const c = colorMap[color];

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
      <div className="relative w-13 h-13 rounded-2xl flex items-center justify-center"
        style={{ background: c.bg, border: `1px solid ${c.border}` }}
      >
        <Icon className={cn("w-6 h-6", c.text)} strokeWidth={2} />
      </div>
      <span className="text-xs font-bold text-foreground truncate max-w-[80px] leading-relaxed">{label}</span>
    </button>
  );
}
