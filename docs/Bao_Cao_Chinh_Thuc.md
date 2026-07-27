# BÁO CÁO ĐỒ ÁN: HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ VORTEX — GAMING GEAR & PHỤ KIỆN CÔNG NGHỆ

---

## LỜI CẢM ƠN

Nhóm phát triển dự án xin gửi lời cảm ơn chân thành và sâu sắc nhất đến **Cô Trần Cẩm Tú** — giáo viên hướng dẫn đã tận tình chỉ bảo, định hướng và cung cấp những kiến thức nền tảng quý báu trong suốt quá trình học tập và thực hiện đồ án này. Những nhận xét, góp ý và phương pháp tư duy mà Cô truyền dạy không chỉ giúp nhóm hoàn thiện hệ thống mà còn là hành trang vững chắc cho con đường nghề nghiệp sau này.

Nhóm cũng xin cảm ơn các bạn trong lớp đã hỗ trợ, đóng góp ý kiến trong quá trình kiểm thử hệ thống.

Xin chân thành cảm ơn!

---

## DANH MỤC CÁC KÝ HIỆU, CHỮ VIẾT TẮT VÀ THUẬT NGỮ

| Ký hiệu / Viết tắt | Ý nghĩa |
|---|---|
| TMĐT | Thương mại điện tử (E-commerce) |
| B2C | Business to Consumer — Mô hình kinh doanh từ doanh nghiệp đến người tiêu dùng cuối |
| UI/UX | User Interface / User Experience — Giao diện / Trải nghiệm người dùng |
| ORM | Object-Relational Mapping — Kỹ thuật ánh xạ cơ sở dữ liệu quan hệ sang đối tượng |
| SSR | Server-Side Rendering — Kỹ thuật dựng trang phía máy chủ |
| API | Application Programming Interface — Giao diện lập trình ứng dụng |
| CRUD | Create, Read, Update, Delete — Bốn thao tác cơ bản trên dữ liệu |
| NLP | Natural Language Processing — Xử lý ngôn ngữ tự nhiên |
| UML | Unified Modeling Language — Ngôn ngữ mô hình hóa thống nhất |
| ERD | Entity Relationship Diagram — Biểu đồ thực thể - liên kết |
| UC | Use Case — Ca sử dụng |
| SEO | Search Engine Optimization — Tối ưu hóa công cụ tìm kiếm |
| JSON | JavaScript Object Notation — Định dạng trao đổi dữ liệu |
| OAuth | Open Authorization — Giao thức ủy quyền mở |
| NFD | Normalization Form Decomposition — Dạng chuẩn hóa tách rời (Unicode) |

---

## DANH MỤC CÁC BẢNG

- Bảng 2.1: So sánh các mô hình kinh doanh TMĐT
- Bảng 3.1: Mô tả chi tiết các Actor trong hệ thống
- Bảng 3.2: Mô tả các Use Case chính của hệ thống
- Bảng 3.3: Danh sách các bảng trong Cơ sở dữ liệu
- Bảng 3.4: Mô tả chi tiết bảng User (Người dùng)
- Bảng 3.5: Mô tả chi tiết bảng Product (Sản phẩm)
- Bảng 3.6: Mô tả chi tiết bảng Order (Đơn hàng)
- Bảng 3.7: Kế hoạch thời gian thực hiện dự án (Biểu đồ Gantt)
- Bảng 4.1: Phân công công việc trong nhóm

---

## DANH MỤC CÁC HÌNH VẼ, ĐỒ THỊ

*(Sinh viên tự chèn số trang sau khi hoàn thiện báo cáo trong Word)*

**Biểu đồ Use Case (Draw.io):**
- Hình 3.1: Biểu đồ Use Case tổng quát
- Hình 3.2: Biểu đồ Use Case — Phân hệ Khách hàng (chi tiết)
- Hình 3.3: Biểu đồ Use Case — Phân hệ Quản trị viên (chi tiết)
- Hình 3.4: Biểu đồ Use Case — Phân hệ Shipper (chi tiết)

**Biểu đồ ERD & Class (Draw.io):**
- Hình 3.5: Biểu đồ thực thể - liên kết ERD
- Hình 3.6: Biểu đồ Lớp (Class Diagram)

**Biểu đồ Tuần tự — Sequence Diagram (Draw.io):**
- Hình 3.7: Seq — Đăng ký tài khoản
- Hình 3.8: Seq — Đăng nhập (Credentials + Google OAuth)
- Hình 3.9: Seq — Tìm kiếm sản phẩm (Tiếng Việt không dấu)
- Hình 3.10: Seq — Thêm sản phẩm vào Giỏ hàng
- Hình 3.11: Seq — Đặt hàng & Thanh toán (Checkout)
- Hình 3.12: Seq — Đánh giá sản phẩm (kèm Wilson Score + Sentiment)
- Hình 3.13: Seq — Chat AI & Human-Handoff
- Hình 3.14: Seq — Admin xử lý Đơn hàng (Xác nhận → Chuyển Shipper → Giao)
- Hình 3.15: Seq — Shipper cập nhật trạng thái giao hàng

**Biểu đồ Hoạt động — Activity Diagram (Draw.io):**
- Hình 3.16: Act — Quy trình Mua hàng toàn bộ (từ duyệt SP → nhận hàng)
- Hình 3.17: Act — Quy trình Quản lý Đơn hàng (Vòng đời đơn hàng)
- Hình 3.18: Act — Quy trình Chat AI Chatbot
- Hình 3.19: Act — Quy trình Đăng ký & Đăng nhập
- Hình 3.20: Act — Quy trình Admin quản lý Sản phẩm (CRUD)

**Ảnh chụp Giao diện (Screenshot):**
- Hình 3.21: Giao diện Trang chủ VORTEX
- Hình 3.22: Giao diện Trang danh sách Sản phẩm và Bộ lọc
- Hình 3.23: Giao diện Trang chi tiết Sản phẩm
- Hình 3.24: Giao diện Giỏ hàng (Cart Drawer)
- Hình 3.25: Giao diện Thanh toán (Checkout)
- Hình 3.26: Giao diện Admin Dashboard
- Hình 3.27: Giao diện Quản lý Đơn hàng (Admin)
- Hình 3.28: Giao diện Quản lý Sản phẩm (Admin)
- Hình 3.29: Giao diện AI Chatbox (khách hàng)
- Hình 3.30: Giao diện Hỗ trợ trực tuyến (Admin tiếp nhận chat)
- Hình 3.31: Giao diện Quản lý Đánh giá & Sentiment (Admin)
- Hình 3.32: Giao diện Shipper

---

## CHƯƠNG 1 – TỔNG QUAN

### 1.1. BỐI CẢNH VÀ TẦM QUAN TRỌNG CỦA THƯƠNG MẠI ĐIỆN TỬ

Trong bối cảnh chuyển đổi số đang diễn ra mạnh mẽ trên toàn cầu, Thương mại điện tử (TMĐT) đã không còn là xu hướng mà đã trở thành yêu cầu bắt buộc đối với mọi doanh nghiệp. Theo báo cáo của Bộ Công Thương Việt Nam, doanh thu TMĐT Việt Nam liên tục tăng trưởng hai con số mỗi năm, cho thấy tiềm năng to lớn và nhu cầu cấp thiết của thị trường.

Đặc biệt, ngành hàng Thiết bị Gaming và Phụ kiện Công nghệ có đặc thù riêng:
- Khách hàng có nhu cầu tra cứu thông số kỹ thuật chi tiết (Cảm biến, DPI, Switch loại gì, Trọng lượng...).
- Khách hàng thường so sánh nhiều sản phẩm cùng lúc và tin tưởng vào đánh giá của người dùng khác.
- Khách hàng thường xuyên cần tư vấn chuyên môn (Ví dụ: "Bàn phím nào phù hợp với FPS?").

Xuất phát từ thực tế đó, nhóm đã quyết định xây dựng hệ thống TMĐT **VORTEX** — một nền tảng bán hàng trực tuyến chuyên biệt dành cho thiết bị Gaming Gear và Phụ kiện Công nghệ, với mục tiêu không chỉ đáp ứng các nghiệp vụ mua-bán cơ bản mà còn tích hợp các giải pháp thông minh (AI Chatbot, Gợi ý sản phẩm, Xếp hạng công bằng) để nâng cao trải nghiệm khách hàng.

### 1.2. TỔNG QUAN VỀ DOANH NGHIỆP

**VORTEX** là thương hiệu giả định (được xây dựng phục vụ đồ án) chuyên cung cấp các sản phẩm Gaming Gear cao cấp:
- **Lĩnh vực:** Bán lẻ trực tuyến thiết bị gaming và phụ kiện công nghệ.
- **Mô hình kinh doanh:** B2C (Business to Consumer) — Doanh nghiệp bán trực tiếp cho người tiêu dùng cuối thông qua website.
- **Danh mục sản phẩm chính:** Bàn phím cơ, Chuột gaming, Tai nghe, Bàn di chuột, Ghế gaming, Ốp điện thoại, Sạc & Cáp, Phụ kiện laptop, Loa & Âm thanh, USB & Lưu trữ.
- **Đối tượng khách hàng mục tiêu:** Game thủ, dân văn phòng yêu thích công nghệ, sinh viên.
- **Mục tiêu dự án:** Xây dựng website TMĐT hoàn chỉnh với đầy đủ các chức năng: Quản lý sản phẩm, Giỏ hàng, Thanh toán, Quản lý đơn hàng, Đánh giá sản phẩm, AI Chatbot hỗ trợ khách hàng, Bảng điều khiển quản trị (Dashboard), và Phân hệ Shipper.

---

## CHƯƠNG 2 – CƠ SỞ LÝ THUYẾT

### 2.1. KHÁI NIỆM THƯƠNG MẠI ĐIỆN TỬ

