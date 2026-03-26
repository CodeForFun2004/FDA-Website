# FE-33: Hiệu chuẩn Cảm biến (Calibrate Sensor Data)

## 1. Tổng quan

**Mục tiêu:** Hiển thị thông tin sai số của thiết bị đo cho người dùng biết.

**Nghiệp vụ (đã đơn giản hóa):**
- Station có thêm thuộc tính `CalibrationOffset` để lưu offset hiển thị sai số
- Admin có thể cập nhật offset này (mặc định 5cm)
- **CHỈ ĐỂ HIỂN THỊ** - Không ảnh hưởng đến bất kỳ logic tính toán nào
- Không cần lưu lịch sử calibration
- Không cần rollback

---

## 2. Business Flow

### 2.1. Flow cập nhật Calibration

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ADMIN CẬP NHẬT CALIBRATION                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Admin vào trang quản lý station                                      │
│  → Click "Cập nhật Calibration"                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Hiển thị form với giá trị hiện tại (default: 5cm)                  │
│  → Admin nhập giá trị mới (0-50cm)                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  PUT /api/v1/stations/{id}/calibration                               │
│  → Lưu vào Station.CalibrationOffset                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  User xem station:                                                  │
│  → Hiển thị: "Sai số có thể: ±X cm"                               │
│  → KHÔNG ảnh hưởng đến water_level                                │
│  → KHÔNG ảnh hưởng đến alert                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2. Điểm quan trọng

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ⚠️ QUAN TRỌNG                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Calibration Offset CHỈ ĐỂ HIỂN THỊ, KHÔNG ẢNH HƯỞNG ĐẾN:          │
│                                                                          │
│  ❌ KHÔNG thay đổi giá trị water_level trong database               │
│  ❌ KHÔNG thay đổi cách tính toán alert                             │
│  ❌ KHÔNG thay đổi ngưỡng cảnh báo                                  │
│  ❌ KHÔNG thay đổi bất kỳ logic nghiệp vụ nào                       │
│                                                                          │
│  ✅ CHỈ để User biết: "Thiết bị này có thể có sai số ±X cm"       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Các API Endpoints

### Base URL: `/api/v1/stations/{id}`

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|--------|--------|
| GET | `/calibration` | Lấy thông tin calibration | ADMIN |
| PUT | `/calibration` | Cập nhật calibration offset | ADMIN |

---

## 4. Chi tiết từng API

### 4.1. Lấy thông tin Calibration

**Endpoint:** `GET /api/v1/stations/{id}/calibration`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Calibration retrieved successfully",
  "stationId": "550e8400-e29b-41d4-a716-446655440000",
  "calibrationOffset": 5,
  "updatedAt": "2026-03-16T10:30:00Z",
  "updatedBy": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Giải thích Response:**

| Thuộc tính | Mô tả |
|------------|-------|
| `stationId` | ID của station |
| `calibrationOffset` | Offset sai số (0-50cm, default 5cm) |
| `updatedAt` | Ngày cập nhật cuối (UTC) |
| `updatedBy` | ID người cập nhật cuối |

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Station not found"
}
```

---

### 4.2. Cập nhật Calibration

**Endpoint:** `PUT /api/v1/stations/{id}/calibration`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "calibrationOffset": 10
}
```

**Giải thích Request:**

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|------------|------|-----------|--------|
| `calibrationOffset` | decimal | **Có** | Offset sai số (0-50 cm). Default khi tạo station mới: 5cm |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Calibration updated successfully",
  "stationId": "550e8400-e29b-41d4-a716-446655440000",
  "calibrationOffset": 10,
  "updatedAt": "2026-03-16T10:45:00Z",
  "updatedBy": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Calibration offset must be between 0 and 50 cm"
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Station not found"
}
```

---

## 5. Quy tắc Validation

### 5.1. Calibration Offset

| Thuộc tính | Giá trị | Mô tả |
|------------|---------|--------|
| Minimum | 0 cm | Không âm |
| Maximum | 50 cm | Tối đa 50cm |
| Default | 5 cm | Giá trị mặc định khi tạo station mới |

---

## 6. Mô tả giao diện và cách áp dụng API

### 6.1. Màn hình Chi tiết Station - Hiển thị Calibration

**Layout gợi ý:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│  📍 Trạm đo Nguyễn Trãi                         ⚡ Hoạt động      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📍 Vị trí: 10.8231, 106.6297                                       │
│  📏 Ngưỡng: Cảnh báo 200cm / Nguy hiểm 300cm                       │
│  📐 **Sai số có thể: ±5cm**                                         │
│     └─ Giá trị này chỉ để hiển thị, không ảnh hưởng đến đo lường  │
│                                                                         │
│  [Sửa Station] [Quản lý Components]                                │
└─────────────────────────────────────────────────────────────────────────┘
```

