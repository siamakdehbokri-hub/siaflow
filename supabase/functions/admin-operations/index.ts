import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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

    console.log('Request from user:', user.id);

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
    console.log('Admin action:', action, 'for user:', userId);

    switch (action) {
      case 'get-users': {
        // Get all users from auth.users via admin API
        const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        if (authError) {
          console.error('Error fetching auth users:', authError);
          throw authError;
        }

        // Get profiles with additional data
        const { data: profiles, error: profilesError } = await supabaseAdmin
          .from('profiles')
          .select('*');
        
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          throw profilesError;
        }

        // Get user roles
        const { data: roles, error: rolesError } = await supabaseAdmin
          .from('user_roles')
          .select('*');

        if (rolesError) {
          console.error('Error fetching roles:', rolesError);
          throw rolesError;
        }

        // Get transaction counts per user
        const { data: transactionCounts, error: txError } = await supabaseAdmin
          .from('transactions')
          .select('user_id');

        if (txError) {
          console.error('Error fetching transactions:', txError);
          throw txError;
        }

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
        // Get system statistics
        const { count: userCount } = await supabaseAdmin
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        const { count: transactionCount } = await supabaseAdmin
          .from('transactions')
          .select('*', { count: 'exact', head: true });

        const { count: categoryCount } = await supabaseAdmin
          .from('categories')
          .select('*', { count: 'exact', head: true });

        const { count: debtCount } = await supabaseAdmin
          .from('debts')
          .select('*', { count: 'exact', head: true });

        const { count: goalCount } = await supabaseAdmin
          .from('saving_goals')
          .select('*', { count: 'exact', head: true });

        const { count: activeUserCount } = await supabaseAdmin
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        return new Response(
          JSON.stringify({
            stats: {
              totalUsers: userCount || 0,
              activeUsers: activeUserCount || 0,
              totalTransactions: transactionCount || 0,
              totalCategories: categoryCount || 0,
              totalDebts: debtCount || 0,
              totalGoals: goalCount || 0
            }
          }),
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

        console.log('User status toggled:', userId, 'to', newStatus);

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

        console.log('Deleting user and all data:', userId);

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

        console.log('User deleted successfully:', userId);

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

        console.log('Admin role updated for user:', userId, 'isAdmin:', isAdmin);

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
