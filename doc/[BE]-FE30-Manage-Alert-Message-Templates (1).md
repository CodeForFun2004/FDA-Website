# FE-30: Manage Alert Message Templates

## A) Nghiệp vụ & Scope

**Mục tiêu:** Cho phép Admin tạo/chỉnh sửa các template tin nhắn cảnh báo ngập lụt thay vì hardcode như hiện tại.

**Nghiệp vụ hiện tại (problem):**
- `NotificationTemplateService` hiện tại hardcode message templates
- Không thể tùy chỉnh nội dung theo nhu cầu
- Không hỗ trợ đa ngôn ngữ (i18n)

**Scope FE-30:**
1. Tạo entity `AlertTemplate` lưu template trong DB
2. CRUD APIs để quản lý templates (Admin only)
3. Template engine hỗ trợ variables
4. Preview template với sample data
5. Integration với notification dispatch

---

## B) Data/Entities

### Entity: AlertTemplate

| Field | Type | Notes |
|-------|------|-------|
| Id | Guid | PK |
| Name | string | e.g., "Critical Push Template" |
| Channel | string | Push, Email, SMS, InApp |
| Severity | string? | info, caution, warning, critical (null = all) |
| TitleTemplate | string | Template for title |
| BodyTemplate | string | Template for body |
| IsActive | bool | Default: true |
| SortOrder | int | Display order |
| CreatedBy | Guid | Audit |
| CreatedAt | DateTime | Audit |
| UpdatedBy | Guid | Audit |
| UpdatedAt | DateTime | Audit |

### Supported Variables:
| Variable | Description |
|----------|-------------|
| `{{station_name}}` | Tên trạm |
| `{{water_level}}` | Mức nước + đơn vị |
| `{{water_level_raw}}` | Chỉ số |
| `{{severity}}` | Mức độ |
| `{{time}}` | Thời gian |
| `{{threshold}}` | Ngưỡng cảnh báo |
| `{{address}}` | Địa chỉ trạm |
| `{{message}}` | Alert message |

---

## C) API Contract

### Routes:

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/admin/alert-templates` | Admin | Create template |
| GET | `/api/v1/admin/alert-templates` | Admin | List all templates |
| GET | `/api/v1/admin/alert-templates/{id}` | Admin | Get template by ID |
| PUT | `/api/v1/admin/alert-templates/{id}` | Admin | Update template |
| DELETE | `/api/v1/admin/alert-templates/{id}` | Admin | Delete template |
| POST | `/api/v1/admin/alert-templates/{id}/preview` | Admin | Preview rendered message |

---

## D) Trạng thái triển khai hiện tại

### ✅ Đã hoàn thành

| Feature | FeatG | Status |
|---------|-------|--------|
| AlertTemplateCreate | G100 | ✅ Done - Handler + Endpoint |
| AlertTemplateList | G99 | ✅ Done - Handler + Endpoint |
| AlertTemplateUpdate | G101 | ✅ Done - Handler + Endpoint |
| AlertTemplateDelete | G102 | ✅ Done - Handler + Endpoint |
| AlertTemplateGet | G103 | ✅ Done - Handler + Endpoint |
| AlertTemplatePreview | G104 | ✅ Done - Handler + Endpoint |

### ⚠️ Cần cải thiện (từ Code Review)

1. **XSS Prevention**: Template content cần được sanitize trước khi lưu
2. **Caching**: Templates được đọc thường xuyên nhưng ít khi thay đổi - nên cache
3. **Template Versioning**: Chưa có - cần track lịch sử thay đổi
4. **Variable Validation**: Validate variables trong template có thuộc danh sách allowed
5. **Integration**: Chưa tích hợp vào NotificationDispatchService

---

## E) Kế hoạch cải thiện

### Phase 1: Security & Performance (nếu cần)
- [ ] Thêm XSS prevention trong validator
- [ ] Thêm in-memory cache cho templates

### Phase 2: Integration (quan trọng)
- [ ] Tạo `ITemplateRenderService` để render template với variables
- [ ] Sửa `NotificationDispatchService` ưu tiên load từ DB trước
- [ ] Fallback về hardcoded message nếu không có template

### Phase 3: Versioning (optional)
- [ ] Tạo bảng `AlertTemplateHistory` lưu lịch sử thay đổi

---

## F) Integration với Notification Flow

```
AlertTriggered
    ↓
