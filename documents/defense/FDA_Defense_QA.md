# FDA — Tài liệu chuẩn bị bảo vệ (Q&A bám source code)

**Phạm vi phân tích:** `FDA-Web`, `FDA-Mobile`, `FDA_API`  
**Tài liệu đối chiếu:** Report 6 (`documents/report 6/3.2.11 Logs & Tasks.md`), SRS Report 3 (file PDF/DOCX trong repo — trace requirement qua mã `FeatGxx` và comment test `FE-xx`).

**Quota đã đạt:** Technical ≥50 · Architecture ≥20 · AI ≥20 · Frontend ≥20 · Security ≥10 · Scalability ≥10 (**tổng tối thiểu 130 câu**).

**Lưu ý trung thực kỹ thuật:** Trong backend, tích hợp **Gemini** phục vụ pipeline **News Crawler** (batch JSON); job **VerifyPredictions** đánh giá dự báo so với đọc cảm biến. **Không** thấy vector DB / RAG full-text trong các file đã quét — nếu hội đồng hỏi RAG, trả lời đúng phạm vi đã làm hoặc nêu hướng mở rộng.

---

# PHẦN A — TECHNICAL IMPLEMENTATION (50 câu)

## Q1. Hệ thống backend được khởi tạo pipeline middleware theo thứ tự nào và vì sao thứ tự quan trọng?

### Why committee asks this

- Kiểm tra hiểu ASP.NET Core pipeline: exception handling, CORS, authentication/authorization, FastEndpoints.

### Suggested Answer

- Trong `[Program.cs](D:/FPTU/SEM9/SEP490/BE/FDA_API/src/External/Presentation/FDAAPI.Presentation.FastEndpointBasedApi/Program.cs)` có `ValidationExceptionMiddleware` gắn sớm để bắt lỗi toàn cục; sau đó CORS, rồi `UseAuthentication` trước `UseAuthorization`, cuối cùng `UseFastEndpoints`. Thứ tự đảm bảo JWT được xác thực trước khi áp rule phân quyền và vào endpoint.

### Follow-up Questions

- Điểm nào trong pipeline có thể làm lộ stack trace ra client?  
- Hangfire dashboard được bảo vệ thế nào?

### Risk Level

- Medium

---

## Q2. Cơ sở dữ liệu được migrate khi nào và rủi ro khi auto-migrate trên production?

### Why committee asks this

- Kiểm tra DevOps và an toàn triển khai EF Core.

### Suggested Answer

- `Program.cs` gọi `context.Database.Migrate()` trong scope khi startup. Ưu điểm: môi trường UAT/Deploy đồng bộ schema nhanh. Rủi ro: migration lỗi làm crash toàn app; cần backup và chiến lược migration có kiểm soát trên production.

### Follow-up Questions

- Khi nào nên tách migrate ra pipeline CI thay vì startup?

### Risk Level

- Medium

---

## Q3. Endpoint FastEndpoints được phân quyền role như thế? Cho ví dụ từ code.

### Why committee asks this

- Liên kết RBAC với JWT claims và khai báo endpoint.

### Suggested Answer

- Nhiều endpoint dùng `Roles("ADMIN","SUPERADMIN","MODERATOR")` hoặc `AuthSchemes(JwtBearerDefaults.AuthenticationScheme)` — ví dụ nhóm announcement (`FeatG89`–`FeatG93`), alert template (`FeatG99`–`FeatG104`), ẩn báo cộng đồng (`FeatG134`). Server là lớp chặn chính; client chỉ hỗ trợ UX.

### Follow-up Questions

- Nếu user sửa role trong JWT phía client thì điều gì xảy ra khi gọi API?

### Risk Level

- Easy

---

## Q4. SignalR hub `FloodDataHub` cho phép client đăng ký những kênh realtime nào?

### Why committee asks this

- Kiểm tra mô hình pub/sub và nhóm kết nối.

### Suggested Answer

- `[FloodDataHub.cs](D:/FPTU/SEM9/SEP490/BE/FDA_API/src/External/Presentation/FDAAPI.Presentation.FastEndpointBasedApi/Hubs/FloodDataHub.cs)`: `SubscribeToStation` / `UnsubscribeFromStation` thêm connection vào group `station_{stationId}`; `SubscribeToArea` / `UnsubscribeFromArea` vào group `area_{areaId}`. Hub map tại `/hubs/flood-data` trong `Program.cs`.

### Follow-up Questions

- Ai chịu trách nhiệm broadcast vào các group này — hub method hay background service?

### Risk Level

- Medium

---

## Q5. Trên mobile, client SignalR lấy token xác thực từ đâu và dùng transport gì?

### Why committee asks this

- Liên kết auth mobile với realtime.

### Suggested Answer

- `[lib/signalr-client.ts](D:/FPTU/SEM9/SEP490/FE/FDA-Mobile/lib/signalr-client.ts)`: `accessTokenFactory` đọc `access_token` từ AsyncStorage; URL hub `EXPO_PUBLIC_SIGNALR_HUB_URL` mặc định UAT; `HttpTransportType.LongPolling`; `withAutomaticReconnect` với backoff. Singleton connection + `retainFloodHub` / `releaseFloodHub` đếm consumer để không disconnect sớm.

### Follow-up Questions

- Vì sao chọn LongPolling thay vì WebSockets trên React Native?

### Risk Level

- Medium

---

## Q6. Pattern “singleton SignalR + consumer count” giải quyết vấn đề gì trên React?

### Why committee asks this

- Strict Mode / nhiều hook subscribe cùng hub.

### Suggested Answer

- `retainFloodHub` tăng `consumerCount`, `releaseFloodHub` giảm; chỉ `stopFloodHub` khi về 0 — tránh disconnect khi một màn hình unmount nhưng màn khác vẫn cần. Comment trong code còn nhắc tránh lỗi khi đang `Connecting`.

### Follow-up Questions

- Race condition khi hai tab cùng app?

### Risk Level

- Hard

---

## Q7. Luồng merge dữ liệu lũ trên mobile kết hợp REST và realtime như thế?

### Why committee asks this

- Kiểm tra nhất quán dữ liệu map.

### Suggested Answer

- `[useFloodData.ts](D:/FPTU/SEM9/SEP490/FE/FDA-Mobile/features/map/hooks/flood/useFloodData.ts)`: React Query lấy GeoJSON (`useFloodSeverityQuery`); Zustand (`useFloodRealtimeStore`) nhận cập nhật SignalR; hàm `mergeRealtimeIntoGeoJSON` ưu tiên realtime: cập nhật điểm, upsert/xóa polygon theo `stationId`, append trạm mới nếu có.

### Follow-up Questions

- Khi REST stale và SignalR mất kết nối, bản đồ hiển thị thế nào?

### Risk Level

- Hard

---

## Q8. Job `VerifyPredictionsRunner` làm gì với một bản ghi `PredictionLog`?

### Why committee asks this

- Đánh giá AI/ML governance — verification sau thực tế.

### Suggested Answer

- Lấy prediction pending (`GetPendingVerificationAsync`), xác định `AreaId` hoặc `AdministrativeAreaId`, gom danh sách trạm (radius hoặc phân cấp ward/district/city), so sánh với đọc cảm biến thực tế (logic tiếp theo trong file), ghi nhận verified/errors. Đây là vòng “đóng” để đánh giá độ tin cậy dự báo.

### Follow-up Questions

- Metric cụ thể để xác định prediction đúng/sai?

### Risk Level

- Hard

---

## Q9. `GeminiProcessingService` giới hạn batch và xử lý lỗi API thế nào?

