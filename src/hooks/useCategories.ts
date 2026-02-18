import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/expense';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

const CATEGORIES_KEY = 'categories';

function mapRow(c: Record<string, unknown>): Category {
  return {
    id: c.id as string,
    name: c.name as string,
    icon: c.icon as string,
    color: c.color as string,
    budget: c.budget ? Number(c.budget) : undefined,
    spent: 0,
    type: (c.type as 'expense' | 'income' | 'saving') || 'expense',
    subcategories: (c.subcategories as string[]) || [],
  };
}

export function useCategories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading: loading } = useQuery({
    queryKey: [CATEGORIES_KEY, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []).map(mapRow);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const addMutation = useMutation({
    mutationFn: async (category: Omit<Category, 'id'>) => {
      if (!user) throw new Error('Not authenticated');
      const subcats = category.subcategories
        ? category.subcategories.map(s => typeof s === 'string' ? s : (s as { name: string }).name)
        : [];
      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name: category.name,
          icon: category.icon,
          color: category.color,
          budget: category.budget || null,
          subcategories: subcats,
          type: category.type || (category.budget ? 'expense' : 'income'),
        })
        .select()
        .single();
      if (error) throw error;
      return mapRow(data);
    },
    onSuccess: (newCat) => {
      queryClient.setQueryData<Category[]>(
        [CATEGORIES_KEY, user?.id],
        (old = []) => [...old, newCat]
      );
      toast.success('دسته‌بندی با موفقیت اضافه شد');
    },
    onError: (error: Error) => {
      console.error('Error adding category:', error);
      toast.error('خطا در افزودن دسته‌بندی');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (category: Category) => {
      if (!user) throw new Error('Not authenticated');
      const subcats = category.subcategories
        ? category.subcategories.map(s => typeof s === 'string' ? s : (s as { name: string }).name)
        : [];
      const { error } = await supabase
        .from('categories')
        .update({
          name: category.name,
          icon: category.icon,
          color: category.color,
          budget: category.budget || null,
          subcategories: subcats,
          type: category.type || (category.budget ? 'expense' : 'income'),
        })
        .eq('id', category.id)
        .eq('user_id', user.id);
      if (error) throw error;
      return { ...category, subcategories: subcats };
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Category[]>(
        [CATEGORIES_KEY, user?.id],
        (old = []) => old.map(c => c.id === updated.id ? updated : c)
      );
      toast.success('دسته‌بندی با موفقیت ویرایش شد');
    },
    onError: (error: Error) => {
      console.error('Error updating category:', error);
      toast.error('خطا در ویرایش دسته‌بندی');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<Category[]>(
        [CATEGORIES_KEY, user?.id],
        (old = []) => old.filter(c => c.id !== id)
      );
      toast.success('دسته‌بندی با موفقیت حذف شد');
    },
    onError: (error: Error) => {
      console.error('Error deleting category:', error);
      toast.error('خطا در حذف دسته‌بندی');
    },
  });

  return {
    categories,
    loading,
    addCategory: (c: Omit<Category, 'id'>) => addMutation.mutateAsync(c),
    updateCategory: (c: Category) => updateMutation.mutateAsync(c),
    deleteCategory: (id: string) => deleteMutation.mutateAsync(id),
    refetch: () => queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY, user?.id] }),
  };
}
