'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

const FAQS = [
  {
    q: 'VORTEX có hỗ trợ giao hàng hỏa tốc không?',
    a: 'Có! VORTEX cung cấp dịch vụ giao hàng hỏa tốc trong vòng 2 giờ đối với khu vực nội thành TP. Hồ Chí Minh. Các khu vực khác sẽ nhận hàng từ 1-3 ngày làm việc thông qua các đối tác vận chuyển uy tín.'
  },
  {
    q: 'Quy trình bảo hành Gaming Gear tại VORTEX như thế nào?',
    a: 'Tất cả các sản phẩm bàn phím, chuột, tai nghe bán ra đều được bảo hành chính hãng 24 tháng. Đặc biệt, VORTEX áp dụng chính sách 1 đổi 1 trong 30 ngày đầu tiên nếu sản phẩm phát sinh lỗi từ nhà sản xuất. Bạn chỉ cần mang hóa đơn hoặc đọc số điện thoại mua hàng để được hỗ trợ.'
  },
  {
    q: 'Tôi có được kiểm tra sản phẩm trước khi thanh toán không?',
    a: 'Hoàn toàn được! VORTEX khuyến khích quý khách kiểm tra ngoại quan sản phẩm, phụ kiện đi kèm và tem bảo hành trước khi thanh toán cho nhân viên giao hàng (đồng kiểm).'
  },
  {
    q: 'Làm sao để tôi theo dõi hành trình đơn hàng của mình?',
    a: 'Sau khi đơn hàng được gửi đi, mã vận đơn sẽ được cập nhật trong phần "Đơn hàng của tôi" trong tài khoản của bạn. Bạn cũng sẽ nhận được email tự động thông báo kèm link tra cứu lộ trình trực tuyến.'
  }
];

const POLICIES = [
  {
    title: '🛡️ Chính sách Bảo hành & Đổi trả',
    content: 'Chúng tôi cam kết bảo hành 24 tháng cho mọi thiết bị Gaming Gear. Đổi mới 100% trong 30 ngày đầu tiên nếu lỗi kỹ thuật. Hỗ trợ gửi sản phẩm bảo hành tận nhà miễn phí trong 6 tháng đầu.'
  },
  {
    title: '🚚 Chính sách Vận chuyển',
    content: 'Miễn phí vận chuyển cho đơn hàng từ 1.000.000₫ trên toàn quốc. Hỗ trợ giao hoả tốc 2H tại TP.HCM. Đóng gói sản phẩm bằng hộp chống sốc chuyên dụng bảo vệ tối đa thiết bị công nghệ.'
  },
  {
    title: '🔒 Chính sách Bảo mật Thông tin',
    content: 'VORTEX cam kết bảo mật tuyệt đối thông tin cá nhân và thông tin thanh toán của khách hàng theo tiêu chuẩn mã hóa SSL/TLS 256-bit cao nhất. Chúng tôi không bao giờ chia sẻ thông tin của bạn với bất kỳ bên thứ ba nào.'
  }
];