### Why committee asks this

- Chi phí, ổn định, retry AI.

### Suggested Answer

- `[GeminiProcessingService.cs](D:/FPTU/SEM9/SEP490/BE/FDA_API/src/External/Infrastructure/Services/FDAAPI.Infra.Services/NewsCrawler/GeminiProcessingService.cs)`: `MaxBatchSize = 10`, `RequestsPerMinute = 5`, timeout 30s, `responseMimeType = application/json`, endpoint `gemini-2.5-flash`. `SemaphoreSlim` + `EnforceRateLimitAsync`; HTTP 429/503 trả `DeferredRun` để schedule chạy lại; parse JSON array, fail nếu không hợp lệ.

### Follow-up Questions

- Gemini haluclinate JSON — pipeline phòng vệ tại đâu?

### Risk Level

- Medium

---

## Q10. Hosted service `MqttIngestionJob` đặt trong kiến trúc tổng thể vai trò gì?

### Why committee asks this

- Luồng dữ liệu cảm biến thời gian thực.

### Suggested Answer

- `Program.cs` đăng ký hosted services: xử lý cảnh báo (`Feat42`), gửi thông báo (`Feat43`), **MQTT ingestion** (`Feat54`), log retention (`Feat132`). MQTT ingestion đưa dữ liệu trạm vào hệ thống để các job khác và SignalR có nguồn.

### Follow-up Questions

- Nếu MQTT broker down, hệ thống degrade thế nào?

### Risk Level

- Medium

---

## Q11. Hangfire được dùng cho những tác vụ nào ngoài recurring dashboard?

### Why committee asks this

- Phân biệt HostedService vs Hangfire.

### Suggested Answer

- `Program.cs` có `UseHangfireDashboard`, `RegisterAnalyticsRecurringJobs`, `RegisterAnnouncementRecurringJobs`, `RegisterNewsCrawlerRecurringJobs`. VerifyPredictions đăng ký scoped runner cho Hangfire trigger. Tách tác vụ nặng khỏi request HTTP.

### Follow-up Questions

- Idempotency của job crawler?

### Risk Level

- Medium

---

## Q12. API refresh token phía web được gọi khi nào trong `apiFetch`?

### Why committee asks this

- Session và race condition.

### Suggested Answer

- `[api/client.ts](D:/FPTU/SEM9/SEP490/FE/FDA-Web/src/libs/api/client.ts)`: trước mỗi request gọi `useAuthStore.getState().getValidToken()`; store tự refresh khi hết hạn; client có `isRefreshing` + `refreshPromise` dedupe nhiều request đồng thời; POST `/auth/refresh-token` với body refresh token.

### Follow-up Questions

- Tại sao không để mỗi 401 tự refresh (đoạn còn lại của file)?

### Risk Level

- Medium

---

## Q13. Zustand `getValidToken` proactive refresh hoạt động ra sao?

### Why committee asks this

- UX và tránh 401 hàng loạt.

### Suggested Answer

- `[auth-store.ts](D:/FPTU/SEM9/SEP490/FE/FDA-Web/src/features/authenticate/store/auth-store.ts)`: nếu token sắp hết hạn trong 5 phút thì `refreshSession()` chạy nền, vẫn trả token hiện tại; nếu đã hết hạn thì await refresh. Giảm gián đoạn thao tác admin.

### Follow-up Questions

- Clock skew giữa client và server?

### Risk Level

- Medium

---

## Q14. Redux mobile persist whitelist những key nào và tại sao?

### Why committee asks this

- Bảo mật và khôi phục phiên.

### Suggested Answer

- `[app/store.ts](D:/FPTU/SEM9/SEP490/FE/FDA-Mobile/app/store.ts)`: `authPersistConfig` whitelist `user`, `session` trong AsyncStorage; middleware ignore serializable actions của redux-persist. Giảm lưu thừa; token nằm trong session để app khởi động lại vẫn đăng nhập.

### Follow-up Questions

- Refresh token lưu plaintext trong AsyncStorage — rủi ro?

### Risk Level

- Medium

---

## Q15. Thunk `registerFcmToken` xuất hiện trong auth slice — luồng push notification liên quan API nào?

### Why committee asks this

- Liên kết FCM với backend.

### Suggested Answer

- `[auth.slice.ts](D:/FPTU/SEM9/SEP490/FE/FDA-Mobile/features/auth/stores/auth.slice.ts)` re-export `registerFcmToken` từ `fcm.thunk`; backend có endpoint `FeatG97_FcmTokenUpdate` yêu cầu JWT. Mobile đăng ký token thiết bị để `NotificationDispatchJob` có đích gửi.

### Follow-up Questions

- Xử lý khi user revoke notification permission?

### Risk Level

- Medium

---

## Q16. Test tích hợp `FE24`, `FE25` trong repo backend đang trace requirement nào?

### Why committee asks this

- Kiểm chứng traceability SRS ↔ code.

### Suggested Answer

- File test comment `FE-24` community flood reports, `FE-25` vote; gọi `/api/v1/flood-reports` và `/vote`. Dùng làm bằng chứng kiểm thử hội đồng.

### Follow-up Questions

- Coverage cho moderator hide report (`FeatG134`)?

### Risk Level

- Easy

---

## Q17. Kestrel `MaxRequestBodySize` 300MB phục vụ feature gì?

### Why committee asks this

- Upload media/video flood report.

### Suggested Answer

- Comment trong `Program.cs`: video uploads. Cần giới hạn phía client và validate type để tránh abuse.

### Follow-up Questions

- Rate limit upload?

### Risk Level

- Easy

---

## Q18. `EvaluateAllDistrictsHandler` và Redis — khi Redis fail thì sao?

### Why committee asks this

- Resilience cache.

### Suggested Answer

- Handler có `catch { /* Redis unavailable */ }` — tiếp tục không cache hoặc fallback (cần đọc chi tiết handler); pattern graceful degradation.

### Follow-up Questions

- Stampede cache khi Redis reboot?

### Risk Level

- Hard

---

## Q19. Trang Operational Logs trên web ẩn category với role AUTHORITY — được mô tả ở đâu?

### Why committee asks this

- RBAC tinh chỉnh UX.

### Suggested Answer

- `[3.2.11 Logs & Tasks.md](D:/FPTU/SEM9/SEP490/FE/FDA-Web/documents/report%206/3.2.11%20Logs%20&%20Tasks.md)`: role `AUTHORITY` không thấy `system` và `moderation` trong filter và bảng.

### Follow-up Questions

- Ai được coi là AUTHORITY trong seed data?

### Risk Level

- Medium

---

## Q20. Google OAuth callback trên web hydrate Zustand và cookie như thế?

### Why committee asks this

- Đồng bộ token sau redirect.

### Suggested Answer

- `[auth/callback/page.tsx](D:/FPTU/SEM9/SEP490/FE/FDA-Web/src/app/auth/callback/page.tsx)`: ghi `localStorage` token keys; `useAuthStore.setState` với `expiresAt`; `setAuthSessionCookies` theo roles; replace history để token không nằm trong URL hash.

### Follow-up Questions

- XSS đánh cắp localStorage — mitigations?

### Risk Level

- Hard

---

## Q21. `RoleGuard` là server hay client guard? Giới hạn của nó?

### Why committee asks this

- Defense in depth.

### Suggested Answer

- `[RoleGuard.tsx](D:/FPTU/SEM9/SEP490/FE/FDA-Web/src/components/guards/RoleGuard.tsx)`: client-only; đọc `user.roles` từ store; redirect `/auth/login` hoặc `/auth/forbidden`. Không thay thế kiểm tra JWT phía server.

