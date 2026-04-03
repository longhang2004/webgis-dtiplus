# WebGIS DTI+ - Phân hóa không gian phát triển số Việt Nam

Hệ thống WebGIS tương tác phân tích chỉ số Chuyển đổi số (DTI+) giữa 6 vùng kinh tế Việt Nam giai đoạn 2020-2025.

## Cài đặt & Chạy

### Frontend (bắt buộc)
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev   # http://localhost:5173
```

### Backend (tùy chọn)
```bash
cd backend
npm install
docker-compose up -d
npm run migrate
npm run seed
npm run dev   # http://localhost:3001
```

## Nhóm nghiên cứu
- Chủ nhiệm: Lê Ngọc Phương Thu (MSSV: 2456080090)
- Thành viên: Hằng Nhựt Long (MSSV: 2211874)
- GVHD: ThS. Lê Khánh Hùng

Khoa Địa lý, ĐHKHXH&NV - ĐHQG TP.HCM, 2025