Thương mại điện tử (Electronic Commerce — E-Commerce) là hình thức kinh doanh trong đó các giao dịch mua bán hàng hóa, dịch vụ hoặc trao đổi thông tin thương mại được thực hiện thông qua các phương tiện điện tử, chủ yếu là mạng Internet (Trần Văn Hòe, 2007).

TMĐT không chỉ đơn thuần là mua bán trực tuyến mà còn bao gồm: Quảng cáo số, Marketing online, Chăm sóc khách hàng điện tử, Thanh toán trực tuyến, và Quản lý chuỗi cung ứng số.

### 2.2. CÁC MÔ HÌNH KINH DOANH TMĐT

| Mô hình | Mô tả | Ví dụ |
|---|---|---|
| **B2C** (Business to Consumer) | Doanh nghiệp bán hàng trực tiếp cho người tiêu dùng cuối | Shopee, Tiki, Amazon, **VORTEX** |
| **B2B** (Business to Business) | Doanh nghiệp giao dịch với doanh nghiệp | Alibaba |
| **C2C** (Consumer to Consumer) | Người tiêu dùng giao dịch với nhau | Chợ Tốt, eBay |
| **O2O** (Online to Offline) | Kết hợp bán hàng trực tuyến và cửa hàng vật lý | Thế Giới Di Động |

*Bảng 2.1: So sánh các mô hình kinh doanh TMĐT*

Hệ thống VORTEX áp dụng mô hình **B2C** — trong đó VORTEX đóng vai trò là nhà bán lẻ, toàn quyền quản lý danh mục sản phẩm, giá cả, khuyến mãi và phân phối hàng hóa trực tiếp đến tay người tiêu dùng.

### 2.3. CÁC THÀNH PHẦN CHÍNH CỦA HỆ THỐNG TMĐT

Một hệ thống TMĐT hoàn chỉnh bao gồm các thành phần:

1. **Giao diện khách hàng (Storefront):** Trang chủ, Danh sách sản phẩm, Chi tiết sản phẩm, Giỏ hàng, Thanh toán, Tài khoản cá nhân.
2. **Hệ thống quản trị (Back Office):** Dashboard thống kê, Quản lý sản phẩm (CRUD), Quản lý đơn hàng, Quản lý người dùng, Quản lý khuyến mãi, Quản lý đánh giá.
3. **Cổng thanh toán (Payment Gateway):** Tích hợp COD, Chuyển khoản ngân hàng, VNPAY.
4. **Hệ thống Hỗ trợ khách hàng:** AI Chatbot tự động, Chuyển tiếp cho nhân viên (Human-Handoff).
5. **Hệ thống Giao vận (Logistics):** Quản lý trạng thái đơn hàng, Phân hệ Shipper.

### 2.4. CÔNG NGHỆ SỬ DỤNG TRONG DỰ ÁN

| Công nghệ | Vai trò | Lý do lựa chọn |
|---|---|---|
| **Next.js 15 (App Router)** | Framework fullstack (Frontend + API Backend) | Hỗ trợ SSR giúp SEO tốt, hiệu năng cao, tích hợp API Routes |
| **React 19** | Thư viện xây dựng giao diện người dùng | Component-based, Virtual DOM, hệ sinh thái phong phú |
| **Prisma ORM** | Truy vấn & quản lý cơ sở dữ liệu | An toàn (chống SQL Injection), type-safe, migration dễ dàng |
| **SQLite** | Cơ sở dữ liệu quan hệ | Nhẹ, không cần cài đặt server riêng, phù hợp đồ án |
| **NextAuth.js** | Xác thực & quản lý phiên đăng nhập | Hỗ trợ OAuth (Google), Credentials, Session JWT |
| **bcryptjs** | Mã hóa mật khẩu | Hashing một chiều, chống brute-force |
| **Zustand** | Quản lý State toàn cục (Giỏ hàng) | Nhẹ hơn Redux, tích hợp LocalStorage persist |
| **CSS Modules** | Quản lý style riêng từng component | Tránh xung đột CSS, dễ bảo trì |

---

## CHƯƠNG 3 – XÂY DỰNG ỨNG DỤNG

### 3.1. PHÂN TÍCH THIẾT KẾ HỆ THỐNG

#### 3.1.1. Xác định các Actor (Tác nhân)

Hệ thống VORTEX có 3 tác nhân chính:

| Actor | Mô tả | Vai trò (Role trong DB) |
|---|---|---|
| **Khách hàng (User)** | Người truy cập website, duyệt sản phẩm, đặt hàng, đánh giá | `USER` |
| **Quản trị viên (Admin)** | Quản lý toàn bộ hệ thống: sản phẩm, đơn hàng, người dùng, tin tức, chat | `ADMIN` |
| **Nhân viên giao hàng (Shipper)** | Nhận đơn hàng đã xác nhận, cập nhật trạng thái giao hàng | `SHIPPER` |

*Bảng 3.1: Mô tả chi tiết các Actor trong hệ thống*

#### 3.1.2. Biểu đồ Use Case (Ca sử dụng) — VẼ BẰNG Draw.io

**► HÌNH 3.1: Biểu đồ Use Case Tổng Quát**

Hướng dẫn vẽ: Tạo 1 hình chữ nhật lớn (System Boundary) đại diện cho "Hệ thống VORTEX". Đặt 3 Actor (hình người que) ở bên ngoài. Bên trong vẽ các hình Oval đại diện cho các Use Case chính và nối mũi tên (Association) từ Actor đến Use Case.

Phác thảo bố cục:
```
[Khách hàng]                              [Admin]
    |                                         |
    |--- (Đăng ký / Đăng nhập)                |--- (Đăng nhập Admin)
    |--- (Xem danh sách Sản phẩm)             |--- (Quản lý Sản phẩm)
    |--- (Tìm kiếm & Lọc sản phẩm)            |--- (Quản lý Danh mục)
    |--- (Xem chi tiết Sản phẩm)              |--- (Quản lý Đơn hàng)
    |--- (Thêm vào Giỏ hàng)                  |--- (Xem Dashboard Thống kê)
    |--- (Thanh toán Đơn hàng)                 |--- (Quản lý Người dùng)
    |--- (Xem Lịch sử Đơn hàng)               |--- (Quản lý Đánh giá)
    |--- (Đánh giá Sản phẩm)                   |--- (Quản lý Giỏ hàng tồn)
    |--- (Chat với AI Chatbot)                  |--- (Tiếp nhận Chat Hỗ trợ)
    |--- (Quản lý Tài khoản Cá nhân)
                                             [Shipper]
                                                 |--- (Xem Đơn hàng cần giao)
                                                 |--- (Cập nhật Trạng thái giao)
```

**► HÌNH 3.2: Biểu đồ Use Case — Phân hệ Khách hàng (Chi tiết)**

Hướng dẫn vẽ: Tập trung vào Actor Khách Hàng. Sử dụng mũi tên nét đứt cho quan hệ `<<include>>` (bắt buộc phải có) và `<<extend>>` (tùy chọn, có điều kiện).

```
[Khách hàng]
    |
    |--- (Đăng nhập)
    |       ^--- <<extend>> --- (Đăng nhập bằng Google)
    |
    |--- (Tìm kiếm & Lọc sản phẩm)
    |
    |--- (Xem chi tiết Sản phẩm)
    |       |--- <<include>> ---> (Xem Gợi ý mua kèm - Apriori)
    |
    |--- (Thêm vào Giỏ hàng)
    |
    |--- (Thanh toán Đơn hàng)
    |       |--- <<include>> ---> (Chọn Phương thức Thanh toán)
    |       |--- <<include>> ---> (Chọn Địa chỉ giao hàng)
    |       ^--- <<extend>> --- (Sử dụng Mã giảm giá)
    |
    |--- (Đánh giá Sản phẩm)
    |       ^--- <<extend>> --- (Đính kèm hình ảnh)
    |
    |--- (Chat với AI Chatbot)
            ^--- <<extend>> --- (Yêu cầu gặp nhân viên - Human Handoff)
```

**► HÌNH 3.3: Biểu đồ Use Case — Phân hệ Admin (Chi tiết)**

Hướng dẫn vẽ: Phân tách rõ ràng các thao tác CRUD của Admin.

```
[Admin]
    |
    |--- (Xem Dashboard Thống kê)
    |       |--- <<include>> ---> (Xem Doanh thu)
    |       |--- <<include>> ---> (Xem Top Sản phẩm bán chạy)
    |
    |--- (Quản lý Sản phẩm)
    |       |--- <<include>> ---> (Thêm mới Sản phẩm)
    |       |--- <<include>> ---> (Sửa thông tin Sản phẩm)
    |       |--- <<include>> ---> (Xóa Sản phẩm - Soft Delete)
    |       |--- <<include>> ---> (Quản lý Biến thể Sản phẩm)
    |
    |--- (Quản lý Đơn hàng)
    |       |--- <<include>> ---> (Xác nhận Đơn hàng)
    |       |--- <<include>> ---> (Chuyển Đơn cho Shipper)
    |       |--- <<include>> ---> (Hủy Đơn hàng)
    |
    |--- (Quản lý Đánh giá)
    |       |--- <<include>> ---> (Xem Phân tích Sắc thái - Sentiment)
    |
    |--- (Tiếp nhận Chat Hỗ trợ)
```

**► HÌNH 3.4: Biểu đồ Use Case — Phân hệ Shipper**

```
[Shipper]
    |
    |--- (Đăng nhập Shipper)
    |
    |--- (Xem danh sách Đơn hàng cần giao)
    |       (Chỉ thấy đơn trạng thái SHIPPING)
    |
    |--- (Cập nhật Trạng thái giao hàng)
            |--- <<include>> ---> (Đánh dấu "Đã giao")
            |--- <<include>> ---> (Đánh dấu "Giao thất bại")
```

#### 3.1.3. Biểu đồ Thực thể - Liên kết (ERD) — VẼ BẰNG Draw.io

