<div align="center">
  <img src="./public/assets/logo-gradient.svg" alt="VORTEX Logo" width="300"/>
  <h1>🌀 VORTEX — Gaming Gear & Phụ Kiện Công Nghệ</h1>
  <p><i>Trang web thương mại điện tử chuyên nghiệp cấp cao với giao diện Dark Premium</i></p>
</div>

---

## 📖 Giới thiệu
VORTEX là một nền tảng thương mại điện tử hiện đại, chuyên cung cấp các thiết bị Gaming Gear (bàn phím cơ, chuột gaming, tai nghe) và phụ kiện công nghệ cao cấp. Với phong cách thiết kế **Dark Premium**, kết hợp cùng các hiệu ứng viền Neon và cấu trúc giao diện tối ưu, VORTEX mang lại trải nghiệm mua sắm tuyệt vời, mượt mà và trực quan nhất cho cộng đồng game thủ và người yêu công nghệ.

## ✨ Tính năng nổi bật
* **Giao diện & Trải nghiệm (UI/UX):**
  * Thiết kế Dark Mode toàn diện, sang trọng.
  * Hiệu ứng chuyển động mượt mà, Hover đa dạng (vd: Hover Drawer cực mượt bên trang Admin), thân thiện với người dùng.
* **Sản phẩm & Mua sắm:**
  * Bộ lọc sản phẩm chuyên sâu (theo danh mục, thương hiệu, giá cả). Đặc biệt có **Bộ lọc Màu sắc động** tự động gom nhóm và nhận diện màu sắc từ biến thể (variants).
  * Bộ lọc giá thông minh chặn số âm và tự động hoán đổi khi giá trị min > max.
  * Hiển thị trạng thái "Còn hàng" / "Hết hàng" dựa vào kho (inventory), tự động hiển thị biến thể còn hàng nếu sản phẩm gốc hết hàng.
  * Giỏ hàng sử dụng Zustand, tự động lưu (persist) qua local storage tích hợp UI Slider mượt mà.
  * Tìm kiếm thông minh: Gợi ý tức thì (autocomplete) theo danh mục và sản phẩm. Hỗ trợ **tìm kiếm tiếng Việt không dấu** (gõ "chuot" vẫn tìm ra "Chuột Gaming").
* **Thanh toán & Đăng nhập (Authentication):**
  * Tích hợp NextAuth hoàn chỉnh, hỗ trợ **Đăng nhập/Đăng ký một chạm qua Google và Facebook** tiện lợi. Đăng nhập truyền thống an toàn với mật khẩu băm.
  * **Ràng buộc đăng nhập:** Bắt buộc người dùng đăng nhập mới có thể tiến hành thanh toán, chuyển hướng cực thông minh với cơ chế `callbackUrl`.
  * Hỗ trợ tính năng mã giảm giá, tính phí vận chuyển theo cấp bậc hạng VIP.
* **AI & Thông minh & Hệ thống:**
  * Tích hợp **AI Chatbox** thông minh: tự động phân tích ngữ cảnh, có khả năng đoán ý định khách hàng dù gõ tắt hay sai chính tả, giới thiệu các sản phẩm hot.
  * **Hệ thống Thông báo (Notification Bell):** Chuông thông báo realtime thông minh, tự động gửi "Welcome Back" khi đăng nhập hoặc thông báo ngay khi khách hàng đủ điểm Thăng Hạng VIP.
* **Quản trị (Admin Dashboard):**
  * Giao diện Admin quản lý Sản phẩm, Tin tức, Đơn hàng độc lập.
  * Cột điều hướng Sidebar dạng Hover thông minh giúp tối ưu không gian làm việc.
  * **Dashboard Doanh thu Trực quan:** Tích hợp `chart.js` hiển thị biểu đồ cột (theo thời gian Năm/Quý/Tháng/Ngày) và biểu đồ tròn (theo danh mục, thương hiệu, thanh toán).

