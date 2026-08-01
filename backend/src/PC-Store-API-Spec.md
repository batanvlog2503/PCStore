# PC Store — API Specification

Base URL giả định: `http://localhost:5000/api`
Định dạng response chuẩn hoá cho toàn bộ API (giúp frontend xử lý đồng nhất):

```json
// Thành công
{ "success": true, "data": { ... }, "message": "OK" }

// Danh sách có phân trang
{
  "success": true,
  "data": [ ... ],
  "pagination": { "page": 1, "limit": 20, "total": 137, "totalPages": 7 }
}

// Lỗi
{ "success": false, "message": "Mô tả lỗi", "errors": null }
```

Endpoint nào cần đăng nhập sẽ đánh dấu 🔒 (gửi header `Authorization: Bearer <token>`), cần quyền admin đánh dấu 🔒👑.

---

## 1. AUTH (`/auth`)

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| POST | `/auth/register` | – | Đăng ký tài khoản mới |
| POST | `/auth/login` | – | Đăng nhập, trả về access token |
| POST | `/auth/refresh` | – | Cấp lại access token từ refresh token |
| POST | `/auth/logout` | 🔒 | Vô hiệu hoá refresh token hiện tại |
| GET | `/auth/me` | 🔒 | Lấy thông tin user đang đăng nhập |

**POST `/auth/register`**
```json
// Request
{ "username": "tandev", "email": "tan@gmail.com", "phone": "0947584056", "password": "123456" }

// Response 201
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "id": "665f1a2b3c4d5e6f7a8b9c0d",
    "username": "tandev",
    "email": "tan@gmail.com",
    "role": "user",
    "status": "active"
  }
}
```

**POST `/auth/login`**
```json
// Response 200
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": "665f1a2b...", "username": "tandev", "role": "user" }
  }
}
```
Lỗi thường gặp: `401 { "message": "Sai số điện thoại hoặc mật khẩu" }`.

---

## 2. USERS (`/users`)

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/users/me` | 🔒 | Xem hồ sơ cá nhân |
| PATCH | `/users/me` | 🔒 | Cập nhật hồ sơ (email, phone...) |
| PATCH | `/users/me/password` | 🔒 | Đổi mật khẩu |
| GET | `/users` | 🔒👑 | Admin xem danh sách user |
| PATCH | `/users/:id/status` | 🔒👑 | Admin khoá/mở tài khoản |

**GET `/users/me`**
```json
{
  "success": true,
  "data": {
    "id": "665f1a2b3c4d5e6f7a8b9c0d",
    "username": "tandev",
    "email": "tan@gmail.com",
    "phone": "0947584056",
    "role": "user",
    "status": "active",
    "created_at": "2026-06-01T08:00:00.000Z"
  }
}
```

---

## 3. ADDRESSES (`/addresses`)

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/addresses` | 🔒 | Danh sách địa chỉ của user hiện tại |
| POST | `/addresses` | 🔒 | Thêm địa chỉ mới |
| PATCH | `/addresses/:id` | 🔒 | Sửa địa chỉ |
| DELETE | `/addresses/:id` | 🔒 | Xoá địa chỉ |
| PATCH | `/addresses/:id/default` | 🔒 | Đặt làm địa chỉ mặc định |

**GET `/addresses`**
```json
{
  "success": true,
  "data": [
    {
      "id": "665f2b...",
      "receiver_name": "Nguyễn Văn Tân",
      "phone": "0947584056",
      "province": "Hà Nội",
      "district": "Cầu Giấy",
      "ward": "Dịch Vọng",
      "detail": "Số 10 ngõ 5",
      "is_default": true
    }
  ]
}
```

---

