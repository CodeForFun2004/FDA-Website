# FDA — Gợi ý đọc lại feature / code trước khi bảo vệ

Tài liệu này bổ sung cho `[FDA_Defense_QA.md](FDA_Defense_QA.md)` (đầy đủ follow-up) và `[FDA_Defense_QA_ChiTraLoi.md](FDA_Defense_QA_ChiTraLoi.md)` (chỉ hỏi–đáp). Ưu tiên ôn theo thứ tự **Must-read → Nên đọc → Đọc khi rảnh**.

Ba repo (đường dẫn máy bạn):

- Backend: `D:\FPTU\SEM9\SEP490\BE\FDA_API`
- Web: `D:\FPTU\SEM9\SEP490\FE\FDA-Web`
- Mobile: `D:\FPTU\SEM9\SEP490\FE\FDA-Mobile`

---

## 1. Must-read — hay bị hỏi nhất (ôn kỹ)

### 1.1 Luồng dữ liệu realtime (MQTT / job → SignalR → client)


| Việc cần nắm                                                  | File / vị trí                                                                                                                                                |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Pipeline middleware, hosted jobs, SignalR map hub, migrate DB | `[FDA_API/.../Program.cs](D:/FPTU/SEM9/SEP490/BE/FDA_API/src/External/Presentation/FDAAPI.Presentation.FastEndpointBasedApi/Program.cs)`                     |
| Hub đăng ký group `station_*`, `area_*`                       | `[FDA_API/.../Hubs/FloodDataHub.cs](D:/FPTU/SEM9/SEP490/BE/FDA_API/src/External/Presentation/FDAAPI.Presentation.FastEndpointBasedApi/Hubs/FloodDataHub.cs)` |
| Client singleton, LongPolling, token AsyncStorage, reconnect  | `[FDA-Mobile/lib/signalr-client.ts](D:/FPTU/SEM9/SEP490/FE/FDA-Mobile/lib/signalr-client.ts)`                                                                |
| Merge REST GeoJSON + Zustand SignalR                          | `[FDA-Mobile/features/map/hooks/flood/useFloodData.ts](D:/FPTU/SEM9/SEP490/FE/FDA-Mobile/features/map/hooks/flood/useFloodData.ts)`                          |
| Hooks subscribe flood / area                                  | `[FDA-Mobile/features/map/hooks/useMapData.ts](D:/FPTU/SEM9/SEP490/FE/FDA-Mobile/features/map/hooks/useMapData.ts)`, `useFloodSignalR`, `useAreaSignalR`     |


**Một câu nhớ nói:** “REST lấy snapshot ban đầu, SignalR đẩy delta; mobile merge realtime vào GeoJSON để bản đồ khớp thời gian thực.”

### 1.2 Auth web + refresh token


| Việc cần nắm                                      | File / vị trí                                                                                                                           |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Zustand persist, `getValidToken`, refresh sớm     | `[FDA-Web/src/features/authenticate/store/auth-store.ts](D:/FPTU/SEM9/SEP490/FE/FDA-Web/src/features/authenticate/store/auth-store.ts)` |
| `apiFetch`, dedupe refresh, `/auth/refresh-token` | `[FDA-Web/src/libs/api/client.ts](D:/FPTU/SEM9/SEP490/FE/FDA-Web/src/libs/api/client.ts)`                                               |
| Guard route theo role (client)                    | `[FDA-Web/src/components/guards/RoleGuard.tsx](D:/FPTU/SEM9/SEP490/FE/FDA-Web/src/components/guards/RoleGuard.tsx)`                     |


**Một câu nhớ nói:** “Phân quyền thật nằm ở API (`Roles` FastEndpoints); `RoleGuard` chỉ UX — sửa JWT trên trình duyệt không qua được server.”

### 1.3 Auth mobile (Redux + persist)


| Việc cần nắm                                | File / vị trí                                                                                                           |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Store + persist whitelist `user`, `session` | `[FDA-Mobile/app/store.ts](D:/FPTU/SEM9/SEP490/FE/FDA-Mobile/app/store.ts)`                                             |
| Slice auth, thunk login/OTP/FCM             | `[FDA-Mobile/features/auth/stores/auth.slice.ts](D:/FPTU/SEM9/SEP490/FE/FDA-Mobile/features/auth/stores/auth.slice.ts)` |


**Một câu nhớ nói:** “Auth dùng Redux Toolkit + redux-persist; map realtime dùng Zustand/React Query để khỏi nhét update tần suất cao vào Redux.”

### 1.4 AI / dự báo (đúng phạm vi đồ án)


| Việc cần nắm                                            | File / vị trí                                                                                                                                                                                                                               |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gemini batch tin crawl, JSON, rate limit, defer 429/503 | `[FDA_API/.../NewsCrawler/GeminiProcessingService.cs](D:/FPTU/SEM9/SEP490/BE/FDA_API/src/External/Infrastructure/Services/FDAAPI.Infra.Services/NewsCrawler/GeminiProcessingService.cs)`                                                    |
| Job đối chiếu prediction với cảm biến thực tế           | `[FDA_API/.../FeatG79_VerifyPredictions/VerifyPredictionsRunner.cs](D:/FPTU/SEM9/SEP490/BE/FDA_API/src/External/Presentation/FDAAPI.Presentation.FastEndpointBasedApi/BackgroundJobs/FeatG79_VerifyPredictions/VerifyPredictionsRunner.cs)` |


