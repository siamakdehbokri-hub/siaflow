import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from '@/types/expense';
import { formatCurrency, formatPersianDateShort } from '@/utils/persianDate';

export const exportToExcel = (transactions: Transaction[], filename: string = 'transactions') => {
  const data = transactions.map((t) => ({
    'نوع': t.type === 'income' ? 'درآمد' : 'هزینه',
    'مبلغ': t.amount,
    'دسته‌بندی': t.category,
    'توضیحات': t.description,
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
    { width: 25 },
    { width: 12 },
    { width: 8 },
  ];

  XLSX.writeFile(workbook, `${filename}.xlsx`);
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

  // Create table data with transliterated headers
  const tableData = transactions.map((t) => [
    t.type === 'income' ? 'Income' : 'Expense',
    t.amount.toLocaleString('fa-IR'),
    t.category,
    t.description || '-',
    formatPersianDateShort(t.date),
  ]);

  autoTable(doc, {
    head: [['Type', 'Amount', 'Category', 'Description', 'Date']],
    body: tableData,
    startY: 50,
    styles: { 
      fontSize: 10,
      halign: 'center',
    },
    headStyles: { 
      fillColor: [20, 184, 166],
      halign: 'center',
    },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 35, halign: 'right' },
      2: { cellWidth: 40 },
      3: { cellWidth: 50 },
      4: { cellWidth: 30 },
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