### Follow-up Questions

- Kẻ tấn công bypass bằng cách gọi API trực tiếp?

### Risk Level

- Easy

---

## Q22. Admin store (`admin-store.ts`) quản lý phân trang và thao tác CRUD user — pattern gọi API?

### Why committee asks this

- Kiểm tra tách lớp FE.

### Suggested Answer

- Store gọi `admin.api` (`getAdminUsersApi`, `updateUserRolesApi`, …), giữ `page`, `limit`, `total`, trạng thái loading/error — đồng bộ UI bảng admin.

### Follow-up Questions

- Optimistic update có dùng không?

### Risk Level

- Easy

---

## Q23. Community reports query mobile đặt `staleTime` 30s — lý do?

### Why committee asks this

- Cân bằng REST vs SignalR.

### Suggested Answer

- Comment trong `useCommunityReportsQuery.ts`: dữ liệu gần realtime nhờ SignalR nên không refetch quá dày.

### Follow-up Questions

- Invalidate query khi nhận event SignalR?

### Risk Level

- Medium

---

## Q24. Subscription endpoints (`Feat71`–`Feat73`) xác định user từ đâu?

### Why committee asks this

- Thanh toán và tenant.

### Suggested Answer

- `SubscribeToPlanEndpoint` comment “Extract user ID from JWT” — user id từ claims token, không tin client body.

### Follow-up Questions

- Webhook payment verify signature?

### Risk Level

- Medium

---

## Q25. `GeminiRateLock` static Semaphore — tác dụng trong multi-instance server?

### Why committee asks this

- Scale-out correctness.

### Suggested Answer

- Chỉ đồng bộ trong một process; multi-instance vẫn có thể vượt quota Gemini — cần Redis distributed lock hoặc quota ở API gateway (điểm hạn chế thật).

### Follow-up Questions

- Bạn đề xuất cải tiến gì?

### Risk Level

- Hard

---

## Q26. EF Core migration throw khi lỗi — ảnh hưởng SLA?

### Why committee asks this

- Availability.

### Suggested Answer

- `catch` log và `throw` — app không start nếu DB sai; phù hợp fail-fast nhưng downtime khi migration lỗi.

### Follow-up Questions

- Blue-green deployment?

### Risk Level

- Medium

---

## Q27. FastEndpoints global validation error format?

### Why committee asks this

- Hợp đồng API cho frontend.

### Suggested Answer

- `Errors.ResponseBuilder` trả `success: false`, `message: Validation failed`, `errors` array field/message — frontend parse thống nhất.

### Follow-up Questions

- i18n message phía server?

### Risk Level

- Easy

---

## Q28. `maximumReceiveMessageSize` SignalR 100KB — ảnh hưởng payload flood update?

### Why committee asks this

- Giới hạn realtime.

### Suggested Answer

- Config trong `Program.cs`; payload GeoJSON lớn có thể cần chunk hoặc chỉ gửi delta — risk nếu vượt ngưỡng.

### Follow-up Questions

- Nén payload?

### Risk Level

- Medium

---

## Q29. Chức năng ẩn báo cộng đồng `FeatG134` phân quyền ai?

### Why committee asks this

- Moderation workflow.

### Suggested Answer

- Endpoint `Roles("ADMIN","SUPERADMIN","MODERATOR")` — moderator có quyền ẩn báo giả.

### Follow-up Questions

- Audit log khi hide?

### Risk Level

- Easy

---

## Q30. `NewsCrawlerJob` singleton + Hangfire — vì sao không HostedService?

### Why committee asks this

- Lifecycle và scheduling.

### Suggested Answer

- Comment `Program.cs`: driven by Hangfire, không phải HostedService — linh hoạt lịch recurring và monitor dashboard.

### Follow-up Questions

- Job overlap prevention?

### Risk Level

- Medium

---

## Q31. Mobile `useMapData` gọi `useFloodSignalR` và `useAreaSignalR` — đăng ký theo id nào?

### Why committee asks this

- Hiệu năng subscribe.

### Suggested Answer

- `useMapData.ts` bật overlay flood; `useAreaSignalR(areaIds)` subscribe theo danh sách khu vực đang load — giảm broadcast thừa.

### Follow-up Questions

- Giới hạn số areaIds?

### Risk Level

- Medium

---

## Q32. Web `libs/api.ts` vừa mock generator vừa `@google/genai` — production dùng nhánh nào?

### Why committee asks this

- Tránh nhầm demo vs thật.

### Suggested Answer

- File khởi tạo `GoogleGenAI` với `NEXT_PUBLIC_GEMINI_API_KEY` nhưng chứa mock users/devices; một số view như `zones-view` import hook từ `@/libs/api` — cần nói rõ phần dashboard production dùng feature API (`*.api.ts`) và backend thật; phần mock chỉ dev/UI prototype.

### Follow-up Questions

- Kế hoạch loại bỏ mock?

### Risk Level

- Hard

---

## Q33. `clear-old-tokens` / `auth-utils` — can thiệp token legacy?

### Why committee asks this

- Migration auth.

### Suggested Answer

- Có file `[clear-old-tokens.ts](D:/FPTU/SEM9/SEP490/FE/FDA-Web/src/libs/clear-old-tokens.ts)`, `[auth-utils.ts](D:/FPTU/SEM9/SEP490/FE/FDA-Web/src/libs/auth-utils.ts)` — dọn key cũ tránh xung đột version OAuth.

### Follow-up Questions

- Versioning token schema?

### Risk Level

- Medium

---

## Q34. Testcontainers Redis trong `ApiWebApplicationFactory` phục vụ test gì?

### Why committee asks this

- Chiến lược test tích hợp.

### Suggested Answer

- Factory thêm StackExchange Redis cache cho OAuth state — test gần production.

### Follow-up Questions

- Test song song CI có chậm không?

### Risk Level

- Medium

---

## Q35. Station components CRUD (`FeatG105`–`FeatG109`) phân quyền khác nhau thế nào?

### Why committee asks this

- Principle of least privilege.

### Suggested Answer

- Create/update/delete `ADMIN`,`SUPERADMIN`; list/get có thêm `USER` — user xem được nhưng không sửa.

### Follow-up Questions

- Kiểm tra ownership station?

### Risk Level

- Easy

---

## Q36. Mobile NetInfo — có trong dependency; offline UX áp dụng chỗ nào?

### Why committee asks this

- Offline-first.

### Suggested Answer

- `@react-native-community/netinfo` trong `package.json`; cần chỉ rõ màn hình map/report có queue offline hay chỉ toast — trả lời trung thực theo code đã implement (`useNetworkStore` zustand).

### Follow-up Questions

- TanStack Query persist client?

### Risk Level

- Medium

---

## Q37. Zustand `usePlaceSearchHistoryStore` persist — UX gì?

### Why committee asks this

- Local UX polish.

### Suggested Answer

- Lịch sử tìm địa điểm map persist — giảm gõ lại.

### Follow-up Questions

- Privacy?

### Risk Level

- Easy

---

## Q38. Backend `AddCacheServices` và Redis connection string bắt buộc?

### Why committee asks this

- Config deployment.

### Suggested Answer

- `[ServiceExtensions.cs](D:/FPTU/SEM9/SEP490/BE/FDA_API/src/External/Infrastructure/Common/FDAAPI.Infra.Configuration/ServiceExtensions.cs)` throw nếu thiếu `RedisConnection` khi đăng ký cache — production phải có Redis.

### Follow-up Questions

- Fallback in-memory cache?

### Risk Level

- Medium

---

