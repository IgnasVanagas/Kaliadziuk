alter function public.is_admin() set search_path = public;
alter function public.anonymize_customer_pii(uuid) set search_path = public;
alter function public.gift_card_available_cents(uuid) set search_path = public;
alter function public.release_gift_card_reservation(uuid) set search_path = public;
alter function public.consume_gift_card_reservation(uuid) set search_path = public;
