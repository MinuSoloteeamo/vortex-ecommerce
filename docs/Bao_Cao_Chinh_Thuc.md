# BÁO CÁO DỰ ÁN: HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ VORTEX - GAMING GEAR

## LỜI CẢM ƠN
Nhóm phát triển dự án xin gửi lời cảm ơn chân thành và sâu sắc nhất đến Quý Thầy/Cô hướng dẫn đã tận tình chỉ bảo, định hướng và cung cấp những kiến thức nền tảng quý báu trong suốt quá trình học tập và thực hiện đồ án này. Những lời khuyên và nhận xét của Thầy/Cô không chỉ giúp nhóm hoàn thiện hệ thống Thương mại điện tử VORTEX mà còn là hành trang kiến thức vững chắc cho công việc thực tế sau này. Xin chân thành cảm ơn!

---

## MỤC LỤC
1. LỜI CẢM ƠN
2. DANH MỤC CÁC KÝ HIỆU, CHỮ VIẾT TẮT VÀ THUẬT NGỮ
3. DANH MỤC CÁC BẢNG, HÌNH VẼ, ĐỒ THỊ
4. CHƯƠNG 1 – TỔNG QUAN
5. CHƯƠNG 2 – CƠ SỞ LÝ THUYẾT
6. CHƯƠNG 3 – XÂY DỰNG ỨNG DỤNG
7. CHƯƠNG 4 – KẾT LUẬN
8. TÀI LIỆU THAM KHẢO

---

## DANH MỤC CÁC KÝ HIỆU, CHỮ VIẾT TẮT VÀ THUẬT NGỮ
* **TMĐT (E-commerce):** Thương mại điện tử.
* **B2C (Business to Consumer):** Mô hình kinh doanh từ doanh nghiệp đến người tiêu dùng.
* **UI/UX (User Interface / User Experience):** Giao diện người dùng / Trải nghiệm người dùng.
* **ORM (Object-Relational Mapping):** Kỹ thuật lập trình ánh xạ cơ sở dữ liệu quan hệ sang đối tượng (ở đây sử dụng Prisma).
* **AI (Artificial Intelligence):** Trí tuệ nhân tạo.
* **NLP (Natural Language Processing):** Xử lý ngôn ngữ tự nhiên.
* **SEO (Search Engine Optimization):** Tối ưu hóa công cụ tìm kiếm.

---

## DANH MỤC CÁC HÌNH VẼ, ĐỒ THỊ
* Hình 3.1: Sơ đồ kiến trúc tổng thể của hệ thống VORTEX.
* Hình 3.2: Giao diện Trang chủ (Dark Premium).
* Hình 3.3: Giao diện Bộ lọc động và Tìm kiếm tiếng Việt.
* Hình 3.4: Giao diện Admin Dashboard tích hợp Chart.js.
* Hình 3.5: AI Chatbox và hệ thống hỗ trợ trực tuyến.

---

## CHƯƠNG 1 – TỔNG QUAN

### 1.1. BỐI CẢNH VÀ TẦM QUAN TRỌNG CỦA THƯƠNG MẠI ĐIỆN TỬ
Trong kỷ nguyên số hóa, Thương mại điện tử (TMĐT) đã trở thành một thành phần không thể thiếu của nền kinh tế toàn cầu. Việc mua sắm trực tuyến không chỉ mang lại sự tiện lợi, nhanh chóng cho người tiêu dùng mà còn giúp doanh nghiệp tối ưu hóa chi phí vận hành, tiếp cận thị trường rộng lớn và quản lý dữ liệu khách hàng hiệu quả. Đối với ngành hàng đặc thù như thiết bị điện tử, phần cứng máy tính và Gaming Gear, khách hàng có nhu cầu rất cao về việc tra cứu thông số kỹ thuật, so sánh cấu hình và nhận tư vấn trực tiếp. Điều này đòi hỏi các nền tảng TMĐT phải liên tục đổi mới, nâng cấp trải nghiệm người dùng (UX) và tích hợp các công nghệ thông minh.

