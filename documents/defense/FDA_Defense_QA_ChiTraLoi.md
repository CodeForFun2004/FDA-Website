# FDA — Câu hỏi chi tiết và gợi ý trả lời (lời văn trình bày)

Tài liệu được tái tạo có cấu trúc từ `[FDA_Defense_QA.md](FDA_Defense_QA.md)`. Mỗi mục có **câu hỏi diễn đạt đầy đủ**, **đáp án lời nói** (mục tiêu ~1–3 phút khi đọc chậm), và **hướng hỏi tiếp**.

---

## Q1. Hệ thống backend được khởi tạo pipeline middleware theo thứ tự nào và vì sao thứ tự quan trọng?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Hệ thống backend được khởi tạo pipeline middleware theo thứ tự nào và vì sao thứ tự quan trọng?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Kiểm tra hiểu ASP.NET Core pipeline: exception handling, CORS, authentication/authorization, FastEndpoints.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Hệ thống backend được khởi tạo pipeline middleware theo thứ tự nào và vì sao thứ tự quan trọng? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Kiểm tra hiểu ASP.NET Core pipeline: exception handling, CORS, authentication/authorization, FastEndpoints. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Trong `[Program.cs](D:/FPTU/SEM9/SEP490/BE/FDA_API/src/External/Presentation/FDAAPI.Presentation.FastEndpointBasedApi/Program.cs)` có `ValidationExceptionMiddleware` gắn sớm để bắt lỗi toàn cục. Thứ 2, sau đó CORS, rồi `UseAuthentication` trước `UseAuthorization`, cuối cùng `UseFastEndpoints`. Thứ tự đảm bảo JWT được xác thực trước khi áp rule phân quyền và vào endpoint.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Điểm nào trong pipeline có thể làm lộ stack trace ra client? Hangfire dashboard được bảo vệ thế nào?

---

## Q2. Cơ sở dữ liệu được migrate khi nào và rủi ro khi auto-migrate trên production?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Cơ sở dữ liệu được migrate khi nào và rủi ro khi auto-migrate trên production?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Kiểm tra DevOps và an toàn triển khai EF Core.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Cơ sở dữ liệu được migrate khi nào và rủi ro khi auto-migrate trên production? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Kiểm tra DevOps và an toàn triển khai EF Core. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, `Program.cs` gọi `context.Database.Migrate()` trong scope khi startup. Ưu điểm: môi trường UAT/Deploy đồng bộ schema nhanh. Rủi ro: migration lỗi làm crash toàn app. Thứ 2, cần backup và chiến lược migration có kiểm soát trên production.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Khi nào nên tách migrate ra pipeline CI thay vì startup?

---

## Q3. Endpoint FastEndpoints được phân quyền role như thế? Cho ví dụ từ code.

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Endpoint FastEndpoints được phân quyền role như thế? Cho ví dụ từ code.».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Liên kết RBAC với JWT claims và khai báo endpoint.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Endpoint FastEndpoints được phân quyền role như thế? Cho ví dụ từ code.». Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Liên kết RBAC với JWT claims và khai báo endpoint. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Nhiều endpoint dùng `Roles("ADMIN","SUPERADMIN","MODERATOR")` hoặc `AuthSchemes(JwtBearerDefaults.AuthenticationScheme)` — ví dụ nhóm announcement (`FeatG89`–`FeatG93`), alert template (`FeatG99`–`FeatG104`), ẩn báo cộng đồng (`FeatG134`). Server là lớp chặn chính. Thứ 2, client chỉ hỗ trợ UX.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Nếu user sửa role trong JWT phía client thì điều gì xảy ra khi gọi API?

---

## Q4. SignalR hub `FloodDataHub` cho phép client đăng ký những kênh realtime nào?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «SignalR hub `FloodDataHub` cho phép client đăng ký những kênh realtime nào?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Kiểm tra mô hình pub/sub và nhóm kết nối.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung SignalR hub `FloodDataHub` cho phép client đăng ký những kênh realtime nào? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Kiểm tra mô hình pub/sub và nhóm kết nối. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, `[FloodDataHub.cs](D:/FPTU/SEM9/SEP490/BE/FDA_API/src/External/Presentation/FDAAPI.Presentation.FastEndpointBasedApi/Hubs/FloodDataHub.cs)`: `SubscribeToStation` / `UnsubscribeFromStation` thêm connection vào group `station_{stationId}`. Thứ 2, `SubscribeToArea` / `UnsubscribeFromArea` vào group `area_{areaId}`. Hub map tại `/hubs/flood-data` trong `Program.cs`.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Ai chịu trách nhiệm broadcast vào các group này — hub method hay background service?

---

## Q5. Trên mobile, client SignalR lấy token xác thực từ đâu và dùng transport gì?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Trên mobile, client SignalR lấy token xác thực từ đâu và dùng transport gì?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Liên kết auth mobile với realtime.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Trên mobile, client SignalR lấy token xác thực từ đâu và dùng transport gì? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Liên kết auth mobile với realtime. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, `[lib/signalr-client.ts](D:/FPTU/SEM9/SEP490/FE/FDA-Mobile/lib/signalr-client.ts)`: `accessTokenFactory` đọc `access_token` từ AsyncStorage. Thứ 2, URL hub `EXPO_PUBLIC_SIGNALR_HUB_URL` mặc định UAT. Thứ 3, `HttpTransportType.LongPolling`. Thứ 4, `withAutomaticReconnect` với backoff. Singleton connection + `retainFloodHub` / `releaseFloodHub` đếm consumer để không disconnect sớm.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Vì sao chọn LongPolling thay vì WebSockets trên React Native?

---

## Q6. Pattern “singleton SignalR + consumer count” giải quyết vấn đề gì trên React?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Pattern “singleton SignalR + consumer count” giải quyết vấn đề gì trên React?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Strict Mode / nhiều hook subscribe cùng hub.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Pattern “singleton SignalR + consumer count” giải quyết vấn đề gì trên React? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Strict Mode / nhiều hook subscribe cùng hub. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, `retainFloodHub` tăng `consumerCount`, `releaseFloodHub` giảm. Thứ 2, chỉ `stopFloodHub` khi về 0 — tránh disconnect khi một màn hình unmount nhưng màn khác vẫn cần. Comment trong code còn nhắc tránh lỗi khi đang `Connecting`.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** khó. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Race condition khi hai tab cùng app?

---

## Q7. Luồng merge dữ liệu lũ trên mobile kết hợp REST và realtime như thế?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Luồng merge dữ liệu lũ trên mobile kết hợp REST và realtime như thế?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Kiểm tra nhất quán dữ liệu map.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Luồng merge dữ liệu lũ trên mobile kết hợp REST và realtime như thế? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Kiểm tra nhất quán dữ liệu map. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, `[useFloodData.ts](D:/FPTU/SEM9/SEP490/FE/FDA-Mobile/features/map/hooks/flood/useFloodData.ts)`: React Query lấy GeoJSON (`useFloodSeverityQuery`). Thứ 2, Zustand (`useFloodRealtimeStore`) nhận cập nhật SignalR. Thứ 3, hàm `mergeRealtimeIntoGeoJSON` ưu tiên realtime: cập nhật điểm, upsert/xóa polygon theo `stationId`, append trạm mới nếu có.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** khó. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Khi REST stale và SignalR mất kết nối, bản đồ hiển thị thế nào?

---

## Q8. Job `VerifyPredictionsRunner` làm gì với một bản ghi `PredictionLog`?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Job `VerifyPredictionsRunner` làm gì với một bản ghi `PredictionLog`?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Đánh giá AI/ML governance — verification sau thực tế.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Job `VerifyPredictionsRunner` làm gì với một bản ghi `PredictionLog`? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Đánh giá AI/ML governance — verification sau thực tế. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Lấy prediction pending (`GetPendingVerificationAsync`), xác định `AreaId` hoặc `AdministrativeAreaId`, gom danh sách trạm (radius hoặc phân cấp ward/district/city), so sánh với đọc cảm biến thực tế (logic tiếp theo trong file), ghi nhận verified/errors. Đây là vòng “đóng” để đánh giá độ tin cậy dự báo. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** khó. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Metric cụ thể để xác định prediction đúng/sai?

---