**Một câu nhớ nói:** “Gemini xử lý văn bản tin crawl có cấu trúc; đánh giá dự báo lũ là job verify so với sensor — không nhất thiết là RAG/vector DB trừ khi team đã triển khai (trung thực với code).”

### 1.5 Điểm “dễ bị chất vấn” — chuẩn bị trả lời thẳng

- **CORS** `AllowAnyOrigin` trong `[Program.cs](D:/FPTU/SEM9/SEP490/BE/FDA_API/src/External/Presentation/FDAAPI.Presentation.FastEndpointBasedApi/Program.cs)`: nêu rủi ro và hướng whitelist domain production.
- **Hai khối `UseHttpsRedirection`**: trùng lặp đọc code — có thể refactor; proxy HTTPS thực tế thường ở Nginx.
- **Web `src/libs/api.ts`**: có mock + `@google/genai` — phân biệt rõ phần demo và API feature (`*.api.ts`) khi demo slide.

---

## 2. Nên đọc — RBAC, admin, FCM


| Chủ đề                        | Gợi ý mở file                                                                                                                                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Endpoint `Roles("ADMIN",...)` | Bất kỳ file trong `FDA_API/.../Endpoints/` có `Roles` hoặc `AuthSchemes` (ví dụ announcement, alert template, hide flood report `FeatG134`)                                                                       |
| CRUD user / stats admin web   | `[FDA-Web/src/features/admin/store/admin-store.ts](D:/FPTU/SEM9/SEP490/FE/FDA-Web/src/features/admin/store/admin-store.ts)`, `[admin.api.ts](D:/FPTU/SEM9/SEP490/FE/FDA-Web/src/features/admin/api/admin.api.ts)` |
| Operational logs UI + filter  | Feature operational-logs, khớp mô tả Report 6                                                                                                                                                                     |
| FCM token API                 | `FeatG97_FcmTokenUpdate` (backend), `[FDA-Mobile/features/auth/stores/thunks/fcm.thunk.ts](D:/FPTU/SEM9/SEP490/FE/FDA-Mobile/features/auth/stores/thunks/fcm.thunk.ts)` (nếu cần demo push)                       |


---

## 3. Đọc khi còn thời gian

- **Subscription / payment:** endpoint `Feat71`–`Feat73`, màn `[FDA-Mobile/app/billing](D:/FPTU/SEM9/SEP490/FE/FDA-Mobile/app/billing)`, `[app/plans](D:/FPTU/SEM9/SEP490/FE/FDA-Mobile/app/plans)`.
- **News crawler + Hangfire:** đăng ký job trong `Program.cs`, job singleton NewsCrawler.
- **Redis / cache:** `ServiceExtensions` Redis, handlers analytics có `IDistributedCache`.
- **Hangfire dashboard:** `/hangfire` — nhớ nói cách hạn chế truy cập (filter authorization).

---

## 4. Tài liệu không phải code


| Tài liệu                                                                                          | Mục đích                                                                  |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `[FDA-Web/documents/report 6/3.2.11 Logs & Tasks.md](../report%206/3.2.11%20Logs%20&%20Tasks.md)` | Operational logs, role **AUTHORITY** ẩn category `system` / `moderation`  |
| `[FDA-Web/documents/report 3/](../report%203/)` (SRS PDF/DOCX)                                    | Đối chiếu use case với test `FE-xx` trong `FDA_API/src/Tests/FDAAPI.Test` |


---

## 5. Checklist ~30 phút trước khi vào phòng bảo vệ

- Vẽ miệng 1 luồng: **sensor/MQTT → xử lý → DB → broadcast SignalR → mobile merge map**.
- Nói 1 câu: **Redux auth mobile** vs **Zustand realtime map**.
- Nói 1 câu: **JWT + `Roles` server** vs `**RoleGuard` client**.
- Nói 1 câu: **Gemini news** vs **VerifyPredictions** (không nhầm với RAG nếu chưa làm).
- Thành thật 1 điểm yếu có chủ đích: **CORS / Semaphore Gemini một process / token localStorage** + hướng cải thiện ngắn.
- Mở sẵn 3 file: `Program.cs`, `signalr-client.ts`, `useFloodData.ts` (hoặc in outline) để chỉ slide khi hội đồng hỏi sâu.

---

## Liên kết tài liệu ôn trong cùng thư mục


| File                                                         | Dùng khi nào                     |
| ------------------------------------------------------------ | -------------------------------- |
| `[FDA_Defense_QA.md](FDA_Defense_QA.md)`                     | Luyện thêm follow-up, mức độ khó |
| `[FDA_Defense_QA_ChiTraLoi.md](FDA_Defense_QA_ChiTraLoi.md)` | Đọc nhanh 130 câu–đáp            |
