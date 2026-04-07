# Tổng quan dự án FDA Website

Tài liệu này tóm tắt trạng thái hiện tại của dự án dựa trên code trong workspace. Mục tiêu là phân biệt rõ 3 nhóm: phần đã triển khai, phần đã có UI nhưng chưa hoàn chỉnh, và phần chưa triển khai hoặc mới chỉ tồn tại trong tài liệu/spec.

## 1. Bức tranh chung

FDA Website là một frontend Next.js App Router cho hệ thống Flood Detection & Alert. Dự án đang đi theo mô hình feature-based, có các mảng chính sau:

- Xác thực và phân quyền theo role qua middleware.
- Dashboard quản trị cho trạm, thiết bị, cảm biến, cảnh báo, bản đồ vùng ngập, lịch sử ngập, tin tức, người dùng, nhật ký và subscription cảnh báo.
- Bộ component dùng lại khá lớn, gồm layout, form, table, modal và các UI primitives.
- Nhiều module có tích hợp API thật, đồng thời vẫn giữ fallback mock để chạy khi backend chưa sẵn sàng.

## 2. Đã triển khai

### 2.1. Hạ tầng và nền tảng

- Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, TanStack Table, Zustand, MapLibre GL, Recharts, React Hook Form, Zod.
- Middleware RBAC đã có, dùng để chặn truy cập theo vai trò cho các nhóm route admin, authority và các luồng auth.
- Hệ thống layout, sidebar, header, page container, theme selector và các UI primitives đã có sẵn để dùng lại.

### 2.2. Xác thực và phân quyền

- Luồng đăng nhập, đăng ký, callback Google OAuth và xử lý token đã có.
- Có helper và store cho auth session, auth utilities và logic refresh token.
- Trang forbidden và các route auth đã được dựng.

### 2.3. Quản lý station và component

- Danh sách station đã có trang quản trị riêng, có table, pagination, tìm kiếm và skeleton loading.
- Station detail đã có, gồm thông tin tổng quan, trạng thái kết nối, danh sách component và timeline incident.
- Calibration offset đã được hiển thị và có dialog cập nhật calibration.
- Component management trong station detail đã có UI và data flow cơ bản.
- API station hỗ trợ list, detail, status, component và calibration đã được nối.

### 2.4. Bản đồ vùng ngập

- Trang zones đã gắn với map shell và MapLibre.
- Có lớp hiển thị vùng, legend, layer panel, detail card và dữ liệu mock/fallback.

### 2.5. Lịch sử ngập và giám sát dữ liệu

- Trang flood history có KPI cards, trend graph, history graph, heatmap, bar chart và bộ lọc theo trạm/khoảng thời gian.
- Có store và API cho lịch sử ngập, thống kê và trends.

### 2.6. Cảnh báo, tin tức, người dùng và nhật ký

- Alert templates đã có UI quản lý và API riêng.
- News/announcements đã có trang listing và các dialog tạo/sửa.
- User management đã có trang list server-side.
- User alert subscriptions đã có trang xem danh sách.
- Logs viewer đã có.

### 2.7. Các module khác đã có UI và dữ liệu nền

- Routes: đã remove khỏi scope hiện tại (không còn route/menu admin và đã gỡ module feature tương ứng).
- Sensors: đã remove khỏi scope hiện tại (không còn route/menu admin và đã gỡ module feature tương ứng).
- Devices: đã remove khỏi scope hiện tại (không còn route/menu admin và đã gỡ module feature tương ứng).
- Areas: có danh sách và dialog chi tiết.
- Profile: đã có modal/trang cấu hình hồ sơ.

## 3. Đã có UI nhưng chưa hoàn chỉnh

- [src/app/admin/analytics/page.tsx](../src/app/admin/analytics/page.tsx) mới chỉ là stub hiển thị text, chưa có dữ liệu hoặc luồng nghiệp vụ thật.
- [src/app/admin/settings/page.tsx](../src/app/admin/settings/page.tsx) là form cấu hình hệ thống, nhưng hiện chưa thấy luồng lưu/persist rõ ràng.
- [src/app/admin/page.tsx](../src/app/admin/page.tsx) đã gọi DashboardView nhưng các hành động như tạo alert và thêm device vẫn là handler giả.
- [src/app/admin/logs/page.tsx](../src/app/admin/logs/page.tsx) có nút export nhưng chưa có chức năng xuất CSV/JSON.
- Một số form bên trong station và alert vẫn còn TODO wiring API, ví dụ create/update ở shared form layer, dù phần list/detail đã chạy được.

Lưu ý cập nhật mới:

- Các trang src/app/admin/devices/page.tsx, src/app/admin/sensors/page.tsx, src/app/admin/routes/page.tsx đã được remove khỏi route admin theo quyết định scope hiện tại.

## 4. Chưa triển khai hoặc mới chỉ có trong spec

- Không thấy route riêng cho superadmin, dù RBAC và tài liệu có nhắc tới nhóm quyền này.
- Các luồng backend nền tảng trong FE-32 như MQTT ingestion, job kiểm tra heartbeat, auto tạo incident khi offline dài giờ không nằm trong frontend này.
- FE-17 và FE-19 là các tài liệu định hướng về analytics/compare/interpretable insight; trong code hiện tại chỉ thấy scaffold module analytics và một trang analytics stub, chưa thấy sản phẩm hoàn chỉnh theo mô tả spec.
- Những phần liên quan đến backend workflow, job scheduling, data aggregation và xử lý tự động vẫn chủ yếu nằm trong tài liệu kiến trúc/spec, chưa thấy triển khai hoàn chỉnh ở frontend.

## 5. Nhận xét nhanh

- Dự án đã có nền tảng frontend khá rộng, đặc biệt ở auth, station management, zones, flood history, news và user management.
- Trạng thái hiện tại phù hợp với một dashboard đang chạy được, nhưng vẫn còn một số điểm cần hoàn thiện ở các trang stub, action handlers và persistence cho settings hoặc export.
- Nếu muốn dùng tài liệu này làm checklist phát triển tiếp, nên ưu tiên các mục trong nhóm 3 trước, sau đó mới tới các mục nhóm 4 theo spec.