## Q39. `VerifyPredictions` với administrative area level `city` — độ phức tạp?

### Why committee asks this

- Algorithm và performance.

### Suggested Answer

- Query districts → wards → gom ward ids → filter stations — nested queries O(k) areas; với pageSize 10000 stations có thể nặng — điểm tối ưu index DB.

### Follow-up Questions

- Spatial query thay vì filter in-memory?

### Risk Level

- Hard

---

## Q40. `FeatG56_EvaluateAllDistricts` dùng cache — mục tiêu business?

### Why committee asks this

- AI/analytics flood hotspot.

### Suggested Answer

- Handler evaluate districts — cache giảm tải tính toán lặp (chi tiết trong handler).

### Follow-up Questions

- TTL cache?

### Risk Level

- Medium

---

## Q41. Web Sentry (`@sentry/nextjs`) — lỗi production thu thập ra sao?

### Why committee asks this

- Observability.

### Suggested Answer

- Dependency trong `package.json` — cấu hình `sentry.*` khi build; giúp hội đồng thấy giám sát lỗi client/server.

### Follow-up Questions

- PII scrubbing?

### Risk Level

- Easy

---

## Q42. Mobile supercluster + map clustering — bài toán UX?

### Why committee asks this

- Hiển thị nhiều điểm báo.

### Suggested Answer

- Dependencies `supercluster`, `react-native-map-clustering` — gom marker khi zoom out.

### Follow-up Questions

- Performance O(n)?

### Risk Level

- Medium

---

## Q43. `FeatG97` FCM token update — method HTTP?

### Why committee asks this

- REST contract.

### Suggested Answer

- Endpoint class `FcmTokenUpdateEndpoint` với JWT scheme — mobile POST token sau khi refresh FCM.

### Follow-up Questions

- Multi-device token table?

### Risk Level

- Easy

---

## Q44. Payment/plan admin endpoints `FeatG122`–`FeatG127` — scope báo cáo đồ án?

### Why committee asks this

- Business completeness.

### Suggested Answer

- Admin xem payment, complaints — phần vận hành và monetization; liên hệ use case billing trên mobile `app/billing`.

### Follow-up Questions

- PCI scope?

### Risk Level

- Medium

---

## Q45. `OperationalLogs` export `FeatG133` — định dạng?

### Why committee asks this

- Compliance và audit.

### Suggested Answer

- Export operational logs cho admin — định dạng cần xem endpoint (CSV/Excel) khi demo.

### Follow-up Questions

- Size limit export?

### Risk Level

- Easy

---

## Q46. React Query trong web (`@tanstack/react-query`) — dùng chung pattern gì?

### Why committee asks this

- Data fetching layer.

### Suggested Answer

- Nhiều feature gọi API qua hooks query; kết hợp Zustand cho auth không trộn với server cache.

### Follow-up Questions

- Query key convention?

### Risk Level

- Easy

---

## Q47. `next-intl` trong web — đa ngôn ngữ?

### Why committee asks this

- i18n.

### Suggested Answer

- Dependency `next-intl` — chuẩn bị đường dịch portal admin/mod.

### Follow-up Questions

- Locale flood alert message?

### Risk Level

- Easy

---

## Q48. Mobile `expo-secure-store` — lưu gì so với AsyncStorage?

### Why committee asks this

- Secret storage.

### Suggested Answer

- Package có trong dependencies — thích hợp secret nhạy cảm hơn; auth hiện persist qua redux AsyncStorage — có thể nêu đề xuất cải tiến.

### Follow-up Questions

- Threat model jailbreak?

### Risk Level

- Hard

---

## Q49. Hai lần `UseHttpsRedirection()` trong `Program.cs` — có bug không?

### Why committee asks this

- Attention to detail.

### Suggested Answer

- Một khối chỉ Development và một khối global — trùng logic, có thể refactor; không nhất thiết break nhưng dễ gây nhầm khi đọc pipeline.

### Follow-up Questions

- Reverse proxy termination HTTPS?

### Risk Level

- Medium

---

## Q50. `AllowAnyOrigin` CORS — rủi ro và cách khắc phục production?

### Why committee asks this

- Security realism.

### Suggested Answer

- `CorsPolicy` allow any origin — tiện dev/mobile nhưng CSRF-like risks với cookie nếu mis-config; production nên whitelist domain web admin và mobile scheme, hoặc dùng token chỉ header không cookie cross-site.

### Follow-up Questions

- SameSite cookie?

### Risk Level

- Hard

---

# PHẦN B — ARCHITECTURE (20 câu)

## A1. Vì sao chọn FastEndpoints thay vì Controller MVC truyền thống?

### Why committee asks this

- Kiến trúc API hiện đại.

### Suggested Answer

- FastEndpoints gom endpoint theo feature (`FeatGxx`), validation và Swagger gọn; phù hợp API-first, vertical slice.

### Follow-up Questions

- Minimal APIs so sánh?

### Risk Level

- Medium

---

## A2. Kiến trúc Clean Architecture trong repo thể hiện qua thư mục nào?

### Why committee asks this

- Separation of concerns.

### Suggested Answer

- `Core/Application` handlers theo feature, `Domain.RelationalDb` entities, `Infra` persistence/services, `Presentation` endpoints — dependency hướng vào domain.

### Follow-up Questions

- Vi phạm layer nào dễ gặp?

### Risk Level

- Easy

---

## A3. Vì sao mobile dùng **cả** Redux Toolkit và Zustand?

### Why committee asks this

- Quyết định kiến trúc FE quan trọng nhất đồ án.

### Suggested Answer

- Redux + persist cho **auth** (single source, thunk async, tooling quen); Zustand cho **realtime map** và store nhẹ (`useFloodRealtimeStore`, …) vì cập nhật tần suất cao, ít boilerplate, merge với React Query hiệu quả.

### Follow-up Questions

- Gộp hết vào một được không?

### Risk Level

- Hard

---

## A4. Web chỉ dùng Zustand + React Query — kiến trúc “server state vs client state”?

### Why committee asks this

- Phân tách concern.

### Suggested Answer

- React Query giữ **server state** (cache, stale, refetch); Zustand auth + admin store giữ **session và UI state** pagination/modals.

### Follow-up Questions

- Duplicate source of truth?

### Risk Level

- Medium

---

## A5. Luồng realtime tổng thể từ MQTT đến mobile map?

### Why committee asks this

- End-to-end architecture.

### Suggested Answer

- MQTT ingestion → xử lý/lưu DB → hosted jobs & realtime service broadcast SignalR → hub groups station/area → mobile SignalR merge vào GeoJSON layer.

### Follow-up Questions

- Single point of failure?

### Risk Level

- Hard

---

## A6. Hangfire + HostedService cùng tồn tại — nguyên tắc phân chia?

### Why committee asks this

- Background processing design.

### Suggested Answer

- HostedService cho vòng lặp liên tục (ingestion, alert pipeline); Hangfire cho job lịch/recurring có dashboard và retry (analytics, news crawler, verify predictions trigger).

### Follow-up Questions

- Duplicate scheduling risk?

### Risk Level

- Medium

---

## A7. Feature folder `FeatGxx` — lợi ích cho nhóm 5–7 người?

### Why committee asks this

- Agile scaling.

### Suggested Answer

- Giảm conflict merge, ownership rõ, map 1-1 với backlog trace `FE-xx` trong test.

### Follow-up Questions

- Shared kernel duplicate?

### Risk Level

- Easy

---

## A8. Admin portal Next.js App Router — route protection pattern?

### Why committee asks this

- FE architecture.

### Suggested Answer