## Q9. `GeminiProcessingService` giới hạn batch và xử lý lỗi API thế nào?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «`GeminiProcessingService` giới hạn batch và xử lý lỗi API thế nào?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Chi phí, ổn định, retry AI.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung `GeminiProcessingService` giới hạn batch và xử lý lỗi API thế nào? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Chi phí, ổn định, retry AI. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, `[GeminiProcessingService.cs](D:/FPTU/SEM9/SEP490/BE/FDA_API/src/External/Infrastructure/Services/FDAAPI.Infra.Services/NewsCrawler/GeminiProcessingService.cs)`: `MaxBatchSize = 10`, `RequestsPerMinute = 5`, timeout 30s, `responseMimeType = application/json`, endpoint `gemini-2.5-flash`. `SemaphoreSlim` + `EnforceRateLimitAsync`. Thứ 2, HTTP 429/503 trả `DeferredRun` để schedule chạy lại. Thứ 3, parse JSON array, fail nếu không hợp lệ.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Gemini haluclinate JSON — pipeline phòng vệ tại đâu?

---

## Q10. Hosted service `MqttIngestionJob` đặt trong kiến trúc tổng thể vai trò gì?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Hosted service `MqttIngestionJob` đặt trong kiến trúc tổng thể vai trò gì?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Luồng dữ liệu cảm biến thời gian thực.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Hosted service `MqttIngestionJob` đặt trong kiến trúc tổng thể vai trò gì? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Luồng dữ liệu cảm biến thời gian thực. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: `Program.cs` đăng ký hosted services: xử lý cảnh báo (`Feat42`), gửi thông báo (`Feat43`), **MQTT ingestion** (`Feat54`), log retention (`Feat132`). MQTT ingestion đưa dữ liệu trạm vào hệ thống để các job khác và SignalR có nguồn. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Nếu MQTT broker down, hệ thống degrade thế nào?

---

## Q11. Hangfire được dùng cho những tác vụ nào ngoài recurring dashboard?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Hangfire được dùng cho những tác vụ nào ngoài recurring dashboard?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Phân biệt HostedService vs Hangfire.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Hangfire được dùng cho những tác vụ nào ngoài recurring dashboard? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Phân biệt HostedService vs Hangfire. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: `Program.cs` có `UseHangfireDashboard`, `RegisterAnalyticsRecurringJobs`, `RegisterAnnouncementRecurringJobs`, `RegisterNewsCrawlerRecurringJobs`. VerifyPredictions đăng ký scoped runner cho Hangfire trigger. Tách tác vụ nặng khỏi request HTTP. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Idempotency của job crawler?

---

## Q12. API refresh token phía web được gọi khi nào trong `apiFetch`?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «API refresh token phía web được gọi khi nào trong `apiFetch`?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Session và race condition.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung API refresh token phía web được gọi khi nào trong `apiFetch`? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Session và race condition. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, `[api/client.ts](D:/FPTU/SEM9/SEP490/FE/FDA-Web/src/libs/api/client.ts)`: trước mỗi request gọi `useAuthStore.getState().getValidToken()`. Thứ 2, store tự refresh khi hết hạn. Thứ 3, client có `isRefreshing` + `refreshPromise` dedupe nhiều request đồng thời. Thứ 4, POST `/auth/refresh-token` với body refresh token.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Tại sao không để mỗi 401 tự refresh (đoạn còn lại của file)?

---

## Q13. Zustand `getValidToken` proactive refresh hoạt động ra sao?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Zustand `getValidToken` proactive refresh hoạt động ra sao?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** UX và tránh 401 hàng loạt.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Zustand `getValidToken` proactive refresh hoạt động ra sao? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: UX và tránh 401 hàng loạt. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, `[auth-store.ts](D:/FPTU/SEM9/SEP490/FE/FDA-Web/src/features/authenticate/store/auth-store.ts)`: nếu token sắp hết hạn trong 5 phút thì `refreshSession()` chạy nền, vẫn trả token hiện tại. Thứ 2, nếu đã hết hạn thì await refresh. Giảm gián đoạn thao tác admin.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Clock skew giữa client và server?

---

## Q14. Redux mobile persist whitelist những key nào và tại sao?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Redux mobile persist whitelist những key nào và tại sao?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Bảo mật và khôi phục phiên.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Redux mobile persist whitelist những key nào và tại sao? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Bảo mật và khôi phục phiên. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, `[app/store.ts](D:/FPTU/SEM9/SEP490/FE/FDA-Mobile/app/store.ts)`: `authPersistConfig` whitelist `user`, `session` trong AsyncStorage. Thứ 2, middleware ignore serializable actions của redux-persist. Giảm lưu thừa. Thứ 3, token nằm trong session để app khởi động lại vẫn đăng nhập.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Refresh token lưu plaintext trong AsyncStorage — rủi ro?

---

## Q15. Thunk `registerFcmToken` xuất hiện trong auth slice — luồng push notification liên quan API nào?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Thunk `registerFcmToken` xuất hiện trong auth slice — luồng push notification liên quan API nào?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Liên kết FCM với backend.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Thunk `registerFcmToken` xuất hiện trong auth slice — luồng push notification liên quan API nào? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Liên kết FCM với backend. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, `[auth.slice.ts](D:/FPTU/SEM9/SEP490/FE/FDA-Mobile/features/auth/stores/auth.slice.ts)` re-export `registerFcmToken` từ `fcm.thunk`. Thứ 2, backend có endpoint `FeatG97_FcmTokenUpdate` yêu cầu JWT. Mobile đăng ký token thiết bị để `NotificationDispatchJob` có đích gửi.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Xử lý khi user revoke notification permission?

---

## Q16. Test tích hợp `FE24`, `FE25` trong repo backend đang trace requirement nào?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Test tích hợp `FE24`, `FE25` trong repo backend đang trace requirement nào?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Kiểm chứng traceability SRS ↔ code.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Test tích hợp `FE24`, `FE25` trong repo backend đang trace requirement nào? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Kiểm chứng traceability SRS ↔ code. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, File test comment `FE-24` community flood reports, `FE-25` vote. Thứ 2, gọi `/api/v1/flood-reports` và `/vote`. Dùng làm bằng chứng kiểm thử hội đồng.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Coverage cho moderator hide report (`FeatG134`)?

---

## Q17. Kestrel `MaxRequestBodySize` 300MB phục vụ feature gì?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Kestrel `MaxRequestBodySize` 300MB phục vụ feature gì?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Upload media/video flood report.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Kestrel `MaxRequestBodySize` 300MB phục vụ feature gì? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Upload media/video flood report. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Comment trong `Program.cs`: video uploads. Cần giới hạn phía client và validate type để tránh abuse. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Rate limit upload?

---

## Q18. `EvaluateAllDistrictsHandler` và Redis — khi Redis fail thì sao?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «`EvaluateAllDistrictsHandler` và Redis — khi Redis fail thì sao?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Resilience cache.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung `EvaluateAllDistrictsHandler` và Redis — khi Redis fail thì sao? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Resilience cache. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Handler có `catch { /* Redis unavailable */ }` — tiếp tục không cache hoặc fallback (cần đọc chi tiết handler). Thứ 2, pattern graceful degradation.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** khó. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Stampede cache khi Redis reboot?

---

## Q19. Trang Operational Logs trên web ẩn category với role AUTHORITY — được mô tả ở đâu?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Trang Operational Logs trên web ẩn category với role AUTHORITY — được mô tả ở đâu?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** RBAC tinh chỉnh UX.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Trang Operational Logs trên web ẩn category với role AUTHORITY — được mô tả ở đâu? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: RBAC tinh chỉnh UX. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: `[3.2.11 Logs & Tasks.md](D:/FPTU/SEM9/SEP490/FE/FDA-Web/documents/report%206/3.2.11%20Logs%20&%20Tasks.md)`: role `AUTHORITY` không thấy `system` và `moderation` trong filter và bảng. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Ai được coi là AUTHORITY trong seed data?

---

