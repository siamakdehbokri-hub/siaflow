import { Transaction } from '@/types/expense';
import { formatPersianDateShort } from '@/utils/persianDate';

export const exportToExcel = (transactions: Transaction[], filename: string = 'transactions') => {
  // Use CSV export as a secure alternative (xlsx package has known vulnerabilities)
  // CSV files can be opened in Excel and other spreadsheet applications
  exportToCSV(transactions, filename);
};

export const exportToCSV = (transactions: Transaction[], filename: string = 'transactions') => {
  const headers = ['نوع', 'مبلغ', 'دسته‌بندی', 'زیردسته', 'توضیحات', 'تاریخ', 'تکراری'];
  
  const rows = transactions.map((t) => [
    t.type === 'income' ? 'درآمد' : 'هزینه',
    t.amount.toString(),
    t.category,
    t.subcategory || '-',
    t.description || '-',
    formatPersianDateShort(t.date),
    t.isRecurring ? 'بله' : 'خیر',
  ]);

  // Add BOM for UTF-8 support in Excel
  const BOM = '\uFEFF';
  const csvContent = BOM + [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

/**
 * Export transactions to PDF using browser's native print functionality
 * This is a secure alternative to jspdf which had critical vulnerabilities
 */
export const exportToPDF = (transactions: Transaction[], filename: string = 'transactions') => {
  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Generate HTML content for printing
  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="fa">
    <head>
      <meta charset="UTF-8">
      <title>گزارش مالی - SiaFlow</title>
      <style>
        * { font-family: Tahoma, Arial, sans-serif; box-sizing: border-box; }
        body { padding: 20px; direction: rtl; background: #fff; color: #333; }
        .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #14b8a6; padding-bottom: 16px; }
        .header h1 { color: #14b8a6; margin: 0 0 8px 0; font-size: 24px; }
        .header p { color: #666; margin: 0; font-size: 12px; }
        .summary { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
        .summary-card { flex: 1; min-width: 120px; padding: 16px; border-radius: 12px; text-align: center; }
        .summary-card.income { background: #dcfce7; color: #166534; }
        .summary-card.expense { background: #fee2e2; color: #991b1b; }
        .summary-card.balance { background: #e0f2fe; color: #075985; }
        .summary-card h3 { margin: 0 0 8px 0; font-size: 12px; font-weight: normal; }
        .summary-card p { margin: 0; font-size: 18px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #14b8a6; color: white; padding: 12px 8px; text-align: center; }
        td { padding: 10px 8px; text-align: center; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background: #f9fafb; }
        .income-row { color: #166534; }
        .expense-row { color: #991b1b; }
        .footer { margin-top: 24px; text-align: center; color: #999; font-size: 10px; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>گزارش مالی SiaFlow</h1>
        <p>تعداد تراکنش‌ها: ${transactions.length} | تاریخ گزارش: ${new Date().toLocaleDateString('fa-IR')}</p>
      </div>
      
      <div class="summary">
        <div class="summary-card income">
          <h3>کل درآمد</h3>
          <p>${totalIncome.toLocaleString('fa-IR')} تومان</p>
        </div>
        <div class="summary-card expense">
          <h3>کل هزینه</h3>
          <p>${totalExpense.toLocaleString('fa-IR')} تومان</p>
        </div>
        <div class="summary-card balance">
          <h3>موجودی</h3>
          <p>${balance.toLocaleString('fa-IR')} تومان</p>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>نوع</th>
            <th>مبلغ</th>
            <th>دسته‌بندی</th>
            <th>زیردسته</th>
            <th>توضیحات</th>
            <th>تاریخ</th>
          </tr>
        </thead>
        <tbody>
          ${transactions.map(t => `
            <tr class="${t.type === 'income' ? 'income-row' : 'expense-row'}">
              <td>${t.type === 'income' ? 'درآمد' : 'هزینه'}</td>
              <td>${t.amount.toLocaleString('fa-IR')}</td>
              <td>${t.category}</td>
              <td>${t.subcategory || '-'}</td>
              <td>${t.description || '-'}</td>
              <td>${formatPersianDateShort(t.date)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>این گزارش توسط SiaFlow ایجاد شده است</p>
      </div>
    </body>
    </html>
  `;

  // Open print dialog
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};

/**
 * Export category budget report using browser's native print functionality
 */
export const exportCategoryReport = (categories: { name: string; spent: number; budget: number }[]) => {
  const totalBudget = categories.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);

  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="fa">
    <head>
      <meta charset="UTF-8">
      <title>گزارش بودجه - SiaFlow</title>
      <style>
        * { font-family: Tahoma, Arial, sans-serif; box-sizing: border-box; }
        body { padding: 20px; direction: rtl; background: #fff; color: #333; }
        .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #14b8a6; padding-bottom: 16px; }
        .header h1 { color: #14b8a6; margin: 0 0 8px 0; font-size: 24px; }
        .header p { color: #666; margin: 0; font-size: 12px; }
        .summary { display: flex; gap: 16px; margin-bottom: 24px; justify-content: center; }
        .summary-card { padding: 16px 24px; border-radius: 12px; text-align: center; }
        .summary-card.budget { background: #e0f2fe; color: #075985; }
        .summary-card.spent { background: #fef3c7; color: #92400e; }
        .summary-card h3 { margin: 0 0 8px 0; font-size: 12px; font-weight: normal; }
        .summary-card p { margin: 0; font-size: 18px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #14b8a6; color: white; padding: 12px 8px; text-align: center; }
        td { padding: 10px 8px; text-align: center; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background: #f9fafb; }
        .over-budget { color: #dc2626; font-weight: bold; }
        .under-budget { color: #16a34a; }
        .progress-bar { width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 4px; }
        .footer { margin-top: 24px; text-align: center; color: #999; font-size: 10px; }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>گزارش بودجه SiaFlow</h1>
        <p>تعداد دسته‌بندی‌ها: ${categories.length} | تاریخ گزارش: ${new Date().toLocaleDateString('fa-IR')}</p>
      </div>
      
      <div class="summary">
        <div class="summary-card budget">
          <h3>کل بودجه</h3>
          <p>${totalBudget.toLocaleString('fa-IR')} تومان</p>
        </div>
        <div class="summary-card spent">
          <h3>کل مصرف</h3>
          <p>${totalSpent.toLocaleString('fa-IR')} تومان</p>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>دسته‌بندی</th>
            <th>بودجه</th>
            <th>مصرف شده</th>
            <th>باقیمانده</th>
            <th>درصد مصرف</th>
          </tr>
        </thead>
        <tbody>
          ${categories.map(c => {
            const percentage = c.budget > 0 ? Math.round((c.spent / c.budget) * 100) : 0;
            const isOver = c.spent > c.budget;
            return `
              <tr>
                <td>${c.name}</td>
                <td>${c.budget.toLocaleString('fa-IR')}</td>
                <td class="${isOver ? 'over-budget' : ''}">${c.spent.toLocaleString('fa-IR')}</td>
                <td class="${isOver ? 'over-budget' : 'under-budget'}">${(c.budget - c.spent).toLocaleString('fa-IR')}</td>
                <td class="${isOver ? 'over-budget' : ''}">${percentage}%</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>این گزارش توسط SiaFlow ایجاد شده است</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};