## 4. CATEGORIES (`/categories`)

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/categories` | – | Danh sách danh mục dạng cây (cha-con) |
| GET | `/categories/:slug` | – | Chi tiết 1 danh mục |
| POST | `/categories` | 🔒👑 | Tạo danh mục |
| PATCH | `/categories/:id` | 🔒👑 | Sửa danh mục |
| DELETE | `/categories/:id` | 🔒👑 | Xoá danh mục |

**GET `/categories`** — trả về dạng cây, dùng cho menu "home-list-type" ở frontend:
```json
{
  "success": true,
  "data": [
    {
      "id": "665f3a...",
      "name": "Laptop",
      "slug": "laptop",
      "parent_id": null,
      "children": []
    },
    {
      "id": "665f3b...",
      "name": "Linh kiện",
      "slug": "linh-kien",
      "parent_id": null,
      "children": [
        { "id": "665f3c...", "name": "RAM", "slug": "ram", "parent_id": "665f3b..." },
        { "id": "665f3d...", "name": "SSD", "slug": "ssd", "parent_id": "665f3b..." }
      ]
    }
  ]
}
```

---

## 5. BRANDS (`/brands`)

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/brands` | – | Danh sách hãng (dùng cho phần "Máy tính Laptop" ở Home) |
| POST | `/brands` | 🔒👑 | Thêm hãng |
| PATCH | `/brands/:id` | 🔒👑 | Sửa hãng |
| DELETE | `/brands/:id` | 🔒👑 | Xoá hãng |

```json
{
  "success": true,
  "data": [
    { "id": "665f4a...", "name": "Asus", "logo_url": "/brands/asus.png" },
    { "id": "665f4b...", "name": "Dell", "logo_url": "/brands/dell.png" }
  ]
}
```

---