## Q20. Google OAuth callback trên web hydrate Zustand và cookie như thế?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Google OAuth callback trên web hydrate Zustand và cookie như thế?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Đồng bộ token sau redirect.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Google OAuth callback trên web hydrate Zustand và cookie như thế? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Đồng bộ token sau redirect. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, `[auth/callback/page.tsx](D:/FPTU/SEM9/SEP490/FE/FDA-Web/src/app/auth/callback/page.tsx)`: ghi `localStorage` token keys. Thứ 2, `useAuthStore.setState` với `expiresAt`. Thứ 3, `setAuthSessionCookies` theo roles. Thứ 4, replace history để token không nằm trong URL hash.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** khó. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** XSS đánh cắp localStorage — mitigations?

---

## Q21. `RoleGuard` là server hay client guard? Giới hạn của nó?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «`RoleGuard` là server hay client guard? Giới hạn của nó?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Defense in depth.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung `RoleGuard` là server hay client guard? Giới hạn của nó? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Defense in depth. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, `[RoleGuard.tsx](D:/FPTU/SEM9/SEP490/FE/FDA-Web/src/components/guards/RoleGuard.tsx)`: client-only. Thứ 2, đọc `user.roles` từ store. Thứ 3, redirect `/auth/login` hoặc `/auth/forbidden`. Không thay thế kiểm tra JWT phía server.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Kẻ tấn công bypass bằng cách gọi API trực tiếp?

---

## Q22. Admin store (`admin-store.ts`) quản lý phân trang và thao tác CRUD user — pattern gọi API?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Admin store (`admin-store.ts`) quản lý phân trang và thao tác CRUD user — pattern gọi API?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Kiểm tra tách lớp FE.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Admin store (`admin-store.ts`) quản lý phân trang và thao tác CRUD user — pattern gọi API? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Kiểm tra tách lớp FE. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Store gọi `admin.api` (`getAdminUsersApi`, `updateUserRolesApi`, …), giữ `page`, `limit`, `total`, trạng thái loading/error — đồng bộ UI bảng admin. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Optimistic update có dùng không?

---

## Q23. Community reports query mobile đặt `staleTime` 30s — lý do?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Community reports query mobile đặt `staleTime` 30s — lý do?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Cân bằng REST vs SignalR.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Community reports query mobile đặt `staleTime` 30s — lý do? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Cân bằng REST vs SignalR. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Comment trong `useCommunityReportsQuery.ts`: dữ liệu gần realtime nhờ SignalR nên không refetch quá dày. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Invalidate query khi nhận event SignalR?

---

## Q24. Subscription endpoints (`Feat71`–`Feat73`) xác định user từ đâu?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Subscription endpoints (`Feat71`–`Feat73`) xác định user từ đâu?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Thanh toán và tenant.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Subscription endpoints (`Feat71`–`Feat73`) xác định user từ đâu? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Thanh toán và tenant. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: `SubscribeToPlanEndpoint` comment “Extract user ID from JWT” — user id từ claims token, không tin client body. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Webhook payment verify signature?

---

## Q25. `GeminiRateLock` static Semaphore — tác dụng trong multi-instance server?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «`GeminiRateLock` static Semaphore — tác dụng trong multi-instance server?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Scale-out correctness.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung `GeminiRateLock` static Semaphore — tác dụng trong multi-instance server? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Scale-out correctness. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Chỉ đồng bộ trong một process. Thứ 2, multi-instance vẫn có thể vượt quota Gemini — cần Redis distributed lock hoặc quota ở API gateway (điểm hạn chế thật).

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** khó. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Bạn đề xuất cải tiến gì?

---

## Q26. EF Core migration throw khi lỗi — ảnh hưởng SLA?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «EF Core migration throw khi lỗi — ảnh hưởng SLA?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Availability.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung EF Core migration throw khi lỗi — ảnh hưởng SLA? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Availability. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, `catch` log và `throw` — app không start nếu DB sai. Thứ 2, phù hợp fail-fast nhưng downtime khi migration lỗi.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Blue-green deployment?

---

## Q27. FastEndpoints global validation error format?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «FastEndpoints global validation error format?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Hợp đồng API cho frontend.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung FastEndpoints global validation error format? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Hợp đồng API cho frontend. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: `Errors.ResponseBuilder` trả `success: false`, `message: Validation failed`, `errors` array field/message — frontend parse thống nhất. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** i18n message phía server?

---

## Q28. `maximumReceiveMessageSize` SignalR 100KB — ảnh hưởng payload flood update?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «`maximumReceiveMessageSize` SignalR 100KB — ảnh hưởng payload flood update?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Giới hạn realtime.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung `maximumReceiveMessageSize` SignalR 100KB — ảnh hưởng payload flood update? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Giới hạn realtime. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Config trong `Program.cs`. Thứ 2, payload GeoJSON lớn có thể cần chunk hoặc chỉ gửi delta — risk nếu vượt ngưỡng.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Nén payload?

---

## Q29. Chức năng ẩn báo cộng đồng `FeatG134` phân quyền ai?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Chức năng ẩn báo cộng đồng `FeatG134` phân quyền ai?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Moderation workflow.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Chức năng ẩn báo cộng đồng `FeatG134` phân quyền ai? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Moderation workflow. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Endpoint `Roles("ADMIN","SUPERADMIN","MODERATOR")` — moderator có quyền ẩn báo giả. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Audit log khi hide?

---

## Q30. `NewsCrawlerJob` singleton + Hangfire — vì sao không HostedService?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «`NewsCrawlerJob` singleton + Hangfire — vì sao không HostedService?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Lifecycle và scheduling.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung `NewsCrawlerJob` singleton + Hangfire — vì sao không HostedService? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Lifecycle và scheduling. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Comment `Program.cs`: driven by Hangfire, không phải HostedService — linh hoạt lịch recurring và monitor dashboard. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Job overlap prevention?

---

## Q31. Mobile `useMapData` gọi `useFloodSignalR` và `useAreaSignalR` — đăng ký theo id nào?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Mobile `useMapData` gọi `useFloodSignalR` và `useAreaSignalR` — đăng ký theo id nào?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Hiệu năng subscribe.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Mobile `useMapData` gọi `useFloodSignalR` và `useAreaSignalR` — đăng ký theo id nào? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Hiệu năng subscribe. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, `useMapData.ts` bật overlay flood. Thứ 2, `useAreaSignalR(areaIds)` subscribe theo danh sách khu vực đang load — giảm broadcast thừa.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Giới hạn số areaIds?

---

## Q32. Web `libs/api.ts` vừa mock generator vừa `@google/genai` — production dùng nhánh nào?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Web `libs/api.ts` vừa mock generator vừa `@google/genai` — production dùng nhánh nào?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Tránh nhầm demo vs thật.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Web `libs/api.ts` vừa mock generator vừa `@google/genai` — production dùng nhánh nào? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Tránh nhầm demo vs thật. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, File khởi tạo `GoogleGenAI` với `NEXT_PUBLIC_GEMINI_API_KEY` nhưng chứa mock users/devices. Thứ 2, một số view như `zones-view` import hook từ `@/libs/api` — cần nói rõ phần dashboard production dùng feature API (`*.api.ts`) và backend thật. Thứ 3, phần mock chỉ dev/UI prototype.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** khó. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Kế hoạch loại bỏ mock?

---

## Q33. `clear-old-tokens` / `auth-utils` — can thiệp token legacy?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «`clear-old-tokens` / `auth-utils` — can thiệp token legacy?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Migration auth.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung `clear-old-tokens` / `auth-utils` — can thiệp token legacy? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Migration auth. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Có file `[clear-old-tokens.ts](D:/FPTU/SEM9/SEP490/FE/FDA-Web/src/libs/clear-old-tokens.ts)`, `[auth-utils.ts](D:/FPTU/SEM9/SEP490/FE/FDA-Web/src/libs/auth-utils.ts)` — dọn key cũ tránh xung đột version OAuth. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Versioning token schema?

---

## Q34. Testcontainers Redis trong `ApiWebApplicationFactory` phục vụ test gì?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Testcontainers Redis trong `ApiWebApplicationFactory` phục vụ test gì?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Chiến lược test tích hợp.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Testcontainers Redis trong `ApiWebApplicationFactory` phục vụ test gì? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Chiến lược test tích hợp. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Factory thêm StackExchange Redis cache cho OAuth state — test gần production. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Test song song CI có chậm không?

---