### 1.2. TỔNG QUAN VỀ DOANH NGHIỆP
**VORTEX** là thương hiệu giả định được xây dựng trong dự án này, chuyên cung cấp các thiết bị Gaming Gear (Bàn phím cơ, Chuột gaming, Tai nghe) và phụ kiện công nghệ cao cấp. 
* **Tầm nhìn:** Trở thành nền tảng mua sắm Gaming Gear hàng đầu, nơi hội tụ của cộng đồng game thủ với trải nghiệm mua sắm đẳng cấp, mang đậm phong cách eSports.
* **Sứ mệnh:** Cung cấp sản phẩm chính hãng, minh bạch về thông số, kết hợp cùng dịch vụ tư vấn tự động hóa thông minh giúp người dùng lựa chọn được thiết bị tối ưu nhất cho nhu cầu của mình.

---

## CHƯƠNG 2 – CƠ SỞ LÝ THUYẾT

### 2.1. KHÁI NIỆM THƯƠNG MẠI ĐIỆN TỬ
Thương mại điện tử (E-commerce) là việc tiến hành một phần hoặc toàn bộ hoạt động kinh doanh thông qua mạng Internet, bao gồm các hoạt động mua bán, trao đổi hàng hóa, dịch vụ và thông tin (theo Giáo trình TMĐT Căn bản - ĐH Kinh tế Quốc dân).

### 2.2. CÁC MÔ HÌNH KINH DOANH
Hệ thống VORTEX hoạt động chủ yếu dưới mô hình **B2C (Business to Consumer)**. Trong mô hình này, VORTEX (Doanh nghiệp) đóng vai trò là nhà bán lẻ, cung cấp trực tiếp các sản phẩm Gaming Gear đến tay người tiêu dùng cuối (Game thủ, nhân viên văn phòng, v.v.) thông qua Website (Cửa hàng trực tuyến).

### 2.3. CÁC THÀNH PHẦN CHÍNH CỦA HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ
Một hệ thống TMĐT B2C tiêu chuẩn cần có:
1. **Frontend (Giao diện):** Cửa hàng hiển thị sản phẩm, giỏ hàng, trang thanh toán.
2. **Backend (Hệ thống xử lý):** Máy chủ xử lý đơn hàng, quản lý tài khoản, API dữ liệu.
3. **Database (Cơ sở dữ liệu):** Lưu trữ thông tin Sản phẩm, Người dùng, Đơn hàng, Đánh giá.
4. **Hệ thống Quản trị (Admin Panel):** Quản lý kho, theo dõi doanh thu, xử lý đơn.

---

## CHƯƠNG 3 – XÂY DỰNG ỨNG DỤNG

### 3.1. PHÂN TÍCH THIẾT KẾ HỆ THỐNG
Dự án VORTEX được thiết kế dựa trên kiến trúc Web hiện đại (Modern Web Architecture), đảm bảo tốc độ cao, tính mở rộng và khả năng SEO tốt.
* **Ngôn ngữ & Khung ứng dụng (Framework):** React và Next.js (App Router, Server Actions) giúp render phía máy chủ (SSR) để tăng tốc độ tải trang.
* **Quản trị Cơ sở dữ liệu:** Prisma ORM kết hợp SQLite (được thiết kế linh hoạt để dễ dàng chuyển đổi sang PostgreSQL/MySQL khi triển khai thực tế).
* **Quản lý trạng thái (State Management):** Zustand (sử dụng cho Giỏ hàng có tính năng lưu trữ LocalStorage) và React Context.
* **Xác thực (Authentication):** NextAuth.js hỗ trợ đăng nhập mật khẩu băm (Bcrypt) và đăng nhập nhanh qua Google (OAuth).
* **Giao diện (Styling):** CSS Modules kết hợp với thiết kế "Dark Premium" (Nền đen, viền Neon, kính mờ Glassmorphism) mang đậm phong cách Gaming.