- `RoleGuard` + layout route `/admin` + pages moderator; kết hợp `auth-session` bridge và login flow.

### Follow-up Questions

- Middleware Next.js?

### Risk Level

- Medium

---

## A9. Mobile Expo Router — lợi thế file-based routing?

### Why committee asks this

- Structure app.

### Suggested Answer

- Thư mục `app/` map route; deep link plans/map/guest — giảm config navigation thủ công.

### Follow-up Questions

- Auth guard ở layout?

### Risk Level

- Easy

---

## A10. Sep Redis cache vs DB — khi nào đọc DB trực tiếp?

### Why committee asks this

- Caching strategy.

### Suggested Answer

- Handlers hotspot/analytics dùng `IDistributedCache` short-circuit; miss thì tính và ghi lại — chi tiết TTL từng handler.

### Follow-up Questions

- Cache invalidation khi có sensor mới?

### Risk Level

- Hard

---

## A11. AI trong hệ thống tách thành hai nhánh chính — đó là gì?

### Why committee asks this

- Conceptual diagram oral exam.

### Suggested Answer

- (1) **Gemini** xử lý văn bản tin tức crawl thành JSON có cấu trúc; (2) **Prediction logs + VerifyPredictions** đánh giá mô hình dự báo lũ so thực tế — không gộp thành một “chatbot”.

### Follow-up Questions

- Model training ở đâu?

### Risk Level

- Medium

---

## A12. SignalR không thay REST — vì sao kiến trúc hybrid?

### Why committee asks this

- Right tool choice.

### Suggested Answer

- REST cho GeoJSON ban đầu, phân trang, CRUD; SignalR cho delta realtime nhỏ — giảm tải và đơn giản retry HTTP.

### Follow-up Questions

- WebSocket trực tiếp?

### Risk Level

- Medium

---

## A13. Monolith FDA_API — khi nào tách microservice?

### Why committee asks this

- Evolution architecture.

### Suggested Answer

- Hiện monolith + background jobs đủ cho capstone; tách khi đội DevOps đủ và có bottleneck đo được (ingestion, AI) — đề xuất extrade MQTT worker hoặc AI worker.

### Follow-up Questions

- Event bus?

### Risk Level

- Medium

---

## A14. Test project map requirement `FE-xx` — vai trò trong architecture?

### Why committee asks this

- Quality gate.

### Suggested Answer

- `FDAAPI.Test` giữ contract API cho user stories — là “living documentation” cho SRS.

### Follow-up Questions

- Mutation testing?

### Risk Level

- Easy

---

## A15. `IRealtimeMapService` scope `Scoped` — ý nghĩa với Hub?

### Why committee asks this

- DI lifetime.

### Suggested Answer

- Scoped per request/hub context trong ASP.NET — tránh singleton stateful sai; hub inject logger/services đúng lifecycle.

### Follow-up Questions

- Singleton broadcast service?

### Risk Level

- Hard

---

## A16. Web MapLibre + Google Maps API — hai thư viện map — tại sao?

### Why committee asks this

- FE mapping stack.

### Suggested Answer

- `package.json` có `@react-google-maps/api` và `maplibre-gl` — có thể dùng cho layer khác nhau (admin vs visualization) — trả lời theo module zones/stations đang dùng.

### Follow-up Questions

- Chi phí license Google?

### Risk Level

- Medium

---

## A17. Notification pipeline `Feat43` + FCM — kiến trúc asynchronous?

### Why committee asks this

- Alert reliability.

### Suggested Answer

- Dispatch job tách khỏi HTTP request user — đảm bảo retry và không block API.

### Follow-up Questions

- Dead letter queue?

### Risk Level

- Medium

---

## A18. Repository pattern trong Domain — lợi ích test?

### Why committee asks this

- Testability.

### Suggested Answer

- Handlers nhận `IStationRepository`, … — mock trong unit test, integration test dùng Testcontainers.

### Follow-up Questions

- Over-abstraction?

### Risk Level

- Easy

---

## A19. Version API `/api/v1` — chiến lược breaking change?

### Why committee asks this

- API lifecycle.

### Suggested Answer

- Tests và Swagger gọi `/api/v1/...` — chuẩn bị v2 song song khi đổi contract.

### Follow-up Questions

- Deprecation header?

### Risk Level

- Easy

---

## A20. `Scalar`/`Swagger` documentation — ai là consumer?

### Why committee asks this

- DX và handoff.

### Suggested Answer

- Swagger UI bật Dev/UAT — mobile/web teams đồng bộ DTO; JWT scheme doc sẵn.

### Follow-up Questions

- OpenAPI codegen?

### Risk Level

- Easy

---

# PHẦN C — AI & PREDICTION (20 câu)

## AI1. Model Gemini cụ thể và output format là gì?

### Why committee asks this

- Accuracy of claims.

### Suggested Answer

- `gemini-2.5-flash` qua REST `generateContent`; `generationConfig.responseMimeType = application/json` — ép model trả JSON để parse an toàn hơn free text.

### Follow-up Questions

- Schema validation với FluentValidation?

### Risk Level

- Medium

---

## AI2. Batch tối đa 10 bài báo — lý do?

### Why committee asks this

- Token economics.

### Suggested Answer

- Giảm độ trễ và kích thước prompt; tránh timeout 30s; dễ retry batch.

### Follow-up Questions

- Chi phí token ước lượng?

### Risk Level

- Medium

---

## AI3. Rate limit 5 request/phút + Semaphore — giải thích “double control”?

### Why committee asks this

- Production stability.

### Suggested Answer

- Constants `RequestsPerMinute` + lock serialize — chống burst và race trong đa luồng async.

### Follow-up Questions

- Distributed deployment?

### Risk Level

- Hard

---

## AI4. Khi Gemini trả invalid JSON array pipeline xử lý sao?

### Why committee asks this

- Hallucination handling.

### Suggested Answer

- Log warning, `GeminiBatchResult.Failed` — không ghi nhận dữ liệu sai cấu trúc; có thể manual review hoặc retry batch sau.

### Follow-up Questions

- JSON schema validate?

### Risk Level

- Medium

---

## AI5. HTTP 429/503 — vì sao `DeferredRun` thay vì fail cứng?

### Why committee asks this

- Resilience patterns.

### Suggested Answer

- Tạm hoãn sang lần schedule Hangfire — tránh mất dữ liệu crawl khi API Google gián đoạn.

### Follow-up Questions

- Exponential backoff?

### Risk Level

- Medium

---

## AI6. `VerifyPredictions` gắn với “trustworthy AI” như thế trong báo cáo?

### Why committee asks this

- Ethics / evaluation.

### Suggested Answer

- Sau thời điểm dự báo, hệ thống đối chiếu đọc trạm thực tế để đánh dấu verified — đây là **post-hoc evaluation**, không phải training online.

### Follow-up Questions

- Confusion matrix?

### Risk Level

- Hard

---

## AI7. Dự báo theo `Area` người dùng vẽ khác `AdministrativeArea` thế nào?

### Why committee asks this

- Domain logic AI input.

### Suggested Answer

- `AreaId` dùng bán kính `RadiusMeters`; administrative dùng phân cấp hành chính — ảnh hưởng tập trạm đối chiếu khi verify.

### Follow-up Questions

- Edge case trạm nằm ranh giới ward?

### Risk Level

- Hard

---

## AI8. Có embedding / vector search trong codebase không?

### Why committee asks this

- Tránh thổi phồng RAG.

### Suggested Answer

- Không thấy trong các file đã quét — nếu đồ án không triển khai RAG, trả lời thẳng; đề xuất mở rộng: embed tin tức đã crawl để semantic search.

