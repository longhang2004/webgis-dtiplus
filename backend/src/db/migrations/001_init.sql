CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS regions (
  id          VARCHAR(20) PRIMARY KEY,
  name        TEXT NOT NULL,
  short_name  TEXT NOT NULL,
  provinces   TEXT[],
  area_km2    NUMERIC(10,2),
  population  INTEGER,
  geom        GEOMETRY(MULTIPOLYGON, 4326)
);

CREATE TABLE IF NOT EXISTS dti_data (
  id          SERIAL PRIMARY KEY,
  region_id   VARCHAR(20) REFERENCES regions(id),
  year        SMALLINT NOT NULL CHECK (year BETWEEN 2020 AND 2025),
  total       NUMERIC(5,3) NOT NULL,
  gov         NUMERIC(5,3) NOT NULL,
  econ        NUMERIC(5,3) NOT NULL,
  soc         NUMERIC(5,3) NOT NULL,
  is_estimate BOOLEAN DEFAULT false,
  created_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(region_id, year)
);

CREATE INDEX IF NOT EXISTS idx_dti_year ON dti_data(year);
CREATE INDEX IF NOT EXISTS idx_dti_region ON dti_data(region_id);
CREATE INDEX IF NOT EXISTS idx_regions_geom ON regions USING gist(geom);