### 3.2. KẾ HOẠCH THỜI GIAN VÀ NGÂN SÁCH THỰC HIỆN DỰ ÁN
*(Phần này sinh viên có thể tự điều chỉnh bảng Gantt chart theo đồ án thực tế của trường. Dự án giả định thực hiện trong 8-12 tuần từ khâu Phân tích Yêu cầu, Thiết kế UI/UX, Code Frontend, Code Backend, Tích hợp AI và Kiểm thử).*

### 3.3. PHÁT TRIỂN ỨNG DỤNG (CÁC CHỨC NĂNG CHÍNH)
Hệ thống VORTEX được xây dựng với những tính năng vượt trội:
1. **Giao diện Người dùng (Dark Premium):** Giao diện được thiết kế chuyên biệt cho Game thủ, tối ưu hóa trải nghiệm thị giác với gam màu tối chống mỏi mắt, kết hợp hiệu ứng animation mượt mà.
2. **Bộ Lọc Động & Tìm Kiếm Thông Minh:** 
   * Tính năng lọc tự động thu thập và gộp nhóm các thông số kỹ thuật (Thương hiệu, Màu sắc, RAM, Switch...) từ cơ sở dữ liệu (tự động loại bỏ trùng lặp in hoa/in thường).
   * Thuật toán tìm kiếm hỗ trợ **Tiếng Việt không dấu** (người dùng gõ "chuot" hệ thống vẫn trả về "Chuột Gaming").
   * Bộ lọc giá an toàn (chặn số âm, tự động hoán đổi khi Min lớn hơn Max).
3. **Quản lý Giỏ hàng & Thanh toán:** Giỏ hàng sử dụng Zustand giúp lưu trữ trạng thái ngay cả khi tải lại trang. Hệ thống bắt buộc người dùng đăng nhập trước khi thanh toán và tính toán phí vận chuyển tự động.
4. **Hệ thống Quản trị (Admin Dashboard):**
   * Quản lý CRUD (Thêm/Sửa/Xóa) cho Sản phẩm, Tin tức, Đơn hàng.
   * Dashboard trực quan hóa dữ liệu kinh doanh bằng **Chart.js** (Biểu đồ doanh thu theo thời gian, tỷ lệ danh mục).
5. **Hệ thống Đánh giá & Phản hồi (Reviews):** Mỗi sản phẩm trong một đơn hàng được đánh giá độc lập. Hỗ trợ "Bong bóng gợi ý nhanh" giúp khách hàng gửi đánh giá chỉ bằng 1 click.

### 3.4. THIẾT LẬP SEO VÀ HIỆU SUẤT
* Cấu hình thẻ Meta Tags tự động cho từng trang sản phẩm dựa trên Next.js Metadata API.
* Tối ưu hóa hình ảnh (Lazy loading) giúp website tải nhanh chóng, cải thiện điểm số Google PageSpeed Insights.

### 3.5. TÍCH HỢP TRÍ TUỆ NHÂN TẠO (AI) VÀ CÁC THUẬT TOÁN TOÁN HỌC
Điểm nhấn khác biệt của VORTEX so với các website TMĐT cơ bản là việc áp dụng sâu các thuật toán:
1. **AI Chatbox & Live Support:**
   * Hệ thống Chatbox góc màn hình cho phép khách hàng tương tác với AI để nhận tư vấn mua hàng 24/7.
   * Có cơ chế **Human-Handoff (Chuyển giao cho con người)**: Khi khách cần, phiên chat được đẩy về trang Admin. Nhân viên có thể "Tiếp nhận" và chat trực tiếp thời gian thực. Nếu nhân viên quá hạn không tiếp nhận, AI tự động xin lỗi và hỗ trợ tiếp.
2. **Thuật toán Wilson Score Interval:** 
   * Áp dụng trong việc tính toán "Điểm Uy Tín" của Sản phẩm thay vì chỉ dùng Trung bình cộng số sao. Giúp hiển thị bảng xếp hạng sản phẩm công bằng, giải quyết bài toán: Sản phẩm có 1 đánh giá 5 sao không thể xếp cao hơn sản phẩm có 100 đánh giá 4.8 sao.
