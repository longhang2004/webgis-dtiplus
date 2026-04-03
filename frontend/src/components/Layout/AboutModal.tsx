import React from 'react';

interface Props {
  onClose: () => void;
}

export default function AboutModal({ onClose }: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4"
      style={{ background: 'rgba(7, 14, 28, 0.96)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg max-h-[min(92vh,800px)] overflow-y-auto rounded-t-2xl border shadow-2xl sm:rounded-xl p-5 sm:p-7 touch-manipulation"
        style={{
          background: 'var(--panel)',
          borderColor: 'var(--border)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.55)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start gap-3 mb-4">
          <h2 id="about-modal-title" className="text-lg font-semibold leading-snug pr-2" style={{ color: 'var(--accent)' }}>
            Giới thiệu đề tài
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-2xl leading-none w-9 h-9 rounded-lg flex items-center justify-center hover:opacity-80"
            style={{ color: 'var(--muted)', background: 'rgba(26, 45, 77, 0.35)' }}
            aria-label="Đóng"
          >
            ×
          </button>
        </div>
        <h3 className="text-sm sm:text-base font-medium mb-4 leading-relaxed" style={{ color: 'var(--text)' }}>
          Phân tích sự phân hóa không gian của hạ tầng và năng lực số giữa các vùng kinh tế Việt Nam giai đoạn 2020–2025 bằng WebGIS
        </h3>
        <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
          <div>
            <p className="font-semibold mb-2 text-[0.95rem]" style={{ color: 'var(--text)' }}>
              Nhóm nghiên cứu
            </p>
            <ul className="list-disc pl-4 space-y-1.5">
              <li>Chủ nhiệm: Lê Ngọc Phương Thư (MSSV: 2456080090)</li>
              <li>Thành viên: Hàng Nhựt Long (MSSV: 2211874)</li>
              <li>GVHD: ThS. Lê Khánh Hưng</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2 text-[0.95rem]" style={{ color: 'var(--text)' }}>
              Đơn vị
            </p>
            <p>Khoa Địa lý, Trường Đại học Khoa học Xã hội và Nhân văn, ĐHQG TP.HCM</p>
          </div>
          <div>
            <p className="font-semibold mb-2 text-[0.95rem]" style={{ color: 'var(--text)' }}>
              Về chỉ số DTI+
            </p>
            <p>
              Chỉ số DTI+ là chỉ số tổng hợp mở rộng được xây dựng từ dữ liệu DTI chính thức của Bộ TT&TT, tổng hợp theo 6 vùng kinh tế bằng phương pháp trung bình gia quyền dân số. Thang đo 0–1, càng cao càng phát triển số.
            </p>
          </div>
          <p className="italic pt-1 text-[0.8125rem] border-t mt-4" style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}>
            * Số liệu năm 2025 là ước tính dựa trên xu hướng giai đoạn 2020–2024.
          </p>
        </div>
      </div>
    </div>
  );
}
