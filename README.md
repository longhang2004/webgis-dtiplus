# WebGIS DTI+ | Phân hóa không gian phát triển số Việt Nam

> **Ứng dụng WebGIS trong phân tích sự phân hoá không gian về chuyển đổi số giữa các vùng Kinh tế Việt Nam giai đoạn 2020-2025**

Đề tài nghiên cứu khoa học sinh viên cấp trường, năm học 2025-2026  
Khoa Địa lý - Đô thị, Trường ĐH KHXH&NV - ĐHQG TP.HCM

🌐 **Live Demo**: [https://webgis-dtiplus.vercel.app](https://webgis-dtiplus.vercel.app)

---

## Kiến trúc hệ thống (Three-Tier Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│  TẦNG 1 – GIAO DIỆN (Presentation Layer)                   │
│  React.js v18 │ Leaflet.js v1.9 │ Recharts v2 │ Zustand    │
│  Tailwind CSS                                                │
└──────────────────────────┬──────────────────────────────────┘
                           │ Request / Response (JSON)
┌──────────────────────────▼──────────────────────────────────┐
│  TẦNG 2 – LOGIC NGHIỆP VỤ (Application Layer)              │
│  Node.js v18 │ Express.js v4 │ RESTful API │ CORS           │
└──────────────────────────┬──────────────────────────────────┘
                           │ Query / Data
┌──────────────────────────▼──────────────────────────────────┐
│  TẦNG 3 – DỮ LIỆU (Data Layer)                             │
│  PostgreSQL 14 │ PostGIS 3.3 │ GeoJSON │ DTI+ Tables        │
│  Spatial Index                                               │
└─────────────────────────────────────────────────────────────┘
```

## Thông số kỹ thuật

| Thành phần | Công nghệ / Thông số |
|---|---|
| Frontend Framework | React.js v18.2 |
| Thư viện bản đồ | Leaflet.js v1.9 với GeoJSON renderer |
| Backend | Node.js v18 + Express.js v4 |
| Cơ sở dữ liệu không gian | PostgreSQL 14 + PostGIS 3.3 |
| Bản đồ nền | OpenStreetMap Tile Server (HTTPS) |
| Hệ tọa độ | WGS84 (EPSG:4326) |
| Định dạng dữ liệu không gian | GeoJSON |
| Phân loại màu sắc | 5 nhóm phân vị (quintile), bảng màu YlOrRd → Blues |
| Tính năng tương tác | Zoom, pan, click popup, so sánh song song, lọc theo năm, xuất PNG |
| Hỗ trợ thiết bị | Desktop và mobile (responsive design) |
| API | RESTful API với JSON, hỗ trợ CORS |

## Cấu trúc dự án

```
webgis-dtiplus/
├── frontend/                    # Tầng giao diện (React.js)
│   ├── src/
│   │   ├── api/                 # API client kết nối backend
│   │   ├── components/
│   │   │   ├── Controls/        # Thanh điều khiển (năm, trụ cột, xuất)
│   │   │   ├── Layout/          # Bố cục tổng thể
│   │   │   ├── Map/             # Bản đồ choropleth + legend
│   │   │   └── Panel/           # Bảng thông tin chi tiết
│   │   ├── data/                # Dữ liệu tĩnh (fallback)
│   │   ├── hooks/               # Custom hooks
│   │   ├── locales/             # Đa ngôn ngữ (vi/en)
│   │   ├── store/               # Zustand state management
│   │   ├── types/               # TypeScript types
│   │   └── utils/               # Tiện ích (color scale, statistics, export)
│   └── package.json
├── backend/                     # Tầng logic nghiệp vụ (Express.js)
│   ├── src/
│   │   ├── db/
│   │   │   ├── connection.ts    # PostgreSQL connection pool
│   │   │   ├── migrate.ts       # Database migration runner
│   │   │   ├── migrations/      # SQL migration files
│   │   │   └── seed.ts          # Seed DTI+ data
│   │   └── routes/
│   │       ├── dti.ts           # /api/dti - DTI+ data endpoints
│   │       ├── regions.ts       # /api/regions - Region metadata
│   │       └── geojson.ts       # /api/geojson - PostGIS spatial data
│   └── package.json
└── docker-compose.yml           # PostgreSQL 14 + PostGIS 3.3
```

## Chức năng chính

1. **Bản đồ choropleth DTI+** - Trực quan hóa chỉ số chuyển đổi số theo 6 vùng kinh tế
2. **Lọc theo năm** - Thanh trượt thời gian 2020-2025 với animation tự động
3. **Chọn trụ cột** - DTI+ tổng hợp, Chính quyền số, Kinh tế số, Xã hội số
4. **Pop-up chi tiết** - Click vào vùng để xem thông tin và biểu đồ xu hướng
5. **So sánh song song** - Split-screen comparison giữa hai thời điểm
6. **Xuất dữ liệu** - Export CSV và PNG với legend đầy đủ
7. **Đa ngôn ngữ** - Hỗ trợ tiếng Việt và tiếng Anh

## Cài đặt và chạy

### Yêu cầu
- Node.js >= 18
- pnpm >= 9
- Docker & Docker Compose (cho PostgreSQL + PostGIS)

### 1. Khởi động database

```bash
docker-compose up -d postgres
```

### 2. Cài đặt và chạy backend

```bash
cd backend
pnpm install
pnpm migrate
pnpm seed
pnpm dev
```

Backend chạy tại: http://localhost:3001

### 3. Cài đặt và chạy frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Frontend chạy tại: http://localhost:5173

### Cấu hình backend cho frontend

Mặc định frontend dùng dữ liệu tĩnh hardcoded trong `frontend/src/data`. Backend chỉ được gọi khi bật rõ ràng bằng biến môi trường:

```bash
VITE_BACKEND_ENABLED=true
VITE_API_URL=http://localhost:3001/api
```

Nếu `VITE_BACKEND_ENABLED=false` hoặc không được định nghĩa, frontend không gọi backend và tiếp tục dùng dữ liệu tĩnh.

## API Endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/dti` | Lấy dữ liệu DTI+ (filter: year, region_id, pillar) |
| GET | `/api/dti/stats` | Thống kê tổng hợp theo năm |
| GET | `/api/dti/compare` | So sánh hai thời điểm |
| GET | `/api/regions` | Danh sách 6 vùng kinh tế |
| GET | `/api/regions/:id` | Chi tiết vùng + chuỗi thời gian DTI+ |
| GET | `/api/geojson/regions` | GeoJSON từ PostGIS |

## Dữ liệu

- **Nguồn chính**: Chỉ số Chuyển đổi số (DTI) do Bộ TT&TT công bố 2020-2024
- **Phương pháp**: Chuẩn hóa Min-Max, tổng hợp trọng số dân số từ cấp tỉnh lên cấp vùng
- **Chỉ số DTI+**: Trung bình có trọng số của 3 trụ cột (1/3 mỗi trụ cột)
- **Bản đồ**: GeoJSON chuẩn WGS84 (EPSG:4326)

## Nhóm tác giả

| STT | Họ và tên | Vai trò |
|---|---|---|
| 1 | Lê Ngọc Phương Thư | Chủ nhiệm |
| 2 | Hàng Nhựt Long | Tham gia |

**Người hướng dẫn**: ThS. Lê Khánh Hưng

---

*TP. Hồ Chí Minh, 2026*