## 6. PRODUCTS (`/products`)

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/products` | – | Danh sách sản phẩm, hỗ trợ filter + phân trang |
| GET | `/products/:slug` | – | Chi tiết sản phẩm (kèm variants, images, brand, category) |
| POST | `/products` | 🔒👑 | Tạo sản phẩm mới |
| PATCH | `/products/:id` | 🔒👑 | Sửa sản phẩm |
| DELETE | `/products/:id` | 🔒👑 | Xoá sản phẩm |
| POST | `/products/:id/variants` | 🔒👑 | Thêm 1 variant cho sản phẩm |
| PATCH | `/products/:id/variants/:variantId` | 🔒👑 | Sửa variant (giá, tồn kho) |
| POST | `/products/:id/images` | 🔒👑 | Upload thêm ảnh sản phẩm |

**GET `/products?category=laptop&brand=asus&minPrice=10000000&maxPrice=30000000&sort=price_asc&page=1&limit=20`**

Vì giá thật nằm ở `PRODUCT_VARIANTS`, danh sách sản phẩm trả về **khoảng giá** (tính từ `MIN`/`MAX` các variant), không phải giá cố định:
```json
{
  "success": true,
  "data": [
    {
      "id": "665f5a...",
      "name": "Laptop ASUS TUF Gaming",
      "slug": "laptop-asus-tuf-gaming",
      "brand": { "name": "Asus" },
      "category": { "name": "Laptop" },
      "thumbnail": "/products/tuf-1.jpg",
      "price_range": { "min": 20000000, "max": 25000000 },
      "rating_avg": 4.5,
      "sold_count": 128,
      "status": "active"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 54, "totalPages": 3 }
}
```

**GET `/products/laptop-asus-tuf-gaming`** — chi tiết đầy đủ, populate hết quan hệ:
```json
{
  "success": true,
  "data": {
    "id": "665f5a...",
    "name": "Laptop ASUS TUF Gaming",
    "slug": "laptop-asus-tuf-gaming",
    "description": "Laptop gaming hiệu năng cao...",
    "rating_avg": 4.5,
    "sold_count": 128,
    "status": "active",
    "brand": { "id": "665f4a...", "name": "Asus", "logo_url": "/brands/asus.png" },
    "category": { "id": "665f3a...", "name": "Laptop", "slug": "laptop" },
    "images": [
      { "id": "665f6a...", "image_url": "/products/tuf-1.jpg", "is_main": true },
      { "id": "665f6b...", "image_url": "/products/tuf-2.jpg", "is_main": false }
    ],
    "variants": [
      {
        "id": "665f7a...",
        "sku": "ASUS-TUF-16-512",
        "config_name": "RAM 16GB / SSD 512GB",
        "price": 20000000,
        "discount_price": 18500000,
        "stock": 10,
        "status": "active"
      },
      {
        "id": "665f7b...",
        "sku": "ASUS-TUF-32-1TB",
        "config_name": "RAM 32GB / SSD 1TB",
        "price": 25000000,
        "discount_price": null,
        "stock": 5,
        "status": "active"
      }
    ]
  }
}
```

---

## 7. REVIEWS (`/products/:productId/reviews`)

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/products/:productId/reviews` | – | Danh sách đánh giá của sản phẩm |
| POST | `/products/:productId/reviews` | 🔒 | Viết đánh giá (chỉ khi đã mua — nên check ở Service) |
| DELETE | `/reviews/:id` | 🔒 | Xoá đánh giá của chính mình |

```json
{
  "success": true,
  "data": [
    {
      "id": "665f8a...",
      "user": { "username": "tandev" },
      "rating": 5,
      "comment": "Máy chạy mượt, đóng gói cẩn thận",
      "created_at": "2026-07-10T02:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 24, "totalPages": 3 }
}
```
Ghi chú: sau khi tạo review thành công, Service nên **tính lại `rating_avg`** của `PRODUCTS` (trung bình cộng tất cả review) — đây là lý do `rating_avg` để ở `PRODUCTS` chứ không tính động mỗi lần gọi API (tối ưu tốc độ đọc).

---

## 8. WISHLIST (`/wishlist`)

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/wishlist` | 🔒 | Danh sách sản phẩm yêu thích |
| POST | `/wishlist/:productId` | 🔒 | Thêm vào yêu thích |
| DELETE | `/wishlist/:productId` | 🔒 | Bỏ yêu thích |

```json
{
  "success": true,
  "data": [
    {
      "product_id": "665f5a...",
      "name": "Laptop ASUS TUF Gaming",
      "thumbnail": "/products/tuf-1.jpg",
      "price_range": { "min": 18500000, "max": 25000000 }
    }
  ]
}
```

---

## 9. CART (`/cart`)

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/cart` | 🔒 | Xem giỏ hàng hiện tại |
| POST | `/cart/items` | 🔒 | Thêm sản phẩm (kèm variant) vào giỏ |
| PATCH | `/cart/items/:itemId` | 🔒 | Đổi số lượng |
| DELETE | `/cart/items/:itemId` | 🔒 | Xoá 1 dòng khỏi giỏ |
| DELETE | `/cart` | 🔒 | Xoá sạch giỏ hàng |

**GET `/cart`** — nên populate sẵn thông tin sản phẩm/variant để frontend không phải gọi thêm API:
```json
{
  "success": true,
  "data": {
    "id": "665f9a...",
    "items": [
      {
        "id": "665f9b...",
        "product": { "id": "665f5a...", "name": "Laptop ASUS TUF Gaming", "thumbnail": "/products/tuf-1.jpg" },
        "variant": { "id": "665f7a...", "config_name": "RAM 16GB / SSD 512GB", "price": 20000000, "discount_price": 18500000 },
        "quantity": 2,
        "line_total": 37000000
      }
    ],
    "total": 37000000
  }
}
```
Lỗi cần xử lý riêng: `400 { "message": "Số lượng vượt quá tồn kho (còn 1 sản phẩm)" }` khi `quantity` > `variant.stock`.

---

## 10. VOUCHERS (`/vouchers`)

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/vouchers` | 🔒 | Danh sách voucher user có thể dùng |
| POST | `/vouchers/apply` | 🔒 | Kiểm tra + áp mã giảm giá vào đơn đang tính |
| POST | `/vouchers` | 🔒👑 | Tạo voucher |
| PATCH | `/vouchers/:id` | 🔒👑 | Sửa voucher |

**POST `/vouchers/apply`**
```json
// Request
{ "code": "SUMMER10", "order_total": 20000000 }

// Response 200 — hợp lệ
{
  "success": true,
  "data": { "code": "SUMMER10", "discount_type": "percent", "discount_value": 10, "discount_amount": 2000000, "final_total": 18000000 }
}

// Response 400 — không hợp lệ
{ "success": false, "message": "Đơn hàng chưa đạt giá trị tối thiểu 25.000.000đ để áp mã này" }
```

---

## 11. ORDERS (`/orders`)

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| POST | `/orders` | 🔒 | Tạo đơn hàng (checkout từ giỏ hàng) |
| GET | `/orders` | 🔒 | Danh sách đơn hàng của tôi |
| GET | `/orders/:id` | 🔒 | Chi tiết 1 đơn hàng |
| PATCH | `/orders/:id/cancel` | 🔒 | Huỷ đơn (chỉ khi status = pending) |
| GET | `/admin/orders` | 🔒👑 | Admin xem tất cả đơn |
| PATCH | `/admin/orders/:id/status` | 🔒👑 | Admin cập nhật trạng thái vận chuyển |

**POST `/orders`**
```json
// Request
{
  "address_id": "665f2b...",
  "voucher_code": "SUMMER10",
  "payment_method": "cod",
  "items": [
    { "product_id": "665f5a...", "variant_id": "665f7a...", "quantity": 1 }
  ]
}

// Response 201
{
  "success": true,
  "message": "Đặt hàng thành công",
  "data": {
    "id": "665faa...",
    "order_code": "PCS20260731001",
    "status": "pending",
    "total_amount": 18500000,
    "payment_method": "cod",
    "created_at": "2026-07-31T09:00:00.000Z"
  }
}
```
Logic quan trọng cần làm trong Service khi checkout (không phải chỉ insert đơn giản):
1. Kiểm tra `variant.stock >= quantity` cho từng item — hết hàng thì trả lỗi ngay.
2. **Đóng băng giá**: copy `variant.discount_price ?? variant.price` sang `order_items.price` tại thời điểm này.
3. Trừ `variant.stock -= quantity`.
4. Toàn bộ 4 bước trên nên nằm trong 1 **MongoDB transaction** (`session.startTransaction()`) — nếu bước trừ stock lỗi giữa chừng, phải rollback lại đơn hàng vừa tạo.

**GET `/orders/:id`**
```json
{
  "success": true,
  "data": {
    "id": "665faa...",
    "order_code": "PCS20260731001",
    "status": "shipping",
    "total_amount": 18500000,
    "address": { "receiver_name": "Nguyễn Văn Tân", "phone": "0947584056", "detail": "Số 10 ngõ 5, Dịch Vọng, Cầu Giấy, Hà Nội" },
    "items": [
      {
        "product_name": "Laptop ASUS TUF Gaming",
        "variant_config": "RAM 16GB / SSD 512GB",
        "quantity": 1,
        "price": 18500000
      }
    ],
    "payment": { "method": "cod", "status": "pending" },
    "created_at": "2026-07-31T09:00:00.000Z"
  }
}
```

---

## 12. PAYMENTS (`/payments`)

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| POST | `/payments/:orderId` | 🔒 | Khởi tạo thanh toán (COD tự tạo record, online thì trả link thanh toán) |
| POST | `/payments/webhook/:provider` | – | Webhook callback từ cổng thanh toán (Momo/VNPay) |
| GET | `/payments/:orderId` | 🔒 | Xem trạng thái thanh toán của 1 đơn |

**POST `/payments/:orderId`** (giả sử phương thức online)
```json
{
  "success": true,
  "data": {
    "payment_url": "https://sandbox.vnpayment.vn/paymentv2/...",
    "order_id": "665faa...",
    "amount": 18500000
  }
}
```

⚠️ Endpoint `/payments/webhook/:provider` **không đánh dấu 🔒** vì cổng thanh toán bên thứ 3 gọi vào, không có JWT của user — nhưng **phải xác thực bằng chữ ký (signature) riêng của từng cổng** (VD: VNPay dùng `vnp_SecureHash`), nếu không ai cũng có thể giả request để đánh dấu đơn "đã thanh toán" mà không trả tiền thật — đây là lỗ hổng bảo mật thường gặp nhất khi làm tích hợp thanh toán.

---

## Tổng số endpoint: 45

Thứ tự nên code trước — sau, dựa theo mức độ phụ thuộc dữ liệu (đã nói ở phần trước): **Auth → Category/Brand → Product (+ Variant/Image) → Cart → Order → Payment → Review/Wishlist/Voucher** (2 nhóm cuối không phụ thuộc, làm lúc nào cũng được).
