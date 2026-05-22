import { pool } from './connection';
import fs from 'fs';
import path from 'path';

const REGIONS = [
  { id: 'TDMNPB', name: 'Trung du và miền núi phía Bắc', short_name: 'TDMNPB', area_km2: 95222, population: 12609000 },
  { id: 'DBSH',   name: 'Đồng bằng sông Hồng',           short_name: 'ĐBSH',   area_km2: 21260, population: 23070000 },
  { id: 'BTB',    name: 'Bắc Trung Bộ và duyên hải miền Trung', short_name: 'BTB & DHMT', area_km2: 95840, population: 20410000 },
  { id: 'TN',     name: 'Tây Nguyên',                    short_name: 'Tây Nguyên', area_km2: 54641, population: 6231000 },
  { id: 'DNB',    name: 'Đông Nam Bộ',                   short_name: 'ĐNB',    area_km2: 23605, population: 18340000 },
  { id: 'DBSCL',  name: 'Đồng bằng sông Cửu Long',       short_name: 'ĐBSCL',  area_km2: 39734, population: 17428000 },
];

const DTI_RECORDS: Array<{ regionId: string; year: number; total: number; gov: number; econ: number; soc: number; isEstimate: boolean }> = [
  { regionId: 'DBSH',   year: 2020, total: 0.612, gov: 0.632, econ: 0.595, soc: 0.608, isEstimate: false },
  { regionId: 'DBSH',   year: 2021, total: 0.645, gov: 0.668, econ: 0.628, soc: 0.638, isEstimate: false },
  { regionId: 'DBSH',   year: 2022, total: 0.681, gov: 0.712, econ: 0.658, soc: 0.673, isEstimate: false },
  { regionId: 'DBSH',   year: 2023, total: 0.714, gov: 0.745, econ: 0.692, soc: 0.704, isEstimate: false },
  { regionId: 'DBSH',   year: 2024, total: 0.742, gov: 0.768, econ: 0.718, soc: 0.741, isEstimate: false },
  { regionId: 'DBSH',   year: 2025, total: 0.771, gov: 0.792, econ: 0.748, soc: 0.774, isEstimate: true  },
  { regionId: 'DNB',    year: 2020, total: 0.588, gov: 0.601, econ: 0.612, soc: 0.552, isEstimate: false },
  { regionId: 'DNB',    year: 2021, total: 0.621, gov: 0.634, econ: 0.648, soc: 0.582, isEstimate: false },
  { regionId: 'DNB',    year: 2022, total: 0.658, gov: 0.681, econ: 0.673, soc: 0.621, isEstimate: false },
  { regionId: 'DNB',    year: 2023, total: 0.697, gov: 0.718, econ: 0.705, soc: 0.668, isEstimate: false },
  { regionId: 'DNB',    year: 2024, total: 0.726, gov: 0.742, econ: 0.731, soc: 0.706, isEstimate: false },
  { regionId: 'DNB',    year: 2025, total: 0.758, gov: 0.771, econ: 0.762, soc: 0.742, isEstimate: true  },
  { regionId: 'BTB',    year: 2020, total: 0.447, gov: 0.458, econ: 0.428, soc: 0.455, isEstimate: false },
  { regionId: 'BTB',    year: 2021, total: 0.475, gov: 0.489, econ: 0.458, soc: 0.478, isEstimate: false },
  { regionId: 'BTB',    year: 2022, total: 0.512, gov: 0.534, econ: 0.493, soc: 0.509, isEstimate: false },
  { regionId: 'BTB',    year: 2023, total: 0.541, gov: 0.562, econ: 0.522, soc: 0.540, isEstimate: false },
  { regionId: 'BTB',    year: 2024, total: 0.573, gov: 0.591, econ: 0.552, soc: 0.575, isEstimate: false },
  { regionId: 'BTB',    year: 2025, total: 0.601, gov: 0.618, econ: 0.582, soc: 0.604, isEstimate: true  },
  { regionId: 'DBSCL',  year: 2020, total: 0.413, gov: 0.422, econ: 0.398, soc: 0.420, isEstimate: false },
  { regionId: 'DBSCL',  year: 2021, total: 0.441, gov: 0.449, econ: 0.425, soc: 0.448, isEstimate: false },
  { regionId: 'DBSCL',  year: 2022, total: 0.473, gov: 0.487, econ: 0.461, soc: 0.471, isEstimate: false },
  { regionId: 'DBSCL',  year: 2023, total: 0.502, gov: 0.514, econ: 0.488, soc: 0.503, isEstimate: false },
  { regionId: 'DBSCL',  year: 2024, total: 0.531, gov: 0.538, econ: 0.518, soc: 0.537, isEstimate: false },
  { regionId: 'DBSCL',  year: 2025, total: 0.558, gov: 0.564, econ: 0.548, soc: 0.562, isEstimate: true  },
  { regionId: 'TDMNPB', year: 2020, total: 0.384, gov: 0.392, econ: 0.368, soc: 0.393, isEstimate: false },
  { regionId: 'TDMNPB', year: 2021, total: 0.412, gov: 0.421, econ: 0.396, soc: 0.420, isEstimate: false },
  { regionId: 'TDMNPB', year: 2022, total: 0.443, gov: 0.461, econ: 0.425, soc: 0.443, isEstimate: false },
  { regionId: 'TDMNPB', year: 2023, total: 0.472, gov: 0.488, econ: 0.451, soc: 0.478, isEstimate: false },
  { regionId: 'TDMNPB', year: 2024, total: 0.501, gov: 0.512, econ: 0.481, soc: 0.511, isEstimate: false },
  { regionId: 'TDMNPB', year: 2025, total: 0.528, gov: 0.536, econ: 0.512, soc: 0.536, isEstimate: true  },
  { regionId: 'TN',     year: 2020, total: 0.332, gov: 0.338, econ: 0.315, soc: 0.342, isEstimate: false },
  { regionId: 'TN',     year: 2021, total: 0.358, gov: 0.365, econ: 0.342, soc: 0.368, isEstimate: false },
  { regionId: 'TN',     year: 2022, total: 0.387, gov: 0.401, econ: 0.371, soc: 0.389, isEstimate: false },
  { regionId: 'TN',     year: 2023, total: 0.416, gov: 0.428, econ: 0.398, soc: 0.421, isEstimate: false },
  { regionId: 'TN',     year: 2024, total: 0.448, gov: 0.452, econ: 0.428, soc: 0.462, isEstimate: false },
  { regionId: 'TN',     year: 2025, total: 0.475, gov: 0.478, econ: 0.462, soc: 0.484, isEstimate: true  },
];