**► HÌNH 3.5: Biểu đồ ERD**

Hướng dẫn vẽ: Sử dụng Draw.io, tạo Entity Relationship Diagram với các bảng (Entity) và mối quan hệ (Relationship) như sau. Mỗi Entity là 1 hộp chữ nhật, ghi tên bảng ở trên và các cột (Attribute) ở dưới. Đường nối giữa các bảng ghi rõ bản số (1 — N, 1 — 1, N — N).

Danh sách 15 bảng dữ liệu thực tế trong hệ thống (dựa trên file `prisma/schema.prisma`):

| # | Tên bảng | Mô tả | Quan hệ chính |
|---|---|---|---|
| 1 | `User` | Người dùng (Khách, Admin, Shipper) | 1–N với Order, CartItem, Review, Wishlist, Notification |
| 2 | `Account` | Tài khoản OAuth (Google) | N–1 với User |
| 3 | `Address` | Sổ địa chỉ giao hàng | N–1 với User |
| 4 | `Category` | Danh mục sản phẩm | 1–N với Product |
| 5 | `Product` | Sản phẩm | N–1 với Category; 1–N với Variant, Image, OrderItem, Review |
| 6 | `ProductVariant` | Biến thể sản phẩm (Màu, Size) | N–1 với Product |
| 7 | `ProductImage` | Hình ảnh sản phẩm | N–1 với Product, N–1 với Variant (tùy chọn) |
| 8 | `CartItem` | Mục trong giỏ hàng | N–1 với User, N–1 với Product |
| 9 | `Order` | Đơn hàng | N–1 với User; 1–N với OrderItem; N–1 với Coupon (tùy chọn) |
| 10 | `OrderItem` | Chi tiết mặt hàng trong đơn | N–1 với Order, N–1 với Product |
| 11 | `Review` | Đánh giá sản phẩm | N–1 với User, N–1 với Product, N–1 với Order |
| 12 | `Wishlist` | Danh sách yêu thích | N–1 với User, N–1 với Product |
| 13 | `ChatSession` | Phiên trò chuyện | 1–N với ChatMessage |
| 14 | `ChatMessage` | Tin nhắn trong phiên chat | N–1 với ChatSession |
| 15 | `Coupon` | Mã giảm giá | 1–N với Order |
| 16 | `PointHistory` | Lịch sử tích/tiêu điểm | N–1 với User |
| 17 | `News` | Tin tức/Bài viết | Độc lập |
| 18 | `Notification` | Thông báo hệ thống | N–1 với User (tùy chọn) |
| 19 | `ProductView` | Lượt xem sản phẩm (Analytics) | N–1 với Product, N–1 với User (tùy chọn) |

*Bảng 3.3: Danh sách các bảng trong Cơ sở dữ liệu*

**Chi tiết 3 bảng quan trọng nhất:**

**Bảng User (users):**

| Cột | Kiểu dữ liệu | Mô tả |
|---|---|---|
| id | String (CUID) | Khóa chính |
| email | String (UNIQUE) | Email đăng nhập |
| name | String | Họ tên |
| password | String? | Mật khẩu đã mã hóa Bcrypt (NULL nếu đăng nhập Google) |
| phone | String? | Số điện thoại |
| role | String | Vai trò: USER, ADMIN, SHIPPER |
| points | Int | Điểm tích lũy |
| vipTier | String | Hạng VIP: MEMBER, SILVER, GOLD, DIAMOND |

*Bảng 3.4: Mô tả chi tiết bảng User*

**Bảng Product (products):**

| Cột | Kiểu dữ liệu | Mô tả |
|---|---|---|
| id | String (CUID) | Khóa chính |
| name | String | Tên sản phẩm |
| slug | String (UNIQUE) | URL thân thiện SEO |
| description | String? | Mô tả chi tiết |
| specs | String? | Thông số kỹ thuật (Lưu dạng JSON) |
| price | Float | Giá gốc |
| salePrice | Float? | Giá khuyến mãi |
| stock | Int | Số lượng tồn kho |
| brand | String? | Thương hiệu |
| wilsonScore | Float | Điểm xếp hạng Wilson Score |
| categoryId | String | Khóa ngoại liên kết Category |

*Bảng 3.5: Mô tả chi tiết bảng Product*

**Bảng Order (orders):**

| Cột | Kiểu dữ liệu | Mô tả |
|---|---|---|
| id | String (CUID) | Khóa chính |
| orderNumber | String (UNIQUE) | Mã đơn hàng (VD: VTX-20260713-A1B2C3) |
| totalAmount | Float | Tổng tiền |
| status | String | Trạng thái: PENDING → CONFIRMED → PROCESSING → SHIPPING → DELIVERED / CANCELLED |
| paymentMethod | String | Phương thức: COD, BANK_TRANSFER, VNPAY |
| paymentStatus | String | Trạng thái thanh toán: PENDING, PAID, FAILED, REFUNDED |
| userId | String | Khóa ngoại liên kết User |
| couponCode | String? | Mã giảm giá đã áp dụng |

*Bảng 3.6: Mô tả chi tiết bảng Order*

#### 3.1.4. Biểu đồ Lớp (Class Diagram) — VẼ BẰNG Draw.io

**► HÌNH 3.6: Biểu đồ Lớp (Class Diagram)**

Hướng dẫn vẽ: Trong Draw.io, tạo Class Diagram với các lớp tương ứng với các Service và Model trong source code:

```
┌─────────────────────┐       ┌──────────────────────┐
│   ProductService    │       │    ReviewService     │
├─────────────────────┤       ├──────────────────────┤
│                     │       │                      │
├─────────────────────┤       ├──────────────────────┤
│ + getAllProducts()   │       │ + addReview()        │
│ + getProductBySlug()│       │ + updateWilsonScore()│
│ + searchProducts()  │       │ + getProductReviews()│
│ + createProduct()   │──────>│                      │
│ + updateProduct()   │       └──────────────────────┘
│ + deleteProduct()   │
│ + getFrequently     │       ┌──────────────────────┐
│   BoughtTogether()  │       │  SentimentAnalyzer   │
└─────────────────────┘       ├──────────────────────┤
                              │ - positiveWords[]    │
┌─────────────────────┐       │ - negativeWords[]    │
│     CartStore       │       │ - negationWords[]    │
│     (Zustand)       │       ├──────────────────────┤
├─────────────────────┤       │ + analyzeSentiment() │
│ - items[]           │       └──────────────────────┘
├─────────────────────┤
│ + addItem()         │
│ + removeItem()      │
│ + updateQuantity()  │
│ + clearCart()       │
│ + getTotalPrice()   │
└─────────────────────┘
```

Lưu ý khi vẽ:
- Mỗi Class có 3 phần: Tên lớp (trên cùng), Thuộc tính (giữa), Phương thức (dưới).
- Ghi rõ ký hiệu truy cập: `+` public, `-` private, `#` protected.
- Vẽ mũi tên quan hệ giữa các lớp: `ProductService` gọi `ReviewService.updateWilsonScore()` khi có đánh giá mới.

#### 3.1.5. Biểu đồ Tuần Tự (Sequence Diagram) — VẼ BẰNG Draw.io

Dưới đây là phác thảo cho **9 biểu đồ Sequence Diagram**, sắp xếp từ đơn giản → phức tạp. Trong Draw.io, sếp tạo mỗi biểu đồ trên 1 trang riêng. Các đối tượng (Lifeline) nằm ngang hàng phía trên, tin nhắn (Message) là mũi tên từ trái sang phải (gọi) hoặc nét đứt từ phải sang trái (trả về).

---

**► HÌNH 3.7: Seq — Đăng ký tài khoản**

Đối tượng: `Khách hàng` → `AuthModal (Frontend)` → `API /api/register` → `Bcrypt` → `Prisma` → `Database`

```
Khách hàng      AuthModal         API /register        Bcrypt         Prisma         Database
    |               |                   |                 |              |              |
    |-- Nhập thông tin-->|              |                 |              |              |
    |-- Bấm Đăng ký---->|              |                 |              |              |
    |               |-- POST ---------->|                 |              |              |
    |               |                   |-- Validate (tên, email, mật khẩu >= 6 ký tự) |
    |               |                   |                 |              |              |
    |               |                   |-- findUnique ---|------------->|-- SELECT --->|
    |               |                   |<-- user hoặc null ------------|<-- result ---|
    |               |                   |                 |              |              |
    |               |                   |◇ Email đã tồn tại?            |              |
    |               |                   |  Có → return lỗi 400         |              |
    |               |                   |  Không ↓                      |              |
    |               |                   |-- hash(password)>|            |              |
    |               |                   |<-- hashedPassword|            |              |
    |               |                   |                 |              |              |
    |               |                   |-- user.create --|------------>|-- INSERT --->|
    |               |                   |                 |              |-- Tạo Notif  |
    |               |                   |<-- { success } -|------------|<-- OK --------|
    |               |<-- "Đăng ký OK"---|                 |              |              |
    |<-- Hiển thị --|                   |                 |              |              |
```

---

**► HÌNH 3.8: Seq — Đăng nhập (Credentials + Google OAuth)**

Đối tượng: `Khách hàng` → `AuthModal` → `NextAuth.js` → `Prisma` → `Database`

