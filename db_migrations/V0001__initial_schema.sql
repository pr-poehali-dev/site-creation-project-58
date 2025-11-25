
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS videos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  external_url TEXT NOT NULL,
  image1_url TEXT NOT NULL,
  image2_url TEXT NOT NULL,
  image3_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  position INTEGER DEFAULT 0
);

CREATE INDEX idx_videos_position ON videos(position DESC, created_at DESC);
CREATE INDEX idx_videos_tags ON videos USING GIN(tags);
