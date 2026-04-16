# FE-48: View Operational Logs – Frontend Business Guide

## 1) FE-48 dùng để làm gì trong sản phẩm?

FE-48 là màn hình **nhật ký vận hành hệ thống** cho Admin/Authority để:

- Điều tra sự cố (vì sao job fail, station offline, alert xử lý ra sao)
- Theo dõi hoạt động theo thời gian thực tế
- Truy vết hành động hệ thống hoặc user
- Export logs để audit / báo cáo

Nói ngắn gọn: FE-48 là trang **observability + audit trail** cho backend operations.

---

## 2) Ai dùng và quyền nghiệp vụ

## Role matrix

| Chức năng | ADMIN/SUPERADMIN | AUTHORITY |
|---|---:|---:|
| Xem list logs | ✅ | ✅ (giới hạn category) |
| Xem detail log | ✅ | ✅ |
| Export logs | ✅ | ✅ |
| Xem category `system`/`moderation` | ✅ | ❌ |
| Xem category `alert`/`sensor` | ✅ | ✅ |

No token => `401`.

---

## 3) API 1 – View logs list

## 3.1 Endpoint

```http
GET /api/v1/admin/logs
Authorization: Bearer {token}
```

## 3.2 API này để xử lý gì?

API này phục vụ màn hình bảng logs với:
- filter
- sort
- pagination

FE gọi API này khi:
- mở trang lần đầu
- đổi filter/date
- đổi trang
- search text

---

## 3.3 Query params và ý nghĩa

| Param | Ý nghĩa nghiệp vụ | Ví dụ |
|---|---|---|
| `category` | Nhóm log cần xem | `system`, `alert`, `sensor`, `moderation` |
| `action` | Event cụ thể | `job_completed`, `job_failed`, `alert_triggered` |
| `level` | Mức độ nghiêm trọng | `info`, `warning`, `error` |
| `userId` | Truy vết theo user | guid |
| `entityId` | Truy vết theo entity | guid |
| `entityType` | Loại entity | `Station`, `Alert`, ... |
| `fromDate` / `toDate` | Khoảng thời gian | UTC ISO |
| `searchText` | Tìm text trong details/error | `alert`, `timeout` |
| `page` | Trang hiện tại | `1` |
| `pageSize` | Số dòng/trang | `20`, `50` |
| `orderBy` | Cột sort | `CreatedAt`, `Action`, `Category`, `Level` |
| `orderDescending` | Thứ tự sort | `true/false` |

Validation backend:
- page >= 1
- pageSize 1..100
- category/level/orderBy phải thuộc danh sách cho phép

---

## 3.4 Response list và ý nghĩa field

```json
{
  "success": true,
  "message": "Retrieved 5 logs (total: 48)",
  "statusCode": 200,
  "data": {
    "items": [ ... ],
    "page": 1,
    "pageSize": 5,
    "totalCount": 48,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

Mỗi `item`:

| Field | Ý nghĩa |
|---|---|
| `id` | ID log record |
| `category` | Nhóm nghiệp vụ của log |
| `action` | Event đã xảy ra |
| `level` | Mức severity |
| `userId/userName` | User liên quan (nếu có) |
| `entityId/entityType` | Thực thể liên quan (station/alert/...) |
| `ipAddress` | IP nếu có |
| `details` | Metadata chính của event (JSON/object/string) |
| `errorMessage` | Lỗi chi tiết nếu event fail |
| `createdAt` | Thời điểm xảy ra |

---

## 4) API 2 – View log detail

## 4.1 Endpoint

```http
GET /api/v1/admin/logs/{id}
```

## 4.2 API này để xử lý gì?

Dùng khi user click 1 dòng trong table để mở drawer/modal detail.

Hiển thị:
- toàn bộ fields đầy đủ
- pretty JSON cho `details`
- copy raw payload

## 4.3 Kết quả thực tế cần FE handle

- ID tồn tại: `200` + JSON detail
- ID không tồn tại: `404` với body rỗng

=> FE phải check `res.status === 404` trước khi `res.json()`.

---

## 5) API 3 – Export logs

## 5.1 Endpoint

```http
GET /api/v1/admin/logs/export?format=csv
GET /api/v1/admin/logs/export?format=json
```

Có thể kèm filter giống API list (category/fromDate/toDate...).

## 5.2 API này để xử lý gì?

- Tạo dữ liệu tải về cho audit/report
- Cho phép team Ops phân tích offline

## 5.3 Behavior hiện tại (rất quan trọng)

API export trả về **JSON wrapper**, KHÔNG trả file attachment trực tiếp.

```json
{
  "success": true,
  "message": "Exported 62 logs",
  "statusCode": 200,
  "data": "...csv or json string..."
}
```

FE phải:
1. parse JSON wrapper
2. lấy `data` string
3. tự tạo Blob để download file client-side

---

## 6) Gợi ý UI phù hợp với nghiệp vụ

## 6.1 Màn hình list

- Filter bar (category, level, date range, search)
- Table logs
- Pagination
- Export buttons (CSV/JSON)

Cột gợi ý ưu tiên:
- CreatedAt
- Level (badge màu)
- Category
- Action
- UserName
- EntityType
- Error indicator

## 6.2 Màu severity

- `info`: xanh/neutral
- `warning`: vàng/cam
- `error`: đỏ

## 6.3 Detail drawer

Section gợi ý:
1. Thông tin cơ bản
2. Context (user/entity/ip)
3. Details JSON
4. Error message

---

## 7) FE flow thực tế

1. Load lần đầu: gọi list với `page=1&pageSize=50&orderBy=CreatedAt&orderDescending=true`
2. User đổi filter -> reset `page=1` -> gọi lại
3. User click row -> gọi detail
4. User export -> gọi export + download blob

Pseudo code:

```ts
async function fetchOperationalLogs(filters) {
  const q = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
  });

  const res = await fetch(`/api/v1/admin/logs?${q.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (res.status === 403) throw new Error('FORBIDDEN');

  const body = await res.json();
  if (!res.ok || !body.success) throw new Error(body.message || 'LOAD_LOGS_FAILED');

  return body.data;
}

async function exportOperationalLogs(format: 'csv' | 'json', filters) {
  const q = new URLSearchParams({ ...filters, format });
  const res = await fetch(`/api/v1/admin/logs/export?${q.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const body = await res.json();
  if (!res.ok || !body.success) throw new Error(body.message || 'EXPORT_FAILED');

  const blob = new Blob([body.data], {
    type: format === 'json' ? 'application/json' : 'text/csv'
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `operational_logs.${format}`;
  a.click();
  URL.revokeObjectURL(url);
}
```

---

## 8) Error handling checklist

- `400`: map `errors[]` vào UI filter validation
- `401`: redirect login
- `403`: show “Bạn không có quyền truy cập logs này”
- `404` (detail): show “Log không tồn tại hoặc đã bị xóa”
- `500`: show retry banner

---

## 9) Lưu ý tích hợp quan trọng

1. Date params nên dùng UTC (`...Z`).
2. `details` có thể object hoặc string -> FE render fallback an toàn.
3. Authority role: nên ẩn `system`/`moderation` khỏi category filter để tránh 403.
4. Export không phải file stream -> phải tải bằng Blob từ `data` string.