FindTemplate(Channel, Severity)
    ↓ (nếu có)
RenderTemplate(variables)
    ↓
SendNotification(channel, title, body)
    ↓ (nếu không có template)
UseHardcodedMessage()
```

**Template Render Logic:**
```csharp
// 1. Tìm template phù hợp nhất
var template = await _templateRepo.GetActiveTemplate(channel, severity);

// 2. Replace variables
var title = Render(template.TitleTemplate, variables);
var body = Render(template.BodyTemplate, variables);

// 3. Fallback nếu không có template
if (template == null)
    return GetHardcodedMessage(severity);
```

---

## G) Test Cases

| Test Case | Flow | Expected |
|-----------|------|----------|
| Create template | POST with valid data | 201 Created |
| Create invalid | POST with empty body | 400 Bad Request |
| Update template | PUT with new content | 200 OK |
| Delete template | DELETE existing | 200 OK |
| Get by ID | GET /{id} | 200 OK |
| List templates | GET / | List of templates |
| Preview | POST preview request | Rendered message |
| Fallback | No template found | Hardcoded message |
| Variable substitution | Preview với {{station_name}} | Giá trị thay thế |

---

## H) File Structure

```
src/Core/Application/
├── FDAAPI.App.FeatG99_AlertTemplateList/
├── FDAAPI.App.FeatG100_AlertTemplateCreate/
├── FDAAPI.App.FeatG101_AlertTemplateUpdate/
├── FDAAPI.App.FeatG102_AlertTemplateDelete/
├── FDAAPI.App.FeatG103_AlertTemplateGet/
└── FDAAPI.App.FeatG104_AlertTemplatePreview/

src/External/Presentation/.../Endpoints/
├── FeatG99_AlertTemplateList/
├── FeatG100_AlertTemplateCreate/
├── FeatG101_AlertTemplateUpdate/
├── FeatG102_AlertTemplateDelete/
├── FeatG103_AlertTemplateGet/
└── FeatG104_AlertTemplatePreview/
```

---

## I) Câu hỏi xác nhận

1. **Template Integration**: ✅ Confirm - Cần tích hợp vào notification flow ngay
2. **Caching**: Sẽ thêm nếu cần
3. **Versioning**: Để sau này nếu cần

---

## J) Integration vào Notification Flow (QUAN TRỌNG)

### Yêu cầu đã confirm:
- ✅ Cần tích hợp template vào notification flow
- Khi dispatch notification, ưu tiên lấy template từ DB
- Fallback về hardcoded message nếu không có template

### Kế hoạch Integration:

#### Phase: ITemplateRenderService
- [ ] Tạo `ITemplateRenderService` interface trong `FDAAPI.App.Common/Services/`
- [ ] Implement `TemplateRenderService` - render template với variables
- [ ] Register trong ServiceExtensions

#### Phase: Modify NotificationDispatchService
- [ ] Sửa `NotificationDispatchService`:
  - Tìm template phù hợp (channel + severity)
  - Render template với variables
  - Fallback nếu không có template

### Coding Standards:
- Tham khảo: `documents/.claude/coding-conventions.md`
- Tham khảo: `documents/Others/Prompt-Template-For-New-Features.md`
- Sử dụng MediatR pattern, FluentValidation, Mapper pattern
- Mỗi file chỉ chứa 1 class

### File Structure:
```
src/Core/Application/FDAAPI.App.Common/Services/
├── ITemplateRenderService.cs
└── TemplateRenderService.cs

src/External/Infrastructure/Services/Notification/
└── NotificationDispatchService.cs (modify)
```

---

## K) Next Steps

1. Tạo ITemplateRenderService
2. Modify NotificationDispatchService
3. Test với các case