## Q35. Station components CRUD (`FeatG105`–`FeatG109`) phân quyền khác nhau thế nào?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Station components CRUD (`FeatG105`–`FeatG109`) phân quyền khác nhau thế nào?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Principle of least privilege.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Station components CRUD (`FeatG105`–`FeatG109`) phân quyền khác nhau thế nào? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Principle of least privilege. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Create/update/delete `ADMIN`,`SUPERADMIN`. Thứ 2, list/get có thêm `USER` — user xem được nhưng không sửa.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Kiểm tra ownership station?

---

## Q36. Mobile NetInfo — có trong dependency; offline UX áp dụng chỗ nào?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Mobile NetInfo — có trong dependency; offline UX áp dụng chỗ nào?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Offline-first.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Mobile NetInfo — có trong dependency; offline UX áp dụng chỗ nào? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Offline-first. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, `@react-native-community/netinfo` trong `package.json`. Thứ 2, cần chỉ rõ màn hình map/report có queue offline hay chỉ toast — trả lời trung thực theo code đã implement (`useNetworkStore` zustand).

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** TanStack Query persist client?

---

## Q37. Zustand `usePlaceSearchHistoryStore` persist — UX gì?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Zustand `usePlaceSearchHistoryStore` persist — UX gì?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Local UX polish.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Zustand `usePlaceSearchHistoryStore` persist — UX gì? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Local UX polish. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Lịch sử tìm địa điểm map persist — giảm gõ lại. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Privacy?

---

## Q38. Backend `AddCacheServices` và Redis connection string bắt buộc?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Backend `AddCacheServices` và Redis connection string bắt buộc?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Config deployment.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Backend `AddCacheServices` và Redis connection string bắt buộc? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Config deployment. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: `[ServiceExtensions.cs](D:/FPTU/SEM9/SEP490/BE/FDA_API/src/External/Infrastructure/Common/FDAAPI.Infra.Configuration/ServiceExtensions.cs)` throw nếu thiếu `RedisConnection` khi đăng ký cache — production phải có Redis. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Fallback in-memory cache?

---

## Q39. `VerifyPredictions` với administrative area level `city` — độ phức tạp?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «`VerifyPredictions` với administrative area level `city` — độ phức tạp?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Algorithm và performance.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung `VerifyPredictions` với administrative area level `city` — độ phức tạp? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Algorithm và performance. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Query districts → wards → gom ward ids → filter stations — nested queries O(k) areas. Thứ 2, với pageSize 10000 stations có thể nặng — điểm tối ưu index DB.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** khó. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Spatial query thay vì filter in-memory?

---

## Q40. `FeatG56_EvaluateAllDistricts` dùng cache — mục tiêu business?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «`FeatG56_EvaluateAllDistricts` dùng cache — mục tiêu business?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** AI/analytics flood hotspot.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung `FeatG56_EvaluateAllDistricts` dùng cache — mục tiêu business? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: AI/analytics flood hotspot. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Handler evaluate districts — cache giảm tải tính toán lặp (chi tiết trong handler). Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** TTL cache?

---

## Q41. Web Sentry (`@sentry/nextjs`) — lỗi production thu thập ra sao?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Web Sentry (`@sentry/nextjs`) — lỗi production thu thập ra sao?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Observability.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Web Sentry (`@sentry/nextjs`) — lỗi production thu thập ra sao? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Observability. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Dependency trong `package.json` — cấu hình `sentry.`* khi build. Thứ 2, giúp hội đồng thấy giám sát lỗi client/server.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** PII scrubbing?

---

## Q42. Mobile supercluster + map clustering — bài toán UX?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Mobile supercluster + map clustering — bài toán UX?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Hiển thị nhiều điểm báo.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Mobile supercluster + map clustering — bài toán UX? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Hiển thị nhiều điểm báo. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Dependencies `supercluster`, `react-native-map-clustering` — gom marker khi zoom out. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Performance O(n)?

---

## Q43. `FeatG97` FCM token update — method HTTP?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «`FeatG97` FCM token update — method HTTP?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** REST contract.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung `FeatG97` FCM token update — method HTTP? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: REST contract. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Endpoint class `FcmTokenUpdateEndpoint` với JWT scheme — mobile POST token sau khi refresh FCM. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Multi-device token table?

---

## Q44. Payment/plan admin endpoints `FeatG122`–`FeatG127` — scope báo cáo đồ án?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Payment/plan admin endpoints `FeatG122`–`FeatG127` — scope báo cáo đồ án?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Business completeness.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Payment/plan admin endpoints `FeatG122`–`FeatG127` — scope báo cáo đồ án? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Business completeness. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Admin xem payment, complaints — phần vận hành và monetization. Thứ 2, liên hệ use case billing trên mobile `app/billing`.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** PCI scope?

---

## Q45. `OperationalLogs` export `FeatG133` — định dạng?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «`OperationalLogs` export `FeatG133` — định dạng?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Compliance và audit.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung `OperationalLogs` export `FeatG133` — định dạng? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Compliance và audit. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Export operational logs cho admin — định dạng cần xem endpoint (CSV/Excel) khi demo. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Size limit export?

---

## Q46. React Query trong web (`@tanstack/react-query`) — dùng chung pattern gì?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «React Query trong web (`@tanstack/react-query`) — dùng chung pattern gì?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Data fetching layer.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung React Query trong web (`@tanstack/react-query`) — dùng chung pattern gì? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Data fetching layer. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Nhiều feature gọi API qua hooks query. Thứ 2, kết hợp Zustand cho auth không trộn với server cache.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Query key convention?

---

## Q47. `next-intl` trong web — đa ngôn ngữ?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «`next-intl` trong web — đa ngôn ngữ?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** i18n.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung `next-intl` trong web — đa ngôn ngữ? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: i18n. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Dependency `next-intl` — chuẩn bị đường dịch portal admin/mod. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Locale flood alert message?

---

## Q48. Mobile `expo-secure-store` — lưu gì so với AsyncStorage?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Mobile `expo-secure-store` — lưu gì so với AsyncStorage?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Secret storage.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Mobile `expo-secure-store` — lưu gì so với AsyncStorage? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Secret storage. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Package có trong dependencies — thích hợp secret nhạy cảm hơn. Thứ 2, auth hiện persist qua redux AsyncStorage — có thể nêu đề xuất cải tiến.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** khó. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Threat model jailbreak?

---

## Q49. Hai lần `UseHttpsRedirection()` trong `Program.cs` — có bug không?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Hai lần `UseHttpsRedirection()` trong `Program.cs` — có bug không?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Attention to detail.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Hai lần `UseHttpsRedirection()` trong `Program.cs` — có bug không? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Attention to detail. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Một khối chỉ Development và một khối global — trùng logic, có thể refactor. Thứ 2, không nhất thiết break nhưng dễ gây nhầm khi đọc pipeline.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Reverse proxy termination HTTPS?

---

## Q50. `AllowAnyOrigin` CORS — rủi ro và cách khắc phục production?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «`AllowAnyOrigin` CORS — rủi ro và cách khắc phục production?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Security realism.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung `AllowAnyOrigin` CORS — rủi ro và cách khắc phục production? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Security realism. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, `CorsPolicy` allow any origin — tiện dev/mobile nhưng CSRF-like risks với cookie nếu mis-config. Thứ 2, production nên whitelist domain web admin và mobile scheme, hoặc dùng token chỉ header không cookie cross-site.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** khó. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** SameSite cookie?

---

## A1. Vì sao chọn FastEndpoints thay vì Controller MVC truyền thống?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Vì sao chọn FastEndpoints thay vì Controller MVC truyền thống?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Kiến trúc API hiện đại.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Vì sao chọn FastEndpoints thay vì Controller MVC truyền thống? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Kiến trúc API hiện đại. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, FastEndpoints gom endpoint theo feature (`FeatGxx`), validation và Swagger gọn. Thứ 2, phù hợp API-first, vertical slice.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Minimal APIs so sánh?

---

## A2. Kiến trúc Clean Architecture trong repo thể hiện qua thư mục nào?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Kiến trúc Clean Architecture trong repo thể hiện qua thư mục nào?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Separation of concerns.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Kiến trúc Clean Architecture trong repo thể hiện qua thư mục nào? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Separation of concerns. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: `Core/Application` handlers theo feature, `Domain.RelationalDb` entities, `Infra` persistence/services, `Presentation` endpoints — dependency hướng vào domain. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Vi phạm layer nào dễ gặp?

