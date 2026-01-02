import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Create client with user's token to get their ID
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: userError } = await userClient.auth.getUser()

    if (userError || !user) {
      console.error('User auth error:', userError)
      return new Response(
        JSON.stringify({ error: 'User not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = user.id
    const jwt = authHeader.replace('Bearer ', '')

    // Create admin client with service role key
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    console.log('Starting full account deletion for user:', userId)

    // 1) Delete avatar files (best-effort)
    try {
      const { data: avatarFiles, error: avatarListError } = await adminClient.storage
        .from('avatars')
        .list(userId)

      if (avatarListError) {
        console.warn('Avatar list failed:', avatarListError)
      } else if (avatarFiles && avatarFiles.length > 0) {
        const filesToDelete = avatarFiles.map((f) => `${userId}/${f.name}`)
        const { error: avatarRemoveError } = await adminClient.storage
          .from('avatars')
          .remove(filesToDelete)

        if (avatarRemoveError) {
          console.warn('Avatar remove failed:', avatarRemoveError)
        }
      }
    } catch (e) {
      console.warn('Avatar cleanup failed (ignored):', e)
    }

    // 2) Delete all user data from tables (order matters due to foreign keys)
    const deletes = [
      { table: 'saving_goal_transactions', col: 'user_id' },
      { table: 'saving_goals', col: 'user_id' },
      { table: 'transactions', col: 'user_id' },
      { table: 'categories', col: 'user_id' },
      { table: 'debts', col: 'user_id' },
      { table: 'profiles', col: 'id' },
    ] as const

    for (const d of deletes) {
      const { error } = await adminClient.from(d.table).delete().eq(d.col, userId)
      if (error) {
        console.error(`Error deleting from ${d.table}:`, error)
        return new Response(
          JSON.stringify({ error: `Failed to delete from ${d.table}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // 3) Revoke sessions (best-effort) then delete user
    try {
      // This revokes refresh tokens for the provided JWT (if supported)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (adminClient.auth.admin as any).signOut(jwt)
    } catch (e) {
      console.warn('Admin signOut failed (ignored):', e)
    }

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Error deleting user from auth:', deleteError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete user account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Account deleted successfully for user:', userId)

    return new Response(
      JSON.stringify({ success: true, message: 'Account completely deleted' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
