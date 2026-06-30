-- ============================================================
-- seed.sql  —  default categories + cities
-- ============================================================

-- Activity categories (let DB generate UUIDs)
INSERT INTO public.activity_categories (name, description, icon) VALUES
  ('Sports',       'Competitive and recreational sports',    '⚽'),
  ('Outdoors',     'Hiking, cycling, nature activities',     '🏕️'),
  ('Food & Drink', 'Dining, cooking, food meetups',          '🍜'),
  ('Music',        'Concerts, jams, open mics',              '🎵'),
  ('Art & Culture','Museums, galleries, creative workshops', '🎨'),
  ('Wellness',     'Yoga, meditation, fitness classes',      '🧘'),
  ('Games',        'Board games, video games, card games',   '🎮'),
  ('Learning',     'Workshops, talks, language exchanges',   '📚'),
  ('Social',       'General meetups, networking, parties',   '🎉'),
  ('Travel',       'Day trips, travel planning, sightseeing','✈️')
ON CONFLICT (name) DO NOTHING;

-- Cities (let DB generate UUIDs)
INSERT INTO public.cities (name, state, country, location, is_active) VALUES
  ('Chennai',   'Tamil Nadu',  'India', ST_SetSRID(ST_MakePoint(80.2707, 13.0827), 4326), TRUE),
  ('Bangalore', 'Karnataka',   'India', ST_SetSRID(ST_MakePoint(77.5946, 12.9716), 4326), TRUE),
  ('Mumbai',    'Maharashtra', 'India', ST_SetSRID(ST_MakePoint(72.8777, 19.0760), 4326), TRUE),
  ('Delhi',     'Delhi',       'India', ST_SetSRID(ST_MakePoint(77.1025, 28.7041), 4326), TRUE),
  ('Hyderabad', 'Telangana',   'India', ST_SetSRID(ST_MakePoint(78.4867, 17.3850), 4326), TRUE),
  ('Pune',      'Maharashtra', 'India', ST_SetSRID(ST_MakePoint(73.8567, 18.5204), 4326), TRUE)
ON CONFLICT (name) DO NOTHING;

