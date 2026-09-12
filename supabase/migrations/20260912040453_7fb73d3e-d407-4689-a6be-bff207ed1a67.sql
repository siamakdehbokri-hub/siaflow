create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select cron.unschedule('siaflow-run-recurring-daily')
where exists (select 1 from cron.job where jobname = 'siaflow-run-recurring-daily');

select cron.schedule(
  'siaflow-run-recurring-daily',
  '30 20 * * *',
  $$
  select net.http_post(
    url := 'https://qlytnmelseururejffbf.supabase.co/functions/v1/run-recurring',
    headers := '{"Content-Type": "application/json", "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFseXRubWVsc2V1cnVyZWpmZmJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2Mjg5MzAsImV4cCI6MjA4MjIwNDkzMH0.U3D3sdxEWs6Rsvmmzft4KEbIJN8-GMy4vU-_jlxzHMU"}'::jsonb,
    body := '{"source":"cron"}'::jsonb
  );
  $$
);