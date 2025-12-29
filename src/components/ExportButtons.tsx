import { FileSpreadsheet, FileText, FileDown, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Transaction } from '@/types/expense';
import { exportToExcel, exportToPDF, exportToCSV } from '@/utils/exportUtils';
import { toast } from 'sonner';

interface ExportButtonsProps {
  transactions: Transaction[];
  className?: string;
}

export function ExportButtons({ transactions, className }: ExportButtonsProps) {
  const handleExportExcel = () => {
    try {
      exportToExcel(transactions);
      toast.success('فایل Excel با موفقیت دانلود شد');
    } catch (error) {
      toast.error('خطا در ایجاد فایل Excel');
    }
  };

  const handleExportPDF = () => {
    try {
      exportToPDF(transactions);
      toast.success('فایل PDF با موفقیت دانلود شد');
    } catch (error) {
      toast.error('خطا در ایجاد فایل PDF');
    }
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(transactions);
      toast.success('فایل CSV با موفقیت دانلود شد');
    } catch (error) {
      toast.error('خطا در ایجاد فایل CSV');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={`gap-2 ${className}`}>
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">خروجی</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={handleExportPDF} className="gap-2 cursor-pointer">
          <FileText className="w-4 h-4" />
          <span>PDF</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="w-4 h-4" />
          <span>Excel</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV} className="gap-2 cursor-pointer">
          <FileDown className="w-4 h-4" />
          <span>CSV</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
