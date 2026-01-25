import { Shield, Database, Activity, Settings, FileText, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AdminSettingsTabProps {
  exportUsersToCSV: () => void;
  exportTransactionsToCSV: () => void;
}

export function AdminSettingsTab({
  exportUsersToCSV,
  exportTransactionsToCSV,
}: AdminSettingsTabProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            تنظیمات سیستم
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">احراز هویت</p>
                <p className="text-xs text-muted-foreground">تأیید ایمیل خودکار فعال است</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Database className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="font-medium">پایگاه داده</p>
                <p className="text-xs text-muted-foreground">متصل و فعال</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Activity className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">نسخه سیستم</p>
                <p className="text-xs text-muted-foreground">SiaFlow v2.0</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            خروجی گزارشات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start rounded-xl"
            onClick={exportUsersToCSV}
          >
            <Download className="w-4 h-4 ml-2" />
            خروجی لیست کاربران (CSV)
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start rounded-xl"
            onClick={exportTransactionsToCSV}
          >
            <Download className="w-4 h-4 ml-2" />
            خروجی تراکنش‌ها (CSV)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
