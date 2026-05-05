import { shouldQueueOffline, isOfflineId } from '@/lib/networkUtils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/expense';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { enqueueRequest } from '@/lib/offlineDb';

const CATEGORIES_KEY = 'categories';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

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

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
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
      const dbRow = {
        user_id: user.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        budget: category.budget || null,
        subcategories: subcats,
        type: category.type || (category.budget ? 'expense' : 'income'),
      };

      try {
        const { data, error } = await supabase
          .from('categories')
          .insert(dbRow)
          .select()
          .single();
        if (error) throw error;
        return { cat: mapRow(data), queued: false };
      } catch (err) {
        if (shouldQueueOffline(err)) {
          const headers = await getAuthHeaders();
          await enqueueRequest({
            endpoint: `${SUPABASE_URL}/rest/v1/categories?select=*`,
            method: 'POST',
            payload: dbRow,
            headers: { ...headers, 'Prefer': 'return=representation' },
          });
          const optimistic: Category = {
            ...category,
            id: `offline-${Date.now()}`,
            subcategories: subcats,
            spent: 0,
          };
          return { cat: optimistic, queued: true };
        }
        throw err;
      }
    },
    onSuccess: ({ cat, queued }) => {
      queryClient.setQueryData<Category[]>(
        [CATEGORIES_KEY, user?.id],
        (old = []) => [...old, cat]
      );
      toast.success(queued ? 'ذخیره آفلاین شد.' : 'دسته‌بندی با موفقیت اضافه شد');
    },
    onError: (error: Error) => {
      console.error('Error adding category:', error);
      toast.error('خطا در افزودن دسته‌بندی');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (category: Category) => {
      if (!user) throw new Error('Not authenticated');
      if (isOfflineId(category.id)) {
        toast.warning('این آیتم هنوز همگام‌سازی نشده. لطفاً پس از اتصال دوباره تلاش کنید.');
        throw new Error('OFFLINE_PENDING');
      }
      const subcats = category.subcategories
        ? category.subcategories.map(s => typeof s === 'string' ? s : (s as { name: string }).name)
        : [];
      const dbRow = {
        name: category.name,
        icon: category.icon,
        color: category.color,
        budget: category.budget || null,
        subcategories: subcats,
        type: category.type || (category.budget ? 'expense' : 'income'),
      };

      try {
        const { error } = await supabase
          .from('categories')
          .update(dbRow)
          .eq('id', category.id)
          .eq('user_id', user.id);
        if (error) throw error;
        return { cat: { ...category, subcategories: subcats }, queued: false };
      } catch (err) {
        if (shouldQueueOffline(err)) {
          const headers = await getAuthHeaders();
          await enqueueRequest({
            endpoint: `${SUPABASE_URL}/rest/v1/categories?id=eq.${category.id}&user_id=eq.${user.id}`,
            method: 'PATCH',
            payload: dbRow,
            headers,
          });
          return { cat: { ...category, subcategories: subcats }, queued: true };
        }
        throw err;
      }
    },
    onSuccess: ({ cat, queued }) => {
      queryClient.setQueryData<Category[]>(
        [CATEGORIES_KEY, user?.id],
        (old = []) => old.map(c => c.id === cat.id ? cat : c)
      );
      toast.success(queued ? 'ذخیره آفلاین شد.' : 'دسته‌بندی با موفقیت ویرایش شد');
    },
    onError: (error: Error) => {
      console.error('Error updating category:', error);
      toast.error('خطا در ویرایش دسته‌بندی');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');
      if (isOfflineId(id)) {
        toast.warning('این آیتم هنوز همگام‌سازی نشده. لطفاً پس از اتصال دوباره تلاش کنید.');
        throw new Error('OFFLINE_PENDING');
      }

      try {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
        if (error) throw error;
        return { id, queued: false };
      } catch (err) {
        if (shouldQueueOffline(err)) {
          const headers = await getAuthHeaders();
          await enqueueRequest({
            endpoint: `${SUPABASE_URL}/rest/v1/categories?id=eq.${id}&user_id=eq.${user.id}`,
            method: 'DELETE',
            payload: null,
            headers,
          });
          return { id, queued: true };
        }
        throw err;
      }
    },
    onSuccess: ({ id, queued }) => {
      queryClient.setQueryData<Category[]>(
        [CATEGORIES_KEY, user?.id],
        (old = []) => old.filter(c => c.id !== id)
      );
      toast.success(queued ? 'ذخیره آفلاین شد.' : 'دسته‌بندی با موفقیت حذف شد');
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
