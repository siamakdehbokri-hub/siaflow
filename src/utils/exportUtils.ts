import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from '@/types/expense';
import { formatPersianDateShort } from '@/utils/persianDate';

export const exportToExcel = (transactions: Transaction[], filename: string = 'transactions') => {
  const data = transactions.map((t) => ({
    'نوع': t.type === 'income' ? 'درآمد' : 'هزینه',
    'مبلغ': t.amount,
    'دسته‌بندی': t.category,
    'زیردسته': t.subcategory || '-',
    'توضیحات': t.description || '-',
    'تاریخ': formatPersianDateShort(t.date),
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
    { width: 15 },
    { width: 25 },
    { width: 12 },
    { width: 8 },
  ];

  XLSX.writeFile(workbook, `${filename}.xlsx`);
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

export const exportToPDF = (transactions: Transaction[], filename: string = 'transactions') => {
  const doc = new jsPDF();
  
  // Add title in English (jsPDF has limited RTL support)
  doc.setFontSize(18);
  doc.text('Financial Report - SiaFlow', 105, 15, { align: 'center' });
  
  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  doc.setFontSize(12);
  doc.text(`Total Income: ${totalIncome.toLocaleString('fa-IR')} Toman`, 14, 25);
  doc.text(`Total Expense: ${totalExpense.toLocaleString('fa-IR')} Toman`, 14, 32);
  doc.text(`Balance: ${(totalIncome - totalExpense).toLocaleString('fa-IR')} Toman`, 14, 39);
  doc.text(`Transactions: ${transactions.length}`, 14, 46);

  // Create table data with transliterated headers
  const tableData = transactions.map((t) => [
    t.type === 'income' ? 'Income' : 'Expense',
    t.amount.toLocaleString('fa-IR'),
    t.category,
    t.subcategory || '-',
    t.description || '-',
    formatPersianDateShort(t.date),
  ]);

  autoTable(doc, {
    head: [['Type', 'Amount', 'Category', 'Subcategory', 'Description', 'Date']],
    body: tableData,
    startY: 55,
    styles: { 
      fontSize: 9,
      halign: 'center',
    },
    headStyles: { 
      fillColor: [20, 184, 166],
      halign: 'center',
    },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 28, halign: 'right' },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
      4: { cellWidth: 45 },
      5: { cellWidth: 25 },
    },
  });

  doc.save(`${filename}.pdf`);
};

export const exportCategoryReport = (categories: { name: string; spent: number; budget: number }[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Category Budget Report - SiaFlow', 105, 15, { align: 'center' });
  
  const tableData = categories.map((c) => [
    c.name,
    c.budget.toLocaleString('fa-IR'),
    c.spent.toLocaleString('fa-IR'),
    (c.budget - c.spent).toLocaleString('fa-IR'),
    `${Math.round((c.spent / c.budget) * 100)}%`,
  ]);

  autoTable(doc, {
    head: [['Category', 'Budget', 'Spent', 'Remaining', 'Usage']],
    body: tableData,
    startY: 25,
    styles: { 
      fontSize: 10,
      halign: 'center',
    },
    headStyles: { 
      fillColor: [20, 184, 166],
      halign: 'center',
    },
  });

  doc.save('category-report.pdf');
};