```
Khách hàng      AuthModal         NextAuth.js          Prisma         Database
    |               |                   |                  |              |
    |== ĐƯỜNG 1: Đăng nhập bằng Email/Mật khẩu ==         |              |
    |-- Nhập email + password -->|      |                  |              |
    |               |-- signIn("credentials") ------------>|              |
    |               |                   |-- findUnique --->|-- SELECT --->|
    |               |                   |<-- user data ----|<-- result ---|
    |               |                   |-- bcrypt.compare(password, hash)|
    |               |                   |◇ Đúng mật khẩu? |              |
    |               |                   |  Sai → return lỗi|              |
    |               |                   |  Đúng ↓          |              |
    |               |                   |-- Tạo JWT Token (role, id)     |
    |               |<-- session -------|                  |              |
    |<-- Đăng nhập OK|                  |                  |              |
    |               |                   |                  |              |
    |== ĐƯỜNG 2: Đăng nhập bằng Google ==                  |              |
    |-- Bấm "Google"-->|               |                  |              |
    |               |-- signIn("google") --> Google OAuth Server          |
    |               |                   |<-- Google Profile (email, name, avatar)     |
    |               |                   |-- findOrCreate Account -------->|            |
    |               |                   |-- Tạo JWT Token  |              |            |
    |               |<-- session -------|                  |              |            |
    |<-- Đăng nhập OK|                  |                  |              |            |
```

---

**► HÌNH 3.9: Seq — Tìm kiếm sản phẩm (Tiếng Việt không dấu)**

Đối tượng: `Khách hàng` → `Header (SearchBar)` → `ProductsPage` → `API /api/products` → `ProductService` → `Database`

```
Khách hàng      SearchBar        ProductsPage      API /products     ProductService    Database
    |               |                 |                 |                  |              |
    |-- Gõ "chuot"->|                 |                 |                  |              |
    |-- Ấn Enter -->|                 |                 |                  |              |
    |               |-- router.push   |                 |                  |              |
    |               |  ("/products?   |                 |                  |              |
    |               |   search=chuot")|                 |                  |              |
    |               |                 |-- GET ---------->|                 |              |
    |               |                 |                 |-- getAllProducts()|              |
    |               |                 |                 |                  |-- findMany ->|
    |               |                 |                 |                  |<-- TẤT CẢ SP |
    |               |                 |                 |                  |              |
    |               |                 |                 |  Lặp qua từng SP:              |
    |               |                 |                 |  - Nối: name+brand+category+desc
    |               |                 |                 |  - removeVietnameseDiacritics() |
    |               |                 |                 |    (normalize NFD + regex xóa dấu)
    |               |                 |                 |  - "Chuột Gaming" → "chuot gaming"
    |               |                 |                 |  - .includes("chuot") → ĐẠT   |
    |               |                 |                 |                  |              |
    |               |                 |                 |<-- Danh sách SP khớp ----------|
    |               |                 |<-- products ----|                  |              |
    |<-- Hiển thị kết quả ------------|                 |                  |              |
```

---

**► HÌNH 3.10: Seq — Thêm sản phẩm vào Giỏ hàng**

Đối tượng: `Khách hàng` → `ProductDetailPage` → `CartStore (Zustand)` → `LocalStorage` → `API /api/cart` → `Database`

```
Khách hàng    ProductDetail     CartStore       LocalStorage     API /cart       Database
    |               |               |                |              |              |
    |-- Chọn variant->|             |                |              |              |
    |-- Bấm "Thêm vào giỏ" ------->|                |              |              |
    |               |               |-- addItem()    |              |              |
    |               |               |-- persist ----->|              |              |
    |               |               |  (Lưu giỏ hàng |              |              |
    |               |               |   vào Storage)  |              |              |
    |               |               |                |              |              |
    |               |               |◇ Đã đăng nhập? |              |              |
    |               |               |  Chưa → Dừng   |              |              |
    |               |               |  Rồi ↓         |              |              |
    |               |               |-- POST --------|------------->|              |
    |               |               |                |              |-- upsert --->|
    |               |               |                |              |  CartItem    |
    |               |               |                |              |<-- OK -------|
    |               |               |<-- Sync OK ----|              |              |
    |               |               |                |              |              |
    |<-- Toast: "Đã thêm vào giỏ"--|                |              |              |
    |<-- CartDrawer mở ra ----------|                |              |              |
```

---

**► HÌNH 3.11: Seq — Đặt hàng & Thanh toán (Checkout) ★ PHỨC TẠP NHẤT**

Đối tượng: `Khách hàng` → `CheckoutPage` → `API /api/checkout` → `Prisma ($transaction)` → `Database` → `NotificationService`

```
Khách hàng     CheckoutPage     API /checkout      Prisma         Database     NotifService
    |               |                 |               |               |              |
    |-- Chọn địa chỉ-->|             |               |               |              |
    |-- Chọn PT thanh toán-->|       |               |               |              |
    |-- (Nhập mã giảm giá)-->|      |               |               |              |
    |-- Bấm "Đặt hàng" ---->|       |               |               |              |
    |               |-- POST ------->|               |               |              |
    |               |                |-- auth() → Kiểm tra Session   |              |
    |               |                |               |               |              |
    |               |                |== BƯỚC 1: Kiểm tra sản phẩm ==|              |
    |               |                |-- findMany -->|-- SELECT ----->|              |
    |               |                |<- products ---|<-- results ----|              |
    |               |                |-- Kiểm tra stock từng SP      |              |
    |               |                |-- Tính subtotal (giá × số lượng)|             |
    |               |                |               |               |              |
    |               |                |== BƯỚC 2: Tính giảm giá ==    |              |
    |               |                |-- Kiểm tra VIP Tier (DIAMOND=10%, GOLD=5%, SILVER=2%)
    |               |                |-- Kiểm tra Coupon (nếu có) -->|-- SELECT --->|
    |               |                |-- Tính couponDiscount         |              |
    |               |                |-- Tính shippingFee (miễn phí nếu >= 1tr hoặc VIP)
    |               |                |-- Tính điểm tích lũy (1 điểm / 10.000₫)     |
    |               |                |               |               |              |
    |               |                |== BƯỚC 3: Transaction (Atomic) ==             |
    |               |                |-- $transaction -->|            |              |
    |               |                |               |-- CREATE Order |-- INSERT --->|
    |               |                |               |-- CREATE Items |-- INSERT --->|
    |               |                |               |-- UPDATE Coupon (usedCount+1) |
    |               |                |               |-- UPDATE User (points, vipTier)|
    |               |                |               |-- UPDATE Stock (decrement) -->|
    |               |                |               |-- DELETE CartItems ---------->|
    |               |                |               |-- UPDATE ProductView (converted)|
    |               |                |<-- order ------|<-- COMMIT ----|              |
    |               |                |               |               |              |
    |               |                |== BƯỚC 4: Notifications ==    |              |
    |               |                |-- Thông báo Admin "Đơn mới"--|------------>--|
    |               |                |-- Check stock < 5 → Cảnh báo |              |
    |               |                |-- Check VIP thăng hạng → Thông báo User     |
    |               |                |               |               |              |
    |               |<-- { orderId, orderNumber } ---|               |              |
    |<-- "Đặt hàng thành công" -----|               |               |              |
```

---

**► HÌNH 3.12: Seq — Đánh giá sản phẩm (kèm Wilson Score + Sentiment)**

Đối tượng: `Khách hàng` → `OrderHistoryPage` → `API /api/user/reviews` → `ReviewService` → `API /api/admin/reviews` → `SentimentAnalyzer`

```
Khách hàng     OrderHistory     API /reviews      ReviewService     Database     SentimentAnalyzer
    |               |                |                 |               |              |
    |-- Chọn số sao->|              |                 |               |              |
    |-- Viết comment->|             |                 |               |              |
    |-- Bấm "Gửi" -->|             |                 |               |              |
    |               |-- POST ------>|                 |               |              |
    |               |               |-- Kiểm tra: Đơn hàng đã DELIVERED?             |
    |               |               |-- Kiểm tra: Đã đánh giá SP này trong đơn này?  |
    |               |               |◇ Đã đánh giá rồi → return lỗi 400             |
    |               |               |◇ Chưa ↓        |               |              |
    |               |               |-- review.create->|-- INSERT ---->|              |
    |               |               |                 |               |              |
    |               |               |-- updateWilsonScore() ---------->|              |
    |               |               |                 |-- COUNT total |-- SELECT --->|
    |               |               |                 |-- COUNT >=4★  |-- SELECT --->|
    |               |               |                 |-- Tính p = positive/total    |
    |               |               |                 |-- Wilson = (p + z²/2n        |
    |               |               |                 |   - z√(p(1-p)/n + z²/4n²))  |
    |               |               |                 |   / (1 + z²/n)              |
    |               |               |                 |-- UPDATE wilsonScore -------->|
    |               |               |                 |               |              |
    |               |<-- { review }--|                 |               |              |
    |<-- "Đánh giá thành công" -----|                 |               |              |
    |               |               |                 |               |              |
    |== Khi Admin mở trang Quản lý Đánh giá ==       |               |              |
    |               |               |                 |               |              |
    |   AdminPage ------ GET /api/admin/reviews ----->|               |              |
    |               |               |-- Lấy reviews -->|-- SELECT --->|              |
    |               |               |                 |               |              |
    |               |               |-- Với mỗi review:               |              |
    |               |               |   analyzeSentiment(comment) ----|------------>|
    |               |               |   "Sản phẩm tốt, mượt" --------|             |
    |               |               |   → score=+2, label=POSITIVE <--|             |
    |               |               |                 |               |              |
    |               |               |<-- reviews + sentimentLabel ----|              |
```

---

**► HÌNH 3.13: Seq — Chat AI & Human-Handoff**

Đối tượng: `Khách hàng` → `AIChatBox` → `API /api/chat` → `Prisma` → `Database` → `Admin Dashboard`