### Follow-up Questions

- PostgreSQL pgvector?

### Risk Level

- Medium

---

## AI9. Web `@google/genai` trong `libs/api.ts` phục vụ AI feature gì trên dashboard?

### Why committee asks this

- Scope clarity.

### Suggested Answer

- Khởi tạo client SDK; cần chỉ rõ feature UI nào gọi (nếu chỉ prototype) — tránh nhầm với backend Gemini news pipeline.

### Follow-up Questions

- API key exposure `NEXT_PUBLIC_*`?

### Risk Level

- Hard

---

## AI10. Crawler news + Gemini — output phục vụ user story nào?

### Why committee asks this

- Business value.

### Suggested Answer

- Cung cấp tin lũ đã tóm tắt/cấu trúc cho portal (`news` feature web) — giảm đọc thủ công.

### Follow-up Questions

- Fact-check pipeline?

### Risk Level

- Medium

---

## AI11. Confidence score có trong entity `PredictionLog` không?

### Why committee asks this

- Model outputs.

### Suggested Answer

- Cần xem entity trong Domain — nếu có field confidence hãy trích; nếu không, nói verification nhị phân verified/error.

### Follow-up Questions

- Calibration?

### Risk Level

- Medium

---

## AI12. Prompt `BuildPrompt` trong Gemini service — nguyên tắc thiết kế?

### Why committee asks this

- Prompt engineering.

### Suggested Answer

- Prompt build từ danh sách `CrawledArticle` — output JSON array để map vào DB; giữ instructions rõ schema giảm hallucination định dạng.

### Follow-up Questions

- Few-shot examples?

### Risk Level

- Medium

---

## AI13. AI có auto-trigger cảnh báo người dân không hay chỉ admin?

### Why committee asks this

- Safety critical path.

### Suggested Answer

- Alert pipeline `Feat42` + notification `Feat43` là luồng operational — Gemini news có thể chỉ hỗ trợ nội dung, không trực tiếp bắn alert trừ khi có rule nghiệp vụ nối — trả lời đúng luồng đã code.

### Follow-up Questions

- Human-in-the-loop publish?

### Risk Level

- Hard

---

## AI14. Thuật ngữ “prediction verification limit 100” — ảnh hưởng backlog?

### Why committee asks this

- Operational bounds.

### Suggested Answer

- `GetPendingVerificationAsync(..., limit: 100)` — mỗi run xử lý tối đa 100 — chống job dài; backlog lớn cần tăng frequency hoặc parallel shard.

### Follow-up Questions

- Poison message?

### Risk Level

- Medium

---

## AI15. Model flood prediction train bằng dữ liệu gì trong đồ án?

### Why committee asks this

- Data lineage.

### Suggested Answer

- Trả lời theo báo cáo/bộ dữ liệu thực tế team dùng (sensor history, rainfall…) — trích handler evaluate/prediction log schema nếu có mô tả.

### Follow-up Questions

- Class imbalance?

### Risk Level

- Hard

---

## AI16. Có fine-tune Gemini không?

### Why committee asks this

- ML depth.

### Suggested Answer

- Hiện dùng API generateContent — không fine-tune; nếu có thì nêu riêng.

### Follow-up Questions

- Cost fine-tune?

### Risk Level

- Easy

---

## AI17. `EvaluateAllDistricts` vs `AdministrativeAreasEvaluate` — khác nhau?

### Why committee asks this

- AI evaluation scope.

### Suggested Answer

- Hai handler khác phạm vi địa lý/tính toán (district batch vs single area) — tham chiếu Application layer.

### Follow-up Questions

- Duplicate code?

### Risk Level

- Medium

---

## AI18. Làm sao giảm chi phí Gemini?

### Why committee asks this

- Cost optimization.

### Suggested Answer

- Batch 10, rate limit, defer retry; cache kết quả crawl; chỉ gửi nội dung cần thiết trong prompt.

### Follow-up Questions

- Summarize article trước khi Gemini?

### Risk Level

- Medium

---

## AI19. Tin giả từ news crawl — biện pháp?

### Why committee asks this

- Misinformation.

### Suggested Answer

- Moderator/admin duyệt nguồn; có thể whitelist domain crawler; không auto push alert chỉ từ tin chưa verify.

### Follow-up Questions

- Source reputation score?

### Risk Level

- Medium

---

## AI20. Metrics alert performance `FeatG129` — liên quan AI không?

### Why committee asks this

- Observability AI ops.

### Suggested Answer

- Endpoint metrics hiệu năng cảnh báo — có thể dùng để đánh giá độ trễ pipeline AI/notification.

### Follow-up Questions

- SLA notification?

### Risk Level

- Easy

---

# PHẦN D — FRONTEND (WEB + MOBILE) (20 câu)

## F1. `RoleGuard` kiểm tra role thế nào và loading UX?

### Why committee asks this

- UX auth.

### Suggested Answer

- Chờ `status` khác loading/idle; spinner “Checking permissions…”; redirect nếu thiếu role.

### Follow-up Questions

- Flash of unauthorized content?

### Risk Level

- Easy

---

## F2. Admin operational logs view — tương tác filter/sort theo doc Report 6?

### Why committee asks this

- SRS alignment.

### Suggested Answer

- Toolbar search, time range, severity, category; sort cột; drawer chi tiết JSON — khớp mô tả `3.2.11`.

### Follow-up Questions

- Virtualize large table?

### Risk Level

- Medium

---

## F3. Map zones/stations web — hooks `useMapStationsList`, `useAdministrativeAreasMapData` làm gì?

### Why committee asks this

- Data hooks architecture.

### Suggested Answer

- Tách fetch stations và ranh giới hành chính — ghép layer map; giảm component monolith.

### Follow-up Questions

- Debounce search?

### Risk Level

- Medium

---

## F4. Form validation web — stack?

### Why committee asks this

- DX và quality.

### Suggested Answer

- `react-hook-form` + `zod` resolvers trong dependencies — schema-first validation.

### Follow-up Questions

- Server validation mismatch?

### Risk Level

- Easy

---

## F5. Toast `sonner` — pattern feedback?

### Why committee asks this

- UX consistency.

### Suggested Answer

- OAuth callback success/error dùng toast — feedback không chặn luồng.

### Follow-up Questions

- Accessibility announcements?

### Risk Level

- Easy

---

## F6. Mobile map clustering — user zoom in thấy chi tiết điểm báo?

### Why committee asks this

- Interaction design.

### Suggested Answer

- Supercluster expand khi zoom — giảm chồng marker.

### Follow-up Questions

- Dynamic marker rendering perf?

### Risk Level

- Medium

---

## F7. Bottom sheet `@gorhom/bottom-sheet` — dùng cho UX gì?

### Why committee asks this

- Mobile UX patterns.

### Suggested Answer

- Sheet báo cộng đồng/chọn địa điểm — gesture native.

### Follow-up Questions

- Keyboard overlap?

### Risk Level

- Easy

---

## F8. `useLanguageStore` — đa ngôn ngữ mobile?

### Why committee asks this

- i18n mobile.

### Suggested Answer

- Zustand persist ngôn ngữ — đồng bộ UI strings.

### Follow-up Questions

- RTL support?

### Risk Level

- Easy

---

## F9. `useSatelliteFloodStore` / analysis store — hiển thị lớp vệ tinh?

### Why committee asks this

- Feature depth.

### Suggested Answer

- Store Zustand cho phân tích ảnh vệ tinh/lũ — kết nối feature prediction/satellite.

### Follow-up Questions

- Tile load errors?

### Risk Level

