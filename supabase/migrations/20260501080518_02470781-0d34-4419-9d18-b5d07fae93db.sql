
-- Grant execute on functions the client legitimately needs
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.transfer_between_accounts(uuid, uuid, uuid, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.transfer_to_goal(uuid, uuid, uuid, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_goal_amount(uuid, uuid, bigint, text, text) TO authenticated;

-- Revoke from anon explicitly for safety
REVOKE ALL ON FUNCTION public.is_admin() FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.transfer_between_accounts(uuid, uuid, uuid, numeric, text) FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.transfer_to_goal(uuid, uuid, uuid, numeric, text) FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.update_goal_amount(uuid, uuid, bigint, text, text) FROM anon, PUBLIC;

-- Revoke execute on internal/trigger functions from all client roles
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_last_login() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
