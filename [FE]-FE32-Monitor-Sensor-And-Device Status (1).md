# FE-32: Giám sát Trạng thái Cảm biến & Thiết bị (Monitor Sensor & Device Status)

## 1. Tổng quan

**Mục tiêu:** Giám sát trạng thái hoạt động của trạm cảm biến bao gồm heartbeat, pin, tín hiệu để phát hiện thiết bị offline.

**Nghiệp vụ:**
- Theo dõi heartbeat/last-seen của station
- Theo dõi battery level (ESP32 gửi về)
- Theo dõi signal strength (RSSI)
- Phát hiện offline devices tự động
- Auto-tạo incident khi offline > 6 tiếng

---

## 2. Business Flow

### 2.1. Flow hoạt động

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    BACKGROUND JOBS CHẠY ĐỊNH KỲ                        │
│                      (Mỗi 10 phút một lần)                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
          ┌─────────────────────────┴─────────────────────────┐
          ▼                                                   ▼
┌─────────────────────┐                           ┌─────────────────────┐
│ CheckStationStatusJob│                           │CheckStationIncident │
│                     │                           │        Job         │
├─────────────────────┤                           ├─────────────────────┤
│ 1. Lấy tất cả    │                           │ 1. Lấy station     │
│    stations        │                           │    offline          │
│                   │                           │                     │
│ 2. Với mỗi       │                           │ 2. Tính offline    │
│    station:        │                           │    duration        │
│    - Kiểm tra     │                           │                     │
│      LastSeenAt   │                           │ 3. Nếu > 6 tiếng: │
│                   │                           │    - Kiểm tra đã   │
│ 3. Nếu > 10 phút:│                           │      có incident?  │
│    Status=offline │                           │    - Nếu chưa: tạo│
│                   │                           │      incident       │
└─────────────────────┘                           └─────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE UPDATES                               │
├─────────────────────────────────────────────────────────────────────────┤
│ - Station.Status = "offline" (nếu LastSeenAt > 10 phút)             │
│ - Station.IsIncidentActive = true (nếu có incident)                  │
│ - SensorIncident được tạo (nếu offline > 6 tiếng)                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2. Flow MQTT Ingestion

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ESP32 GỬI DỮ LIỆU QUA MQTT                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  MqttIngestionJob nhận message:                                      │
│  {                                                                     │
│    "station_id": "xxx",                                               │
│    "water_level": 2.5,                                               │
│    "distance": 100,                                                   │
│    "sensor_height": 300,                                              │
│    "status": 0,                                                      │
│    "battery": 85,        // Có thể null (sẽ default = 100)         │
│    "rssi": -45          // Có thể null (sẽ default = 0)            │
│  }                                                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  XỬ LÝ:                                                               │
│  1. Lưu SensorReading (value, battery, signal)                      │
│     - battery = 85 (hoặc null → 100)                                │
│     - signal = -45 (hoặc null → 0)                                  │
│                                                                          │
│  2. Cập nhật Station:                                                │
│     - LastSeenAt = now                                               │
│     - Status = "active" (nếu trước đó offline)                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.3. Flow API User truy vấn

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER TRUY VẤN STATUS                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
   ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
   │ Xem 1 station│         │ List online  │         │ List offline │
   └──────────────┘         └──────────────┘         └──────────────┘
          │                         │                         │
          ▼                         ▼                         ▼
   GET /stations/            GET /stations/            GET /stations/
       {id}/status             status/online              status/offline
```

---

## 3. Các API Endpoints

### Base URL: `/api/v1/stations`

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|--------|--------|
| GET | `/{id}/status` | Lấy chi tiết trạng thái device | USER+ |
| GET | `/status/online` | Danh sách station online | USER+ |
| GET | `/status/offline` | Danh sách station offline | USER+ |

---

## 4. Chi tiết từng API

### 4.1. Lấy chi tiết trạng thái Station

**Endpoint:** `GET /api/v1/stations/{id}/status`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Station status retrieved successfully",
  "stationId": "550e8400-e29b-41d4-a716-446655440000",
  "stationName": "Trạm đo Nguyễn Trãi",
  "status": "active",
  "lastSeenAt": "2026-03-16T10:30:00Z",
  "batteryLevel": 85,
  "signalStrength": -45,
  "lastReading": {
    "waterLevel": 2.5,
    "measuredAt": "2026-03-16T10:28:00Z"
  },
  "offlineDurationMinutes": null
}
```

**Giải thích Response:**