## 🛠 Công nghệ sử dụng (Tech Stack)
* **Khung ứng dụng (Framework):**   [Next.js](https://nextjs.org/) (App Router, Server Actions)
*   [React](https://reactjs.org/)
*   [Prisma ORM](https://www.prisma.io/) + SQLite (phù hợp chạy local, có thể dễ dàng up lên PostgreSQL/MySQL)
*   [NextAuth.js](https://next-auth.js.org/) (Xác thực với Credentials, Google, Facebook)
*   Zustand (Quản lý State: Giỏ hàng, Toast, Auth Modal)

## 📊 Sơ đồ Cơ sở Dữ liệu (ERD)

Sơ đồ dưới đây mô tả cấu trúc và mối quan hệ giữa các bảng chính trong hệ thống VORTEX:

```mermaid
erDiagram
    USER ||--o{ ADDRESS : "có"
    USER ||--o{ ORDER : "đặt"
    USER ||--o{ CART_ITEM : "thêm vào"
    USER ||--o{ REVIEW : "đánh giá"
    USER ||--o{ WISHLIST : "thích"
    USER ||--o{ NOTIFICATION : "nhận"
    
    CATEGORY ||--o{ PRODUCT : "chứa"
    
    PRODUCT ||--o{ PRODUCT_IMAGE : "có"
    PRODUCT ||--o{ PRODUCT_VARIANT : "có"
    PRODUCT ||--o{ ORDER_ITEM : "nằm trong"
    PRODUCT ||--o{ CART_ITEM : "nằm trong"
    PRODUCT ||--o{ REVIEW : "nhận"
    PRODUCT ||--o{ WISHLIST : "được thích bởi"
    PRODUCT ||--o{ PRODUCT_VIEW : "được xem"

    PRODUCT_VARIANT ||--o{ PRODUCT_IMAGE : "có ảnh riêng"
    PRODUCT_VARIANT ||--o{ CART_ITEM : "được chọn trong"
    PRODUCT_VARIANT ||--o{ ORDER_ITEM : "được đặt trong"

    ORDER ||--o{ ORDER_ITEM : "chứa"
    COUPON ||--o{ ORDER : "áp dụng cho"
    
    USER {
        String id PK
        String email UK
        String name
        String role "USER, ADMIN, SHIPPER"
        Int points
        String vipTier
    }
    
    PRODUCT {
        String id PK
        String name
        Float price
        Int stock
    }
    
    PRODUCT_VARIANT {
        String id PK
        String name
        Int stock
        Float priceOffset
    }
    
    ORDER {
        String id PK
        String orderNumber UK
        Float totalAmount
        String status "PENDING, PROCESSING, SHIPPING, DELIVERED, FAILED_DELIVERY, CANCELLED"
        String paymentMethod
    }
```

> **💡 Hướng dẫn xem ERD**: Sơ đồ phía trên được viết dưới định dạng **Mermaid**. Bạn có thể xem hình ảnh trực quan của lược đồ này bằng các cách sau:
> 1. Xem trực tiếp file `README.md` này trên GitHub (GitHub hỗ trợ render sẵn Mermaid).
> 2. Sử dụng extension **Markdown Preview Mermaid Support** trên VSCode.
> 3. Copy toàn bộ đoạn code trong khối ````mermaid ... ```` ở trên và dán vào trang web [Mermaid Live Editor](https://mermaid.live/) để xem và xuất ảnh.

## 🚀 Chức năng nổi bật
* **Quản lý trạng thái (State Management):** Zustand.
* **Styling:** CSS Modules, thiết kế đáp ứng hoàn toàn (Fully Responsive).
* **AI:** Tích hợp logic Gemini/OpenAI vào hệ thống trợ lý ảo.

---

## 🚀 Hướng dẫn cài đặt và Khởi động dự án

Nếu bạn clone hoặc mở dự án lần đầu, hãy thực hiện **lần lượt và chính xác** các bước sau trong Terminal / Command Prompt:

### Bước 1: Mở Terminal đúng thư mục dự án
Điều quan trọng nhất là bạn cần đứng ở thư mục gốc chứa file `package.json`.
```bash
cd d:\axingon\vortex
```

### Bước 2: Cài đặt thư viện
Lệnh này sẽ tự động cài đặt tất cả các gói (dependencies) cần thiết cho website.
```bash
npm install
```

### Bước 3: Đồng bộ Cơ sở dữ liệu (Database)
Thiết lập và tạo cấu trúc bảng cho CSDL SQLite:
```bash
npx prisma db push
```

### Bước 4: Tạo dữ liệu mẫu (Seeding)
Nạp dữ liệu mô phỏng như sản phẩm, danh mục, bài viết tin tức,... để website hoạt động một cách sinh động:
```bash
node prisma/seed.js
```
*(Nếu console hiển thị `Database seeded successfully!` là bạn đã thành công).*

### Bước 5: Khởi động hệ thống (Dev Server)
Khởi động website trên môi trường phát triển:
```bash
npm run dev
```

### Bước 6: Trải nghiệm Website
Truy cập vào trình duyệt bằng địa chỉ:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📝 Các Lệnh Quản Trị Hữu Ích

* **Mở công cụ quản lý Database (Prisma Studio):**
  Công cụ giao diện trực quan giúp bạn dễ dàng xem, sửa, xóa dữ liệu trong database.
  ```bash
  npx prisma studio
  ```
* **Khởi động server (sau lần đầu):**
  Những lần sau, bạn chỉ cần gõ 2 lệnh này để bật web:
  ```bash
  cd d:\axingon\vortex
  npm run dev
  ```
* **Build ứng dụng (để Deploy):**
  ```bash
  npm run build
  npm run start
  ```

## 🐛 Khắc phục lỗi thường gặp
* **Lỗi `no such file or directory, open '...\package.json'`:** Bạn đang gõ lệnh ở sai thư mục. Hãy luôn gõ `cd d:\axingon\vortex` trước tiên.
* **Giao diện trang bị lỗi thanh trắng:** Đã được xử lý triệt để bằng thẻ `themeColor` trong viewport. Hãy chắc chắn bạn đã xóa cache trình duyệt (Ctrl + F5).
* **Lỗi thiếu dữ liệu:** Hãy xóa file `prisma/dev.db`, sau đó lặp lại **Bước 3** và **Bước 4**.

---

## 🗄️ Sơ Đồ Cơ Sở Dữ Liệu (ERD)

```mermaid
erDiagram
    User ||--o{ Address : "có nhiều"
    User ||--o{ Order : "đặt nhiều"
    User ||--o{ CartItem : "có nhiều"
    User ||--o{ Review : "viết nhiều"
    User ||--o{ Wishlist : "yêu thích nhiều"
    User ||--o{ Account : "liên kết"
    User ||--o{ PointHistory : "lịch sử điểm"
    User ||--o{ Notification : "nhận thông báo"

    Category ||--o{ Product : "chứa nhiều"

    Product ||--o{ ProductImage : "có nhiều ảnh"
    Product ||--o{ ProductVariant : "có nhiều biến thể"
    Product ||--o{ OrderItem : "được mua trong"
    Product ||--o{ CartItem : "nằm trong giỏ"
    Product ||--o{ Review : "được đánh giá"
    Product ||--o{ Wishlist : "được yêu thích"
    Product ||--o{ ProductView : "được theo dõi"

    ProductVariant ||--o{ ProductImage : "chứa ảnh riêng"
    ProductVariant ||--o{ OrderItem : "được mua"
    ProductVariant ||--o{ CartItem : "trong giỏ"

    Order ||--o{ OrderItem : "gồm nhiều item"
    Order }o--o| Coupon : "áp dụng mã"

    ChatSession ||--o{ ChatMessage : "có nhiều tin nhắn"

    User {
        string id PK
        string email UK
        string name
        string password
        string role "USER - ADMIN"
        int points
        string vipTier "MEMBER - SILVER - GOLD - DIAMOND"
    }

    Address {
        string id PK
        string userId FK
        string recipientName
        string phoneNumber
        string province
        string district
        string ward
        string street
        boolean isDefault
    }

    Category {
        string id PK
        string name
        string slug UK
        string parentGroup "gaming - tech"
        int sortOrder
        boolean isActive
    }

    Product {
        string id PK
        string name
        string slug UK
        float price
        float salePrice
        int stock
        string brand
        boolean isActive
        boolean isFeatured
        int soldCount
        string categoryId FK
    }

    ProductVariant {
        string id PK
        string productId FK
        string name
        string sku
        int stock
        float priceOffset
    }

    ProductImage {
        string id PK
        string url
        string alt
        int sortOrder
        string productId FK
        string variantId FK
    }

    CartItem {
        string id PK
        int quantity
        string userId FK
        string productId FK
        string variantId FK
    }

    Order {
        string id PK
        string orderNumber UK
        float totalAmount
        float shippingFee
        float discount
        string recipientName
        string recipientPhone
        string shippingAddress
        string status "PENDING - CONFIRMED - SHIPPING - DELIVERED - CANCELLED"
        string paymentMethod "COD - BANK_TRANSFER - VNPAY - MOMO"
        string paymentStatus "PENDING - PAID - FAILED - REFUNDED"
        string couponCode FK
        string userId FK
    }

    OrderItem {
        string id PK
        int quantity
        float price
        string orderId FK
        string productId FK
        string variantId FK
        string variantName
    }

    Review {
        string id PK
        int rating "1 to 5"
        string comment
        string userId FK
        string productId FK
    }

    Wishlist {
        string id PK
        string userId FK
        string productId FK
    }

    Coupon {
        string id PK
        string code UK
        int discountPercent
        int discountAmount
        int minOrderValue
        int maxUsage
        int usedCount
        boolean isActive
    }

    News {
        string id PK
        string title
        string slug UK
        string author
        string category
        string content "HTML"
        string image
        string bgColor
        boolean isFeatured
    }

    ChatSession {
        string id PK
        string userId
        string guestName
        string status "AI - PENDING_HUMAN - HUMAN - CLOSED"
    }

    ChatMessage {
        string id PK
        string senderType "USER - AI - STAFF"
        string content
        string sessionId FK
    }

    Account {
        string id PK
        string userId FK
        string provider
        string providerAccountId
    }

    PointHistory {
        string id PK
        string userId FK
        int points
        string type
    }

    Notification {
        string id PK
        string userId FK
        string targetRole "USER - ADMIN"
        string type
        string title
        boolean isRead
    }
```

> **Ghi chú:** Sơ đồ ERD trên hiển thị tốt nhất trên GitHub hoặc bất kỳ markdown viewer hỗ trợ Mermaid. Trong VS Code, cài extension **"Markdown Preview Mermaid Support"** để xem trực tiếp.

---
<div align="center">
  <i>Được phát triển với niềm đam mê dành cho công nghệ và trải nghiệm đỉnh cao 🚀</i>
</div>
