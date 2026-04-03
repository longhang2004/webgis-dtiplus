import React from 'react';

interface Props {
  onClose: () => void;
}

export default function AboutModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(7,14,28,0.85)' }}>
      <div className="rounded-xl border p-6 max-w-lg w-full mx-4" style={{ background: 'var(--panel)', borderColor: 'var(--border)' }}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-base font-semibold" style={{ color: 'var(--accent)' }}>Giới thiệu đề tài</h2>
          <button onClick={onClose} className="text-xl leading-none" style={{ color: 'var(--muted)' }}>×</button>
        </div>
        <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text)' }}>
          Phân tích sự phân hóa không gian của hạ tầng và năng lực số giữa các vùng kinh tế Việt Nam giai đoạn 2020–2025 bằng WebGIS
        </h3>
        <div className="space-y-3 text-xs" style={{ color: 'var(--muted)' }}>
          <div>
            <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>Nhóm nghiên cứu</p>
            <p>• Chủ nhiệm: Lê Ngọc Phương Thu (MSSV: 2456080090)</p>
            <p>• Thành viên: Hằng Nhựt Long (MSSV: 2211874)</p>
            <p>• GVHD: ThS. Lê Khánh Hùng</p>
          </div>
          <div>
            <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>Đơn vị</p>
            <p>Khoa Địa lý, Trường Đại học Khoa học Xã hội và Nhân văn, ĐHQG TP.HCM</p>
          </div>
          <div>
            <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>Về chỉ số DTI+</p>
            <p>Chỉ số DTI+ là chỉ số tổng hợp mở rộng được xây dựng từ dữ liệu DTI chính thức của Bộ TT&TT, tổng hợp theo 6 vùng kinh tế bằng phương pháp trung bình gia quyền dân số. Thang đo 0–1, càng cao càng phát triển số.</p>
          </div>
          <p className="italic pt-2" style={{ color: 'var(--border)' }}>
            * Số liệu năm 2025 là ước tính dựa trên xu hướng giai đoạn 2020–2024.
          </p>
        </div>
      </div>
    </div>
  );
}
