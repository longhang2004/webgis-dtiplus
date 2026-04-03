import { RegionMeta } from '../types';

export const REGION_META: Record<string, RegionMeta> = {
  TDMNPB: {
    id: 'TDMNPB',
    name: 'Trung du và miền núi phía Bắc',
    shortName: 'TDMNPB',
    provinces: ['Hà Giang','Cao Bằng','Bắc Kạn','Tuyên Quang','Lào Cai','Điện Biên','Lai Châu','Sơn La','Yên Bái','Hòa Bình','Thái Nguyên','Lạng Sơn','Quảng Ninh','Bắc Giang','Phú Thọ'],
    area_km2: 95222,
    population_2023: 12609000,
  },
  DBSH: {
    id: 'DBSH',
    name: 'Đồng bằng sông Hồng',
    shortName: 'ĐBSH',
    provinces: ['Hà Nội','Vĩnh Phúc','Bắc Ninh','Hải Dương','Hải Phòng','Hưng Yên','Thái Bình','Hà Nam','Nam Định','Ninh Bình'],
    area_km2: 21260,
    population_2023: 23070000,
  },
  BTB: {
    id: 'BTB',
    name: 'Bắc Trung Bộ và duyên hải miền Trung',
    shortName: 'BTB & DHMT',
    provinces: ['Thanh Hóa','Nghệ An','Hà Tĩnh','Quảng Bình','Quảng Trị','Thừa Thiên Huế','Đà Nẵng','Quảng Nam','Quảng Ngãi','Bình Định','Phú Yên','Khánh Hòa','Ninh Thuận','Bình Thuận'],
    area_km2: 95840,
    population_2023: 20410000,
  },
  TN: {
    id: 'TN',
    name: 'Tây Nguyên',
    shortName: 'Tây Nguyên',
    provinces: ['Kon Tum','Gia Lai','Đắk Lắk','Đắk Nông','Lâm Đồng'],
    area_km2: 54641,
    population_2023: 6231000,
  },
  DNB: {
    id: 'DNB',
    name: 'Đông Nam Bộ',
    shortName: 'ĐNB',
    provinces: ['TP. Hồ Chí Minh','Bình Phước','Tây Ninh','Bình Dương','Đồng Nai','Bà Rịa - Vũng Tàu'],
    area_km2: 23605,
    population_2023: 18340000,
  },
  DBSCL: {
    id: 'DBSCL',
    name: 'Đồng bằng sông Cửu Long',
    shortName: 'ĐBSCL',
    provinces: ['Long An','Tiền Giang','Bến Tre','Trà Vinh','Vĩnh Long','Đồng Tháp','An Giang','Kiên Giang','Cần Thơ','Hậu Giang','Sóc Trăng','Bạc Liêu','Cà Mau'],
    area_km2: 39734,
    population_2023: 17428000,
  },
};

export const REGION_IDS = Object.keys(REGION_META) as Array<keyof typeof REGION_META>;