- Medium

---

## F10. Community report sheet UX — user gửi báo như thế?

### Why committee asks this

- Critical citizen journey.

### Suggested Answer

- Component `CommunityReportSheet` — form đính kèm ảnh (`expo-image-picker`) nếu có.

### Follow-up Questions

- Abuse reporting?

### Risk Level

- Medium

---

## F11. Web community report moderation — api hooks?

### Why committee asks this

- Moderator journey.

### Suggested Answer

- `community-report.api.ts`, hooks `useCommunityReports` — fetch/filter báo pending.

### Follow-up Questions

- Bulk approve?

### Risk Level

- Medium

---

## F12. Loading overlay map — tránh tương tác khi fetch?

### Why committee asks this

- UX states.

### Suggested Answer

- `MapLoadingOverlay` component — giảm race click khi data chưa sẵn sàng.

### Follow-up Questions

- Skeleton vs spinner?

### Risk Level

- Easy

---

## F13. Safe route cards UI — feature `FeatG74`/`FeatG75`?

### Why committee asks this

- Routing UX.

### Suggested Answer

- Components `SafeRouteResultCard`, alternatives — hiển thị đường đi an toàn từ backend polyline (`@mapbox/polyline`).

### Follow-up Questions

- Offline maps?

### Risk Level

- Medium

---

## F14. Billing/plans UI mobile — package.json có expo modules payment?

### Why committee asks this

- Monetization UX.

### Suggested Answer

- Màn `app/plans`, `app/billing` — luồng subscribe hiển thị plan feature comparison table.

### Follow-up Questions

- WebView checkout?

### Risk Level

- Medium

---

## F15. Web `recharts` — dashboard metrics?

### Why committee asks this

- Visualization.

### Suggested Answer

- Dependency `recharts` — biểu đồ admin stats alerts/users.

### Follow-up Questions

- Real-time chart updates?

### Risk Level

- Easy

---

## F16. `nuqs` URL query state — lợi ích admin filter?

### Why committee asks this

- Shareable URLs.

### Suggested Answer

- State filter trên URL — bookmark báo cáo.

### Follow-up Questions

- Sensitive query leakage?

### Risk Level

- Medium

---

## F17. Mobile OTP UI `react-native-otp-entry` — luồng login?

### Why committee asks this

- Auth UX.

### Suggested Answer

- OTP thunk `otp.thunk` — nhập mã xác minh.

### Follow-up Questions

- Brute force OTP?

### Risk Level

- Medium

---

## F18. Web Header role-aware navigation?

### Why committee asks this

- IA navigation.

### Suggested Answer

- `Header.tsx` dùng auth store — hiển thị portal đúng role.

### Follow-up Questions

- Deep link moderator?

### Risk Level

- Easy

---

## F19. `motion` animation web — scope?

### Why committee asks this

- Polish vs performance.

### Suggested Answer

- Package `motion` — nhẹ nhàng transition; tránh animate layout nặng trên bảng lớn.

### Follow-up Questions

- prefers-reduced-motion?

### Risk Level

- Easy

---

## F20. Mobile NetInfo + query persister packages — offline cụ thể?

### Why committee asks this

- Honest offline story.

### Suggested Answer

- Có dependency TanStack persist async-storage — có thể cache query; cần demo scenario “mất mạng vẫn xem cache map” nếu đã wire.

### Follow-up Questions

- Stale data indicator?

### Risk Level

- Medium

---

# PHẦN E — SECURITY (10 câu)

## SEC1. JWT được kiểm tra ở đâu là “source of truth”?

### Why committee asks this

- Security layering.

### Suggested Answer

- ASP.NET JWT Bearer middleware + `Roles` FastEndpoints — không tin client.

### Follow-up Questions

- Algorithm confusion attack?

### Risk Level

- Medium

---

## SEC2. Refresh token rotation có trong API không?

### Why committee asks this

- Session fixation.

### Suggested Answer

- `refresh-token` endpoint trả access mới + refresh mới (theo client store update) — nếu server rotate, giải thích payload; nếu không chắc, xem handler auth.

### Follow-up Questions

- Reuse old refresh token?

### Risk Level

- Hard

---

## SEC3. Lưu JWT trong localStorage web — rủi ro XSS?

### Why committee asks this

- Front security realism.

### Suggested Answer

- `persist` Zustand vào localStorage — nếu XSS, token lộ; mitigations: CSP, sanitize input, dependency audit, httpOnly cookie migration.

### Follow-up Questions

- Next.js server actions?

### Risk Level

- Hard

---

## SEC4. Role AUTHORITY ẩn log nhạy cảm — đây có phải defense in depth?

### Why committee asks this

- Least privilege UX.

### Suggested Answer

- Giảm lộ nội dung moderation/system cho vai trò không cần — kết hợp server filter nếu có.

### Follow-up Questions

- API vẫn trả category system?

### Risk Level

- Hard

---

## SEC5. Hangfire dashboard `/hangfire` — ai truy cập?

### Why committee asks this

- Ops security.

### Suggested Answer

- `HangfireAuthorizationFilter` custom — cần mô tả rule (admin IP, basic auth) trong báo cáo triển khai.

### Follow-up Questions

- Public internet exposure?

### Risk Level

- Hard

---

## SEC6. Fake flood report — biện pháp trong hệ thống?

### Why committee asks this

- Abuse case.

### Suggested Answer

- Vote cộng đồng (`FeatG86`), moderator hide (`FeatG134`), rate limit (nếu có endpoint) — trả lời thật mức đã code.

### Follow-up Questions

- CAPTCHA?

### Risk Level

- Medium

---

## SEC7. SignalR token long-lived — compromise token?

### Why committee asks this

- Transport security.

### Suggested Answer

- Dùng access JWT như REST — khi refresh, `accessTokenFactory` đọc AsyncStorage đã update — hub reconnect.

### Follow-up Questions

- Close hub on logout?

### Risk Level

- Medium

---

## SEC8. `ValidationExceptionMiddleware` — leak stack?

### Why committee asks this

- Error disclosure.

### Suggested Answer

- Global handler nên ẩn chi tiết production — kiểm tra middleware implementation.

### Follow-up Questions

- Correlation id?

### Risk Level

- Medium

---

## SEC9. Google OAuth state parameter?

### Why committee asks this

- CSRF OAuth.

### Suggested Answer

- Luồng OAuth chuẩn dùng state — kiểm tra `google` finish/callback pages.

### Follow-up Questions

- PKCE?

### Risk Level

- Medium

---

## SEC10. Payment endpoints chỉ JWT — chống giả userId trong body?

### Why committee asks this

- Payment integrity.

### Suggested Answer

- User id từ claims, không từ client-supplied id — giảm giả mạo.

### Follow-up Questions

- Idempotency-Key header?

### Risk Level

- Medium

---

# PHẦN F — SCALABILITY & PERFORMANCE (10 câu)

## SC1. Horizontal scale API — SignalR sticky session?

### Why committee asks this

- Realtime scale-out.

### Suggested Answer

- Cần Redis backplane SignalR khi nhiều instance — hiện single instance đủ capstone; nêu roadmap.

### Follow-up Questions

- Azure SignalR Service?

### Risk Level

- Hard

---

## SC2. Redis cache giảm tải analytics handlers?

### Why committee asks this

- Read scaling.

### Suggested Answer

- `IDistributedCache` cho hotspot/frequency — giảm query DB lặp.

### Follow-up Questions

- Cold start cache?

### Risk Level

- Medium

---

## SC3. Pagination API flood reports/community?

### Why committee asks this

- Large dataset.

