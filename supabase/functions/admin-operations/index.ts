import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const ALLOWED_ORIGINS = [
  'https://siaflow.lovable.app',
  'https://id-preview--b0641f68-27b4-4098-b46f-fab1a6247e46.lovable.app',
  'http://localhost:8080',
  'http://localhost:3000',
  'http://localhost:5173',
];

function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  try {
    const { hostname, protocol } = new URL(origin);
    return protocol === 'https:' && (
      hostname.endsWith('.lovable.app') ||
      hostname.endsWith('.lovableproject.com') ||
      hostname.endsWith('.lovable.dev')
    );
  } catch {
    return false;
  }
}

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') || '';
  const allowedOrigin = isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Vary': 'Origin',
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get the authorization header to verify user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract the JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the user using the admin client with the token
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      console.error('Failed to get user:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    // Check if the user is an admin using the has_role function
    const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (roleError) {
      console.error('Error checking role:', roleError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify permissions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isAdmin) {
      console.error('User is not an admin');
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, userId, data: actionData } = await req.json();
    switch (action) {
      case 'get-users': {
        // Fetch auth users, profiles, roles and transaction list in parallel
        const [
          { data: authUsersData, error: authError },
          { data: profiles, error: profilesError },
          { data: roles, error: rolesError },
          { data: transactionCounts, error: txError },
        ] = await Promise.all([
          supabaseAdmin.auth.admin.listUsers(),
          supabaseAdmin.from('profiles').select('*'),
          supabaseAdmin.from('user_roles').select('*'),
          supabaseAdmin.from('transactions').select('user_id'),
        ]);

        if (authError) {
          console.error('Error fetching auth users:', authError);
          throw authError;
        }
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          throw profilesError;
        }
        if (rolesError) {
          console.error('Error fetching roles:', rolesError);
          throw rolesError;
        }
        if (txError) {
          console.error('Error fetching transactions:', txError);
          throw txError;
        }

        const authUsers = authUsersData;

        // Count transactions per user
        const txCountMap: Record<string, number> = {};
        transactionCounts?.forEach(tx => {
          txCountMap[tx.user_id] = (txCountMap[tx.user_id] || 0) + 1;
        });


        // Combine data
        const users = authUsers.users.map(authUser => {
          const profile = profiles?.find(p => p.id === authUser.id);
          const userRoles = roles?.filter(r => r.user_id === authUser.id).map(r => r.role) || [];
          
          return {
            id: authUser.id,
            email: authUser.email,
            displayName: profile?.display_name || authUser.email?.split('@')[0],
            avatarUrl: profile?.avatar_url,
            isActive: profile?.is_active ?? true,
            lastLogin: profile?.last_login || authUser.last_sign_in_at,
            createdAt: authUser.created_at,
            roles: userRoles,
            transactionCount: txCountMap[authUser.id] || 0
          };
        });

        return new Response(
          JSON.stringify({ users }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get-stats': {
        // Get system statistics (run all count queries in parallel)
        const headCount = (table: string, filter?: (q: any) => any) => {
          let q = supabaseAdmin.from(table).select('*', { count: 'exact', head: true });
          if (filter) q = filter(q);
          return q;
        };

        const [
          { count: userCount },
          { count: transactionCount },
          { count: categoryCount },
          { count: debtCount },
          { count: goalCount },
          { count: activeUserCount },
          { count: accountCount },
          { count: transferCount },
        ] = await Promise.all([
          headCount('profiles'),
          headCount('transactions'),
          headCount('categories'),
          headCount('debts'),
          headCount('saving_goals'),
          headCount('profiles', (q) => q.eq('is_active', true)),
          headCount('accounts'),
          headCount('transfers'),
        ]);

        return new Response(
          JSON.stringify({
            stats: {
              totalUsers: userCount || 0,
              activeUsers: activeUserCount || 0,
              totalTransactions: transactionCount || 0,
              totalCategories: categoryCount || 0,
              totalDebts: debtCount || 0,
              totalGoals: goalCount || 0,
              totalAccounts: accountCount || 0,
              totalTransfers: transferCount || 0
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get-all-transactions': {
        const limit = actionData?.limit || 100;
        const offset = actionData?.offset || 0;
        const filterUserId = actionData?.userId;

        let query = supabaseAdmin
          .from('transactions')
          .select('*')
          .order('date', { ascending: false })
          .range(offset, offset + limit - 1);

        if (filterUserId) {
          query = query.eq('user_id', filterUserId);
        }

        const { data: transactions, error } = await query;

        if (error) {
          console.error('Error fetching transactions:', error);
          throw error;
        }

        // Get user names for transactions
        const userIds = [...new Set(transactions?.map(t => t.user_id) || [])];
        const { data: profiles } = await supabaseAdmin
          .from('profiles')
          .select('id, display_name, email')
          .in('id', userIds);

        const profileMap: Record<string, any> = {};
        profiles?.forEach(p => {
          profileMap[p.id] = p;
        });

        const enrichedTransactions = transactions?.map(t => ({
          ...t,
          userName: profileMap[t.user_id]?.display_name || profileMap[t.user_id]?.email?.split('@')[0] || 'کاربر ناشناس'
        }));

        return new Response(
          JSON.stringify({ transactions: enrichedTransactions }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get-all-categories': {
        const { data: categories, error } = await supabaseAdmin
          .from('categories')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching categories:', error);
          throw error;
        }

        // Get user names
        const userIds = [...new Set(categories?.map(c => c.user_id) || [])];
        const { data: profiles } = await supabaseAdmin
          .from('profiles')
          .select('id, display_name, email')
          .in('id', userIds);

        const profileMap: Record<string, any> = {};
        profiles?.forEach(p => {
          profileMap[p.id] = p;
        });

        const enrichedCategories = categories?.map(c => ({
          ...c,
          userName: profileMap[c.user_id]?.display_name || profileMap[c.user_id]?.email?.split('@')[0] || 'کاربر ناشناس'
        }));

        return new Response(
          JSON.stringify({ categories: enrichedCategories }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get-all-debts': {
        const { data: debts, error } = await supabaseAdmin
          .from('debts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching debts:', error);
          throw error;
        }

        // Get user names
        const userIds = [...new Set(debts?.map(d => d.user_id) || [])];
        const { data: profiles } = await supabaseAdmin
          .from('profiles')
          .select('id, display_name, email')
          .in('id', userIds);

        const profileMap: Record<string, any> = {};
        profiles?.forEach(p => {
          profileMap[p.id] = p;
        });

        const enrichedDebts = debts?.map(d => ({
          ...d,
          userName: profileMap[d.user_id]?.display_name || profileMap[d.user_id]?.email?.split('@')[0] || 'کاربر ناشناس'
        }));

        return new Response(
          JSON.stringify({ debts: enrichedDebts }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get-all-goals': {
        const { data: goals, error } = await supabaseAdmin
          .from('saving_goals')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching goals:', error);
          throw error;
        }

        // Get user names
        const userIds = [...new Set(goals?.map(g => g.user_id) || [])];
        const { data: profiles } = await supabaseAdmin
          .from('profiles')
          .select('id, display_name, email')
          .in('id', userIds);

        const profileMap: Record<string, any> = {};
        profiles?.forEach(p => {
          profileMap[p.id] = p;
        });

        const enrichedGoals = goals?.map(g => ({
          ...g,
          userName: profileMap[g.user_id]?.display_name || profileMap[g.user_id]?.email?.split('@')[0] || 'کاربر ناشناس'
        }));

        return new Response(
          JSON.stringify({ goals: enrichedGoals }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get-all-accounts': {
        const { data: accounts, error } = await supabaseAdmin
          .from('accounts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching accounts:', error);
          throw error;
        }

        // Get user names
        const userIds = [...new Set(accounts?.map(a => a.user_id) || [])];
        const { data: profiles } = await supabaseAdmin
          .from('profiles')
          .select('id, display_name, email')
          .in('id', userIds);

        const profileMap: Record<string, any> = {};
        profiles?.forEach(p => {
          profileMap[p.id] = p;
        });

        const enrichedAccounts = accounts?.map(a => ({
          ...a,
          userName: profileMap[a.user_id]?.display_name || profileMap[a.user_id]?.email?.split('@')[0] || 'کاربر ناشناس'
        }));

        return new Response(
          JSON.stringify({ accounts: enrichedAccounts }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get-financial-summary': {
        // Fetch transactions, debts, goals and accounts in parallel
        const [
          { data: transactions, error: txError },
          { data: debts, error: debtError },
          { data: goals, error: goalError },
          { data: accounts, error: accountError },
        ] = await Promise.all([
          supabaseAdmin.from('transactions').select('amount, type'),
          supabaseAdmin.from('debts').select('total_amount, paid_amount'),
          supabaseAdmin.from('saving_goals').select('target_amount, current_amount'),
          supabaseAdmin.from('accounts').select('balance'),
        ]);

        if (txError) throw txError;
        if (debtError) throw debtError;
        if (goalError) throw goalError;
        if (accountError) throw accountError;

        let totalIncome = 0;
        let totalExpense = 0;
        let totalSaving = 0;
        transactions?.forEach(t => {
          if (t.type === 'income') {
            totalIncome += Number(t.amount);
          } else if (t.type === 'saving') {
            totalSaving += Number(t.amount);
          } else {
            totalExpense += Number(t.amount);
          }
        });

        let totalDebtAmount = 0;
        let totalDebtPaid = 0;
        debts?.forEach(d => {
          totalDebtAmount += Number(d.total_amount);
          totalDebtPaid += Number(d.paid_amount);
        });

        let totalGoalTarget = 0;
        let totalGoalCurrent = 0;
        goals?.forEach(g => {
          totalGoalTarget += Number(g.target_amount);
          totalGoalCurrent += Number(g.current_amount);
        });

        let totalAccountBalance = 0;
        accounts?.forEach(a => {
          totalAccountBalance += Number(a.balance);
        });


        return new Response(
          JSON.stringify({
            summary: {
              totalIncome,
              totalExpense,
              totalSaving,
              netBalance: totalIncome - totalExpense - totalSaving,
              totalDebtAmount,
              totalDebtPaid,
              totalDebtRemaining: totalDebtAmount - totalDebtPaid,
              totalGoalTarget,
              totalGoalCurrent,
              totalGoalProgress: totalGoalTarget > 0 ? Math.round((totalGoalCurrent / totalGoalTarget) * 100) : 0,
              totalAccountBalance
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete-transaction': {
        if (!actionData?.transactionId) {
          return new Response(
            JSON.stringify({ error: 'Transaction ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabaseAdmin
          .from('transactions')
          .delete()
          .eq('id', actionData.transactionId);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete-category': {
        if (!actionData?.categoryId) {
          return new Response(
            JSON.stringify({ error: 'Category ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabaseAdmin
          .from('categories')
          .delete()
          .eq('id', actionData.categoryId);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete-debt': {
        if (!actionData?.debtId) {
          return new Response(
            JSON.stringify({ error: 'Debt ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabaseAdmin
          .from('debts')
          .delete()
          .eq('id', actionData.debtId);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete-goal': {
        if (!actionData?.goalId) {
          return new Response(
            JSON.stringify({ error: 'Goal ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // First delete goal transactions
        await supabaseAdmin
          .from('saving_goal_transactions')
          .delete()
          .eq('goal_id', actionData.goalId);

        const { error } = await supabaseAdmin
          .from('saving_goals')
          .delete()
          .eq('id', actionData.goalId);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'toggle-user-status': {
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'User ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('is_active')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          throw profileError;
        }

        const newStatus = !profile.is_active;

        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ is_active: newStatus })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating status:', updateError);
          throw updateError;
        }

        // Enforce ban at the auth layer so disabled users can't sign in or use existing JWTs
        const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          ban_duration: newStatus ? 'none' : '876600h',
        });
        if (banError) {
          console.error('Error updating auth ban status:', banError);
          throw banError;
        }

        // When disabling, sign out all active sessions immediately
        if (!newStatus) {
          const { error: signOutError } = await supabaseAdmin.auth.admin.signOut(userId, 'global');
          if (signOutError) {
            console.error('Error signing out user:', signOutError);
          }
        }

        return new Response(
          JSON.stringify({ success: true, isActive: newStatus }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete-user': {
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'User ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        // Delete all user data from all tables
        const tablesToDelete = [
          'transfers',
          'accounts',
          'saving_goal_transactions',
          'saving_goals',
          'transactions',
          'categories',
          'debts',
          'user_roles',
          'profiles'
        ];

        for (const table of tablesToDelete) {
          const { error } = await supabaseAdmin
            .from(table)
            .delete()
            .eq(table === 'profiles' ? 'id' : 'user_id', userId);
          
          if (error) {
            console.error(`Error deleting from ${table}:`, error);
          }
        }

        // Delete user from auth
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (authError) {
          console.error('Error deleting auth user:', authError);
          throw authError;
        }
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'set-admin': {
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'User ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const isAdmin = actionData?.isAdmin ?? true;

        if (isAdmin) {
          // Add admin role
          const { error } = await supabaseAdmin
            .from('user_roles')
            .upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id,role' });
          
          if (error) {
            console.error('Error adding admin role:', error);
            throw error;
          }
        } else {
          // Remove admin role
          const { error } = await supabaseAdmin
            .from('user_roles')
            .delete()
            .eq('user_id', userId)
            .eq('role', 'admin');
          
          if (error) {
            console.error('Error removing admin role:', error);
            throw error;
          }
        }
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Admin operation error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