| Thuộc tính | Mô tả |
|------------|-------|
| `stationId` | ID của station |
| `stationName` | Tên station |
| `status` | Trạng thái: active, offline, maintenance |
| `lastSeenAt` | Thời điểm nhận dữ liệu cuối cùng (UTC) |
| `batteryLevel` | Mức pin (0-100%). Null sẽ hiển thị là 100% |
| `signalStrength` | Cường độ tín hiệu (dBm). Null sẽ hiển thị là 0 |
| `lastReading` | Dữ liệu đọc được gần nhất |
| `offlineDurationMinutes` | Số phút offline. Null nếu đang online |

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Station not found"
}
```

---

### 4.2. Lấy danh sách Station Online

**Endpoint:** `GET /api/v1/stations/status/online`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Online stations retrieved successfully",
  "items": [
    {
      "stationId": "550e8400-e29b-41d4-a716-446655440000",
      "stationName": "Trạm đo Nguyễn Trãi",
      "lastSeenAt": "2026-03-16T10:30:00Z",
      "batteryLevel": 85,
      "signalStrength": -45
    },
    {
      "stationId": "660e8400-e29b-41d4-a716-446655440001",
      "stationName": "Trạm đo Lê Lai",
      "lastSeenAt": "2026-03-16T10:25:00Z",
      "batteryLevel": 100,
      "signalStrength": -50
    }
  ],
  "total": 2
}
```

---

### 4.3. Lấy danh sách Station Offline

**Endpoint:** `GET /api/v1/stations/status/offline`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Offline stations retrieved successfully",
  "items": [
    {
      "stationId": "770e8400-e29b-41d4-a716-446655440002",
      "stationName": "Trạm đo Nguyễn Huệ",
      "lastSeenAt": "2026-03-15T20:00:00Z",
      "offlineDurationMinutes": 870
    }
  ],
  "total": 1
}
```

**Giải thích Response:**

| Thuộc tính | Mô tả |
|------------|-------|
| `stationId` | ID của station |
| `stationName` | Tên station |
| `lastSeenAt` | Thời điểm nhận dữ liệu cuối cùng (UTC) |
| `offlineDurationMinutes` | Số phút đã offline |

---

## 5. Các trạng thái Station

### 5.1. Trạng thái (Status)

| Giá trị | Mô tả | Điều kiện |
|---------|-------|------------|
| `active` | Hoạt động bình thường | LastSeenAt ≤ 10 phút |
| `offline` | Không hoạt động | LastSeenAt > 10 phút |
| `maintenance` | Đang bảo trì | Được set thủ công bởi Admin |

### 5.2. Logic phát hiện Offline

```
- Offline threshold: 10 phút (cố định)
- Incident threshold: offline > 6 tiếng (sẽ tạo incident tự động)
```

### 5.3. Battery & Signal

| Thuộc tính | Mô tả | Giá trị mặc định |
|------------|-------|------------------|
| `batteryLevel` | Mức pin (0-100%) | 100% (nếu null) |
| `signalStrength` | Cường độ tín hiệu RSSI (dBm) | 0 (nếu null) |

**Lưu ý:** Battery và Signal hiện tại có thể là null vì ESP32 chưa gửi các trường này. Backend sẽ default là 100% và 0.

---

## 6. Mô tả giao diện và cách áp dụng API

### 6.1. Màn hình Dashboard - Online/Offline Overview

**Layout gợi ý:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│  📊 Dashboard Giám sát Thiết bị                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │    25       │  │     3       │  │     2       │                  │
│  │  Online     │  │  Offline    │  │Maintenance   │                  │
│  │   stations  │  │  stations   │  │  stations   │                  │
│  └─────────────┘  └─────────────┘  └─────────────┘                  │
│                                                                         │
│  ─────────────────────────────────────────────────────────────────   │
│                                                                         │
│  Danh sách Offline:                                                   │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │ ⚠️ Trạm Nguyễn Huệ                      Offline: 14h30m      │   │
│  │    Last seen: 2026-03-15 20:00                            │   │
│  │    [Tạo Incident]                                          │   │
│  └────────────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │ ⚠️ Trạm Lê Văn Sỹ                      Offline: 2h15m       │   │
│  │    Last seen: 2026-03-16 08:15                            │   │
│  │    [Tạo Incident]                                          │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Cách áp dụng API:**
1. Load dashboard → Gọi song song:
   - `GET /api/v1/stations/status/online` → Đếm số online
   - `GET /api/v1/stations/status/offline` → Đếm số offline
2. Hiển thị danh sách offline từ `/api/v1/stations/status/offline`

---

### 6.2. Màn hình Chi tiết Station

**Layout gợi ý:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│  📍 Trạm đo Nguyễn Trãi                    ⚡ Hoạt động            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📡 Trạng thái kết nối:                                              │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ Last Seen: 2026-03-16 10:30:00                                  │  │
│  │ Battery: ████████████ 85%                                        │  │
│  │ Signal: ████████░░ -45 dBm (Tốt)                               │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  📊 Dữ liệu gần nhất:                                                │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ Water Level: 2.5 cm                                              │  │
│  │ Measured At: 2026-03-16 10:28:00                                 │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  📋 Lịch sử:                                                          │
│  - 10:30 - Online                                                     │
│  - 10:20 - Online                                                     │
│  - 10:10 - Online                                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Cách áp dụng API:**
1. Click vào station → Gọi `GET /api/v1/stations/{id}/status`
2. Hiển thị:
   - lastSeenAt → Tính thời gian offline
   - batteryLevel → Hiển thị progress bar
   - signalStrength → Hiển thị signal strength indicator
   - lastReading → Hiển thị water level gần nhất

---

### 6.3. Màn hình Danh sách Stations với Filter Status

**Layout gợi ý:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│  🗺️ Danh sách Trạm                                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  [Tất cả ▼] [Online ▼]  [🔍 Tìm kiếm...]                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📍 Trạm Nguyễn Trãi (Online)                                       │
│     Battery: 85% | Signal: -45dBm | Last seen: 5 phút trước          │
│                                                                         │
│  📍 Trạm Lê Lai (Online)                                             │
│     Battery: 100% | Signal: -50dBm | Last seen: 3 phút trước          │
│                                                                         │
│  📍 Trạm Nguyễn Huệ (Offline) ❌                                     │
│     Offline: 14h30m | Last seen: 2026-03-15 20:00                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Cách áp dụng API:**
1. Tab "Tất cả" → `GET /api/v1/stations` (với filter status)
2. Tab "Online" → `GET /api/v1/stations/status/online`
3. Tab "Offline" → `GET /api/v1/stations/status/offline`

---

## 7. Ví dụ Code (Frontend)

### 7.1. Lấy chi tiết trạng thái Station

```javascript
async function getStationStatus(stationId) {
  const token = localStorage.getItem('access_token');

  const response = await fetch(
    `/api/v1/stations/${stationId}/status`,
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
const status = await getStationStatus('station-uuid');

// status.status → "active" | "offline" | "maintenance"
// status.batteryLevel → 85 (hoặc 100 nếu null)
// status.signalStrength → -45 (hoặc 0 nếu null)
```

### 7.2. Lấy danh sách Station Online

```javascript
async function getOnlineStations() {
  const token = localStorage.getItem('access_token');

  const response = await fetch(
    '/api/v1/stations/status/online',
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
    return data.items;
  } else {
    throw new Error(data.message);
  }
}
```

### 7.3. Lấy danh sách Station Offline

```javascript
async function getOfflineStations() {
  const token = localStorage.getItem('access_token');

  const response = await fetch(
    '/api/v1/stations/status/offline',
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
    return data.items.map(station => ({
      ...station,
      // Tính offline duration hiển thị
      offlineDisplay: formatDuration(station.offlineDurationMinutes)
    }));
  } else {
    throw new Error(data.message);
  }
}

// Helper format thời gian
function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) return `${hours}h${mins}p`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}ngày ${remainingHours}h`;
}
```

