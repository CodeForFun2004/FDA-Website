# FE-48: View Operational Logs – Backend Implementation (Updated)

> Related features:
> - **FeatG130**: OperationalLog entity/repository
> - **FeatG131**: View/Detail/Export APIs
> - **FeatG132**: Log retention hosted job

## 1) Scope đã hoàn thành

### Entity + table

- `OperationalLog` entity đã có
- Bảng `OperationalLogs` đã migrate
- Indexes đã tạo

### APIs

- `GET /api/v1/admin/logs` (filter + paginate)
- `GET /api/v1/admin/logs/{id}` (detail)
- `GET /api/v1/admin/logs/export` (csv/json wrapped payload)

### Background job

- `LogRetentionJob` đã có và đã register trong `Program.cs`

---

## 2) Trạng thái implementation theo layer

## Domain

- `OperationalLog` entity: ✅
- `OperationalLogCategory`/`OperationalLogLevel`: ✅
- `IOperationalLogRepository`: ✅

## Infrastructure

- `PgsqlOperationalLogRepository`: ✅
  - Dynamic filtering
  - Pagination
  - Retention delete
  - Job health metrics

### SQL compatibility fixes đã áp dụng

- Dùng `SUM(CASE WHEN ...)` thay cho `COUNT(*) FILTER (...)`
- Dùng `CAST("Details" AS TEXT) ILIKE ...` thay vì `jsonb ILIKE`

## Application

Project `FDAAPI.App.FeatG131_ViewOperationalLogs` đã có:

- View logs request/response/validator/handler
- Get detail request/response/handler
- Export request/response/handler

## Presentation

- Endpoints đã có đầy đủ cho 3 APIs
- JWT + `Policies("Admin")`

---

## 3) Điểm đã chỉnh sửa khi test runtime

### 3.1 Fix detail endpoint binding

Ban đầu endpoint detail dùng `Endpoint<Guid, ...>` gây lỗi runtime FastEndpoints:

- `Only request DTOs with publicly accessible properties are supported`

Đã đổi sang request DTO:

- `GetOperationalLogDetailRequestDto { Guid Id }`

=> Detail endpoint hoạt động đúng.

### 3.2 Export behavior

Hiện tại export đang trả về payload JSON wrapper:

```json
{
  "success": true,
  "message": "Exported N logs",
  "statusCode": 200,
  "data": "csv-or-json-string"
}
```

Không stream file attachment trực tiếp. Đây là behavior hiện tại đã verify hoạt động.

---

## 4) Auth & access notes

- Admin token: full access
- No token: 401
- Authority category restriction logic có trong endpoint `ViewOperationalLogsEndpoint` (chặn category `system`/`moderation` nếu role AUTHORITY)

---

## 5) Runtime verification summary

Đã test trực tiếp:

- ✅ list logs
- ✅ filter category/level/search/date/pagination
- ✅ detail existing ID
- ✅ detail non-existing ID -> 404
- ✅ export csv/json (wrapped payload)
- ✅ no auth -> 401

---

## 6) Trạng thái FE-48

**DONE (backend implementation + runtime verified)** ✅

Tài liệu này phản ánh implementation thực tế đang chạy, thay thế cho assumptions trong plan ban đầu.