**Cách áp dụng API:**
1. Khi load station detail → Gọi `GET /api/v1/stations/{id}`
2. Hiển thị field `calibrationOffset` với label "Sai số có thể: ±X cm"
3. Thêm tooltip giải thích: "Giá trị này chỉ để hiển thị, không ảnh hưởng đến đo lường"

---

### 6.2. Màn hình Chỉnh sửa Calibration (Admin)

**Layout gợi ý:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│  📐 Cập nhật Calibration Offset                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Sai số hiện tại: 5cm                                                │
│                                                                         │
│  Nhập giá trị mới:                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ [5____] cm                                                        │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│  └─ Cho phép: 0-50 cm (Mặc định: 5cm)                              │
│                                                                         │
│  ⚠️ Lưu ý: Giá trị này chỉ để hiển thị, không ảnh hưởng đến       │
│     kết quả đo lường hay bất kỳ tính toán nào của hệ thống.        │
│                                                                         │
│  [Lưu] [Hủy]                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Cách áp dụng API:**
1. Admin click "Sửa Calibration" → Hiển thị modal/form
2. Load giá trị hiện tại: `GET /api/v1/stations/{id}/calibration`
3. Admin nhập giá trị mới
4. Click "Lưu" → `PUT /api/v1/stations/{id}/calibration`
5. Reload lại station detail

---

### 6.3. Validation Error

**Khi nhập giá trị ngoài phạm vi:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ⚠️ Validation Error                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  Giá trị không hợp lệ. Vui lòng nhập từ 0 đến 50 cm.              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Ví dụ Code (Frontend)

### 7.1. Lấy thông tin Calibration

```javascript
async function getCalibration(stationId) {
  const token = localStorage.getItem('access_token');

  const response = await fetch(
    `/api/v1/stations/${stationId}/calibration`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const data = await response.json();

  if (data.success) {
    return data;
  } else {
    throw new Error(data.message);
  }
}

// Sử dụng
const calibration = await getCalibration('station-uuid');
// calibration.calibrationOffset → 5
// calibration.updatedAt → "2026-03-16T10:30:00Z"
```

### 7.2. Cập nhật Calibration

```javascript
async function updateCalibration(stationId, calibrationOffset) {
  const token = localStorage.getItem('access_token');

  const response = await fetch(
    `/api/v1/stations/${stationId}/calibration`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ calibrationOffset })
    }
  );

  const data = await response.json();

  if (data.success) {
    return data;
  } else {
    throw new Error(data.message);
  }
}

// Sử dụng - Admin cập nhật offset = 10cm
await updateCalibration('station-uuid', 10);
```

### 7.3. Hiển thị trong Station Detail

```javascript
function renderStationDetail(station) {
  const calibrationOffset = station.calibrationOffset || 5;

  return `
    <div class="station-info">
      <p>📐 Sai số có thể: <strong>±${calibrationOffset}cm</strong></p>
      <small>Chỉ để hiển thị, không ảnh hưởng đến đo lường</small>
    </div>
  `;
}
```

---

## 8. Lưu ý quan trọng

1. **Authentication**: Cả hai API đều cần Bearer token
2. **Authorization**: Chỉ ADMIN mới có quyền truy cập
3. **Validation**:
   - `calibrationOffset` phải từ 0 đến 50 cm
   - Nếu null, hiển thị là 5cm (default)
4. **Không ảnh hưởng logic**:
   - KHÔNG thay đổi water_level trong database
   - KHÔNG thay đổi cách tính alert
   - KHÔNG thay đổi ngưỡng cảnh báo
   - CHỈ để hiển thị cho User biết sai số có thể xảy ra
5. **Error Handling**: Luôn kiểm tra trường `success` trong response
6. **Default value**: Khi tạo station mới, default = 5cm

---

## 9. Mối quan hệ với các FE khác

```
FE-31 (Station CRUD)
    ↓
FE-33: Thêm CalibrationOffset vào Station
       - GET /stations/{id}/calibration
       - PUT /stations/{id}/calibration
```

---

## 10. FAQ

### Q: Calibration có ảnh hưởng đến water_level không?
A: **KHÔNG**. CalibrationOffset chỉ để hiển thị, không ảnh hưởng đến bất kỳ tính toán nào.

### Q: Tại sao cần feature này?
A: Thiết bị đo nước có thể có sai số theo thời gian. Feature này cho phép Admin ghi nhận và hiển thị thông tin này cho User biết.

### Q: Có cần lưu lịch sử không?
A: **KHÔNG**. Theo yêu cầu, không cần lưu lịch sử hay rollback.

### Q: Default là bao nhiêu?
A: 5cm là giá trị mặc định khi tạo station mới.

### Q: User có thể sửa không?
A: **KHÔNG**. Chỉ Admin mới có quyền xem và sửa.