### 7.4. Dashboard tổng hợp

```javascript
async function loadDashboard() {
  const [onlineData, offlineData] = await Promise.all([
    fetch('/api/v1/stations/status/online').then(r => r.json()),
    fetch('/api/v1/stations/status/offline').then(r => r.json())
  ]);

  return {
    onlineCount: onlineData.total || 0,
    offlineCount: offlineData.total || 0,
    offlineStations: offlineData.items || []
  };
}
```

---

## 8. Lưu ý quan trọng

1. **Authentication**: Tất cả API cần Bearer token
2. **Authorization**: USER+ (User, Moderator, Admin)
3. **Offline Detection**:
   - Tự động phát hiện sau 10 phút không có dữ liệu
   - Background job chạy mỗi 10 phút
4. **Auto-Incident**:
   - Khi offline > 6 tiếng → Tự động tạo SensorIncident
   - Station.IsIncidentActive = true
   - Station sẽ không hiển thị trên map
5. **Battery/Signal**:
   - Có thể null vì ESP32 chưa gửi
   - Backend default: battery = 100%, signal = 0
6. **Error Handling**: Luôn kiểm tra trường `success` trong response
7. **Real-time**: Cân nhắc dùng SignalR để cập nhật real-time (FE tự quyết định)

---

## 9. Mối quan hệ với các FE khác

```
FE-31 (Station & Components)
    ↓
FE-32: Dùng Station.LastSeenAt để phát hiện offline
       Dùng Station.IsIncidentActive để ẩn station khỏi map
    ↓
FE-34: Tạo SensorIncident khi offline > 6 tiếng
```

---

## 10. FAQ

### Q: Battery/Signal null thì sao?
A: Backend sẽ default là 100% và 0. Frontend có thể hiển thị "Đang chờ dữ liệu".

### Q: Bao lâu phát hiện offline?
A: 10 phút sau lần gửi dữ liệu cuối cùng.

### Q: Bao lâu tạo incident?
A: 6 tiếng sau khi offline.

### Q: Có thể manual set offline không?
A: Có thể set Status = "maintenance" (Admin), nhưng đó là trạng thái riêng, không phải offline do mất kết nối.
