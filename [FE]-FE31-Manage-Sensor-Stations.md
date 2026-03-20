# FE-31: Quản lý Trạm & Thành phần Trạm (Station & Component Management)

## 1. Tổng quan

**Mục tiêu:** Cho phép người dùng xem danh sách trạm và quản lý các thành phần/phần cứng trong mỗi trạm đo.

**Nghiệp vụ:**
1. **Station Management**: CRUD trạm đo (đã có từ các feature trước)
2. **Component Management**: Quản lý các thành phần/phần cứng trong station
   - ESP32 (MCU), SRT04 (sensor siêu âm), sensor nhiệt độ, pin, loa, chip 4G/GSM...
3. **Calibration Offset**: Hiển thị thông tin sai số thiết bị (chỉ hiển thị, không ảnh hưởng logic)

---

## 2. Business Flow

### 2.1. Flow xem danh sách Station (Public)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     XEM DANH SÁCH STATION                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  User (không cần đăng nhập) gọi API                                │
│  GET /api/v1/stations                                                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Backend trả về danh sách station                                   │
│  - Trạng thái (active/offline/maintenance)                          │
│  - Vị trí (lat/lng)                                                 │
│  - Ngưỡng cảnh báo                                                  │
│  - Lọc bỏ các station có IsIncidentActive = true                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2. Flow quản lý Component

```
┌─────────────────────────────────────────────────────────────────────────┐
│              QUẢN LÝ COMPONENT TRONG STATION                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
   ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
   │ ADMIN       │         │ USER        │         │ SYSTEM       │
   │ Tạo/Sửa/Xóa│         │ Chỉ xem     │         │ Auto-update  │
   └──────────────┘         └──────────────┘         └──────────────┘
          │                         │                         │
          ▼                         ▼                         ▼
   POST/PUT/DELETE           GET                   Background Job
   /stations/{id}/          /stations/{id}/        cập nhật status
   components               components              theo heartbeat
```

### 2.3. Flow Calibration (FE-33)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CALIBRATION OFFSET (HIỂN THỊ)                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Admin cập nhật Calibration Offset                                   │
│  PUT /api/v1/stations/{id}/calibration                               │
│  → Lưu vào Station.CalibrationOffset (0-50cm, default 5cm)        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  User xem thông tin station                                          │
│  → Hiển thị: "Sai số có thể: ±X cm"                                │
│  → KHÔNG ảnh hưởng đến giá trị water_level                        │
│  → KHÔNG ảnh hưởng đến alert                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Các API Endpoints

### 3.1. Station APIs (Base URL: `/api/v1`)

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|--------|--------|
| GET | `/stations` | Lấy danh sách station | **Public** (không cần auth) |
| GET | `/stations/{id}` | Lấy chi tiết station | **Public** |
| POST | `/stations` | Tạo mới station | ADMIN |
| PUT | `/stations/{id}` | Cập nhật station | ADMIN |
| DELETE | `/stations/{id}` | Xóa station | ADMIN |

### 3.2. Component APIs (Base URL: `/api/v1/stations/{stationId}`)

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|--------|--------|
| GET | `/components` | Lấy danh sách component | ADMIN, USER |
| GET | `/components/{id}` | Lấy chi tiết component | ADMIN, USER |
| POST | `/components` | Tạo mới component | ADMIN |
| PUT | `/components/{id}` | Cập nhật component | ADMIN |
| DELETE | `/components/{id}` | Xóa component | ADMIN |

### 3.3. Calibration APIs (Base URL: `/api/v1/stations/{id}`)

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|--------|--------|
| GET | `/calibration` | Lấy thông tin calibration | ADMIN |
| PUT | `/calibration` | Cập nhật calibration offset | ADMIN |

---

## 4. Chi tiết Station APIs

### 4.1. Lấy danh sách Station (List)

**Endpoint:** `GET /api/v1/stations`

**Headers:** Không cần (public)

