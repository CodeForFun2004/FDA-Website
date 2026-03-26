# FE-42: Publish News & Announcements – Frontend Guide

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Business Flow](#2-business-flow)
3. [Announcement Status](#3-announcement-status)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [API Endpoints](#5-api-endpoints)
6. [Request/Response Details](#6-requestresponse-details)
7. [Pagination](#7-pagination)
8. [Error Handling](#8-error-handling)
9. [UI Implementation Guide](#9-ui-implementation-guide)
10. [Common Scenarios](#10-common-scenarios)

---

## 1. Tổng quan

### FE-42 là gì?

FE-42 cho phép **Admin/MODERATOR** tạo và quản lý các bài thông báo (Announcements) gửi đến người dùng. Mỗi announcement có thể:

- Được **publish ngay lập tức**
- Được **đặt lịch** để tự động publish vào thời điểm chỉ định
- Được **chỉnh sửa** nếu chưa publish
- Được **xóa** (vĩnh viễn nếu chưa publish, mềm nếu đã publish)

### Phân biệt Announcements vs Notifications

| | Announcements (FE-42) | Notifications (FE-98) |
|---|---|---|
| **Nguồn** | Admin tạo thủ công | Hệ thống tạo tự động |
| **Mục đích** | Tin tức, thông báo chung | Cảnh báo lũ lụt |
| **Tab trên UI** | Tab "Thông báo" | Tab "Cảnh báo" |
| **Endpoint** | `/api/v1/admin/announcements` | `/api/v1/notifications/history` |

---

## 2. Business Flow

### Tạo Announcement

```
[Admin tạo bài]
        │
        ├── ScheduledAt = null
        │       └── Status: "published" → Hiển thị ngay cho user
        │
        └── ScheduledAt = thời gian tương lai
                └── Status: "pending" → Chờ auto-publish
                         └── [Hangfire job chạy mỗi 1 phút]
                                 └── Status: "published" → Hiển thị cho user
```

### Chỉnh sửa Announcement

```
Chỉ sửa được khi Status = "draft" hoặc "pending"
Không sửa được khi Status = "published" hoặc "cancelled"
```

### Xóa Announcement

```
Status = "draft" hoặc "pending" → Xóa vĩnh viễn (hard delete)
Status = "published" hoặc "cancelled" → Xóa mềm (is_deleted = true)
```

---

## 3. Announcement Status

| Status | Mô tả | Được sửa? | Được xóa? | Loại xóa |
|--------|--------|:---:|:---:|---|
| `draft` | Bản nháp, chưa lên lịch | ✅ | ✅ | Hard delete |
| `pending` | Đã đặt lịch publish | ✅ | ✅ | Hard delete |
| `published` | Đã publish, hiển thị public | ❌ | ✅ | Soft delete |
| `cancelled` | Đã hủy | ❌ | ✅ | Soft delete |

---

## 4. User Roles & Permissions

### Ai có quyền gì?

| Action | ADMIN | MODERATOR | USER |
|--------|:---:|:---:|:---:|
| Tạo announcement | ✅ | ✅ | ❌ |
| Sửa announcement | ✅ | ✅ | ❌ |
| Publish ngay | ✅ | ✅ | ❌ |
| Xem danh sách (admin) | ✅ | ❌ | ❌ |
| Xóa announcement | ✅ | ❌ | ❌ |
| Xem announcement (public) | ✅ | ✅ | ✅ |

**Lưu ý:**
- **MODERATOR** có thể tạo/sửa/publish nhưng **không** xem danh sách và **không** xóa
- **USER** không có quyền quản lý, chỉ xem announcements đã publish (thông qua FE-43)

---

## 5. API Endpoints

### Tổng kết

| Method | Endpoint | Auth | Mục đích |
|--------|----------|------|----------|
| `POST` | `/api/v1/admin/announcements` | ADMIN, MODERATOR | Tạo announcement |
| `GET` | `/api/v1/admin/announcements` | ADMIN only | Danh sách tất cả announcements |
| `PUT` | `/api/v1/admin/announcements/{id}` | ADMIN, MODERATOR | Chỉnh sửa announcement |
| `POST` | `/api/v1/admin/announcements/{id}/publish` | ADMIN, MODERATOR | Publish ngay lập tức |
| `DELETE` | `/api/v1/admin/announcements/{id}` | ADMIN only | Xóa announcement |

### Base URL

```
http://localhost:5000/api/v1
```

### Auth Header

```http
Authorization: Bearer {JWT_TOKEN}
```

---

## 6. Request/Response Details

### 6.1 Tạo Announcement – `POST /api/v1/admin/announcements`

**Quyền:** ADMIN, MODERATOR

#### Request Body

```json
{
  "title": "Cảnh báo ngập lụt Q7",
  "content": "Mực nước sông Sài Gòn dâng cao, dự báo ngập 1-2m trong 6h tới.",
  "summary": "Cảnh báo ngập lụt cho khu vực Q7, TP.HCM",
  "imageUrl": "https://storage.example.com/flood-alert-q7.jpg",
  "attachments": "[\"https://storage.example.com/evacuation-map.pdf\"]",
  "scheduledAt": "2026-03-26T02:00:00Z",
  "target": "all",
  "targetValue": null,
  "priority": "high"
}
```

#### Giải thích từng trường

| Field | Kiểu | Bắt buộc | Mặc định | Giải thích |
|-------|------|:---:|--------|-------------|
| `title` | string | ✅ | — | Tiêu đề announcement (tối đa 200 ký tự) |
| `content` | string | ✅ | — | Nội dung đầy đủ (tối đa 10,000 ký tự), hỗ trợ HTML |
| `summary` | string? | ❌ | null | Mô tả ngắn cho danh sách (tối đa 500 ký tự) |
| `imageUrl` | string? | ❌ | null | URL hình ảnh đại diện (tối đa 1000 ký tự) |
| `attachments` | string? | ❌ | null | JSON array của URLs, ví dụ: `"[\"url1.pdf\",\"url2.jpg\"]"` |
| `scheduledAt` | DateTime? | ❌ | null | Thời điểm publish tự động (ISO 8601). **null** = publish ngay |
| `target` | string | ✅ | `"all"` | Đối tượng nhận: `"all"` \| `"region"` \| `"role"` |
| `targetValue` | string? | ❌ | null | Giá trị cụ thể: region code (VD: `"HCM"`) hoặc role name (VD: `"ADMIN"`) |
| `priority` | string | ✅ | `"normal"` | Độ ưu tiên: `"low"` \| `"normal"` \| `"high"` \| `"urgent"` |

#### Các giá trị hợp lệ của `target`

| target | Mô tả | targetValue |
|--------|--------|-------------|
| `"all"` | Gửi tất cả user | null |
| `"region"` | Gửi theo khu vực | Mã khu vực (VD: `"HCM"`, `"HN"`) |
| `"role"` | Gửi theo role | Tên role (VD: `"USER"`, `"MODERATOR"`) |

#### Các giá trị hợp lệ của `priority`

| Priority | Màu sắc gợi ý | Mô tả |
|----------|----------------|--------|
| `"low"` | Xám | Thông tin ít quan trọng |
| `"normal"` | Xanh dương | Thông báo thông thường |
| `"high"` | Cam | Cảnh báo quan trọng |
| `"urgent"` | Đỏ | Khẩn cấp, cần hành động ngay |

#### Response (201 Created)

```json
{
  "success": true,
  "message": "Announcement created and published successfully",
  "statusCode": 201,
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "Cảnh báo ngập lụt Q7",
    "summary": "Cảnh báo ngập lụt cho khu vực Q7, TP.HCM",
    "imageUrl": "https://storage.example.com/flood-alert-q7.jpg",
    "status": "published",
    "scheduledAt": null,
    "publishedAt": "2026-03-24T10:00:00Z",
    "target": "all",
    "targetValue": null,
    "priority": "high",
    "createdAt": "2026-03-24T10:00:00Z",
    "authorName": "admin@fda.vn"
  }
}
```

#### Logic tự động khi tạo

- **`scheduledAt = null`** → `status = "published"`, `publishedAt = now`
- **`scheduledAt = thời gian future`** → `status = "pending"`, chờ auto-publish

---

### 6.2 Danh sách Announcements – `GET /api/v1/admin/announcements`

**Quyền:** ADMIN only (MODERATOR không được phép)

#### Query Parameters

| Parameter | Kiểu | Mặc định | Mô tả |
|-----------|------|-----------|--------|
| `status` | string? | null | Filter theo status: `"draft"`, `"pending"`, `"published"`, `"cancelled"` |
| `priority` | string? | null | Filter theo priority: `"low"`, `"normal"`, `"high"`, `"urgent"` |
| `startDate` | DateTime? | null | Lọc từ ngày (ISO 8601) |
| `endDate` | DateTime? | null | Lọc đến ngày (ISO 8601) |
| `search` | string? | null | Tìm kiếm trong title, content, summary |
| `page` | int | 1 | Số trang |
| `pageSize` | int | 20 | Số item mỗi trang (max: 100) |
| `sortBy` | string | `"created_at"` | Sắp xếp theo: `"created_at"`, `"published_at"`, `"title"` |
| `sortOrder` | string | `"desc"` | Thứ tự: `"asc"` \| `"desc"` |

#### Ví dụ

```http
GET /api/v1/admin/announcements?status=pending&page=1&pageSize=10&sortBy=created_at&sortOrder=desc
Authorization: Bearer {adminToken}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Retrieved 10 announcements",
  "statusCode": 200,
  "data": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "title": "Thông báo bảo trì hệ thống",
      "summary": "Bảo trì hệ thống định kỳ",
      "imageUrl": null,
      "content": "Hệ thống sẽ ngừng hoạt động...",
      "attachments": "[\"https://storage.example.com/guide.pdf\"]",
      "status": "pending",
      "scheduledAt": "2026-03-26T02:00:00Z",
      "publishedAt": null,
      "target": "all",
      "targetValue": null,
      "priority": "normal",
      "createdAt": "2026-03-24T10:00:00Z",
      "authorName": "admin@fda.vn",
      "viewCount": 0,
      "deliveryCount": 0,
      "readCount": 0
    }
  ],
  "totalCount": 25,
  "page": 1,
  "pageSize": 10,
  "totalPages": 3
}
```

#### Giải thích các trường trong response

| Field | Mô tả |
|-------|--------|
| `data[*].id` | GUID unique của announcement |
| `data[*].status` | Trạng thái hiện tại |
| `data[*].scheduledAt` | Thời gian đặt lịch (null nếu publish ngay) |
| `data[*].publishedAt` | Thời gian thực tế publish (null nếu chưa publish) |
| `data[*].viewCount` | Số lượt xem |
| `data[*].deliveryCount` | Số notification đã gửi |
| `data[*].readCount` | Số user đã đọc |
| `totalCount` | Tổng số announcements matching filter |
| `totalPages` | Tổng số trang |

---

### 6.3 Chỉnh sửa Announcement – `PUT /api/v1/admin/announcements/{id}`

**Quyền:** ADMIN, MODERATOR

**Quan trọng:** Chỉ sửa được khi `status = "draft"` hoặc `"pending"`.

#### Path Parameter

| Parameter | Kiểu | Mô tả |
|-----------|------|--------|
| `id` | GUID | ID của announcement cần sửa |

#### Request Body

```json
{
  "title": "Thông báo bảo trì hệ thống - Cập nhật",
  "content": "Hệ thống sẽ ngừng hoạt động vào 03:00-05:00 ngày 26/03/2026.",
  "summary": "Bảo trì hệ thống - thời gian gia hạn",
  "imageUrl": null,
  "attachments": null,
  "scheduledAt": "2026-03-26T03:00:00Z",
  "target": "all",
  "targetValue": null,
  "priority": "high"
}
```

#### Giải thích

- **Tất cả các trường đều optional** — chỉ gửi những trường cần thay đổi (partial update supported)
- Khi `scheduledAt` được cập nhật:
  - Giá trị mới → `status = "pending"`
  - `null` → `status = "published"`, `publishedAt = now`
- Khi `scheduledAt` thay đổi sang thời gian mới → reset về `pending`

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Announcement updated successfully",
  "statusCode": 200,
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "Thông báo bảo trì hệ thống - Cập nhật",
    "status": "pending",
    "scheduledAt": "2026-03-26T03:00:00Z",
    "priority": "high"
  }
}
```

#### Error Cases

| HTTP | Message | Nguyên nhân |
|------|---------|-------------|
| 400 | `Cannot edit a published announcement` | Announcement đã publish |
| 400 | `Cannot edit a cancelled announcement` | Announcement đã bị hủy |
| 404 | `Announcement not found` | ID không tồn tại |

---

### 6.4 Publish ngay – `POST /api/v1/admin/announcements/{id}/publish`

**Quyền:** ADMIN, MODERATOR

**Lưu ý:** Endpoint này **không có request body**. ID được lấy từ URL.

#### Path Parameter

| Parameter | Kiểu | Mô tả |
|-----------|------|--------|
| `id` | GUID | ID của announcement cần publish |

#### Request

```http
POST /api/v1/admin/announcements/3fa85f64-5717-4562-b3fc-2c963f66afa6/publish
Authorization: Bearer {adminToken}
Content-Type: application/json

{}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Announcement published successfully",
  "statusCode": 200,
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "status": "published",
    "publishedAt": "2026-03-24T10:05:00Z",
    "scheduledAt": null
  }
}
```

#### Side Effects

Khi publish thành công:
1. `status` → `"published"`
2. `publishedAt` → thời gian hiện tại
3. `scheduledAt` → `null`
4. **Notifications** được gửi đến users theo `target` và `targetValue`

#### Error Cases

| HTTP | Message | Nguyên nhân |
|------|---------|-------------|
| 400 | `Announcement is already published` | Đã publish rồi |
| 400 | `Cannot publish a cancelled announcement` | Đã bị hủy trước đó |
| 404 | `Announcement not found` | ID không tồn tại |

---

### 6.5 Xóa Announcement – `DELETE /api/v1/admin/announcements/{id}`

**Quyền:** ADMIN only (MODERATOR không được phép)

**Lưu ý:** Không có request body. ID được lấy từ URL.

#### Path Parameter

| Parameter | Kiểu | Mô tả |
|-----------|------|--------|
| `id` | GUID | ID của announcement cần xóa |

#### Request

```http
DELETE /api/v1/admin/announcements/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer {adminToken}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Announcement deleted successfully",
  "statusCode": 200
}
```

#### Logic xóa

| Status | Hành vi |
|--------|---------|
| `draft` / `pending` | **Hard delete** — xóa vĩnh viễn khỏi database |
| `published` / `cancelled` | **Soft delete** — đánh dấu `is_deleted = true`, không hiển thị nữa |

#### Error Cases

| HTTP | Message |
|------|---------|
| 404 | `Announcement not found` |

---

## 7. Pagination

Tất cả endpoints trả về danh sách đều hỗ trợ pagination:

```json
{
  "data": [ ... ],
  "totalCount": 25,
  "page": 1,
  "pageSize": 10,
  "totalPages": 3
}
```

#### Cách tính

```
totalPages = ceil(totalCount / pageSize)
```

#### Ví dụ

- `totalCount = 25`, `pageSize = 10` → `totalPages = 3`
- Page 1: items 1-10
- Page 2: items 11-20
- Page 3: items 21-25

---

## 8. Error Handling

### HTTP Status Codes

| HTTP | Ý nghĩa |
|------|---------|
| 200 | Thành công |
| 201 | Tạo mới thành công |
| 400 | Bad Request (validation failed, business rule violation) |
| 401 | Unauthorized (không có token hoặc token hết hạn) |
| 403 | Forbidden (đúng token nhưng không có quyền) |
| 404 | Not Found |
| 500 | Internal Server Error |

### Validation Errors (400)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "Title", "message": "Title is required." },
    { "field": "Priority", "message": "Priority must be 'low', 'normal', 'high', or 'urgent'." },
    { "field": "ScheduledAt", "message": "ScheduledAt must be in the future." }
  ]
}
```

### Business Rule Errors (400)

```json
{
  "success": false,
  "message": "Cannot edit a published announcement",
  "statusCode": 400,
  "data": null
}
```

---

## 9. UI Implementation Guide

### 9.1 Trang quản lý Announcements (Admin Dashboard)

#### Screen: Danh sách

```
┌─────────────────────────────────────────────────────────┐
│ Quản lý Thông báo                              [+ Tạo] │
├─────────────────────────────────────────────────────────┤
│ [Tất cả] [Draft] [Pending] [Published] [Cancelled]     │
│                                                         │
│ [🔍 Tìm kiếm...] [Lọc: Priority ▼] [Ngày: ... → ...]  │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🟡 [PENDING]  Thông báo bảo trì hệ thống           │ │
│ │ Schedule: 26/03/2026 02:00  |  Priority: Normal     │ │
│ │ View: 0  |  Delivery: 0  |  Read: 0                │ │
│ │                                    [Edit] [Publish] │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🟢 [PUBLISHED] Cảnh báo ngập lụt Q7                │ │
│ │ Published: 24/03/2026 10:00  |  Priority: High      │ │
│ │ View: 156  |  Delivery: 200  |  Read: 89            │ │
│ │                                              [Delete]│ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Showing 1-10 of 25          [<] [1] [2] [3] [>]        │
└─────────────────────────────────────────────────────────┘
```

#### Screen: Tạo/Sửa Announcement

```
┌─────────────────────────────────────────────────────────┐
│ Tạo Thông báo                                          │
├─────────────────────────────────────────────────────────┤
│ Tiêu đề *                    [________________]        │
│                                                         │
│ Tóm tắt                      [________________]        │
│                                                         │
│ Nội dung * (hỗ trợ HTML)                                │
│ ┌───────────────────────────────────────────────────┐  │
│ │ <textarea>                                        │  │
│ │                                                   │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ Hình ảnh đại diện              [________________]      │
│                                                         │
│ Tệp đính kèm (JSON URLs)    [________________]          │
│                                                         │
│ Đối tượng nhận *                                       │
│ ○ Tất cả  ○ Theo khu vực  ○ Theo vai trò               │
│                                                         │
│ Độ ưu tiên *                                           │
│ ○ Low  ● Normal  ○ High  ○ Urgent                      │
│                                                         │
│ ☐ Đặt lịch publish                                      │
│    Ngày: [__/__/____]  Giờ: [__:__]                   │
│                                                         │
│                    [Hủy]              [Tạo / Lưu]       │
└─────────────────────────────────────────────────────────┘
```

### 9.2 Lưu ý quan trọng khi implement

1. **Luôn check `status` trước khi hiển thị nút hành động:**
   - Nút "Edit" chỉ hiện khi `status = "draft"` hoặc `"pending"`
   - Nút "Publish Now" chỉ hiện khi `status = "draft"` hoặc `"pending"`
   - Nút "Delete" chỉ hiện khi user có role ADMIN

2. **Xử lý ảnh và file đính kèm:**
   - `imageUrl` và `attachments` là string URLs, không phải file upload
   - FE cần upload file lên storage service riêng, nhận về URL, rồi gửi URL lên API
   - `attachments` phải được format thành JSON string: `"[\"url1\",\"url2\"]"`

3. **Timezone:**
   - API sử dụng **UTC** (DateTime được lưu và trả về theo UTC)
   - FE cần convert sang **Asia/Ho_Chi_Minh (UTC+7)** khi hiển thị

4. **Real-time updates:**
   - Khi announcement được publish (bởi user khác hoặc scheduler), danh sách admin nên được refresh
   - Cân nhắc sử dụng SignalR/SSE để notify admin khi có thay đổi

5. **Rich text editor cho `content`:**
   - Backend không sanitize HTML
   - FE nên dùng rich text editor hỗ trợ: bold, italic, link, list, heading
   - Khuyến nghị: Quill, TinyMCE, hoặc TipTap

---

## 10. Common Scenarios

### Scenario 1: Tạo và publish ngay lập tức

```javascript
// 1. Admin nhấn "Tạo" → POST với scheduledAt = null
const createRes = await fetch('/api/v1/admin/announcements', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Cảnh báo ngập lụt Q7',
    content: '<p>Mực nước sông dâng cao...</p>',
    summary: 'Cảnh báo ngập lụt Q7',
    target: 'all',
    priority: 'high',
    scheduledAt: null  // Publish ngay
  })
});

// Response: status = "published", publishedAt = now
// Notifications được gửi tự động
```

### Scenario 2: Tạo với lịch publish

```javascript
// 1. Tạo announcement với scheduledAt
const createRes = await fetch('/api/v1/admin/announcements', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Thông báo bảo trì hệ thống',
    content: '<p>Hệ thống sẽ bảo trì...</p>',
    target: 'all',
    priority: 'normal',
    scheduledAt: '2026-03-26T02:00:00Z'  // Đặt lịch
  })
});

// Response: status = "pending", chờ scheduler
// 2. Sau đó Admin có thể chỉnh sửa nếu cần
// 3. Hoặc Admin nhấn "Publish Now" để publish trước
// 4. Hoặc đợi Hangfire job chạy mỗi 1 phút để auto-publish
```

### Scenario 3: Admin lọc xem announcements

```javascript
// 1. Xem tất cả pending
const pendingRes = await fetch(
  '/api/v1/admin/announcements?status=pending&page=1&pageSize=20',
  { headers: { 'Authorization': `Bearer ${token}` } }
);

// 2. Tìm kiếm trong title
const searchRes = await fetch(
  '/api/v1/admin/announcements?search=ngap&page=1&pageSize=20',
  { headers: { 'Authorization': `Bearer ${token}` } }
);

// 3. Xem high priority, sắp xếp theo ngày tạo
const highRes = await fetch(
  '/api/v1/admin/announcements?priority=high&sortBy=created_at&sortOrder=desc',
  { headers: { 'Authorization': `Bearer ${token}` } }
);
```

### Scenario 4: Xóa announcement đã publish

```javascript
// 1. Xác nhận với user trước khi xóa (vì là soft delete)
// 2. Gọi DELETE
const deleteRes = await fetch(
  '/api/v1/admin/announcements/{id}',
  {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  }
);

// 3. Announcement vẫn còn trong DB nhưng không hiển thị nữa
// 4. Response message: "Announcement deleted (soft delete)"
```

### Scenario 5: Xử lý lỗi validation

```javascript
async function createAnnouncement(data) {
  const res = await fetch('/api/v1/admin/announcements', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  const body = await res.json();

  if (body.errors) {
    // Validation errors
    const errorMap = {};
    for (const err of body.errors) {
      errorMap[err.field] = err.message;
    }
    return { success: false, errors: errorMap };
  }

  if (!body.success) {
    // Business rule error
    return { success: false, message: body.message };
  }

  return { success: true, data: body.data };
}
```

---

## Checklist cho Frontend Developer

- [ ] Gọi API với đúng Authorization header
- [ ] Validate `priority` phải là `"low"`, `"normal"`, `"high"`, `"urgent"`
- [ ] Validate `target` phải là `"all"`, `"region"`, `"role"`
- [ ] Format `scheduledAt` theo ISO 8601 (UTC)
- [ ] Format `attachments` thành JSON string
- [ ] Hiển thị nút Edit/Publish/Delete theo đúng `status`
- [ ] Kiểm tra role trước khi gọi API (tránh 403)
- [ ] Xử lý pagination đầy đủ
- [ ] Convert UTC sang local timezone khi hiển thị ngày giờ
- [ ] Hiển thị error messages từ API cho user
- [ ] Rich text editor cho trường `content`
- [ ] Preview images trước khi submit (nếu có `imageUrl`)
- [ ] Confirm dialog trước khi delete