```
Khách hàng      AIChatBox       API /api/chat       Prisma       Database      Admin Dashboard
    |               |                 |                |              |               |
    |-- Bấm bong bóng chat -->|      |                |              |               |
    |               |-- POST /api/chat/sessions (Tạo phiên mới)      |               |
    |               |                 |-- create ----->|-- INSERT --->|               |
    |               |<-- sessionId ---|                |              |               |
    |               |                 |                |              |               |
    |== GIAI ĐOẠN 1: AI TRẢ LỜI TỰ ĐỘNG ==           |              |               |
    |-- "Tư vấn chuột gaming" -->|    |                |              |               |
    |               |-- POST -------->|                |              |               |
    |               |                 |-- Lưu msg USER>|-- INSERT --->|               |
    |               |                 |-- Check status == "AI"        |               |
    |               |                 |                |              |               |
    |               |                 |-- normalize('NFD') → bỏ dấu  |               |
    |               |                 |-- So khớp từ khóa với Category|               |
    |               |                 |   "chuot" → match "Chuột gaming"              |
    |               |                 |                |              |               |
    |               |                 |-- Query SP theo categoryId -->|-- SELECT ---->|
    |               |                 |<-- top 4 SP ---|<-- results --|               |
    |               |                 |-- Format reply với link SP    |               |
    |               |                 |-- Lưu msg AI ->|-- INSERT --->|               |
    |               |<-- AI reply ----|                |              |               |
    |<-- Hiển thị --|                 |                |              |               |
    |               |                 |                |              |               |
    |== GIAI ĐOẠN 2: CHUYỂN GIAO CHO ADMIN ==         |              |               |
    |-- "Cho tôi gặp nhân viên" ---->|                |              |               |
    |               |-- POST -------->|                |              |               |
    |               |                 |-- Lưu msg USER |              |               |
    |               |                 |-- Phát hiện keyword: "nhân viên"              |
    |               |                 |-- UPDATE session status = "PENDING_HUMAN"     |
    |               |                 |                |-- UPDATE --->|               |
    |               |<-- "Đang chuyển cho nhân viên"   |              |               |
    |<-- Hiển thị --|                 |                |              |               |
    |               |                 |                |              |               |
    |== GIAI ĐOẠN 3: ADMIN TIẾP NHẬN ==               |              |               |
    |               |                 |                |              |<-- Polling 3s-|
    |               |                 |                |              |-- sessions -->|
    |               |                 |                |              |  (status=      |
    |               |                 |                |              |   PENDING)     |
    |               |                 |                |              |               |-- Badge đỏ
    |               |                 |                |              |               |
    |               |                 |                |              |<-- Admin bấm  |
    |               |                 |                |              |   "Tiếp nhận" |
    |               |                 |                |-- UPDATE status = "HUMAN" -->|
    |               |                 |                |              |               |
    |               |                 |                |              |<-- Admin gõ   |
    |               |                 |                |              |   "Xin chào"  |
    |               |                 |                |-- INSERT msg STAFF --------->|
    |               |                 |                |              |               |
    |-- Polling 3s->|                 |                |              |               |
    |               |-- GET messages->|                |              |               |
    |               |<-- msg STAFF ---|                |              |               |
    |<-- "Xin chào" (từ Admin) ------|                |              |               |
```

---

**► HÌNH 3.14: Seq — Admin xử lý Đơn hàng (Xác nhận → Chuyển Shipper → Giao)**

Đối tượng: `Admin` → `OrdersPage` → `API /api/admin/orders` → `Prisma` → `Database` → `NotificationService` → `Shipper`

```
Admin         OrdersPage       API /admin/orders    Prisma       Database     NotifService   Shipper
  |               |                  |                 |             |             |            |
  |-- Mở trang -->|                  |                 |             |             |            |
  |               |-- GET ---------->|                 |             |             |            |
  |               |                  |-- findMany ---->|-- SELECT ->|             |            |
  |               |<-- orders -------|<-- data --------|<-----------|             |            |
  |<-- Hiển thị --|                  |                 |             |             |            |
  |               |                  |                 |             |             |            |
  |== Bước 1: Xác nhận Đơn hàng ==  |                 |             |             |            |
  |-- Bấm "Xác nhận" -->|           |                 |             |             |            |
  |               |-- PUT {status:   |                 |             |             |            |
  |               |   "CONFIRMED"} ->|                 |             |             |            |
  |               |                  |-- UPDATE ------>|-- UPDATE ->|             |            |
  |               |                  |-- Notif User: "Đơn đã xác nhận" --------->|            |
  |               |<-- OK -----------|                 |             |             |            |
  |               |                  |                 |             |             |            |
  |== Bước 2: Chuyển cho Shipper ==  |                 |             |             |            |
  |-- Bấm "Giao hàng" -->|          |                 |             |             |            |
  |               |-- PUT {status:   |                 |             |             |            |
  |               |   "SHIPPING"} -->|                 |             |             |            |
  |               |                  |-- UPDATE ------>|-- UPDATE ->|             |            |
  |               |                  |-- Notif User: "Đang giao" --|------------>|            |
  |               |                  |-- Tìm ALL Shipper ---------->|             |            |
  |               |                  |-- Notif Shipper: "Có đơn mới" ----------->|----------->|
  |               |<-- OK -----------|                 |             |             |     |      |
  |               |                  |                 |             |             |     |      |
  |== Bước 3: Shipper giao hàng ==  |                 |             |             |     |      |
  |               |                  |                 |             |             |     |      |
  |               |           ShipperPage ------------ API /shipper  |             |     |      |
  |               |                  |                 |             |             |     |      |
  |               |                  |        Shipper bấm "Đã giao" |             |     |      |
  |               |                  |-- PUT {status: "DELIVERED"} ->|-- UPDATE ->|     |      |
  |               |                  |-- Notif User: "Giao thành công, hãy đánh giá" ->|      |
  |               |                  |                 |             |             |            |
```

---

**► HÌNH 3.15: Seq — Shipper cập nhật trạng thái giao hàng**

Đối tượng: `Shipper` → `ShipperPage` → `API /api/shipper` → `Prisma` → `Database` → `NotificationService`

```
Shipper        ShipperPage      API /shipper        Prisma         Database      NotifService
    |               |                |                 |               |              |
    |-- Đăng nhập (role=SHIPPER) --->|                |               |              |
    |               |-- GET -------->|                 |               |              |
    |               |                |-- findMany ---->|-- SELECT ---->|              |
    |               |                |  (status =      |  (orders     |              |
    |               |                |   "SHIPPING")   |   đang giao) |              |
    |               |<-- orders -----|<-- data --------|<-- results --|              |
    |<-- Hiển thị --|                |                 |               |              |
    |               |                |                 |               |              |
    |-- Bấm "Đã giao thành công" -->|                 |               |              |
    |               |-- PUT -------->|                 |               |              |
    |               |                |-- auth() → Check role SHIPPER  |              |
    |               |                |-- UPDATE status = "DELIVERED" ->|-- UPDATE --->|
    |               |                |-- UPDATE paymentStatus = "PAID" (nếu COD) --->|
    |               |                |                 |               |              |
    |               |                |-- Notif User: --|--------------|------------>--|
    |               |                |  "Giao hàng     |               |              |
    |               |                |   thành công"   |               |              |
    |               |                |                 |               |              |
    |               |<-- { success }--|                |               |              |
    |<-- Cập nhật UI|                |                 |               |              |
```

---

#### 3.1.6. Biểu đồ Hoạt Động (Activity Diagram) — VẼ BẰNG Draw.io

Dùng các ký hiệu chuẩn UML: ● = Nút bắt đầu, ◇ = Nút quyết định (Decision), ▭ = Hành động (Action), ◉ = Nút kết thúc, ║ = Fork/Join (Xử lý song song).

---

**► HÌNH 3.16: Act — Quy trình Mua hàng toàn bộ (Từ duyệt SP → Nhận hàng)**

```
● Bắt đầu
    ↓
▭ Khách truy cập trang web
    ↓
◇ Muốn tìm SP cụ thể?
  ├── Có → ▭ Gõ từ khóa vào thanh Tìm kiếm → ▭ Hệ thống lọc không dấu → ▭ Hiển thị kết quả
  └── Không → ▭ Duyệt Danh mục / Bộ lọc
    ↓
▭ Xem chi tiết Sản phẩm
    ↓
▭ Xem mục "Thường được mua cùng" (Thuật toán Apriori)
    ↓
◇ Muốn mua?
  ├── Không → ▭ Quay lại duyệt sản phẩm (vòng lặp)
  └── Có ↓
▭ Chọn Biến thể (nếu có) → Bấm "Thêm vào giỏ"
    ↓
▭ Zustand lưu vào LocalStorage + Đồng bộ lên DB (nếu đã đăng nhập)
    ↓
◇ Tiếp tục mua sắm?
  ├── Có → Quay lại duyệt sản phẩm
  └── Không ↓
▭ Mở Giỏ hàng (Cart Drawer) → Kiểm tra số lượng, tổng tiền
    ↓
▭ Bấm "Thanh toán"
    ↓
◇ Đã đăng nhập?
  ├── Chưa → ▭ Hiển thị popup Đăng nhập / Đăng ký → Quay lại Checkout
  └── Rồi ↓
▭ Chọn Địa chỉ giao hàng (từ Sổ địa chỉ hoặc nhập mới)
    ↓
▭ Chọn Phương thức thanh toán: COD / VNPAY / Chuyển khoản
    ↓
◇ Nhập Mã giảm giá?
  ├── Có → ▭ Nhập mã → ▭ Hệ thống validate (hạn sử dụng, giá trị tối thiểu, đã dùng chưa)
  │   ├── Hợp lệ → ▭ Áp dụng giảm giá
  │   └── Không hợp lệ → ▭ Hiện lỗi
  └── Không ↓
▭ Hiển thị: Tạm tính - Giảm VIP - Giảm Coupon - Phí ship = Tổng cộng
    ↓
▭ Bấm "Xác nhận Đặt hàng"
    ↓
║ Fork (Xử lý song song trong Transaction):
  ├── ▭ Tạo Order (PENDING)
  ├── ▭ Tạo OrderItems
  ├── ▭ Trừ tồn kho (Stock)
  ├── ▭ Tăng soldCount
  ├── ▭ Cập nhật điểm tích lũy User
  ├── ▭ Kiểm tra thăng hạng VIP
  ├── ▭ Xóa CartItems trong DB
  └── ▭ Cập nhật Coupon (usedCount + 1)
║ Join
    ↓
◇ Thanh toán VNPAY?
  ├── Có → ▭ Mở trang VNPAY Mock → ▭ Nhập OTP → ▭ Xác nhận → paymentStatus = PAID
  └── Không (COD) → paymentStatus giữ PENDING
    ↓
║ Fork (Thông báo):
  ├── ▭ Gửi Notification cho Admin ("Đơn hàng mới")
  ├── ▭ Check stock < 5 → Gửi cảnh báo tồn kho cho Admin
  └── ▭ Check VIP thăng hạng → Gửi thông báo cho User
║ Join
    ↓
▭ Hiển thị "Đặt hàng thành công" + Mã đơn hàng
    ↓
◉ Kết thúc
```