**Query Parameters:**
| Parameter | Kiểu | Mô tả |
|-----------|------|-------|
| `searchTerm` | string | Tìm kiếm theo tên/code |
| `status` | string | Lọc theo trạng thái: active, offline, maintenance |
| `pageNumber` | int | Số trang (default: 1) |
| `pageSize` | int | Số item/trang (default: 20) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Stations retrieved successfully",
  "stations": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "code": "ST_DN_001",
      "name": "Trạm đo Nguyễn Trãi",
      "type": "urban_lowland",
      "locationDesc": "Cạnh cống Nguyễn Trãi",
      "latitude": 10.8231,
      "longitude": 106.6297,
      "roadName": "Đường Nguyễn Trãi",
      "direction": "downstream",
      "status": "active",
      "thresholdWarning": 200,
      "thresholdCritical": 300,
      "calibrationOffset": 5,
      "installedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "totalCount": 100
}
```

---

## 5. Chi tiết Component APIs

### 5.1. Lấy danh sách Component (List)

**Endpoint:** `GET /api/v1/stations/{stationId}/components`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Components retrieved successfully",
  "components": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "stationId": "660e8400-e29b-41d4-a716-446655440001",
      "componentType": "esp32",
      "name": "ESP32 Main Controller",
      "model": "ESP32-WROOM-32",
      "serialNumber": "ESP32-001234",
      "firmwareVersion": "1.0.0",
      "status": "active",
      "installedAt": "2024-01-15T10:30:00Z",
      "lastMaintenanceAt": "2024-06-01T14:00:00Z",
      "notes": "Main controller for sensor data collection",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-06-01T14:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "stationId": "660e8400-e29b-41d4-a716-446655440001",
      "componentType": "srt04",
      "name": "Ultrasonic Sensor",
      "model": "HC-SR04",
      "serialNumber": "SR04-005678",
      "firmwareVersion": null,
      "status": "active",
      "installedAt": "2024-01-15T10:35:00Z",
      "lastMaintenanceAt": null,
      "notes": "Water level measurement",
      "createdAt": "2024-01-15T10:35:00Z",
      "updatedAt": "2024-01-15T10:35:00Z"
    }
  ]
}
```

**Giải thích Response:**

| Thuộc tính | Mô tả |
|------------|-------|
| `id` | ID duy nhất của component |
| `stationId` | ID của station chứa component |
| `componentType` | Loại component |
| `name` | Tên component |
| `model` | Model thiết bị |
| `serialNumber` | Số serial |
| `firmwareVersion` | Phiên bản firmware |
| `status` | Trạng thái: active, inactive, faulty |
| `installedAt` | Ngày lắp đặt |
| `lastMaintenanceAt` | Ngày bảo trì gần nhất |
| `notes` | Ghi chú |
| `createdAt` | Ngày tạo |
| `updatedAt` | Ngày cập nhật cuối |

---

### 5.2. Tạo mới Component (Create)

**Endpoint:** `POST /api/v1/stations/{stationId}/components`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "componentType": "esp32",
  "name": "ESP32 Main Controller",
  "model": "ESP32-WROOM-32",
  "serialNumber": "ESP32-001234",
  "firmwareVersion": "1.0.0",
  "notes": "Main controller for sensor data collection"
}
```

**Giải thích Request:**

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|------------|------|-----------|--------|
| `componentType` | string | **Có** | Loại component. Giá trị: `esp32`, `srt04`, `temperature_sensor`, `battery`, `speaker`, `gsm_module`, `solar_panel`, `rain_sensor` |
| `name` | string | Không | Tên của component, giúp dễ nhận diện |
| `model` | string | Không | Model của thiết bị |
| `serialNumber` | string | Không | Số serial của thiết bị |
| `firmwareVersion` | string | Không | Phiên bản firmware hiện tại |
| `notes` | string | Không | Ghi chú thêm về component |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Component created successfully",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "component": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "stationId": "660e8400-e29b-41d4-a716-446655440001",
    "componentType": "esp32",
    "name": "ESP32 Main Controller",
    "model": "ESP32-WROOM-32",
    "serialNumber": "ESP32-001234",
    "firmwareVersion": "1.0.0",
    "status": "active",
    "installedAt": "2024-01-15T10:30:00Z",
    "lastMaintenanceAt": null,
    "notes": "Main controller for sensor data collection",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Component type is required"
}
```

---

### 5.3. Lấy chi tiết Component (Get By ID)

**Endpoint:** `GET /api/v1/stations/{stationId}/components/{id}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Component retrieved successfully",
  "component": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "stationId": "660e8400-e29b-41d4-a716-446655440001",
    "componentType": "esp32",
    "name": "ESP32 Main Controller",
    "model": "ESP32-WROOM-32",
    "serialNumber": "ESP32-001234",
    "firmwareVersion": "1.0.0",
    "status": "active",
    "installedAt": "2024-01-15T10:30:00Z",
    "lastMaintenanceAt": "2024-06-01T14:00:00Z",
    "notes": "Main controller for sensor data collection",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-06-01T14:00:00Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Component not found"
}
```

---

### 5.4. Cập nhật Component (Update)

