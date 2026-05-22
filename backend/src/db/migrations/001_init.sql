-- WebGIS DTI+ Database Schema
-- Architecture: PostgreSQL 14 + PostGIS 3.3
-- Coordinate System: WGS84 (EPSG:4326)

CREATE EXTENSION IF NOT EXISTS postgis;

-- Table: regions
-- Stores the 6 socio-economic regions of Vietnam per Nghị quyết 81/2023/QH15
CREATE TABLE IF NOT EXISTS regions (
  id          VARCHAR(20) PRIMARY KEY,
  name        TEXT NOT NULL,
  short_name  TEXT NOT NULL,
  provinces   TEXT[],
  area_km2    NUMERIC(10,2),
  population  INTEGER,
  geom        GEOMETRY(MULTIPOLYGON, 4326),
  CONSTRAINT regions_geom_valid CHECK (geom IS NULL OR ST_IsValid(geom))
);

-- Table: dti_data
-- Stores DTI+ composite index values per region per year
-- Three pillars: gov (Chính quyền số), econ (Kinh tế số), soc (Xã hội số)
-- Values normalized to [0, 1] scale using Min-Max method
CREATE TABLE IF NOT EXISTS dti_data (
  id          SERIAL PRIMARY KEY,
  region_id   VARCHAR(20) REFERENCES regions(id),
  year        SMALLINT NOT NULL CHECK (year BETWEEN 2020 AND 2030),
  total       NUMERIC(5,3) NOT NULL,
  gov         NUMERIC(5,3) NOT NULL,
  econ        NUMERIC(5,3) NOT NULL,
  soc         NUMERIC(5,3) NOT NULL,
  is_estimate BOOLEAN DEFAULT false,
  created_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(region_id, year)
);

-- Spatial index for geometry queries
CREATE INDEX IF NOT EXISTS idx_regions_geom ON regions USING gist(geom);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'regions_geom_valid'
  ) THEN
    ALTER TABLE regions
      ADD CONSTRAINT regions_geom_valid CHECK (geom IS NULL OR ST_IsValid(geom));
  END IF;
END $$;

-- Performance indexes for DTI queries
CREATE INDEX IF NOT EXISTS idx_dti_year ON dti_data(year);
CREATE INDEX IF NOT EXISTS idx_dti_region ON dti_data(region_id);
CREATE INDEX IF NOT EXISTS idx_dti_region_year ON dti_data(region_id, year);