---

## A3. Vì sao mobile dùng **cả** Redux Toolkit và Zustand?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Vì sao mobile dùng **cả** Redux Toolkit và Zustand?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Quyết định kiến trúc FE quan trọng nhất đồ án.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Vì sao mobile dùng **cả** Redux Toolkit và Zustand? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Quyết định kiến trúc FE quan trọng nhất đồ án. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Redux + persist cho **auth** (single source, thunk async, tooling quen). Thứ 2, Zustand cho **realtime map** và store nhẹ (`useFloodRealtimeStore`, …) vì cập nhật tần suất cao, ít boilerplate, merge với React Query hiệu quả.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** khó. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Gộp hết vào một được không?

---

## A4. Web chỉ dùng Zustand + React Query — kiến trúc “server state vs client state”?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Web chỉ dùng Zustand + React Query — kiến trúc “server state vs client state”?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Phân tách concern.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Web chỉ dùng Zustand + React Query — kiến trúc “server state vs client state”? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Phân tách concern. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, React Query giữ **server state** (cache, stale, refetch). Thứ 2, Zustand auth + admin store giữ **session và UI state** pagination/modals.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Duplicate source of truth?

---

## A5. Luồng realtime tổng thể từ MQTT đến mobile map?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Luồng realtime tổng thể từ MQTT đến mobile map?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** End-to-end architecture.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Luồng realtime tổng thể từ MQTT đến mobile map? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: End-to-end architecture. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: MQTT ingestion → xử lý/lưu DB → hosted jobs & realtime service broadcast SignalR → hub groups station/area → mobile SignalR merge vào GeoJSON layer. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** khó. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Single point of failure?

---

## A6. Hangfire + HostedService cùng tồn tại — nguyên tắc phân chia?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Hangfire + HostedService cùng tồn tại — nguyên tắc phân chia?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Background processing design.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Hangfire + HostedService cùng tồn tại — nguyên tắc phân chia? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Background processing design. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, HostedService cho vòng lặp liên tục (ingestion, alert pipeline). Thứ 2, Hangfire cho job lịch/recurring có dashboard và retry (analytics, news crawler, verify predictions trigger).

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Duplicate scheduling risk?

---

## A7. Feature folder `FeatGxx` — lợi ích cho nhóm 5–7 người?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Feature folder `FeatGxx` — lợi ích cho nhóm 5–7 người?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Agile scaling.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Feature folder `FeatGxx` — lợi ích cho nhóm 5–7 người? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Agile scaling. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Giảm conflict merge, ownership rõ, map 1-1 với backlog trace `FE-xx` trong test. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Shared kernel duplicate?

---

## A8. Admin portal Next.js App Router — route protection pattern?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Admin portal Next.js App Router — route protection pattern?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** FE architecture.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Admin portal Next.js App Router — route protection pattern? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: FE architecture. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, `RoleGuard` + layout route `/admin` + pages moderator. Thứ 2, kết hợp `auth-session` bridge và login flow.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Middleware Next.js?

---

## A9. Mobile Expo Router — lợi thế file-based routing?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Mobile Expo Router — lợi thế file-based routing?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Structure app.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Mobile Expo Router — lợi thế file-based routing? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Structure app. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Thư mục `app/` map route. Thứ 2, deep link plans/map/guest — giảm config navigation thủ công.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Auth guard ở layout?

---

## A10. Sep Redis cache vs DB — khi nào đọc DB trực tiếp?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Sep Redis cache vs DB — khi nào đọc DB trực tiếp?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Caching strategy.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Sep Redis cache vs DB — khi nào đọc DB trực tiếp? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Caching strategy. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Handlers hotspot/analytics dùng `IDistributedCache` short-circuit. Thứ 2, miss thì tính và ghi lại — chi tiết TTL từng handler.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** khó. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Cache invalidation khi có sensor mới?

---

## A11. AI trong hệ thống tách thành hai nhánh chính — đó là gì?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «AI trong hệ thống tách thành hai nhánh chính — đó là gì?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Conceptual diagram oral exam.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung AI trong hệ thống tách thành hai nhánh chính — đó là gì? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Conceptual diagram oral exam. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, (1) **Gemini** xử lý văn bản tin tức crawl thành JSON có cấu trúc. Thứ 2, (2) **Prediction logs + VerifyPredictions** đánh giá mô hình dự báo lũ so thực tế — không gộp thành một “chatbot”.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Model training ở đâu?

---

## A12. SignalR không thay REST — vì sao kiến trúc hybrid?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «SignalR không thay REST — vì sao kiến trúc hybrid?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Right tool choice.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung SignalR không thay REST — vì sao kiến trúc hybrid? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Right tool choice. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, REST cho GeoJSON ban đầu, phân trang, CRUD. Thứ 2, SignalR cho delta realtime nhỏ — giảm tải và đơn giản retry HTTP.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** WebSocket trực tiếp?

---

## A13. Monolith FDA_API — khi nào tách microservice?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Monolith FDA_API — khi nào tách microservice?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Evolution architecture.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Monolith FDA_API — khi nào tách microservice? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Evolution architecture. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Hiện monolith + background jobs đủ cho capstone. Thứ 2, tách khi đội DevOps đủ và có bottleneck đo được (ingestion, AI) — đề xuất extrade MQTT worker hoặc AI worker.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Event bus?

---

## A14. Test project map requirement `FE-xx` — vai trò trong architecture?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Test project map requirement `FE-xx` — vai trò trong architecture?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Quality gate.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Test project map requirement `FE-xx` — vai trò trong architecture? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Quality gate. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: `FDAAPI.Test` giữ contract API cho user stories — là “living documentation” cho SRS. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Mutation testing?

---

## A15. `IRealtimeMapService` scope `Scoped` — ý nghĩa với Hub?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «`IRealtimeMapService` scope `Scoped` — ý nghĩa với Hub?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** DI lifetime.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung `IRealtimeMapService` scope `Scoped` — ý nghĩa với Hub? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: DI lifetime. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Scoped per request/hub context trong ASP.NET — tránh singleton stateful sai. Thứ 2, hub inject logger/services đúng lifecycle.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** khó. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Singleton broadcast service?

---

## A16. Web MapLibre + Google Maps API — hai thư viện map — tại sao?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Web MapLibre + Google Maps API — hai thư viện map — tại sao?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** FE mapping stack.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Web MapLibre + Google Maps API — hai thư viện map — tại sao? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: FE mapping stack. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: `package.json` có `@react-google-maps/api` và `maplibre-gl` — có thể dùng cho layer khác nhau (admin vs visualization) — trả lời theo module zones/stations đang dùng. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Chi phí license Google?

---

## A17. Notification pipeline `Feat43` + FCM — kiến trúc asynchronous?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Notification pipeline `Feat43` + FCM — kiến trúc asynchronous?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Alert reliability.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Notification pipeline `Feat43` + FCM — kiến trúc asynchronous? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Alert reliability. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Dispatch job tách khỏi HTTP request user — đảm bảo retry và không block API. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Dead letter queue?

---

## A18. Repository pattern trong Domain — lợi ích test?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Repository pattern trong Domain — lợi ích test?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Testability.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Repository pattern trong Domain — lợi ích test? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Testability. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Handlers nhận `IStationRepository`, … — mock trong unit test, integration test dùng Testcontainers. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Over-abstraction?

---

## A19. Version API `/api/v1` — chiến lược breaking change?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Version API `/api/v1` — chiến lược breaking change?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** API lifecycle.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Version API `/api/v1` — chiến lược breaking change? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: API lifecycle. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Tests và Swagger gọi `/api/v1/...` — chuẩn bị v2 song song khi đổi contract. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Deprecation header?

---

## A20. `Scalar`/`Swagger` documentation — ai là consumer?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «`Scalar`/`Swagger` documentation — ai là consumer?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** DX và handoff.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung `Scalar`/`Swagger` documentation — ai là consumer? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: DX và handoff. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Swagger UI bật Dev/UAT — mobile/web teams đồng bộ DTO. Thứ 2, JWT scheme doc sẵn.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** OpenAPI codegen?

---

