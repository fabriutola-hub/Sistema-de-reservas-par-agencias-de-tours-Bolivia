-- Fix "search_path mutable" security advisory for 6 functions
-- Sets search_path = public to prevent search_path injection attacks

ALTER FUNCTION public.generate_codigo_reserva()
  SET search_path = public;

ALTER FUNCTION public.cleanup_expired_reservations()
  SET search_path = public;

ALTER FUNCTION public.get_admin_count()
  SET search_path = public;

ALTER FUNCTION public.get_user_role(check_user_id uuid)
  SET search_path = public;

ALTER FUNCTION public.handle_new_user()
  SET search_path = public;

ALTER FUNCTION public.get_all_admin_users()
  SET search_path = public;
