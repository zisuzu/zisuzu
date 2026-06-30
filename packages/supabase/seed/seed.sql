-- ============================================================
-- seed.sql  —  default categories + cities
-- ============================================================

-- Activity categories
INSERT INTO public.activity_categories (id, name, description, icon) VALUES
  ('cat-sports',    'Sports',      'Competitive and recreational sports',         '⚽'),
  ('cat-outdoors',  'Outdoors',    'Hiking, cycling, nature activities',          '🏕️'),
  ('cat-food',      'Food & Drink','Dining, cooking, food meetups',               '🍜'),
  ('cat-music',     'Music',       'Concerts, jams, open mics',                   '🎵'),
  ('cat-art',       'Art & Culture','Museums, galleries, creative workshops',     '🎨'),
  ('cat-wellness',  'Wellness',    'Yoga, meditation, fitness classes',           '🧘'),
  ('cat-games',     'Games',       'Board games, video games, card games',        '🎮'),
  ('cat-learning',  'Learning',    'Workshops, talks, language exchanges',        '📚'),
  ('cat-social',    'Social',      'General meetups, networking, parties',        '🎉'),
  ('cat-travel',    'Travel',      'Day trips, travel planning, sightseeing',     '✈️')
ON CONFLICT DO NOTHING;

-- Cities
INSERT INTO public.cities (id, name, state, country, location, is_active) VALUES
  ('city-chennai',   'Chennai',   'Tamil Nadu',    'India', ST_SetSRID(ST_MakePoint(80.2707, 13.0827), 4326), TRUE),
  ('city-bangalore', 'Bangalore', 'Karnataka',     'India', ST_SetSRID(ST_MakePoint(77.5946, 12.9716), 4326), TRUE),
  ('city-mumbai',    'Mumbai',    'Maharashtra',   'India', ST_SetSRID(ST_MakePoint(72.8777, 19.0760), 4326), TRUE),
  ('city-delhi',     'Delhi',     'Delhi',         'India', ST_SetSRID(ST_MakePoint(77.1025, 28.7041), 4326), TRUE),
  ('city-hyderabad', 'Hyderabad', 'Telangana',     'India', ST_SetSRID(ST_MakePoint(78.4867, 17.3850), 4326), TRUE),
  ('city-pune',      'Pune',      'Maharashtra',   'India', ST_SetSRID(ST_MakePoint(73.8567, 18.5204), 4326), TRUE)
ON CONFLICT DO NOTHING;