## AI1. Model Gemini cụ thể và output format là gì?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Model Gemini cụ thể và output format là gì?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Accuracy of claims.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Model Gemini cụ thể và output format là gì? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Accuracy of claims. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, `gemini-2.5-flash` qua REST `generateContent`. Thứ 2, `generationConfig.responseMimeType = application/json` — ép model trả JSON để parse an toàn hơn free text.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Schema validation với FluentValidation?

---

## AI2. Batch tối đa 10 bài báo — lý do?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Batch tối đa 10 bài báo — lý do?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Token economics.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Batch tối đa 10 bài báo — lý do? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Token economics. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Giảm độ trễ và kích thước prompt. Thứ 2, tránh timeout 30s. Thứ 3, dễ retry batch.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Chi phí token ước lượng?

---

## AI3. Rate limit 5 request/phút + Semaphore — giải thích “double control”?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Rate limit 5 request/phút + Semaphore — giải thích “double control”?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Production stability.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Rate limit 5 request/phút + Semaphore — giải thích “double control”? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Production stability. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Constants `RequestsPerMinute` + lock serialize — chống burst và race trong đa luồng async. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** khó. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Distributed deployment?

---

## AI4. Khi Gemini trả invalid JSON array pipeline xử lý sao?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Khi Gemini trả invalid JSON array pipeline xử lý sao?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Hallucination handling.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Khi Gemini trả invalid JSON array pipeline xử lý sao? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Hallucination handling. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Log warning, `GeminiBatchResult.Failed` — không ghi nhận dữ liệu sai cấu trúc. Thứ 2, có thể manual review hoặc retry batch sau.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** JSON schema validate?

---

## AI5. HTTP 429/503 — vì sao `DeferredRun` thay vì fail cứng?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «HTTP 429/503 — vì sao `DeferredRun` thay vì fail cứng?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Resilience patterns.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung HTTP 429/503 — vì sao `DeferredRun` thay vì fail cứng? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Resilience patterns. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Tạm hoãn sang lần schedule Hangfire — tránh mất dữ liệu crawl khi API Google gián đoạn. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Exponential backoff?

---

## AI6. `VerifyPredictions` gắn với “trustworthy AI” như thế trong báo cáo?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «`VerifyPredictions` gắn với “trustworthy AI” như thế trong báo cáo?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Ethics / evaluation.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung `VerifyPredictions` gắn với “trustworthy AI” như thế trong báo cáo? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Ethics / evaluation. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Sau thời điểm dự báo, hệ thống đối chiếu đọc trạm thực tế để đánh dấu verified — đây là **post-hoc evaluation**, không phải training online. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** khó. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Confusion matrix?

---

## AI7. Dự báo theo `Area` người dùng vẽ khác `AdministrativeArea` thế nào?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Dự báo theo `Area` người dùng vẽ khác `AdministrativeArea` thế nào?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Domain logic AI input.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Dự báo theo `Area` người dùng vẽ khác `AdministrativeArea` thế nào? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Domain logic AI input. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, `AreaId` dùng bán kính `RadiusMeters`. Thứ 2, administrative dùng phân cấp hành chính — ảnh hưởng tập trạm đối chiếu khi verify.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** khó. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Edge case trạm nằm ranh giới ward?

---

## AI8. Có embedding / vector search trong codebase không?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Có embedding / vector search trong codebase không?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Tránh thổi phồng RAG.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Có embedding / vector search trong codebase không? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Tránh thổi phồng RAG. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Không thấy trong các file đã quét — nếu đồ án không triển khai RAG, trả lời thẳng. Thứ 2, đề xuất mở rộng: embed tin tức đã crawl để semantic search.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** PostgreSQL pgvector?

---

## AI9. Web `@google/genai` trong `libs/api.ts` phục vụ AI feature gì trên dashboard?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Web `@google/genai` trong `libs/api.ts` phục vụ AI feature gì trên dashboard?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Scope clarity.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Web `@google/genai` trong `libs/api.ts` phục vụ AI feature gì trên dashboard? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Scope clarity. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Khởi tạo client SDK. Thứ 2, cần chỉ rõ feature UI nào gọi (nếu chỉ prototype) — tránh nhầm với backend Gemini news pipeline.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** khó. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** API key exposure `NEXT_PUBLIC_`*?

---

## AI10. Crawler news + Gemini — output phục vụ user story nào?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Crawler news + Gemini — output phục vụ user story nào?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Business value.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Crawler news + Gemini — output phục vụ user story nào? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Business value. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Cung cấp tin lũ đã tóm tắt/cấu trúc cho portal (`news` feature web) — giảm đọc thủ công. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Fact-check pipeline?

---

## AI11. Confidence score có trong entity `PredictionLog` không?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Confidence score có trong entity `PredictionLog` không?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Model outputs.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Confidence score có trong entity `PredictionLog` không? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Model outputs. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Cần xem entity trong Domain — nếu có field confidence hãy trích. Thứ 2, nếu không, nói verification nhị phân verified/error.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Calibration?

---

## AI12. Prompt `BuildPrompt` trong Gemini service — nguyên tắc thiết kế?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Prompt `BuildPrompt` trong Gemini service — nguyên tắc thiết kế?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Prompt engineering.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Prompt `BuildPrompt` trong Gemini service — nguyên tắc thiết kế? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Prompt engineering. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Prompt build từ danh sách `CrawledArticle` — output JSON array để map vào DB. Thứ 2, giữ instructions rõ schema giảm hallucination định dạng.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Few-shot examples?

---

## AI13. AI có auto-trigger cảnh báo người dân không hay chỉ admin?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «AI có auto-trigger cảnh báo người dân không hay chỉ admin?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Safety critical path.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung AI có auto-trigger cảnh báo người dân không hay chỉ admin? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Safety critical path. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Alert pipeline `Feat42` + notification `Feat43` là luồng operational — Gemini news có thể chỉ hỗ trợ nội dung, không trực tiếp bắn alert trừ khi có rule nghiệp vụ nối — trả lời đúng luồng đã code. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** khó. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Human-in-the-loop publish?

---

## AI14. Thuật ngữ “prediction verification limit 100” — ảnh hưởng backlog?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Thuật ngữ “prediction verification limit 100” — ảnh hưởng backlog?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Operational bounds.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Thuật ngữ “prediction verification limit 100” — ảnh hưởng backlog? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Operational bounds. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, `GetPendingVerificationAsync(..., limit: 100)` — mỗi run xử lý tối đa 100 — chống job dài. Thứ 2, backlog lớn cần tăng frequency hoặc parallel shard.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Poison message?

---

## AI15. Model flood prediction train bằng dữ liệu gì trong đồ án?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Model flood prediction train bằng dữ liệu gì trong đồ án?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Data lineage.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Model flood prediction train bằng dữ liệu gì trong đồ án? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Data lineage. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Trả lời theo báo cáo/bộ dữ liệu thực tế team dùng (sensor history, rainfall…) — trích handler evaluate/prediction log schema nếu có mô tả. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** khó. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Class imbalance?

---

## AI16. Có fine-tune Gemini không?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Có fine-tune Gemini không?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** ML depth.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Có fine-tune Gemini không? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: ML depth. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Hiện dùng API generateContent — không fine-tune. Thứ 2, nếu có thì nêu riêng.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Cost fine-tune?

---

## AI17. `EvaluateAllDistricts` vs `AdministrativeAreasEvaluate` — khác nhau?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «`EvaluateAllDistricts` vs `AdministrativeAreasEvaluate` — khác nhau?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** AI evaluation scope.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung `EvaluateAllDistricts` vs `AdministrativeAreasEvaluate` — khác nhau? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: AI evaluation scope. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Hai handler khác phạm vi địa lý/tính toán (district batch vs single area) — tham chiếu Application layer. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Duplicate code?

---

## AI18. Làm sao giảm chi phí Gemini?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Làm sao giảm chi phí Gemini?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Cost optimization.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Làm sao giảm chi phí Gemini? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Cost optimization. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Batch 10, rate limit, defer retry. Thứ 2, cache kết quả crawl. Thứ 3, chỉ gửi nội dung cần thiết trong prompt.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Summarize article trước khi Gemini?

---

## AI19. Tin giả từ news crawl — biện pháp?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Tin giả từ news crawl — biện pháp?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Misinformation.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Tin giả từ news crawl — biện pháp? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Misinformation. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Moderator/admin duyệt nguồn. Thứ 2, có thể whitelist domain crawler. Thứ 3, không auto push alert chỉ từ tin chưa verify.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Source reputation score?

