import { Loader2, Tag, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AdminCategory } from '@/hooks/useAdmin';
import { formatCurrency } from '@/utils/persianDate';
import { cn } from '@/lib/utils';

interface AdminCategoriesTabProps {
  categories: AdminCategory[];
  categoriesLoading: boolean;
  onDeleteCategory: (category: AdminCategory) => void;
}

export function AdminCategoriesTab({
  categories,
  categoriesLoading,
  onDeleteCategory,
}: AdminCategoriesTabProps) {
  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            تمام دسته‌بندی‌ها
          </div>
          <Badge variant="outline" className="font-mono">{categories.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {categoriesLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">دسته‌بندی یافت نشد</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">نام</TableHead>
                  <TableHead className="text-right">کاربر</TableHead>
                  <TableHead className="text-right">نوع</TableHead>
                  <TableHead className="text-right">بودجه</TableHead>
                  <TableHead className="text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                          style={{ backgroundColor: cat.color + '20' }}
                        >
                          {cat.icon}
                        </div>
                        <span className="font-medium">{cat.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{cat.userName}</TableCell>
                    <TableCell>
                      <Badge 
                        className={cn(
                          "rounded-lg",
                          cat.type === 'income'
                            ? "bg-green-500/10 text-green-600"
                            : "bg-red-500/10 text-red-600"
                        )}
                      >
                        {cat.type === 'income' ? 'درآمد' : 'هزینه'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {cat.budget ? formatCurrency(cat.budget) : '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteCategory(cat)}
                        className="text-destructive hover:text-destructive rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