**Endpoint:** `PUT /api/v1/stations/{stationId}/components/{id}`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "componentType": "esp32",
  "name": "ESP32 Main Controller - Updated",
  "model": "ESP32-WROOM-32E",
  "serialNumber": "ESP32-001234",
  "firmwareVersion": "1.1.0",
  "status": "active",
  "notes": "Firmware updated to v1.1.0"
}
```

**Giải thích Request:**

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|------------|------|-----------|--------|
| `componentType` | string | **Có** | Loại component |
| `name` | string | **Có** | Tên component |
| `model` | string | Không | Model thiết bị |
| `serialNumber` | string | Không | Số serial |
| `firmwareVersion` | string | Không | Phiên bản firmware mới |
| `status` | string | **Có** | Trạng thái: active, inactive, faulty |
| `notes` | string | Không | Ghi chú |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Component updated successfully",
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### 5.5. Xóa Component (Delete)

**Endpoint:** `DELETE /api/v1/stations/{stationId}/components/{id}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Component deleted successfully"
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Component not found"
}
```

---

## 6. Chi tiết Calibration APIs

### 6.1. Lấy thông tin Calibration

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
  "updatedAt": "2024-01-15T10:30:00Z",
  "updatedBy": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Giải thích Response:**

| Thuộc tính | Mô tả |
|------------|-------|
| `stationId` | ID của station |
| `calibrationOffset` | Offset hiển thị sai số (0-50cm, default 5cm) |
| `updatedAt` | Ngày cập nhật cuối |
| `updatedBy` | ID người cập nhật |

---

### 6.2. Cập nhật Calibration

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
| `calibrationOffset` | decimal | **Có** | Offset sai số (0-50 cm). Default: 5cm |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Calibration updated successfully",
  "stationId": "550e8400-e29b-41d4-a716-446655440000",
  "calibrationOffset": 10,
  "updatedAt": "2024-07-20T09:15:00Z",
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

---

## 7. Các loại Component (Component Types)

| Giá trị | Mô tả | Ví dụ |
|---------|-------|--------|
| `esp32` | ESP32 microcontroller - Bộ điều khiển trung tâm | ESP32-WROOM-32 |
| `srt04` | HC-SR04 ultrasonic sensor - Sensor siêu âm đo mực nước | HC-SR04 |
| `temperature_sensor` | Cảm biến nhiệt độ | DS18B20 |
| `battery` | Pin/Power supply | 18650 Li-ion |
| `speaker` | Loa/Buzzer - Cảnh báo âm thanh | 5V Buzzer |
| `gsm_module` | Module 4G/GSM - Truyền dữ liệu | SIM800L |
| `solar_panel` | Tấm năng lượng mặt trời | 6V 2W |
| `rain_sensor` | Cảm biến mưa | FC-37 |

---

## 8. Các trạng thái Component (Status)

| Giá trị | Mô tả |
|---------|-------|
| `active` | Hoạt động bình thường |
| `inactive` | Không hoạt động |
| `faulty` | Bị lỗi/Cần bảo trì |

---

## 9. Mô tả giao diện và cách áp dụng API

### 9.1. Màn hình Danh sách Station (Public)

**Layout gợi ý:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│  🗺️ Danh sách Trạm Giám Sát Lũ Lụt                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  [🔍 Tìm kiếm...]  [Lọc: Tất cả ▼] [Bản đồ]                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📍 Trạm Nguyễn Trãi                    ⚡ Hoạt động                 │
│     📍 10.8231, 106.6297                  🚨 Ngưỡng: 200/300cm      │
│                                                                         │
│  📍 Trạm Lê Lai                           ⚡ Hoạt động                 │
│     📍 10.8231, 106.6297                  🚨 Ngưỡng: 150/250cm      │
│                                                                         │
│  📍 Trạm Nguyễn Huệ                       ❌ Offline                  │
│     📍 10.8231, 106.6297                  🚨 Ngưỡng: 180/280cm      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Cách áp dụng API:**
1. Khi vào trang → Gọi `GET /api/v1/stations` (không cần token)
2. Hiển thị danh sách station
3. Lọc bỏ các station có IsIncidentActive = true (không hiển thị)

---

### 9.2. Màn hình Chi tiết Station + Components

**Layout gợi ý:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│  📍 Trạm Nguyễn Trãi                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  📍 Vị trí: 10.8231, 106.6297                                        │
│  ⚡ Trạng thái: Hoạt động                                            │
│  📏 Ngưỡng: Cảnh báo 200cm / Nguy hiểm 300cm                        │
│  📐 Sai số có thể: ±5cm (Calibration Offset)                          │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  🛠️ Thành phần thiết bị                                               │
├─────────────────────────────────────────────────────────────────────────┤
│  # │ Tên              │ Loại         │ Model        │ Trạng thái  │
│───│──────────────────│──────────────│──────────────│─────────────│
│ 1 │ ESP32 Controller│ esp32        │ ESP32-WROOM  │ ✓ Hoạt động │
│ 2 │ Ultrasonic      │ srt04        │ HC-SR04      │ ✓ Hoạt động │
│ 3 │ Battery         │ battery       │ 18650        │ ⚠ Cần thay  │
│                                                                         │
│  [+ Thêm Component]  [Sửa Calibration]                                │
└─────────────────────────────────────────────────────────────────────────┘
```

