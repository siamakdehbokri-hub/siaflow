import { FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/expense';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';
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

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportExcel}
        className="flex items-center gap-2"
      >
        <FileSpreadsheet className="w-4 h-4" />
        <span className="hidden sm:inline">Excel</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPDF}
        className="flex items-center gap-2"
      >
        <FileText className="w-4 h-4" />
        <span className="hidden sm:inline">PDF</span>
      </Button>
    </div>
  );
}