---

**► HÌNH 3.17: Act — Quy trình Quản lý Đơn hàng (Vòng đời đơn hàng)**

```
● Bắt đầu (Khách vừa đặt hàng)
    ↓
▭ Đơn hàng được tạo: status = PENDING
    ↓
▭ Admin mở trang Quản lý Đơn hàng
    ↓
◇ Admin xử lý?
  ├── Hủy → ▭ Admin bấm "Hủy" → Nhập lý do → status = CANCELLED
  │          → ▭ Gửi Notification cho User: "Đơn đã bị hủy"
  │          → ◉ Kết thúc
  └── Xác nhận ↓
▭ Admin bấm "Xác nhận" → status = CONFIRMED
    → ▭ Gửi Notification cho User: "Đơn đã xác nhận"
    ↓
▭ Admin bấm "Giao hàng" → status = SHIPPING
    → ▭ Gửi Notification cho User: "Đang giao"
    → ▭ Gửi Notification cho TẤT CẢ Shipper: "Có đơn mới"
    ↓
▭ Shipper nhận đơn trên giao diện Shipper
    ↓
◇ Giao hàng thành công?
  ├── Không → ▭ Liên hệ Admin xử lý thủ công
  └── Có ↓
▭ Shipper bấm "Đã giao" → status = DELIVERED
    → ▭ Nếu COD: paymentStatus = PAID
    → ▭ Gửi Notification cho User: "Giao thành công, hãy đánh giá"
    ↓
◇ Khách đánh giá?
  ├── Có → ▭ Khách gửi đánh giá → ▭ Cập nhật Wilson Score → ▭ Phân tích Sentiment
  └── Không → (Bỏ qua)
    ↓
◉ Kết thúc
```

---

**► HÌNH 3.18: Act — Quy trình Chat AI Chatbot**

```
● Bắt đầu
    ↓
▭ Khách bấm bong bóng Chat (góc phải dưới)
    ↓
▭ Hệ thống tạo ChatSession (status = "AI")
    ↓
▭ Khách gõ tin nhắn
    ↓
▭ Lưu tin nhắn USER vào Database
    ↓
◇ Session status?
  ├── "HUMAN" hoặc "PENDING_HUMAN" → ▭ Chờ Admin phản hồi (không gọi AI)
  │                                   → ◇ Admin đã reply?
  │                                     ├── Có → ▭ Hiển thị tin nhắn Admin
  │                                     └── Chưa → ▭ Hiển thị "Đang chờ nhân viên..."
  │                                   → Quay lại "Khách gõ tin nhắn"
  └── "AI" ↓
▭ Chuẩn hóa tin nhắn: lowercase + bỏ dấu tiếng Việt (NFD)
    ↓
◇ Khớp từ khóa nào?
  ├── Danh mục SP (chuot, ban phim, tai nghe...)
  │     → ▭ Query SP theo categoryId
  │     → ◇ Có kèm ngân sách? (1tr, 500k...)
  │       ├── Có → ▭ Lọc SP <= budget × 1.1
  │       └── Không → ▭ Lấy top 4 SP mới nhất
  │     → ▭ Format reply với tên SP + link + giá
  │
  ├── Chính sách (bảo hành, đổi trả, hoàn tiền)
  │     → ▭ Trả về template chính sách bảo hành
  │
  ├── Giao hàng (ship, vận chuyển, bao lâu)
  │     → ▭ Trả về template thông tin giao hàng
  │
  ├── Liên hệ (hotline, địa chỉ, showroom)
  │     → ▭ Trả về template thông tin liên hệ
  │
  ├── Chào hỏi (hi, hello, chào, cảm ơn)
  │     → ▭ Trả về lời chào + gợi ý câu hỏi
  │
  └── Không khớp bất kỳ
        → ▭ Trả về gợi ý chung (hotline + link Fanpage)
    ↓
▭ Lưu tin nhắn AI vào Database
    ↓
▭ Hiển thị reply cho Khách
    ↓
◇ Khách tiếp tục chat?
  ├── Có → Quay lại "Khách gõ tin nhắn"
  └── Không → ◉ Kết thúc
```

---

**► HÌNH 3.19: Act — Quy trình Đăng ký & Đăng nhập**

```
● Bắt đầu
    ↓
▭ Khách bấm "Đăng nhập" trên Header
    ↓
▭ Hiển thị Modal (có 2 tab: Đăng nhập / Đăng ký)
    ↓
◇ Chọn hình thức?
  │
  ├── TAB "ĐĂNG KÝ":
  │     ▭ Nhập: Họ tên, Email, Mật khẩu
  │     ↓
  │     ◇ Mật khẩu >= 6 ký tự?
  │       ├── Không → ▭ Hiển thị lỗi "Mật khẩu tối thiểu 6 ký tự"
  │       └── Có ↓
  │     ▭ POST /api/register
  │     ↓
  │     ◇ Email đã tồn tại?
  │       ├── Có → ▭ Hiển thị lỗi "Email đã được sử dụng"
  │       └── Không ↓
  │     ▭ Hash mật khẩu (bcrypt, 10 rounds)
  │     ▭ Tạo User trong Database
  │     ▭ Gửi Notification "Chào mừng gia nhập VORTEX"
  │     ▭ Tự động chuyển sang Tab Đăng nhập
  │
  ├── TAB "ĐĂNG NHẬP" (Email/Mật khẩu):
  │     ▭ Nhập: Email, Mật khẩu
  │     ▭ NextAuth signIn("credentials")
  │     ↓
  │     ◇ Email tồn tại trong DB?
  │       ├── Không → ▭ "Sai email hoặc mật khẩu"
  │       └── Có ↓
  │     ◇ bcrypt.compare(password, hash) đúng?
  │       ├── Sai → ▭ "Sai email hoặc mật khẩu"
  │       └── Đúng ↓
  │     ▭ Tạo JWT Token (chứa id, role, avatar)
  │     ▭ Đóng Modal → Redirect về trang trước
  │
  └── NÚT "ĐĂNG NHẬP BẰNG GOOGLE":
        ▭ NextAuth signIn("google")
        ▭ Redirect → Google OAuth Consent Screen
        ▭ Khách chọn tài khoản Google
        ▭ Google trả về: email, name, avatar
        ▭ Hệ thống tự động tạo Account (nếu chưa có) hoặc link với User có sẵn
        ▭ Tạo JWT Token
        ▭ Redirect về trang chủ
    ↓
◉ Kết thúc (Đã đăng nhập)
```

---

**► HÌNH 3.20: Act — Quy trình Admin quản lý Sản phẩm (CRUD)**

```
● Bắt đầu
    ↓
▭ Admin đăng nhập (role = ADMIN)
    ↓
▭ Vào trang Quản lý Sản phẩm (/admin/products)
    ↓
▭ Hiển thị danh sách SP (GET /api/admin/products)
    ↓
◇ Admin muốn làm gì?
  │
  ├── THÊM MỚI:
  │     ▭ Bấm "Thêm sản phẩm"
  │     ▭ Điền form: Tên, Giá, Giá KM, Danh mục, Thương hiệu, Mô tả
  │     ▭ Nhập Thông số kỹ thuật (JSON): {"RAM": "16GB", "Switch": "Cherry MX Red"}
  │     ▭ Upload Hình ảnh
  │     ▭ (Tùy chọn) Thêm Biến thể: Tên variant, Giá offset, Stock
  │     ▭ Bấm "Lưu" → POST /api/admin/products
  │     ▭ Hệ thống tự động tạo slug từ tên SP (VD: "razer-deathadder-v3-pro")
  │     ▭ Hiển thị Toast "Tạo sản phẩm thành công"
  │
  ├── SỬA:
  │     ▭ Bấm icon ✏️ bên cạnh SP
  │     ▭ Form pre-fill dữ liệu hiện tại
  │     ▭ Admin chỉnh sửa các trường cần thay đổi
  │     ▭ Bấm "Cập nhật" → PUT /api/admin/products/[id]
  │     ▭ Hiển thị Toast "Cập nhật thành công"
  │
  └── XÓA:
        ▭ Bấm icon 🗑️ bên cạnh SP
        ▭ Hiển thị hộp thoại xác nhận "Bạn có chắc?"
        ◇ Xác nhận?
          ├── Hủy → Đóng hộp thoại
          └── Đồng ý → DELETE /api/admin/products/[id]
                → ▭ Soft Delete: isActive = false (SP ẩn khỏi trang khách, không xóa khỏi DB)
                → ▭ Hiển thị Toast "Đã xóa sản phẩm"
    ↓
◇ Tiếp tục quản lý?
  ├── Có → Quay lại "Admin muốn làm gì?"
  └── Không → ◉ Kết thúc
```

### 3.2. KẾ HOẠCH THỜI GIAN VÀ NGÂN SÁCH THỰC HIỆN DỰ ÁN

*(Sinh viên tự điền thời gian thực tế của nhóm)*