**Cách áp dụng API:**
1. Xem station + components → `GET /api/v1/stations/{id}/components`
2. Thêm component → `POST /api/v1/stations/{id}/components` (Admin)
3. Sửa component → `PUT /api/v1/stations/{id}/components/{id}` (Admin)
4. Xem/sửa calibration → `GET/PUT /api/v1/stations/{id}/calibration` (Admin)

---

### 9.3. Màn hình Form thêm/sửa Component

**Layout gợi ý:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│  🛠️ Thêm/Sửa Component                                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Loại Component: [ESP32 ▼]                                           │
│                   ┌──────────┐                                         │
│                   │ esp32    │                                         │
│                   │ srt04    │                                         │
│                   │ battery  │                                         │
│                   └──────────┘                                         │
│                                                                         │
│  Tên:        [___________________]                                    │
│  Model:      [___________________]                                    │
│  Serial:     [___________________]                                    │
│  Firmware:   [___________________]                                    │
│  Trạng thái: [Hoạt động ▼]                                          │
│               ┌──────────┐                                            │
│               │ Hoạt động│                                            │
│               │ Không hoạt│                                            │
│               │ Lỗi      │                                            │
│               └──────────┘                                            │
│  Ghi chú:    [___________________]                                    │
│                                                                         │
│  [Lưu] [Hủy]                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Ví dụ Code (Frontend)

### 10.1. Lấy danh sách Station (Public)

```javascript
async function getStations(searchTerm = '', status = '', page = 1, pageSize = 20) {
  const params = new URLSearchParams({
    searchTerm,
    status,
    pageNumber: page,
    pageSize
  });

  const response = await fetch(
    `/api/v1/stations?${params}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  const data = await response.json();

  if (data.success) {
    return data.stations;
  } else {
    throw new Error(data.message);
  }
}
```

### 10.2. Lấy danh sách Component

```javascript
async function getComponents(stationId) {
  const token = localStorage.getItem('access_token');

  const response = await fetch(
    `/api/v1/stations/${stationId}/components`,
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
    return data.components;
  } else {
    throw new Error(data.message);
  }
}
```

### 10.3. Tạo Component

```javascript
async function createComponent(stationId, componentData) {
  const token = localStorage.getItem('access_token');

  const response = await fetch(
    `/api/v1/stations/${stationId}/components`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(componentData)
    }
  );

  const data = await response.json();

  if (data.success) {
    return data.component;
  } else {
    throw new Error(data.message);
  }
}

// Sử dụng
const newComponent = await createComponent('station-uuid', {
  componentType: 'esp32',
  name: 'ESP32 Main Controller',
  model: 'ESP32-WROOM-32',
  serialNumber: 'ESP32-001234',
  firmwareVersion: '1.0.0'
});
```

### 10.4. Cập nhật Calibration

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

---

## 11. Lưu ý quan trọng

1. **Station List/Detail**: Public API, không cần authentication
2. **Component APIs**: Cần authentication
   - ADMIN: Tất cả các thao tác (CRUD)
   - USER: Chỉ xem (GET)
3. **Calibration**: Chỉ ADMIN mới được xem và cập nhật
4. **Validation:**
   - `componentType` là bắt buộc khi tạo/cập nhật
   - `name` là bắt buộc khi cập nhật
   - `status` phải là: active, inactive, faulty
   - `calibrationOffset` phải từ 0-50 cm
5. **Calibration Offset**: Chỉ để hiển thị, KHÔNG ảnh hưởng đến:
   - Giá trị water_level trong database
   - Logic tính toán alert
6. **Error Handling**: Luôn kiểm tra trường `success` trong response

---

## 12. Mối quan hệ với các FE khác

```
FE-31 (Station & Components)
    ↓
FE-32: Dùng Station.LastSeenAt để phát hiện offline
       Dùng StationComponent để theo dõi health
    ↓
FE-33: Station.CalibrationOffset để hiển thị sai số
    ↓
FE-34: Station.IsIncidentActive để disable station khi có incident
```