type RegionFeature = {
  properties?: { region_id?: string };
  geometry: unknown;
};

async function seed() {
  const geojsonPath = path.resolve(__dirname, '../../../frontend/src/data/geojson/vietnam-regions.geojson');
  const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8')) as { features: RegionFeature[] };
  const geometryByRegion = new Map(
    geojson.features.map((feature) => [feature.properties?.region_id, feature.geometry])
  );

  for (const r of REGIONS) {
    const geometry = geometryByRegion.get(r.id);
    await pool.query(
      `INSERT INTO regions (id, name, short_name, area_km2, population, geom)
       VALUES (
         $1,
         $2,
         $3,
         $4,
         $5,
         ST_Multi(ST_CollectionExtract(ST_MakeValid(ST_SetSRID(ST_GeomFromGeoJSON($6), 4326)), 3))
       )
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         short_name = EXCLUDED.short_name,
         area_km2 = EXCLUDED.area_km2,
         population = EXCLUDED.population,
         geom = EXCLUDED.geom`,
      [r.id, r.name, r.short_name, r.area_km2, r.population, JSON.stringify(geometry)]
    );
  }
  for (const d of DTI_RECORDS) {
    await pool.query(
      `INSERT INTO dti_data (region_id, year, total, gov, econ, soc, is_estimate)
       VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (region_id, year) DO NOTHING`,
      [d.regionId, d.year, d.total, d.gov, d.econ, d.soc, d.isEstimate]
    );
  }
  console.log('Seed complete');
  await pool.end();
}

seed().catch(console.error);