| Giai đoạn | Công việc | Thời gian | Ghi chú |
|---|---|---|---|
| Tuần 1–2 | Phân tích yêu cầu, Thiết kế CSDL, Vẽ UML | ... | Dùng Draw.io |
| Tuần 3–5 | Xây dựng Backend API (CRUD Sản phẩm, Đơn hàng, User) | ... | Next.js + Prisma |
| Tuần 5–7 | Xây dựng Frontend (Trang chủ, SP, Giỏ hàng, Checkout) | ... | React + CSS Modules |
| Tuần 7–8 | Tích hợp AI Chatbot, Thuật toán Wilson Score, Apriori | ... | |
| Tuần 9–10 | Phân hệ Admin Dashboard, Shipper, Kiểm thử | ... | |
| Tuần 10–11 | Hoàn thiện báo cáo, Triển khai, Chuẩn bị bảo vệ | ... | |

*Bảng 3.7: Kế hoạch thời gian thực hiện dự án*

### 3.3. PHÁT TRIỂN ỨNG DỤNG

#### 3.3.1. Kiến trúc hệ thống

Hệ thống VORTEX được xây dựng theo kiến trúc **Fullstack Monolith** trên nền Next.js App Router, trong đó Frontend và Backend API cùng nằm trong một dự án duy nhất nhưng được tổ chức tách lớp rõ ràng:

```
vortex/
├── prisma/                    ← Cơ sở dữ liệu (Schema + SQLite)
│   ├── schema.prisma          ← Định nghĩa 19 bảng dữ liệu
│   └── dev.db                 ← File database SQLite
│
├── src/
│   ├── app/                   ← Tầng Giao diện (Pages + API Routes)
│   │   ├── page.js            ← Trang chủ
│   │   ├── products/          ← Trang danh sách & chi tiết sản phẩm
│   │   ├── cart/              ← Trang giỏ hàng
│   │   ├── checkout/          ← Trang thanh toán
│   │   ├── account/           ← Trang tài khoản cá nhân
│   │   ├── wishlist/          ← Trang yêu thích
│   │   ├── news/              ← Trang tin tức
│   │   ├── admin/             ← Phân hệ Admin (Dashboard, CRUD)
│   │   ├── shipper/           ← Phân hệ Shipper
│   │   └── api/               ← 17 nhóm API Routes (Backend)
│   │       ├── auth/          ← API xác thực
│   │       ├── products/      ← API sản phẩm
│   │       ├── cart/          ← API giỏ hàng
│   │       ├── checkout/      ← API thanh toán
│   │       ├── chat/          ← API chatbot AI
│   │       ├── admin/         ← API quản trị
│   │       ├── shipper/       ← API shipper
│   │       ├── vnpay/         ← API thanh toán VNPAY
│   │       └── ...            ← Và các API khác
│   │
│   ├── components/            ← Tầng Component tái sử dụng
│   │   ├── layout/            ← Header, Footer, AIChatBox
│   │   ├── product/           ← ProductCard, ProductFilters, FrequentlyBoughtTogether
│   │   ├── cart/              ← CartDrawer
│   │   ├── auth/              ← AuthModal (Đăng nhập/Đăng ký)
│   │   └── ui/                ← Toast, nút bấm chung
│   │
│   ├── services/              ← Tầng Business Logic (Thuật toán)
│   │   ├── ProductService.js  ← Logic sản phẩm + Apriori + Lọc
│   │   └── ReviewService.js   ← Logic đánh giá + Wilson Score
│   │
│   ├── utils/                 ← Tiện ích
│   │   └── sentiment.js       ← Thuật toán NLP Sentiment Analysis
│   │
│   ├── store/                 ← Quản lý State (Zustand)
│   │   ├── cart.js            ← Giỏ hàng (persist LocalStorage)
│   │   └── authModal.js       ← Trạng thái modal đăng nhập
│   │
│   └── lib/                   ← Thư viện kết nối
│       ├── prisma.js          ← Singleton Prisma Client
│       └── utils.js           ← Hàm tiện ích (removeVietnameseDiacritics...)
```

#### 3.3.2. Giao diện Khách hàng (Storefront)

**a) Trang chủ** (`src/app/page.js`)
- Hero Banner với hiệu ứng Neon phát sáng, phong cách Dark Gaming.
- Danh mục sản phẩm nổi bật (lấy từ Category, hiển thị Icon).
- Sản phẩm bán chạy nhất (Sort theo `soldCount` giảm dần).
- Sản phẩm đánh giá cao nhất (Sort theo `wilsonScore` giảm dần — Thuật toán Wilson Score).
- Khu vực Tin tức (Lấy từ bảng News).

> [Hình 3.21: Chụp màn hình toàn cảnh Trang chủ VORTEX — Đảm bảo thấy Banner, Danh mục, Sản phẩm nổi bật]

**b) Trang danh sách Sản phẩm và Bộ lọc** (`src/app/products/page.js` + `src/components/product/ProductFilters.jsx`)
- Thanh Bộ lọc bên trái: Lọc theo Danh mục, Khoảng giá, Thương hiệu, và các Thông số kỹ thuật động (được tự động trích xuất từ trường JSON `specs`).
- Sắp xếp: Mới nhất, Giá tăng dần, Giá giảm dần, Đánh giá cao nhất.
- Tìm kiếm hỗ trợ Tiếng Việt không dấu.

> [Hình 3.22: Chụp màn hình trang Sản phẩm — Đảm bảo thấy thanh Bộ lọc bên trái và danh sách sản phẩm bên phải]

**c) Trang chi tiết Sản phẩm** (`src/app/products/[slug]/page.js`)
- Hiển thị Gallery ảnh, Thông tin giá (gốc + khuyến mãi), Thông số kỹ thuật, Tính năng nổi bật.
- Chọn Biến thể (Variant): Màu sắc, kích cỡ (nếu có).
- Khu vực Đánh giá sản phẩm (Rating + Comment).
- Dãy "Thường được mua cùng" — Kết quả của thuật toán Apriori.
- Dãy "Sản phẩm liên quan" — Fallback khi chưa có đủ dữ liệu Apriori.

> [Hình 3.23: Chụp màn hình trang Chi tiết SP — Đảm bảo thấy ảnh SP, giá, thông số, và dải "Thường được mua cùng" bên dưới]

**d) Giỏ hàng và Thanh toán** (`src/app/cart/page.js`, `src/app/checkout/page.js`)
- Giỏ hàng dạng Drawer (trượt từ bên phải) — lưu trạng thái bằng Zustand + LocalStorage.
- Trang Checkout: Chọn địa chỉ từ Sổ địa chỉ hoặc nhập mới, Chọn phương thức thanh toán (COD, VNPAY Mock, Chuyển khoản), Nhập mã giảm giá.
- Sau khi đặt hàng: Tự động tính điểm tích lũy, Gửi thông báo cho Admin.

> [Hình 3.24: Chụp màn hình Giỏ hàng Drawer khi được mở ra]
> [Hình 3.25: Chụp màn hình Trang Checkout với form điền thông tin và tóm tắt đơn hàng]

#### 3.3.3. Giao diện Quản trị viên (Admin Dashboard)

**a) Dashboard thống kê** (`src/app/admin/page.js`)
- Tổng doanh thu, Tổng đơn hàng, Tổng khách hàng, Tổng sản phẩm.
- Biểu đồ doanh thu theo thời gian (7 ngày gần nhất).
- Top sản phẩm bán chạy, Đơn hàng gần đây.

> [Hình 3.26: Chụp màn hình Dashboard Admin — Đảm bảo thấy các thẻ thống kê và biểu đồ]

**b) Quản lý Đơn hàng** (`src/app/admin/orders/page.js`)
- Danh sách đơn hàng với bộ lọc theo trạng thái.
- Admin có thể: Xác nhận đơn → Chuyển cho Shipper → Theo dõi trạng thái.

> [Hình 3.27: Chụp màn hình trang Quản lý Đơn hàng]

**c) Quản lý Sản phẩm** (`src/app/admin/products/`)
- CRUD đầy đủ: Tạo mới, Chỉnh sửa, Xóa mềm (Soft Delete).
- Quản lý Biến thể sản phẩm (Variant), Upload ảnh, Nhập thông số kỹ thuật dạng JSON.

> [Hình 3.28: Chụp màn hình trang Quản lý Sản phẩm — Hiển thị danh sách SP hoặc Form tạo SP]

**d) Quản lý Đánh giá** (`src/app/admin/reviews/page.js`)
- Hiển thị toàn bộ đánh giá kèm nhãn Sắc thái (Sentiment): Tích cực / Tiêu cực / Trung lập.
- Thống kê số lượng đánh giá theo từng loại sắc thái.

> [Hình 3.31: Chụp màn hình trang Quản lý Đánh giá — Nhìn rõ các nhãn Sắc thái Tích cực/Tiêu cực do AI đánh giá]

**e) Quản lý Giỏ hàng tồn** (`src/app/admin/abandoned-carts/page.js`)
- Danh sách khách hàng đã thêm sản phẩm vào giỏ nhưng chưa thanh toán.
- Nút "Gửi nhắc nhở" để thúc đẩy tỷ lệ chuyển đổi (Conversion Rate).

**f) Hỗ trợ trực tuyến** (`src/app/admin/support/`)
- Admin tiếp nhận các phiên chat từ khách hàng khi AI chuyển giao (Human-Handoff).
- Giao diện chat real-time (Polling 3 giây).

> [Hình 3.30: Chụp màn hình giao diện Hỗ trợ trực tuyến của Admin khi đang chat với khách]

#### 3.3.4. Giao diện Shipper

**Phân hệ Shipper** (`src/app/shipper/page.js`)
- Shipper đăng nhập bằng tài khoản có role = SHIPPER.
- Xem danh sách đơn hàng có trạng thái SHIPPING.
- Bấm "Đã giao" để chuyển trạng thái thành DELIVERED.

> [Hình 3.32: Chụp màn hình giao diện Shipper]

#### 3.3.5. AI Chatbox

