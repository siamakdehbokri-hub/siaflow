import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from '@/types/expense';
import { formatCurrency } from '@/data/mockData';

export const exportToExcel = (transactions: Transaction[], filename: string = 'transactions') => {
  const data = transactions.map((t) => ({
    'نوع': t.type === 'income' ? 'درآمد' : 'هزینه',
    'مبلغ': t.amount,
    'دسته‌بندی': t.category,
    'توضیحات': t.description,
    'تاریخ': t.date,
    'تکراری': t.isRecurring ? 'بله' : 'خیر',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
  
  // Set RTL for the worksheet
  worksheet['!cols'] = [
    { width: 10 },
    { width: 15 },
    { width: 15 },
    { width: 25 },
    { width: 12 },
    { width: 8 },
  ];

  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToPDF = (transactions: Transaction[], filename: string = 'transactions') => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('Expense Report', 105, 15, { align: 'center' });
  
  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  doc.setFontSize(12);
  doc.text(`Total Income: ${totalIncome.toLocaleString()} Toman`, 14, 25);
  doc.text(`Total Expense: ${totalExpense.toLocaleString()} Toman`, 14, 32);
  doc.text(`Balance: ${(totalIncome - totalExpense).toLocaleString()} Toman`, 14, 39);

  // Create table data
  const tableData = transactions.map((t) => [
    t.type === 'income' ? 'Income' : 'Expense',
    t.amount.toLocaleString(),
    t.category,
    t.description,
    t.date,
  ]);

  autoTable(doc, {
    head: [['Type', 'Amount', 'Category', 'Description', 'Date']],
    body: tableData,
    startY: 50,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [20, 184, 166] },
    alternateRowStyles: { fillColor: [240, 240, 240] },
  });

  doc.save(`${filename}.pdf`);
};

export const exportCategoryReport = (categories: { name: string; spent: number; budget: number }[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Category Budget Report', 105, 15, { align: 'center' });
  
  const tableData = categories.map((c) => [
    c.name,
    c.budget.toLocaleString(),
    c.spent.toLocaleString(),
    (c.budget - c.spent).toLocaleString(),
    `${Math.round((c.spent / c.budget) * 100)}%`,
  ]);

  autoTable(doc, {
    head: [['Category', 'Budget', 'Spent', 'Remaining', 'Usage']],
    body: tableData,
    startY: 25,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [20, 184, 166] },
  });

  doc.save('category-report.pdf');
};
