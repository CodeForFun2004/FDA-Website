import datetime as dt
from pathlib import Path

import openpyxl


def tc(tc_id: str, desc: str, steps: list[str], expected: list[str], pre: list[str]):
    return {
        "id": tc_id,
        "desc": desc,
        "procedure": "\n".join([f"{i+1}. {s}" for i, s in enumerate(steps)]),
        "expected": "\n".join([f"- {s}" for s in expected]),
        "pre": "\n".join([f"- {s}" for s in pre]),
    }


def build_testcases():
    common_pre = [
        "Đăng nhập bằng tài khoản ADMIN hoặc SUPERADMIN.",
        "Có ít nhất 1 trạm hợp lệ (có latitude/longitude).",
        "Mở trang chi tiết trạm: Admin `/admin/stations/{stationId}` hoặc Moderator `/moderator/stations/{stationId}`.",
    ]

    return [
        tc(
            "FE30_TC01",
            "Mở Station Detail hiển thị sidebar FE-30 (Realtime + Thành phần của trạm).",
            [
                "Truy cập trang chi tiết một trạm bất kỳ.",
                "Quan sát bố cục trang ở màn hình laptop/desktop.",
            ],
            [
                "Cột trái hiển thị các thẻ tổng quan và bản đồ Station Location.",
                "Sidebar bên phải hiển thị 2 section: `Trạng thái realtime` và `Thành phần của trạm`.",
                "Không cần kéo xuống quá sâu để thấy bản đồ (map nằm cao hơn).",
            ],
            common_pre,
        ),
        tc(
            "FE30_TC02",
            "Sidebar sticky: cuộn trang thì sidebar vẫn bám theo (desktop).",
            [
                "Ở trang Station Detail trên desktop/laptop, kéo xuống để cuộn trang.",
                "Quan sát sidebar bên phải.",
            ],
            [
                "Sidebar bám theo khi cuộn (sticky).",
                "Nếu sidebar dài, nội dung sidebar cuộn riêng mà không làm trang kéo dài quá mức.",
            ],
            common_pre,
        ),
        tc(
            "FE30_TC03",
            "Mobile responsive: layout không vỡ, hiển thị theo cột dọc.",
            [
                "Mở Station Detail trên màn hình nhỏ (hoặc thu nhỏ trình duyệt).",
                "Quan sát các section FE-30.",
            ],
            [
                "Các section xếp theo chiều dọc (không bị tràn ngang).",
                "Nội dung không bị chồng lên nhau hoặc vỡ khung.",
            ],
            common_pre,
        ),
        tc(
            "FE30_TC04",
            "Realtime card hiển thị mực nước + đơn vị (cm) không bị tràn khung trên laptop.",
            [
                "Mở Station Detail trên laptop.",
                "Quan sát ô `Mực nước` trong section `Trạng thái realtime`.",
            ],
            [
                "Giá trị mực nước hiển thị rõ ràng.",
                "Đơn vị `cm` hiển thị gọn (xuống dòng dưới), không bị tràn khỏi viền khung.",
            ],
            common_pre,
        ),
        tc(
            "FE30_TC05",
            "Realtime card hiển thị measuredAt đúng định dạng dễ đọc.",
            [
                "Mở Station Detail.",
                "Quan sát dòng `measuredAt` trong ô `Mực nước`.",
            ],
            [
                "measuredAt hiển thị dạng ngày/giờ dễ đọc (vi-VN).",
                "Không hiển thị `Invalid Date`.",
            ],
            common_pre,
        ),
        tc(
            "FE30_TC06",
            "Realtime card hiển thị Station status và severity (Safe/Alarm/Warning/Critical).",
            [
                "Mở Station Detail.",
                "Quan sát ô `Station status` trong Realtime.",
            ],
            [
                "Có badge trạng thái trạm (stationStatus).",
                "Có badge severity (Safe/Alarm/Warning/Critical hoặc `—` nếu không có).",
            ],
            common_pre,
        ),
        tc(
            "FE30_TC07",
            "Realtime card hiển thị alertLevel (nếu có).",
            [
                "Mở Station Detail.",
                "Quan sát dòng `alertLevel` trong ô `Station status`.",
            ],
            [
                "alertLevel hiển thị giá trị hoặc `—` nếu không có.",
            ],
            common_pre,
        ),
        tc(
            "FE30_TC08",
            "Realtime card hiển thị lastSeenAt và refreshedAt.",
            [
                "Mở Station Detail.",
                "Quan sát ô `Đồng bộ` trong Realtime.",
            ],
            [
                "lastSeenAt hiển thị ngày/giờ hoặc `—` nếu không có.",
                "refreshedAt hiển thị thời điểm cập nhật UI.",
            ],
            common_pre,
        ),
        tc(
            "FE30_TC09",
            "Nhấn Refresh ở Realtime: cập nhật dữ liệu và hiển thị trạng thái đang tải.",
            [
                "Mở Station Detail.",
                "Nhấn nút `Refresh` ở section `Trạng thái realtime`.",
            ],
            [
                "Icon refresh quay (loading) trong lúc đang tải.",
                "Sau khi tải xong, dữ liệu được cập nhật (refreshedAt thay đổi).",
            ],
            common_pre,
        ),
        tc(
            "FE30_TC10",
            "Realtime polling tự cập nhật (mỗi ~15s) khi ở lại trang.",
            [
                "Mở Station Detail và đứng yên trên trang.",
                "Quan sát `refreshedAt` trong ô `Đồng bộ`.",
                "Chờ khoảng 15–20 giây.",
            ],
            [
                "refreshedAt tự thay đổi theo chu kỳ (không cần bấm Refresh).",
            ],
            common_pre,
        ),
        tc(
            "FE30_TC11",
            "Trạm không có dữ liệu realtime: hiển thị empty state.",
            [
                "Mở chi tiết một trạm không có dữ liệu trên bản đồ (map/current-status không trả về trạm đó).",
                "Quan sát section `Trạng thái realtime`.",
            ],
            [
                "Hiển thị thông báo: `Chưa có dữ liệu realtime cho trạm này.`",
                "Trang không bị lỗi hoặc treo.",
            ],
            common_pre + ["Có 1 trạm B không có dữ liệu realtime từ map/current-status."],
        ),
        tc(
            "FE30_TC12",
            "Map API lỗi: Realtime hiển thị thông báo lỗi nhưng trang vẫn dùng được.",
            [
                "Mở Station Detail.",
                "Giả lập lỗi API map/current-status (tắt mạng hoặc backend trả lỗi).",
                "Quan sát section `Trạng thái realtime`.",
            ],
            [
                "Hiển thị khung lỗi (màu đỏ nhạt) trong section realtime.",
                "Các phần khác của trang vẫn hiển thị bình thường (summary, map, components).",
            ],
            common_pre + ["Có cách giả lập lỗi mạng/API (ví dụ ngắt mạng hoặc cấu hình backend)."],
        ),
        tc(
            "FE30_TC13",
            "Realtime lọc đúng stationId: không hiển thị nhầm trạm lân cận.",
            [
                "Chọn khu vực có nhiều trạm gần nhau.",
                "Mở Station Detail của 1 trạm trong khu vực đó.",
                "Quan sát dữ liệu realtime hiển thị.",
            ],
            [
                "Dữ liệu realtime tương ứng đúng trạm đang xem (đúng ID/Code của trạm).",
                "Không bị lấy dữ liệu của trạm gần đó.",
            ],
            common_pre + ["Khu vực có >=2 trạm gần nhau để kiểm chứng lọc stationId/code."],
        ),
        tc(
            "FE30_TC14",
            "Components load thành công: hiển thị list thiết bị với đúng fields.",
            [
                "Mở Station Detail của trạm có thiết bị.",
                "Quan sát section `Thành phần của trạm`.",
            ],
            [
                "Hiển thị danh sách thiết bị.",
                "Mỗi item hiển thị: loại thiết bị (componentType), name (nếu có), model, serialNumber, status.",
            ],
            common_pre + ["Có 1 trạm A có >=1 component trong hệ thống."],
        ),
        tc(
            "FE30_TC15",
            "Components empty: hiển thị thông báo trạm chưa có thiết bị.",
            [
                "Mở Station Detail của trạm không có thiết bị.",
                "Quan sát section `Thành phần của trạm`.",
            ],
            [
                "Hiển thị thông báo: `Trạm chưa có thiết bị nào.`",
            ],
            common_pre + ["Có 1 trạm B có 0 component."],
        ),
        tc(
            "FE30_TC16",
            "Nhấn Refresh ở Components: reload danh sách.",
            [
                "Mở Station Detail.",
                "Nhấn `Refresh` ở section `Thành phần của trạm`.",
            ],
            [
                "Hiển thị loading khi đang tải.",
                "Danh sách cập nhật lại sau khi tải xong.",
            ],
            common_pre,
        ),
        tc(
            "FE30_TC17",
            "Components API lỗi: hiển thị thông báo lỗi và vẫn có thể Refresh lại.",
            [
                "Mở Station Detail.",
                "Giả lập lỗi API components (tắt mạng hoặc backend trả lỗi).",
                "Quan sát section `Thành phần của trạm`.",
                "Nhấn `Refresh` để thử lại sau khi mạng/API ổn định.",
            ],
            [
                "Hiển thị khung lỗi (Có tiêu đề `Không tải được thiết bị`).",
                "Sau khi thử lại (Refresh), nếu API ok thì danh sách hiển thị lại bình thường.",
            ],
            common_pre + ["Có cách giả lập lỗi mạng/API."],
        ),
        tc(
            "FE30_TC18",
            "Regression: StationSummaryCards vẫn hiển thị đầy đủ (không bị ảnh hưởng bởi FE-30).",
            [
                "Mở Station Detail.",
                "Quan sát các thẻ: Device Status, Alert Threshold, Hiệu chuẩn, Trạng thái kết nối.",
            ],
            [
                "Các thẻ summary vẫn hiển thị đúng nội dung.",
                "Nút refresh của `Trạng thái kết nối` vẫn hoạt động.",
            ],
            common_pre,
        ),
        tc(
            "FE30_TC19",
            "Regression: Station Location map vẫn hiển thị (không bị đẩy xuống quá sâu).",
            [
                "Mở Station Detail trên laptop.",
                "Quan sát vị trí map `Station Location`.",
            ],
            [
                "Map hiển thị ngay dưới summary (không phải kéo xuống quá sâu).",
            ],
            common_pre,
        ),
        tc(
            "FE30_TC20",
            "Offline banner: khi station.status = offline thì hiện cảnh báo offline.",
            [
                "Mở Station Detail của một trạm đang offline.",
                "Quan sát phần đầu trang.",
            ],
            [
                "Hiển thị cảnh báo: `Station is currently offline. Last seen: ...`",
            ],
            common_pre + ["Có 1 trạm có status offline hoặc mock data offline."],
        ),
        tc(
            "FE30_TC21",
            "Đổi stationId: chuyển sang trạm khác thì Realtime/Components cập nhật theo trạm mới.",
            [
                "Mở Station Detail của trạm A.",
                "Chuyển sang trang detail của trạm B (đổi stationId).",
                "Quan sát Realtime và Components.",
            ],
            [
                "Realtime hiển thị dữ liệu của trạm B (không giữ dữ liệu trạm A).",
                "Components hiển thị list của trạm B.",
            ],
            common_pre + ["Có ít nhất 2 trạm A/B."],
        ),
        tc(
            "FE30_TC22",
            "Nút Refresh Realtime không làm crash UI khi bấm liên tục.",
            [
                "Mở Station Detail.",
                "Nhấn `Refresh` realtime nhiều lần liên tiếp (3–5 lần).",
            ],
            [
                "UI vẫn ổn định, không bị treo/trắng trang.",
                "Dữ liệu cuối cùng hiển thị hợp lệ.",
            ],
            common_pre,
        ),
        tc(
            "FE30_TC23",
            "Nút Refresh Components không làm crash UI khi bấm liên tục.",
            [
                "Mở Station Detail.",
                "Nhấn `Refresh` trong section Components nhiều lần liên tiếp (3–5 lần).",
            ],
            [
                "UI vẫn ổn định.",
                "Danh sách hiển thị bình thường sau khi tải xong.",
            ],
            common_pre,
        ),
        tc(
            "FE30_TC24",
            "Trường hợp unit không có: vẫn hiển thị `—` ở dòng đơn vị.",
            [
                "Mở Station Detail của trạm mà realtime trả `unit` null/undefined (nếu có).",
                "Quan sát ô `Mực nước`.",
            ],
            [
                "Dòng đơn vị hiển thị `—` (không để trống gây khó hiểu).",
            ],
            common_pre + ["Có thể cần mock/BE để trả unit trống (nếu môi trường cho phép)."],
        ),
        tc(
            "FE30_TC25",
            "Kiểm tra hiển thị khi giá trị mực nước có nhiều chữ số (ví dụ 123.45): không tràn khung.",
            [
                "Mở Station Detail của trạm có mực nước lớn (nhiều chữ số).",
                "Quan sát ô `Mực nước`.",
            ],
            [
                "Giá trị mực nước vẫn nằm trong khung.",
                "Đơn vị hiển thị ở dòng dưới, không tràn.",
            ],
            common_pre + ["Có trạm trả waterLevel có nhiều chữ số (hoặc mock dữ liệu)."],
        ),
    ]