---

## AI20. Metrics alert performance `FeatG129` — liên quan AI không?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Metrics alert performance `FeatG129` — liên quan AI không?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Observability AI ops.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Metrics alert performance `FeatG129` — liên quan AI không? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Observability AI ops. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Endpoint metrics hiệu năng cảnh báo — có thể dùng để đánh giá độ trễ pipeline AI/notification. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** SLA notification?

---

## F1. `RoleGuard` kiểm tra role thế nào và loading UX?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «`RoleGuard` kiểm tra role thế nào và loading UX?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** UX auth.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung `RoleGuard` kiểm tra role thế nào và loading UX? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: UX auth. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Chờ `status` khác loading/idle. Thứ 2, spinner “Checking permissions…”. Thứ 3, redirect nếu thiếu role.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Flash of unauthorized content?

---

## F2. Admin operational logs view — tương tác filter/sort theo doc Report 6?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Admin operational logs view — tương tác filter/sort theo doc Report 6?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** SRS alignment.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Admin operational logs view — tương tác filter/sort theo doc Report 6? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: SRS alignment. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Toolbar search, time range, severity, category. Thứ 2, sort cột. Thứ 3, drawer chi tiết JSON — khớp mô tả `3.2.11`.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Virtualize large table?

---

## F3. Map zones/stations web — hooks `useMapStationsList`, `useAdministrativeAreasMapData` làm gì?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Map zones/stations web — hooks `useMapStationsList`, `useAdministrativeAreasMapData` làm gì?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Data hooks architecture.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Map zones/stations web — hooks `useMapStationsList`, `useAdministrativeAreasMapData` làm gì? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Data hooks architecture. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Tách fetch stations và ranh giới hành chính — ghép layer map. Thứ 2, giảm component monolith.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Debounce search?

---

## F4. Form validation web — stack?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Form validation web — stack?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** DX và quality.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Form validation web — stack? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: DX và quality. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: `react-hook-form` + `zod` resolvers trong dependencies — schema-first validation. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Server validation mismatch?

---

## F5. Toast `sonner` — pattern feedback?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Toast `sonner` — pattern feedback?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** UX consistency.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Toast `sonner` — pattern feedback? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: UX consistency. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: OAuth callback success/error dùng toast — feedback không chặn luồng. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Accessibility announcements?

---

## F6. Mobile map clustering — user zoom in thấy chi tiết điểm báo?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Mobile map clustering — user zoom in thấy chi tiết điểm báo?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Interaction design.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Mobile map clustering — user zoom in thấy chi tiết điểm báo? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Interaction design. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Supercluster expand khi zoom — giảm chồng marker. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Dynamic marker rendering perf?

---

## F7. Bottom sheet `@gorhom/bottom-sheet` — dùng cho UX gì?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Bottom sheet `@gorhom/bottom-sheet` — dùng cho UX gì?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Mobile UX patterns.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Bottom sheet `@gorhom/bottom-sheet` — dùng cho UX gì? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Mobile UX patterns. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Sheet báo cộng đồng/chọn địa điểm — gesture native. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Keyboard overlap?

---

## F8. `useLanguageStore` — đa ngôn ngữ mobile?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «`useLanguageStore` — đa ngôn ngữ mobile?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** i18n mobile.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung `useLanguageStore` — đa ngôn ngữ mobile? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: i18n mobile. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Zustand persist ngôn ngữ — đồng bộ UI strings. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** RTL support?

---

## F9. `useSatelliteFloodStore` / analysis store — hiển thị lớp vệ tinh?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «`useSatelliteFloodStore` / analysis store — hiển thị lớp vệ tinh?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Feature depth.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung `useSatelliteFloodStore` / analysis store — hiển thị lớp vệ tinh? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Feature depth. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Store Zustand cho phân tích ảnh vệ tinh/lũ — kết nối feature prediction/satellite. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Tile load errors?

---

## F10. Community report sheet UX — user gửi báo như thế?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Community report sheet UX — user gửi báo như thế?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Critical citizen journey.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Community report sheet UX — user gửi báo như thế? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Critical citizen journey. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Component `CommunityReportSheet` — form đính kèm ảnh (`expo-image-picker`) nếu có. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Abuse reporting?

---

## F11. Web community report moderation — api hooks?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Web community report moderation — api hooks?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Moderator journey.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Web community report moderation — api hooks? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Moderator journey. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: `community-report.api.ts`, hooks `useCommunityReports` — fetch/filter báo pending. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Bulk approve?

---

## F12. Loading overlay map — tránh tương tác khi fetch?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Loading overlay map — tránh tương tác khi fetch?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** UX states.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Loading overlay map — tránh tương tác khi fetch? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: UX states. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: `MapLoadingOverlay` component — giảm race click khi data chưa sẵn sàng. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Skeleton vs spinner?

---

## F13. Safe route cards UI — feature `FeatG74`/`FeatG75`?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Safe route cards UI — feature `FeatG74`/`FeatG75`?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Routing UX.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Safe route cards UI — feature `FeatG74`/`FeatG75`? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Routing UX. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Components `SafeRouteResultCard`, alternatives — hiển thị đường đi an toàn từ backend polyline (`@mapbox/polyline`). Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Offline maps?

---

## F14. Billing/plans UI mobile — package.json có expo modules payment?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Billing/plans UI mobile — package.json có expo modules payment?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Monetization UX.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Billing/plans UI mobile — package.json có expo modules payment? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Monetization UX. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Màn `app/plans`, `app/billing` — luồng subscribe hiển thị plan feature comparison table. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** WebView checkout?

---

## F15. Web `recharts` — dashboard metrics?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Web `recharts` — dashboard metrics?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Visualization.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Web `recharts` — dashboard metrics? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Visualization. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Dependency `recharts` — biểu đồ admin stats alerts/users. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Real-time chart updates?

---

## F16. `nuqs` URL query state — lợi ích admin filter?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «`nuqs` URL query state — lợi ích admin filter?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Shareable URLs.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung `nuqs` URL query state — lợi ích admin filter? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Shareable URLs. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: State filter trên URL — bookmark báo cáo. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Sensitive query leakage?

---

## F17. Mobile OTP UI `react-native-otp-entry` — luồng login?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Mobile OTP UI `react-native-otp-entry` — luồng login?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Auth UX.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Mobile OTP UI `react-native-otp-entry` — luồng login? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Auth UX. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: OTP thunk `otp.thunk` — nhập mã xác minh. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Brute force OTP?

---

## F18. Web Header role-aware navigation?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Web Header role-aware navigation?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** IA navigation.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Web Header role-aware navigation? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: IA navigation. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: `Header.tsx` dùng auth store — hiển thị portal đúng role. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Deep link moderator?

---

## F19. `motion` animation web — scope?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «`motion` animation web — scope?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Polish vs performance.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung `motion` animation web — scope? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Polish vs performance. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Package `motion` — nhẹ nhàng transition. Thứ 2, tránh animate layout nặng trên bảng lớn.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** prefers-reduced-motion?

---

## F20. Mobile NetInfo + query persister packages — offline cụ thể?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Mobile NetInfo + query persister packages — offline cụ thể?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Honest offline story.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Mobile NetInfo + query persister packages — offline cụ thể? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Honest offline story. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Có dependency TanStack persist async-storage — có thể cache query. Thứ 2, cần demo scenario “mất mạng vẫn xem cache map” nếu đã wire.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Stale data indicator?

---

## SEC1. JWT được kiểm tra ở đâu là “source of truth”?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «JWT được kiểm tra ở đâu là “source of truth”?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Security layering.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung JWT được kiểm tra ở đâu là “source of truth”? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Security layering. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: ASP.NET JWT Bearer middleware + `Roles` FastEndpoints — không tin client. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Algorithm confusion attack?

---

## SEC2. Refresh token rotation có trong API không?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Refresh token rotation có trong API không?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Session fixation.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Refresh token rotation có trong API không? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Session fixation. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, `refresh-token` endpoint trả access mới + refresh mới (theo client store update) — nếu server rotate, giải thích payload. Thứ 2, nếu không chắc, xem handler auth.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** khó. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Reuse old refresh token?