3. **Thuật toán Apriori / Khai phá Luật Kết Hợp (Association Rules):**
   * Hệ thống tự động phân tích lịch sử Đơn hàng để phát hiện các cặp sản phẩm thường được mua cùng nhau (Ví dụ: Mua Bàn phím cơ thường mua kèm Kê tay). Từ đó hiển thị mục "Gợi ý mua kèm" chính xác, giúp tăng tỷ lệ Cross-selling.
4. **Phân tích Sắc thái Phản hồi (Sentiment Analysis):**
   * Tích hợp thuật toán NLP (Natural Language Processing) dạng Dictionary-based để tự động phân tích hàng loạt nội dung Đánh giá của khách hàng, gắn nhãn (Tích cực / Tiêu cực / Trung lập) giúp Admin nắm bắt nhanh thái độ khách hàng trong Dashboard.

---

## CHƯƠNG 4 – KẾT LUẬN

### 4.1. KẾT QUẢ ĐẠT ĐƯỢC
Hệ thống VORTEX đã hoàn thành đúng mục tiêu đề ra, xây dựng thành công một nền tảng TMĐT bán thiết bị Gaming Gear với giao diện vô cùng bắt mắt, hiện đại. Dự án đã áp dụng thành công các công nghệ Web mới nhất (Next.js App Router, SSR, Prisma) và tích hợp các thuật toán trí tuệ nhân tạo (Apriori, Wilson Score, AI Chat) giúp hệ thống không chỉ là một website bán hàng thông thường mà còn là một nền tảng thông minh.

### 4.2. NHỮNG HẠN CHẾ
* Hiện tại hệ thống cơ sở dữ liệu đang sử dụng SQLite (phù hợp môi trường phát triển), khi có lượng truy cập lớn cần nâng cấp lên PostgreSQL.
* Hệ thống Chat thời gian thực hiện đang sử dụng cơ chế Polling (gọi API liên tục mỗi 3 giây) thay vì WebSockets, điều này có thể gây tiêu tốn tài nguyên mạng nếu số lượng người dùng đồng thời quá lớn.

### 4.3. ĐỊNH HƯỚNG MỞ RỘNG VÀ CẢI TIẾN HỆ THỐNG
* **Tích hợp Cổng thanh toán thực:** Cải tiến hệ thống thanh toán để kết nối với các cổng VNPay, MoMo, ZaloPay (hiện tại mô phỏng thanh toán COD và chuyển khoản).
* **Nâng cấp Socket.IO:** Thay thế cơ chế Polling trong AI Chatbox bằng WebSockets để tiết kiệm băng thông và tăng độ trễ bằng không.
* **Ứng dụng Machine Learning sâu hơn:** Đưa mô hình AI học sâu (Deep Learning) vào phân tích hình ảnh đánh giá của khách hàng để nhận dạng lỗi sản phẩm tự động.

### 4.4. PHÂN CÔNG CÔNG VIỆC
*(Sinh viên tự điền chi tiết phân công công việc của các thành viên trong nhóm, ví dụ: Sinh viên A phụ trách Frontend, Sinh viên B phụ trách Backend và Thuật toán AI).*

---

## TÀI LIỆU THAM KHẢO

1. **Trần Văn Hòe (Chủ biên)**, *Giáo trình Thương mại điện tử căn bản*, NXB Đại học Kinh tế Quốc dân, Hà Nội.
2. **Nguyễn Văn Thoan**, *Giáo trình Thương mại điện tử*, NXB Bách khoa Hà Nội, Hà Nội.
3. **Lưu Đan Thọ, Tôn Thất Hoàng Hải**, *Giáo trình Thương mại điện tử hiện đại*, NXB Tài chính.
4. **Next.js Documentation**, Vercel Inc., [https://nextjs.org/docs](https://nextjs.org/docs)
5. **Prisma ORM Documentation**, [https://www.prisma.io/docs](https://www.prisma.io/docs)
6. Các tài liệu hướng dẫn chuyên ngành, slide bài giảng trực tiếp và sự hỗ trợ tận tình từ Giáo viên hướng dẫn môn học.
