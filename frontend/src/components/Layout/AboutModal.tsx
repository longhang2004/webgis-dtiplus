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
      className="absolute inset-0 z-[1200] flex min-h-0 items-end justify-center sm:items-center p-2 sm:p-4"
      style={{
        background: 'rgba(7, 14, 28, 0.985)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-xl max-h-full overflow-y-auto rounded-t-2xl border shadow-2xl sm:rounded-xl p-6 sm:p-8 touch-manipulation"
        style={{
          background:
            'linear-gradient(180deg, rgba(12, 22, 40, 0.98), rgba(12, 22, 40, 0.94))',
          borderColor: 'var(--border)',
          boxShadow: '0 30px 70px -20px rgba(0, 0, 0, 0.75)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start gap-3 mb-4">
          <h2
            id="about-modal-title"
            className="text-xl sm:text-2xl font-semibold leading-snug pr-2"
            style={{ color: 'var(--accent)' }}
          >
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
        <h3 className="text-base sm:text-lg font-semibold mb-5 leading-relaxed" style={{ color: 'var(--text)' }}>
          Phân tích sự phân hóa không gian của hạ tầng và năng lực số giữa các vùng kinh tế Việt Nam giai đoạn 2020–2025 bằng WebGIS
        </h3>
        <div className="space-y-5 text-base leading-relaxed" style={{ color: 'var(--text)' }}>
          <div>
            <p className="font-semibold mb-2 text-base" style={{ color: 'var(--accent2)' }}>
              Nhóm nghiên cứu
            </p>
            <ul className="list-disc pl-5 space-y-2 marker:text-[var(--muted)]" style={{ color: 'var(--text)' }}>
              <li>Chủ nhiệm: Lê Ngọc Phương Thư (MSSV: 2456080090)</li>
              <li>Thành viên: Hàng Nhựt Long (MSSV: 2211874)</li>
              <li>GVHD: ThS. Lê Khánh Hưng</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2 text-base" style={{ color: 'var(--accent2)' }}>
              Đơn vị
            </p>
            <p style={{ color: 'var(--text)' }}>
              Khoa Địa lý, Trường Đại học Khoa học Xã hội và Nhân văn, ĐHQG TP.HCM
            </p>
          </div>
          <div>
            <p className="font-semibold mb-2 text-base" style={{ color: 'var(--accent2)' }}>
              Về chỉ số DTI+
            </p>
            <p style={{ color: 'var(--text)' }}>
              Chỉ số DTI+ là chỉ số tổng hợp mở rộng được xây dựng từ dữ liệu DTI chính thức của Bộ TT&TT, tổng hợp theo 6 vùng kinh tế bằng phương pháp trung bình gia quyền dân số. Thang đo 0–1, càng cao càng phát triển số.
            </p>
          </div>
          <p
            className="italic pt-3 text-sm border-t"
            style={{ color: 'var(--muted)', borderColor: 'rgba(26, 45, 77, 0.8)' }}
          >
            * Số liệu năm 2025 là ước tính dựa trên xu hướng giai đoạn 2020–2024.
          </p>
        </div>
      </div>
    </div>
  );
}