### Suggested Answer

- Tests `pageNumber` `pageSize` — standard pattern; mobile `staleTime` giảm spam request.

### Follow-up Questions

- Cursor-based pagination?

### Risk Level

- Easy

---

## SC4. Hosted MQTT ingestion — bottleneck IoT throughput?

### Why committee asks this

- Ingest scale.

### Suggested Answer

- Single hosted loop có giới hạn — scale bằng partition theo station/topic hoặc separate worker service.

### Follow-up Questions

- Message queue Kafka?

### Risk Level

- Hard

---

## SC5. DB indexing cho station/administrative queries?

### Why committee asks this

- Query perf.

### Suggested Answer

- Đề xuất index `AdministrativeAreaId`, geo radius — trích migration EF nếu có.

### Follow-up Questions

- Explain analyze?

### Risk Level

- Medium

---

## SC6. Client dedupe refresh token — giảm thundering herd?

### Why committee asks this

- Auth scalability.

### Suggested Answer

- `isRefreshing` gate trong `apiFetch` — một refresh phục vụ nhiều parallel requests.

### Follow-up Questions

- Distributed lock refresh?

### Risk Level

- Medium

---

## SC7. Map GeoJSON size — giảm payload?

### Why committee asks this

- Mobile bandwidth.

### Suggested Answer

- Delta realtime qua SignalR thay vì full snapshot mỗi lần — comment merge logic.

### Follow-up Questions

- Simplify polygon?

### Risk Level

- Medium

---

## SC8. Hangfire worker count?

### Why committee asks this

- Background throughput.

### Suggested Answer

- Cấu hình server Hangfire — tăng worker khi queue lớn (verify predictions backlog).

### Follow-up Questions

- Priority queues?

### Risk Level

- Medium

---

## SC9. CDN cho static Next.js?

### Why committee asks this

- Edge performance.

### Suggested Answer

- Deploy Vercel/nginx CDN assets — giảm TTFB global.

### Follow-up Questions

- ISR cache?

### Risk Level

- Easy

---

## SC10. Gemini cost khi news volume x10?

### Why committee asks this

- AI ops scale.

### Suggested Answer

- Batch+rate limit; defer; có thể pre-filter article trước Gemini bằng keyword.

### Follow-up Questions

- Self-host smaller model?

### Risk Level

- Hard

---

# PHẦN G — XẾP HẠNG & MẸO TRÌNH BÀY

## TOP 30 câu hội đồng hay hỏi nhất (ưu tiên ôn)

1. A3 — Redux + Zustand mobile **(kiến trúc đặc thù đồ án)**
2. Q7 — Merge REST + SignalR map
3. Q50 / SEC1 — CORS + JWT defense in depth
4. AI6 — VerifyPredictions đánh giá mô hình
5. Q5 — SignalR token AsyncStorage + LongPolling
6. Q12–Q13 — Refresh token dedupe + proactive refresh
7. A5 — E2E MQTT → SignalR → mobile
8. Q32 — Mock `libs/api.ts` vs API thật
9. Q21 — RoleGuard chỉ client-side
10. AI1–AI5 — Gemini batch, JSON mime, rate limit, defer
11. Q8 — VerifyPredictionAsync địa lý
12. Q25 — Semaphore không đủ multi-instance
13. Q49 — Duplicate HTTPS redirection
14. F13 — Safe route / polyline
15. Q19 — AUTHORITY ẩn log
16. SC1 — Scale SignalR
17. Q6 — Consumer count SignalR
18. Q36 — Offline/NetInfo thực tế
19. AI8 — Không có RAG — trung thực
20. SEC5 — Hangfire dashboard bảo vệ
21. Q15 — FCM token pipeline
22. A11 — Hai nhánh AI
23. Q40 — Evaluate districts cache
24. F3 — Map hooks web
25. Q29 — Moderator hide report
26. Q10 — MQTT ingestion vai trò
27. Q46 — React Query vs Zustand boundary
28. AI13 — AI có trigger alert không
29. Q17 — Body size 300MB upload
30. Q16 — Trace FE-xx tests

## TOP 10 câu khó nhất

1. Q25 — Semaphore multi-instance Gemini
2. Q8 / AI7 — Edge địa lý verify + ward boundary
3. SC1 — SignalR scale-out backplane
4. SEC3 — XSS vs localStorage JWT
5. Q6 — StrictMode race SignalR
6. AI12 — Prompt governance hallucation
7. SC4 — MQTT throughput bottleneck
8. SEC5 — Hangfire exposure
9. Q32 — Thật/giả AI web libs
10. AI15 — Data lineage training model

## TOP 10 câu liên quan Frontend

1. A3 — Redux vs Zustand
2. Q7 — merge GeoJSON
3. Q12–Q13 — apiFetch + getValidToken
4. Q21 — RoleGuard
5. F3 — map hooks
6. F13 — safe route UI
7. F11 — community moderation hooks
8. Q23 — staleTime + SignalR
9. F16 — nuqs filters
10. Q32 — mock api.ts

## TOP 10 câu liên quan AI

1. AI1 — Gemini flash JSON
2. AI4 — invalid JSON handling
3. AI5 — defer 429/503
4. AI6 — verification post-hoc
5. AI8 — không RAG
6. AI11 — confidence field
7. AI13 — AI vs alert pipeline
8. AI14 — batch limit 100 verify
9. AI18 — cost optimization
10. AI19 — fake news mitigation

---

## Sai lầm thường gặp khi trả lời

- Nói hệ thống có **RAG/vector DB** trong khi code chính là **Gemini batch + job verify**.  
- Khẳng định **RoleGuard** đủ an toàn — quên nhấn **server Roles**.  
- Trộn **mock `libs/api.ts`** với production API.  
- **Không** thừa nhận hạn chế CORS `AllowAnyOrigin` / localStorage token.

## Gợi ý gây ấn tượng hội đồng

- Vẽ một sơ đồ 30 giây: **MQTT → DB → Job → SignalR → Mobile merge**.  
- Nêu **VerifyPredictions** như “closed-loop evaluation” cho AI dự báo.  
- Thành thật trade-off **LongPolling** vs WebSocket trên mobile network.  
- Đề xuất **Redis lock** cho Gemini khi scale ngang.

## Từ khóa kỹ thuật nên nhắc

- FastEndpoints, JWT Bearer, Hangfire, HostedService, EF migrations  
- SignalR groups `station_`* / `area_*`, LongPolling, automatic reconnect  
- Redux Toolkit + redux-persist, Zustand, TanStack Query, `mergeRealtimeIntoGeoJSON`  
- `IDistributedCache`, Redis, Gemini `responseMimeType: application/json`, deferred retry  
- RBAC `Roles(...)`, `RoleGuard`, operational logs AUTHORITY filter

## Thuật ngữ kiến trúc

- Clean Architecture / vertical slice features  
- Hybrid REST + WebSocket (SignalR)  
- Background job orchestration  
- Defense in depth (client UX guard + server authorization)  
- Graceful degradation (Redis optional paths trong một số handler)

## Tips trình bày miệng

- Mỗi câu: **Luận điểm → bằng chứng file/class → trade-off → hướng cải tiến**.  
- Khi không chắc: “Em kiểm tra lại handler X sau phiên bản Y” tốt hơn bịa.  
- Kết thúc câu khó bằng **một** đề xuất cải tiến cụ thể (Redis backplane, CSP, …).

---

*Tài liệu được sinh từ source FDA-Web / FDA-Mobile / FDA_API và Report 6 (Logs & Tasks). Cập nhật khi refactor lớn auth hoặc AI pipeline.*