**Chatbot AI** (`src/components/layout/AIChatBox.jsx` + `src/app/api/chat/route.js`)
- Bong bóng chat góc phải dưới màn hình, có mặt trên mọi trang.
- AI tự động trả lời dựa trên từ khóa: Tư vấn sản phẩm theo danh mục, Tư vấn theo ngân sách, Chính sách bảo hành, Thông tin giao hàng, Thông tin liên hệ.
- Khi khách yêu cầu gặp nhân viên → Chuyển trạng thái sang PENDING_HUMAN → Admin tiếp nhận.

> [Hình 3.29: Chụp màn hình Chatbox AI trả lời tự động cho khách hàng]

### 3.4. CÁC THUẬT TOÁN ỨNG DỤNG TRONG HỆ THỐNG

#### 3.4.1. Thuật toán Wilson Score Interval (Xếp hạng sản phẩm)
- **Vị trí code:** `src/services/ReviewService.js` → Hàm `updateWilsonScore(productId)`
- **Vấn đề giải quyết:** Tránh lỗi sai lệch khi xếp hạng bằng trung bình cộng đơn thuần (1 đánh giá 5★ > 100 đánh giá 4.8★).
- **Cách hoạt động:** Sử dụng công thức khoảng tin cậy thống kê 95% (z = 1.96) để tính ra điểm Wilson Score, lưu vào cột `wilsonScore` trong bảng Product, dùng để sắp xếp "Đánh giá cao nhất".

#### 3.4.2. Thuật toán Gợi ý sản phẩm mua kèm (Association Rules)
- **Vị trí code:** `src/services/ProductService.js` → Hàm `getFrequentlyBoughtTogether(productId, limit)`
- **Vấn đề giải quyết:** Tự động gợi ý sản phẩm "Thường được mua cùng" dựa trên lịch sử đơn hàng thực tế (Cross-selling).
- **Cách hoạt động:** Tìm các đơn hàng chứa sản phẩm đang xem → Đếm tần suất xuất hiện (Support) của các sản phẩm khác trong cùng đơn → Sắp xếp và trả về Top sản phẩm có tần suất cao nhất.

#### 3.4.3. Thuật toán Phân tích Sắc thái (NLP Sentiment Analysis)
- **Vị trí code:** `src/utils/sentiment.js` → Hàm `analyzeSentiment(text)`
- **Vấn đề giải quyết:** Tự động phân loại đánh giá thành Tích cực / Tiêu cực / Trung lập mà Admin không cần đọc từng bình luận.
- **Cách hoạt động:** Sử dụng kỹ thuật Dictionary-based NLP — định nghĩa 2 mảng từ khóa (tích cực: tốt, tuyệt, mượt...; tiêu cực: lỗi, hỏng, chậm...) kết hợp nhận diện từ phủ định (không, chưa, chả) để đảo ngược sắc thái. Tính tổng điểm và dán nhãn.

#### 3.4.4. Thuật toán Tìm kiếm Tiếng Việt không dấu (Unicode NFD Normalization)
- **Vị trí code:** `src/lib/utils.js` → Hàm `removeVietnameseDiacritics()` + `src/services/ProductService.js` → Hàm `getAllProducts()`
- **Vấn đề giải quyết:** Cho phép tìm kiếm "chuot" để ra kết quả "Chuột Gaming".
- **Cách hoạt động:** Sử dụng `normalize('NFD')` tách ký tự Unicode thành chữ cái gốc + dấu, sau đó dùng Regex xóa phần dấu. Áp dụng In-memory filter trên toàn bộ trường Name, Brand, Category, Description.

#### 3.4.5. Thuật toán Gộp Bộ lọc Thông minh (Dynamic Specs Deduplication)
- **Vị trí code:** `src/app/products/page.js` và `src/services/ProductService.js`
- **Vấn đề giải quyết:** Khi Admin nhập "Apple" ở SP này và "apple" ở SP khác, bộ lọc không bị tạo 2 checkbox trùng.
- **Cách hoạt động:** Dùng cấu trúc Map với key đã chuẩn hóa (`.toLowerCase().trim()`) để gộp các giá trị tương đương thành một lựa chọn duy nhất.

### 3.5. TÍCH HỢP CỔNG THANH TOÁN

Hệ thống VORTEX hỗ trợ 3 phương thức thanh toán:
1. **COD (Cash on Delivery):** Thanh toán khi nhận hàng. Trạng thái `paymentStatus` giữ ở `PENDING` cho đến khi Shipper xác nhận đã giao.
2. **Chuyển khoản Ngân hàng:** Khách chuyển khoản theo thông tin hiển thị trên trang Checkout. Admin xác nhận thanh toán thủ công.
3. **VNPAY (Mock):** Hệ thống mô phỏng (Mock) giao diện thanh toán VNPAY với quy trình nhập OTP để minh họa luồng tích hợp cổng thanh toán điện tử.

*(Vị trí code: `src/app/api/vnpay/` và `src/app/checkout/page.js`)*

### 3.6. THIẾT LẬP SEO

Hệ thống áp dụng các kỹ thuật SEO cơ bản được tích hợp sẵn trong Next.js:
- **Metadata động:** Mỗi trang có `title` và `description` riêng biệt (Cấu hình trong `metadata` object của Next.js).
- **URL thân thiện (Slug):** Sản phẩm có URL dạng `/products/razer-deathadder-v3-pro` thay vì `/products?id=abc123`.
- **SSR (Server-Side Rendering):** Trang được render phía Server giúp Search Engine thu thập nội dung dễ dàng hơn so với Client-Side Rendering thuần túy.
- **Open Graph Tags:** Cấu hình cho Facebook/Zalo khi chia sẻ link.

---

## CHƯƠNG 4 – KẾT LUẬN

### 4.1. KẾT QUẢ ĐẠT ĐƯỢC

Nhóm đã hoàn thành xây dựng hệ thống Thương mại điện tử VORTEX với các kết quả chính:
- **Hệ thống hoạt động ổn định** với đầy đủ 3 phân hệ: Khách hàng, Quản trị viên, và Shipper.
- **19 bảng dữ liệu** được thiết kế quan hệ chặt chẽ, đảm bảo tính toàn vẹn dữ liệu.
- **17 nhóm API** phục vụ toàn bộ nghiệp vụ từ xác thực, sản phẩm, giỏ hàng, thanh toán, chat, đến thống kê.
- **5 thuật toán thông minh** được ứng dụng thành công: Wilson Score, Association Rules (Apriori), NLP Sentiment, Tìm kiếm không dấu, Gộp bộ lọc động.
- **Giao diện UI/UX** phong cách Dark Premium, responsive, với hiệu ứng Neon phát sáng phù hợp thương hiệu Gaming.

### 4.2. NHỮNG HẠN CHẾ

- Hệ thống Chat sử dụng Polling (gọi API mỗi 3 giây) thay vì WebSocket — có thể gây tải cho server khi nhiều người chat cùng lúc.
- AI Chatbot sử dụng phương pháp Rule-based (dựa trên từ khóa) chứ chưa tích hợp mô hình AI thực sự (GPT, Gemini).
- Thuật toán Tìm kiếm In-memory phù hợp với quy mô nhỏ-vừa; cần nâng cấp lên Full-text Search Engine (Elasticsearch) nếu mở rộng lên triệu sản phẩm.
- Cổng thanh toán VNPAY hiện là Mock (mô phỏng), chưa tích hợp API VNPAY thực tế.

### 4.3. ĐỊNH HƯỚNG MỞ RỘNG VÀ CẢI TIẾN HỆ THỐNG

- Nâng cấp Chat sang **WebSocket** (Socket.io) để truyền dữ liệu thời gian thực.
- Tích hợp **Gemini/ChatGPT API** để AI Chatbot có khả năng hiểu ngữ cảnh phức tạp hơn.
- Tích hợp Cổng thanh toán **VNPAY/MoMo API chính thức**.
- Chuyển đổi Database từ SQLite sang **PostgreSQL** để phục vụ production.
- Triển khai lên **Vercel** hoặc **VPS** để website hoạt động công khai trên Internet.
- Bổ sung tính năng **Responsive hoàn chỉnh** cho thiết bị di động.

### 4.4. PHÂN CÔNG CÔNG VIỆC

*(Sinh viên tự điền theo thực tế nhóm)*

| STT | Họ và tên | MSSV | Công việc phụ trách | Tỷ lệ đóng góp |
|---|---|---|---|---|
| 1 | ... | ... | ... | ...% |
| 2 | ... | ... | ... | ...% |
| 3 | ... | ... | ... | ...% |

*Bảng 4.1: Phân công công việc trong nhóm*

---

## TÀI LIỆU THAM KHẢO

1. **Trần Văn Hòe (Chủ biên)** (2007), *Giáo trình Thương mại điện tử căn bản*, NXB Đại học Kinh tế Quốc dân, Hà Nội.
2. **Nguyễn Văn Thoan** (2010), *Giáo trình Thương mại điện tử*, NXB Bách khoa Hà Nội, Hà Nội.
3. **Lưu Đan Thọ, Tôn Thất Hoàng Hải** (2015), *Giáo trình Thương mại điện tử hiện đại — Lý thuyết và tình huống thực hành ứng dụng của các công ty Việt Nam*, NXB Tài chính.
4. **Next.js Documentation**, Vercel Inc. [https://nextjs.org/docs](https://nextjs.org/docs)
5. **Prisma Documentation**, Prisma Data Inc. [https://www.prisma.io/docs](https://www.prisma.io/docs)
6. **Edwin B. Wilson** (1927), *"Probable Inference, the Law of Succession, and Statistical Inference"*, Journal of the American Statistical Association, 22(158), pp. 209-212.
7. **Rakesh Agrawal, Ramakrishnan Srikant** (1994), *"Fast Algorithms for Mining Association Rules"*, Proceedings of the 20th International Conference on Very Large Data Bases (VLDB), pp. 487-499.
8. Hướng dẫn và góp ý trực tiếp từ Giảng viên hướng dẫn môn học.