const STEPS = [
  {
    step: '01',
    title: 'Lựa Chọn Sản Phẩm',
    desc: 'Khám phá danh mục Gaming Gear hoặc Phụ Kiện. Lựa chọn màu sắc, phiên bản và bấm "Thêm Vào Giỏ Hàng".'
  },
  {
    step: '02',
    title: 'Nhập Thông Tin Giao Nhận',
    desc: 'Truy cập giỏ hàng, kiểm tra số lượng và nhấn Thanh Toán. Nhập chính xác địa chỉ và số điện thoại của bạn.'
  },
  {
    step: '03',
    title: 'Thanh Toán Tiện Lợi',
    desc: 'Lựa chọn thanh toán khi nhận hàng (COD), Chuyển khoản ngân hàng hoặc ví điện tử cực kỳ bảo mật.'
  },
  {
    step: '04',
    title: 'Nhận Hàng & Unboxing',
    desc: 'Đơn hàng sẽ được giao đến tận tay bạn. Khui hộp sản phẩm và trải nghiệm cảm giác e-sports chuyên nghiệp!'
  }
];

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState('faq');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['faq', 'policy', 'guide', 'contact'].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, []);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  return (
    <div className={styles.page}>
      <div className="container">
        {/* HERO SECTION */}
        <div className={styles.hero}>
          <h1 className={`${styles.heroTitle} text-gradient`}>Trung Tâm Trợ Giúp VORTEX</h1>
          <p className={styles.heroSubtitle}>Chúng tôi luôn ở đây để hỗ trợ trải nghiệm công nghệ của bạn tốt nhất.</p>
        </div>

        {/* NAVIGATION TABS */}
        <div className={styles.tabs}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'faq' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('faq')}
          >
            ❓ Câu Hỏi Thường Gặp
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'policy' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('policy')}
          >
            🛡️ Chính Sách Cửa Hàng
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'guide' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('guide')}
          >
            🛍️ Hướng Dẫn Mua Hàng
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'contact' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            📞 Thông Tin Liên Hệ
          </button>
        </div>

        {/* TAB CONTENT MODULES */}
        <div className={styles.tabContent}>
          
          {/* FAQ TAB */}
          {activeTab === 'faq' && (
            <div className={styles.faqList}>
              {FAQS.map((faq, i) => (
                <div 
                  key={i} 
                  className={`${styles.faqCard} ${expandedFaq === i ? styles.faqActive : ''}`}
                  onClick={() => toggleFaq(i)}
                >
                  <div className={styles.faqQuestion}>
                    <h3>{faq.q}</h3>
                    <span className={styles.faqToggleIcon}>{expandedFaq === i ? '−' : '+'}</span>
                  </div>
                  {expandedFaq === i && (
                    <div className={styles.faqAnswer}>
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* POLICY TAB */}
          {activeTab === 'policy' && (
            <div className={styles.policyGrid}>
              {POLICIES.map((p, i) => (
                <div key={i} className={styles.policyCard}>
                  <h3 className={styles.policyTitle}>{p.title}</h3>
                  <p className={styles.policyText}>{p.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* BUYING GUIDE TAB */}
          {activeTab === 'guide' && (
            <div className={styles.guideTimeline}>
              {STEPS.map((step, i) => (
                <div key={i} className={styles.timelineNode}>
                  <div className={styles.timelineNumber}>{step.step}</div>
                  <div className={styles.timelineContent}>
                    <h3 className={styles.timelineTitle}>{step.title}</h3>
                    <p className={styles.timelineText}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CONTACT TAB */}
          {activeTab === 'contact' && (
            <div className={styles.contactContainer}>
              <div className={styles.contactInfo}>
                <div className={styles.infoCard}>
                  <h4>📞 Điện Thoại Hỗ Trợ</h4>
                  <p>1900 8888 (24/7 - Miễn phí cước gọi)</p>
                </div>
                <div className={styles.infoCard}>
                  <h4>📧 Email Đóng Góp</h4>
                  <p>support@vortex.com</p>
                </div>
                <div className={styles.infoCard}>
                  <h4>📍 Showroom Trưng Bày</h4>
                  <p>Số 123 Đường Neon, Quận Cyberpunk, TP. Hồ Chí Minh</p>
                </div>
              </div>

              <div className={styles.contactFormContainer}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Gửi Lời Nhắn Cho Chúng Tôi</h3>
                {formSubmitted ? (
                  <div className={styles.successMessage}>
                    ✓ Cảm ơn bạn! Lời nhắn đã được gửi đi thành công. VORTEX sẽ liên hệ lại bạn trong 24 giờ.
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className={styles.contactForm}>
                    <div className={styles.formGroup}>
                      <input type="text" placeholder="Họ và tên của bạn" required className={styles.formInput} />
                    </div>
                    <div className={styles.formGroup}>
                      <input type="email" placeholder="Địa chỉ email liên hệ" required className={styles.formInput} />
                    </div>
                    <div className={styles.formGroup}>
                      <textarea placeholder="Nội dung lời nhắn / yêu cầu hỗ trợ" rows="4" required className={styles.formTextarea}></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Gửi Lời Nhắn</button>
                  </form>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
