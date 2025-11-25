-- Add remarks column to web_urls
alter table web_urls add column if not exists remarks text;
