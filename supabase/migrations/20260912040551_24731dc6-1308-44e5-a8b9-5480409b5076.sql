select cron.unschedule('siaflow-run-recurring-daily');

select cron.schedule(
  'siaflow-run-recurring-daily',
  '30 20 * * *',
  $$
  select net.http_post(
    url := 'https://qlytnmelseururejffbf.supabase.co/functions/v1/run-recurring',
    headers := '{"Content-Type": "application/json", "x-cron-secret": "eb799b100294a90456e3d986a5c1b1be2361b021e3c1947f"}'::jsonb,
    body := '{"source":"cron"}'::jsonb
  );
  $$
);