---

## SEC3. Lưu JWT trong localStorage web — rủi ro XSS?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Lưu JWT trong localStorage web — rủi ro XSS?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Front security realism.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Lưu JWT trong localStorage web — rủi ro XSS? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Front security realism. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, `persist` Zustand vào localStorage — nếu XSS, token lộ. Thứ 2, mitigations: CSP, sanitize input, dependency audit, httpOnly cookie migration.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** khó. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Next.js server actions?

---

## SEC4. Role AUTHORITY ẩn log nhạy cảm — đây có phải defense in depth?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Role AUTHORITY ẩn log nhạy cảm — đây có phải defense in depth?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Least privilege UX.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Role AUTHORITY ẩn log nhạy cảm — đây có phải defense in depth? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Least privilege UX. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Giảm lộ nội dung moderation/system cho vai trò không cần — kết hợp server filter nếu có. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** khó. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** API vẫn trả category system?

---

## SEC5. Hangfire dashboard `/hangfire` — ai truy cập?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Hangfire dashboard `/hangfire` — ai truy cập?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Ops security.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Hangfire dashboard `/hangfire` — ai truy cập? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Ops security. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: `HangfireAuthorizationFilter` custom — cần mô tả rule (admin IP, basic auth) trong báo cáo triển khai. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** khó. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Public internet exposure?

---

## SEC6. Fake flood report — biện pháp trong hệ thống?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Fake flood report — biện pháp trong hệ thống?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Abuse case.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Fake flood report — biện pháp trong hệ thống? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Abuse case. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Vote cộng đồng (`FeatG86`), moderator hide (`FeatG134`), rate limit (nếu có endpoint) — trả lời thật mức đã code. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** CAPTCHA?

---

## SEC7. SignalR token long-lived — compromise token?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «SignalR token long-lived — compromise token?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Transport security.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung SignalR token long-lived — compromise token? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Transport security. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Dùng access JWT như REST — khi refresh, `accessTokenFactory` đọc AsyncStorage đã update — hub reconnect. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Close hub on logout?

---

## SEC8. `ValidationExceptionMiddleware` — leak stack?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «`ValidationExceptionMiddleware` — leak stack?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Error disclosure.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung `ValidationExceptionMiddleware` — leak stack? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Error disclosure. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Global handler nên ẩn chi tiết production — kiểm tra middleware implementation. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Correlation id?

---

## SEC9. Google OAuth state parameter?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Google OAuth state parameter?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** CSRF OAuth.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Google OAuth state parameter? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: CSRF OAuth. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Luồng OAuth chuẩn dùng state — kiểm tra `google` finish/callback pages. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** PKCE?

---

## SEC10. Payment endpoints chỉ JWT — chống giả userId trong body?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Payment endpoints chỉ JWT — chống giả userId trong body?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Payment integrity.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Payment endpoints chỉ JWT — chống giả userId trong body? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Payment integrity. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: User id từ claims, không từ client-supplied id — giảm giả mạo. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Idempotency-Key header?

---

## SC1. Horizontal scale API — SignalR sticky session?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Horizontal scale API — SignalR sticky session?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Realtime scale-out.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Horizontal scale API — SignalR sticky session? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Realtime scale-out. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Cần Redis backplane SignalR khi nhiều instance — hiện single instance đủ capstone. Thứ 2, nêu roadmap.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** khó. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Azure SignalR Service?

---

## SC2. Redis cache giảm tải analytics handlers?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Redis cache giảm tải analytics handlers?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Read scaling.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Redis cache giảm tải analytics handlers? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Read scaling. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: `IDistributedCache` cho hotspot/frequency — giảm query DB lặp. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Cold start cache?

---

## SC3. Pagination API flood reports/community?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Pagination API flood reports/community?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Large dataset.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Pagination API flood reports/community? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Large dataset. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Tests `pageNumber` `pageSize` — standard pattern. Thứ 2, mobile `staleTime` giảm spam request.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Cursor-based pagination?

---

## SC4. Hosted MQTT ingestion — bottleneck IoT throughput?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Hosted MQTT ingestion — bottleneck IoT throughput?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Ingest scale.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Hosted MQTT ingestion — bottleneck IoT throughput? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Ingest scale. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Single hosted loop có giới hạn — scale bằng partition theo station/topic hoặc separate worker service. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** khó. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Message queue Kafka?

---

## SC5. DB indexing cho station/administrative queries?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «DB indexing cho station/administrative queries?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Query perf.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung DB indexing cho station/administrative queries? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Query perf. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Đề xuất index `AdministrativeAreaId`, geo radius — trích migration EF nếu có. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Explain analyze?

---

## SC6. Client dedupe refresh token — giảm thundering herd?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Client dedupe refresh token — giảm thundering herd?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Auth scalability.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Client dedupe refresh token — giảm thundering herd? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Auth scalability. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: `isRefreshing` gate trong `apiFetch` — một refresh phục vụ nhiều parallel requests. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Distributed lock refresh?

---

## SC7. Map GeoJSON size — giảm payload?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Map GeoJSON size — giảm payload?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Mobile bandwidth.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Map GeoJSON size — giảm payload? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Mobile bandwidth. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Delta realtime qua SignalR thay vì full snapshot mỗi lần — comment merge logic. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Simplify polygon?

---

## SC8. Hangfire worker count?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Hangfire worker count?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Background throughput.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Hangfire worker count? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Background throughput. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Cấu hình server Hangfire — tăng worker khi queue lớn (verify predictions backlog). Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** trung bình. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Priority queues?

---

## SC9. CDN cho static Next.js?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «CDN cho static Next.js?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** Edge performance.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung CDN cho static Next.js? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: Edge performance. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ: Deploy Vercel/nginx CDN assets — giảm TTFB global. Em có thể chỉ ngay trong mã nguồn hoặc cấu hình liên quan nếu thầy cô yêu cầu mở file cụ thể.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** dễ. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** ISR cache?

---

## SC10. Gemini cost khi news volume x10?

### Câu hỏi chi tiết (ôn theo lời văn)

Phần dưới đây giúp em ôn theo lời văn đầy đủ, không chỉ đọc vắn tắt tiêu đề.

**Câu hỏi trọng tâm (tiêu đề gốc):** «Gemini cost khi news volume x10?».

**Ý mà hội đồng thường muốn chấm / kiểm tra:** AI ops scale.

**Diễn đạt đầy đủ như hội đồng có thể nói (gợi ý mô phỏng):** «Thưa nhóm, trong đồ án FDA của các em có một chủ đề về nội dung Gemini cost khi news volume x10? Ban giám khảo muốn kiểm tra nhóm có hiểu và làm đúng những điểm sau: AI ops scale. Vì vậy nhóm hãy giải thích rõ triển khai trong mã nguồn (file, class, endpoint), luồng chạy thực tế, và lý do kỹ thuật khi chọn phương án đó.»

**Khi trả lời miệng**, em nên đi theo ba lớp ý: (1) ngữ cảnh nghiệp vụ hoặc kỹ thuật của FDA, (2) chứng cứ cụ thể trong code và luồng xử lý, (3) trade-off hoặc rủi ro nhóm đã nhận thức và hướng cải thiện (nếu có).

### Gợi ý trả lời khi đứng trước hội đồng

Thưa hội đồng, em xin được trình bày bằng lời để thầy cô hình dung trọn vẹn phần nhóm đã làm: không chỉ nêu khái niệm mà chỉ rõ chứng cứ trong repo và ý nghĩa vận hành của nó.

Ở phần đầu tiên em muốn làm rõ các ý sau (trong thực tế các ý này liên kết chặt với nhau trong luồng FDA): Thứ 1, Batch+rate limit. Thứ 2, defer. Thứ 3, có thể pre-filter article trước Gemini bằng keyword.

Như vậy, khi gói gọn lại, nhóm tin rằng phần trả lời đã đủ để chứng minh triển khai có thể kiểm chứng được trong mã nguồn FDA.

**Mức độ câu hỏi (ước lượng):** khó. Em có thể chuẩn bị thêm ví dụ, demo hoặc chỉ rõ đường dẫn file nếu thầy cô hỏi sâu thêm.

**Gợi ý mở rộng (nếu hội đồng hỏi tiếp):** Self-host smaller model?

---