def main():
    repo_root = Path(__file__).resolve().parents[1]
    template_path = repo_root / "doc" / "Report 5" / "Template Report 5.xlsx"
    out_path = repo_root / "doc" / "Report 5" / "FE-30_Monitor Sensor & Device Status.xlsx"

    wb = openpyxl.load_workbook(template_path)

    # Copy FE-27 as base to preserve full formatting & formulas
    base_sheet = wb["FE-27"]
    sh = wb.copy_worksheet(base_sheet)
    # Excel worksheet title has a hard limit (31 chars). Keep a safe title,
    # and put the full feature name in the header cell B2.
    sh.title = "FE-30_Monitor Sensor & Device"

    # Header updates
    sh["B2"].value = "FE-30_Monitor Sensor & Device Status"

    # Keep formulas but set range to 25 TCs (rows 13..37)
    sh["B4"].value = "=COUNTA(A13:A37)"
    # Round summary ranges (match template pattern)
    sh["B6"].value = "=COUNTIF($F13:$F37,B5)"
    sh["C6"].value = "=COUNTIF($F13:$F37,C5)"
    sh["D6"].value = "=COUNTIF($F13:$F37,D5)"
    sh["E6"].value = "=COUNTIF($F13:$F37,E5)"

    sh["B7"].value = "=COUNTIF($I13:$I37,B5)"
    sh["C7"].value = "=COUNTIF($I13:$I37,C5)"
    sh["D7"].value = "=COUNTIF($I13:$I37,D5)"
    sh["E7"].value = "=COUNTIF($I13:$I37,E5)"

    sh["B8"].value = "=COUNTIF($L13:$L37,B5)"
    sh["C8"].value = "=COUNTIF($L13:$L37,C5)"
    sh["D8"].value = "=COUNTIF($L13:$L37,D5)"
    sh["E8"].value = "=COUNTIF($L13:$L37,E5)"

    # Write test cases starting row 13, columns A-E
    cases = build_testcases()
    start_row = 13
    for i, c in enumerate(cases):
        r = start_row + i
        sh[f"A{r}"].value = c["id"]
        sh[f"B{r}"].value = c["desc"]
        sh[f"C{r}"].value = c["procedure"]
        sh[f"D{r}"].value = c["expected"]
        sh[f"E{r}"].value = c["pre"]

        # Initialize Round columns to Pending by default for Round 1
        sh[f"F{r}"].value = "Pending"
        sh[f"G{r}"].value = None  # Test date
        sh[f"H{r}"].value = None  # Tester
        sh[f"I{r}"].value = None
        sh[f"J{r}"].value = None
        sh[f"K{r}"].value = None
        sh[f"L{r}"].value = None
        sh[f"M{r}"].value = None
        sh[f"N{r}"].value = None

    # Save
    out_path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(out_path)
    print(f"OK: wrote {out_path}")


if __name__ == "__main__":
    main()

