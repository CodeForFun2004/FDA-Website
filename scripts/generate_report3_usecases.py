import copy
import datetime as dt
import zipfile
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from pathlib import Path


NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"


def w_tag(tag: str) -> str:
    return f"{W}{tag}"


def deep_copy(elem: ET.Element) -> ET.Element:
    return copy.deepcopy(elem)


def set_paragraph_text(p: ET.Element, texts: list[str]) -> ET.Element:
    """
    Replace the visible text of a paragraph by distributing into runs.
    Keeps existing run properties as much as possible.
    """
    runs = p.findall("w:r", NS)
    if not runs:
        r = ET.SubElement(p, w_tag("r"))
        ET.SubElement(r, w_tag("t"))
        runs = [r]

    # Ensure each run has a <w:t>
    for r in runs:
        t = r.find("w:t", NS)
        if t is None:
            t = ET.SubElement(r, w_tag("t"))
        t.attrib[f"{W}space"] = "preserve"

    # Clear all text first
    for r in runs:
        t = r.find("w:t", NS)
        if t is not None:
            t.text = ""

    # Fill
    for idx, txt in enumerate(texts):
        if idx < len(runs):
            runs[idx].find("w:t", NS).text = txt
        else:
            new_r = deep_copy(runs[-1])
            # strip existing text
            t = new_r.find("w:t", NS)
            if t is not None:
                t.text = txt
                t.attrib[f"{W}space"] = "preserve"
            p.append(new_r)

    # Remove trailing empty runs (optional, but keeps doc clean)
    for r in list(p.findall("w:r", NS))[::-1]:
        t = r.find("w:t", NS)
        if t is not None and (t.text is None or t.text == ""):
            # keep at least 1 run
            if len(p.findall("w:r", NS)) <= 1:
                break
            p.remove(r)

    return p


def paragraph_text(p: ET.Element) -> str:
    parts: list[str] = []
    for t in p.findall(".//w:t", NS):
        if t.text:
            parts.append(t.text)
    return "".join(parts)


def find_first_paragraph_by_contains(body: ET.Element, needle: str) -> ET.Element:
    for p in body.findall("w:p", NS):
        if needle in paragraph_text(p):
            return p
    raise RuntimeError(f"Could not find paragraph containing: {needle!r}")


@dataclass
class UseCase:
    number: str
    title: str
    blocks: list[tuple[str, str | None]]


def build_usecases() -> list[UseCase]:
    now = dt.date.today().isoformat()

    return [
        UseCase(
            number="3.43",
            title="Create Subscription Plans",
            blocks=[
                ("Function trigger:", None),
                (
                    "Navigation path:",
                    "Admin Portal > Thanh Toán & Gói > Gói Đăng Ký (`/admin/plan-subscriptions`) > Button `Tạo Gói`",
                ),
                ("Timing Frequency:", "On demand (Admin-triggered)."),
                (
                    "Function description:",
                    "Actors/Roles: ADMIN, SUPERADMIN. Purpose: Create a new pricing plan to configure subscription tiers, pricing, and included features. The UI uses Vietnamese page title `Gói Đăng Ký` and create dialog `Tạo gói mới`.",
                ),
                ("Interface:", None),
                (
                    "List View:",
                    "Page header: `Gói Đăng Ký` — `Cấu hình gói, mức giá và tính năng đi kèm.`",
                ),
                (
                    "Actions:",
                    "- Click `Tạo Gói` to open the create dialog.\n- Optional: toggle `Ẩn Inactive` / `Hiện Inactive` and search plans (affects list only).",
                ),
                ("Data processing:", None),
                (
                    "",
                    "1) User clicks `Tạo Gói` → system opens `CreatePlanDialog`.\n2) User fills form and clicks `Tạo Gói`.\n3) FE validates inputs (e.g. code format, required fields).\n4) FE builds `CreatePlanPayload` and calls `planSubscriptionApi.createPlan(payload, token)`.\n5) On success: invalidate query `['plans']`, show toast `Tạo gói thành công!`, close dialog and refresh list.",
                ),
                (
                    "Create/Update:",
                    "Create via `CreatePlanDialog`.\nFields (UI labels): `Code`, `Plan Name`, `Description`, `Price / Month (VND)`, `Price / Year (VND)`, `Tier`, `Sort Order`, `Features`.\nFeature editor buttons: `Thêm Feature` and per-row delete.\nFooter buttons: `Hủy`, `Tạo Gói` (loading text: `Creating...`).",
                ),
                ("Delete:", "N/A."),
                ("Screen layout:", "Figure: Subscription Plans (`Gói Đăng Ký`) — Create dialog `Tạo gói mới`."),
                ("Function details:", None),
                (
                    "Data:",
                    "Types/payloads: `CreatePlanPayload`, `FeatureInput`, `PricingPlan`.\nEndpoint: `POST {API_BASE_URL}/admin/plans`.\nAuth: `Authorization: Bearer {accessToken}` from `getAccessToken()`.",
                ),
                (
                    "Validation:",
                    "- `code` is required and must match `^[A-Z0-9_]+$`.\n- `name` is required.\n- `priceMonth`, `priceYear` must be ≥ 0.\n- `featureKey` is required for each feature row.\n(Validation messages are currently English in UI for several fields: e.g. `Code is required`, `Name is required`.)",
                ),
                (
                    "Business Rules:",
                    "- Codes are stored as uppercase.\n- Empty features are filtered out before submit.\n- On success, the plans list is refreshed by invalidating `['plans']`.",
                ),
                (
                    "Normal Case:",
                    "Admin opens `Gói Đăng Ký`, clicks `Tạo Gói`, enters plan data and features, then submits. System creates the plan and shows `Tạo gói thành công!`.",
                ),
                (
                    "Abnormal Case:",
                    "1) Missing/invalid form data: system blocks submit and shows field errors.\n2) Authentication missing/expired: FE throws `Cần đăng nhập. Vui lòng đăng nhập lại.`.\n3) API error: show toast `Tạo gói thất bại` with server message.",
                ),
            ],
        ),
        UseCase(
            number="3.44",
            title="View Subscription Plans",
            blocks=[
                ("Function trigger:", None),
                (
                    "Navigation path:",
                    "Admin Portal > Thanh Toán & Gói > Gói Đăng Ký (`/admin/plan-subscriptions`)",
                ),
                ("Timing Frequency:", "On demand (page view)."),
                (
                    "Function description:",
                    "Actors/Roles: ADMIN, SUPERADMIN. Purpose: View and manage the list of subscription pricing plans, including status (Active/Inactive), tier labels, features count, and pricing.",
                ),
                ("Interface:", None),
                (
                    "Overview cards:",
                    "`Total Plans`, `Active Plans`, `Inactive Plans`, `Total Features` (English labels).",
                ),
                (
                    "Table controls:",
                    "- Search input for column `Plan Name` (placeholder: `Tìm kiếm code, plan name ...`).\n- Toggle button: `Ẩn Inactive` / `Hiện Inactive`.\n- Create button: `Tạo Gói`.",
                ),
                (
                    "Table columns:",
                    "#, `Code`, `Plan Name`, `Price / Month`, `Price / Year`, `Tier` (labels: `Miễn phí`, `Cơ bản`, `Cao cấp`, `Giám sát`), `Status` (Active/Inactive), `Features`, `Order`, `Actions`.",
                ),
                ("Data processing:", None),
                (
                    "",
                    "1) On page load, FE attempts `planSubscriptionApi.getPlans(token)`.\n2) If response shape mismatches or call fails, FE falls back to `MOCK_PLANS`.\n3) FE sorts plans by `sortOrder` and renders overview + table.",
                ),
                ("Create/Update:", "N/A (this use case is view-only; create/update are covered in 3.43/3.45)."),
                ("Delete:", "N/A (deactivation covered in 3.46)."),
                ("Screen layout:", "Figure: Subscription Plans listing (`Gói Đăng Ký`) with overview cards and data table."),
                ("Function details:", None),
                (
                    "Data:",
                    "Type: `PricingPlan` with fields `id`, `code`, `name`, `description`, `priceMonth`, `priceYear`, `tier`, `isActive`, `sortOrder`, `features`.\nEndpoint: `GET {API_BASE_URL}/admin/plans`.",
                ),
                (
                    "Validation:",
                    "- Token required for real API call; otherwise page may show mocked data.\n- Search and show/hide inactive are client-side filters.",
                ),
                (
                    "Business Rules:",
                    "- `priceMonth == 0` displays as `Miễn phí`.\n- `showInactive=false` filters plans where `isActive=true`.",
                ),
                (
                    "Normal Case:",
                    "Admin opens the page and sees plans list, can search by code/name, and can hide inactive plans via `Ẩn Inactive`.",
                ),
                (
                    "Abnormal Case:",
                    "1) API call fails: FE shows fallback mock data.\n2) Authentication missing: FE logs error and falls back (depending on token availability).",
                ),
            ],
        ),
        UseCase(
            number="3.45",
            title="Update Subscription Plans",
            blocks=[
                ("Function trigger:", None),
                (
                    "Navigation path:",
                    "Admin Portal > Thanh Toán & Gói > Gói Đăng Ký (`/admin/plan-subscriptions`) > Row `Thao tác` > `Sửa gói`",
                ),
                ("Timing Frequency:", "On demand."),
                (
                    "Function description:",
                    "Actors/Roles: ADMIN, SUPERADMIN. Purpose: Edit an existing subscription plan's name, pricing, tier, activation status, sort order, and features. Plan code is read-only in UI (`Mã gói`).",
                ),
                ("Interface:", None),
                (
                    "Actions:",
                    "- Open row menu `Thao tác` → click `Sửa gói`.\n- Edit fields and click `Save Changes`.\n- Toggle activation status via switch showing `Active` / `Inactive`.",
                ),
                (
                    "Edit dialog:",
                    "Dialog title: `Sửa gói`.\nDescription shows plan code badge and note `(mã gói chỉ đọc)`.\nFooter buttons: `Cancel`, `Save Changes` (loading: `Saving...`).",
                ),
                ("Data processing:", None),
                (
                    "",
                    "1) FE opens `EditPlanDialog` with selected `PricingPlan`.\n2) FE pre-fills form state from `plan`.\n3) On submit, FE validates and builds `UpdatePlanPayload`.\n4) FE calls `planSubscriptionApi.updatePlan(plan.id, payload, token)`.\n5) On success: invalidate `['plans']`, toast `Cập nhật gói thành công!`, close dialog.",
                ),
                (
                    "Create/Update:",
                    "Update via `EditPlanDialog`.\nPayload type: `UpdatePlanPayload`.\nKey fields: `code` (read-only), `name`, `description`, `priceMonth`, `priceYear`, `tier`, `isActive`, `sortOrder`, `features`.",
                ),
                ("Delete:", "N/A (handled by 3.46)."),
                ("Screen layout:", "Figure: Edit plan dialog `Sửa gói`."),
                ("Function details:", None),
                (
                    "Data:",
                    "Endpoint: `PUT {API_BASE_URL}/admin/plans/{id}`.\nAuth: Bearer token from `getAccessToken()`.",
                ),
                (
                    "Validation:",
                    "- `name` required.\n- `priceMonth`, `priceYear` ≥ 0.\n- Each feature row must have `featureKey`.\n(Validation messages are English in UI.)",
                ),
                (
                    "Business Rules:",
                    "- Plan `code` cannot be edited.\n- Empty feature rows are filtered out before submit.\n- Changes reflect after invalidating `['plans']`.",
                ),
                (
                    "Normal Case:",
                    "Admin edits a plan and saves. System updates and shows toast `Cập nhật gói thành công!`.",
                ),
                (
                    "Abnormal Case:",
                    "1) Validation fails: show errors, block submit.\n2) API error: show toast `Cập nhật gói thất bại`.\n3) Authentication missing: error `Cần đăng nhập. Vui lòng đăng nhập lại.`.",
                ),
            ],
        ),
        UseCase(
            number="3.46",
            title="Delete Subscription Plan",
            blocks=[
                ("Function trigger:", None),
                (
                    "Navigation path:",
                    "Admin Portal > Thanh Toán & Gói > Gói Đăng Ký (`/admin/plan-subscriptions`) > Row `Thao tác` > `Ngừng kích hoạt`",
                ),
                ("Timing Frequency:", "On demand."),
                (
                    "Function description:",
                    "Actors/Roles: ADMIN, SUPERADMIN. Purpose: Remove a plan from being available to users by deactivating it (soft delete). The UI wording is `Ngừng kích hoạt`, not a permanent delete.",
                ),
                ("Interface:", None),
                (
                    "Actions:",
                    "- Open row menu `Thao tác`.\n- Click `Ngừng kích hoạt` (disabled when already inactive, label becomes `Đã ngừng kích hoạt`).\n- Confirm in dialog `Ngừng kích hoạt gói`.",
                ),
                (
                    "Confirmation dialog:",
                    "Title: `Ngừng kích hoạt gói`.\nDescription: `Bạn có chắc muốn ngừng kích hoạt {plan.name}?`.\nWarning note: `Việc này sẽ ẩn gói khỏi người dùng. Người đang đăng ký sẽ không bị ảnh hưởng.`\nButtons: `Hủy`, `Ngừng kích hoạt` (loading: `Đang ngừng kích hoạt...`).",
                ),
                ("Data processing:", None),
                (
                    "",
                    "1) Admin clicks `Ngừng kích hoạt`.\n2) FE calls `planSubscriptionApi.deactivatePlan(plan.id, token)`.\n3) On success: invalidate `['plans']`, toast success, and close dialog.",
                ),
                (
                    "Create/Update:",
                    "N/A (deactivation is treated as delete behavior in UI).",
                ),
                (
                    "Delete:",
                    "Soft delete (deactivate) via `DELETE {API_BASE_URL}/admin/plans/{id}`.",
                ),
                ("Screen layout:", "Figure: Deactivate confirmation dialog `Ngừng kích hoạt gói`."),
                ("Function details:", None),
                (
                    "Data:",
                    "Endpoint: `DELETE {API_BASE_URL}/admin/plans/{id}`.\nAuth: Bearer token from `getAccessToken()`.",
                ),
                (
                    "Validation:",
                    "- Deactivate action is disabled when `data.isActive` is false.\n- Token required.",
                ),
                (
                    "Business Rules:",
                    "- Deactivation hides the plan from end users but does not impact existing subscriptions (per UI warning).",
                ),
                (
                    "Normal Case:",
                    "Admin deactivates an active plan; the plan becomes inactive and disappears when `Ẩn Inactive` is enabled.",
                ),
                (
                    "Abnormal Case:",
                    "1) API failure: show toast `Ngừng kích hoạt gói thất bại`.\n2) Authentication missing: error `Cần đăng nhập. Vui lòng đăng nhập lại.`.",
                ),
            ],
        ),
        UseCase(
            number="3.47",
            title="Handle Subscription Disputes",
            blocks=[
                ("Function trigger:", None),
                (
                    "Navigation path:",
                    "Admin Portal > Thanh Toán & Gói > Khiếu Nại Gói (`/admin/subscription-disputes`)",
                ),
                ("Timing Frequency:", "On demand."),
                (
                    "Function description:",
                    "Actors/Roles: ADMIN, SUPERADMIN. Purpose: Review and resolve subscription complaints (khiếu nại). Page title `Khiếu Nại Gói` with description `Xem xét và xử lý khiếu nại liên quan đến gói đăng ký.`",
                ),
                ("Interface:", None),
                (
                    "Table controls:",
                    "- Search by `Subject` (placeholder: `Tìm kiếm subject...`).\n- Filter by `Status` (Open/Resolved/Rejected).",
                ),
                (
                    "Actions:",
                    "- Click complaint `Subject` to view details.\n- If status is `open`, click `Resolve` to open resolve dialog.\n- If not open, the action shows `Resolved` text.",
                ),
                (
                    "Resolve dialog:",
                    "Dialog title: `Resolve Subscription Complaint`.\nFields: `Admin Response` (textarea, required), `New Status` (radio: `Resolve` or `Reject`).\nButtons: `Cancel`, `Submit` (loading: `Submitting...`).",
                ),
                ("Data processing:", None),
                (
                    "",
                    "1) FE loads complaints via `subscriptionDisputeApi.getAdminComplaints({page, pageSize, status}, token)`.\n2) Admin opens `ResolveDisputeDialog` for a complaint.\n3) Admin submits `ResolveComplaintPayload { adminResponse, newStatus }`.\n4) FE calls `subscriptionDisputeApi.resolveComplaint(complaint.id, payload, token)`.\n5) On success: invalidate query `['subscription-disputes']`, toast success, close dialog.",
                ),
                ("Create/Update:", "Update dispute status/response via resolve action."),
                ("Delete:", "N/A."),
                ("Screen layout:", "Figure: Subscription disputes list (`Khiếu Nại Gói`) and resolve dialog."),
                ("Function details:", None),
                (
                    "Data:",
                    "Types: `AdminComplaint`, `ResolveComplaintPayload`, `ResolveNewStatus`.\nEndpoints (by type docs):\n- `GET /api/v1/admin/complaints` (list)\n- `PUT /api/v1/admin/complaints/{id}/resolve` (resolve)",
                ),
                (
                    "Validation:",
                    "- `Admin Response` must be non-empty (submit disabled until trimmed content exists).\n- Token required.",
                ),
                (
                    "Business Rules:",
                    "- Only `open` complaints can be resolved from the UI.\n- New status can be `resolved` or `rejected`.",
                ),
                (
                    "Normal Case:",
                    "Admin filters `Open` complaints, clicks `Resolve`, writes `Admin Response`, selects status and submits. Complaint becomes `Resolved` or `Rejected`.",
                ),
                (
                    "Abnormal Case:",
                    "1) API error: toast `Failed to resolve complaint` and dialog shows error message.\n2) Authentication missing: error `Authentication required. Please log in again.`",
                ),
            ],
        ),
        UseCase(
            number="3.48",
            title="View Billing & Payment Records",
            blocks=[
                ("Function trigger:", None),
                (
                    "Navigation path:",
                    "Admin Portal > Thanh Toán & Gói > Giao Dịch Thanh Toán (`/admin/billing-payment`)",
                ),
                ("Timing Frequency:", "On demand."),
                (
                    "Function description:",
                    "Actors/Roles: ADMIN, SUPERADMIN. Purpose: View billing/payment history and open a read-only record details dialog. Page title `Giao Dịch Thanh Toán`.",
                ),
                ("Interface:", None),
                (
                    "Overview cards:",
                    "`Total Transactions`, `Total Revenue`, `Pending`, `Cancelled` (English labels).",
                ),
                (
                    "Table controls:",
                    "- Search input for `Order Code` filter (placeholder: `Tìm kiếm order code, user, plan...`).\n- Select filter `Status` with options: Paid / Pending / Cancelled.",
                ),
                (
                    "Table columns:",
                    "#, `Order Code`, `User`, `Plan`, `Amount`, `Duration`, `Status`, `Payment Date`.",
                ),
                (
                    "Details dialog:",
                    "Click an `Order Code` value to open `Payment Details` dialog (read-only). Footer button: `Close`.",
                ),
                ("Data processing:", None),
                (
                    "",
                    "1) FE fetches via `billingPaymentApi.getAdminPayments({page, pageSize, status}, token)`.\n2) FE applies client-side filtering for search query across orderCode/user/plan.\n3) Clicking a row order code opens `PaymentDetailsDialog` populated with `AdminPaymentRecord`.",
                ),
                ("Create/Update:", "N/A (read-only)."),
                ("Delete:", "N/A (read-only)."),
                ("Screen layout:", "Figure: Payments overview + table, and `Payment Details` dialog."),
                ("Function details:", None),
                (
                    "Data:",
                    "Type: `AdminPaymentRecord` (fields include `orderCode`, `planName`, `planCode`, `amount`, `currency`, `paymentMethod`, `status`, `durationMonths`, `userFullName`, `userEmail`, timestamps).\nEndpoint: `GET /api/v1/admin/payments` (via FE client).",
                ),
                (
                    "Validation:",
                    "- Token required.\n- Filters are applied by query parameters (status) and client-side search (orderCode/user/plan).",
                ),
                (
                    "Business Rules:",
                    "- Clicking `Order Code` is the primary way to open details.\n- Records are read-only in the details dialog.",
                ),
                (
                    "Normal Case:",
                    "Admin opens the page, filters by `Status`, searches by order code, then opens `Payment Details` to review a transaction.",
                ),
                (
                    "Abnormal Case:",
                    "1) API error: UI shows `Retry` action.\n2) No results: shows `No payment records found.` or `No payments match the selected filter.`",
                ),
            ],
        ),
        UseCase(
            number="3.51",
            title="Create Newsfeed",
            blocks=[
                ("Function trigger:", None),
                (
                    "Navigation path:",
                    "Admin Portal: `/admin/news` (page title `Tin Tức`) OR Moderator Portal: `/moderator/news` (page title `Tin Tức`) > Button `Tạo Bản Tin`",
                ),
                ("Timing Frequency:", "On demand."),
                (
                    "Function description:",
                    "Actors/Roles: ADMIN, SUPERADMIN, MODERATOR. Purpose: Create a new news item/announcement to send to users. UI uses Vietnamese wording (`Tin Tức`, `Tạo Bản Tin`), while types/API use `Announcement` and payload `CreateAnnouncementPayload`.",
                ),
                ("Interface:", None),
                (
                    "Actions:",
                    "- Click `Tạo Bản Tin` to open create dialog.\n- Fill required fields and click `Tạo thông báo`.",
                ),
                (
                    "Create dialog:",
                    "Dialog title: `Tạo thông báo`.\nDialog description: `Tạo thông báo mới để gửi đến người dùng.`\nFooter buttons: `Hủy`, `Tạo thông báo` (loading: `Đang tạo...`).",
                ),
                (
                    "Form fields (UI labels):",
                    "`Tiêu đề *`, `Nội dung *` (supports HTML), `Tóm tắt` (optional), `Hình ảnh đại diện` (mode: `Nhập URL` or `Upload file`), `Đối tượng nhận *` (Tất cả người dùng / Theo khu vực / Theo vai trò), optional `Mã khu vực` / `Tên vai trò`, `Độ ưu tiên *` (Thấp/Bình thường/Cao/Khẩn cấp), `Đặt lịch đăng` (datetime-local).",
                ),
                ("Data processing:", None),
                (
                    "",
                    "1) FE validates input (e.g. title/content required, length constraints).\n2) If image mode is upload, FE uploads to `NEXT_PUBLIC_UPLOAD_IMAGE_ENDPOINT` and fills `imageUrl`.\n3) FE builds `CreateAnnouncementPayload` and calls `newsApi.createAnnouncement(payload)`.\n4) On success: toast `Tạo thông báo thành công!`, close dialog and refresh listing.",
                ),
                ("Create/Update:", "Create via `newsApi.createAnnouncement`."),
                ("Delete:", "N/A."),
                ("Screen layout:", "Figure: News listing (`Tin Tức`) with create button `Tạo Bản Tin` and create dialog `Tạo thông báo`."),
                ("Function details:", None),
                (
                    "Data:",
                    "Types/payloads: `Announcement`, `CreateAnnouncementPayload`.\nEndpoint: `POST /admin/announcements`.",
                ),
                (
                    "Validation:",
                    "- `title` required (max 200).\n- `content` required (max 10,000).\n- If scheduled, date-time must be greater than current time.\n- If image upload selected, must upload successfully to obtain `imageUrl`.\n(Validation messages are Vietnamese in this dialog, e.g. `Tiêu đề là bắt buộc`.)",
                ),
                (
                    "Business Rules:",
                    "- Target is `all` by default.\n- `scheduledAt` is converted to ISO string on submit when scheduling enabled.",
                ),
                (
                    "Normal Case:",
                    "Moderator/Admin creates a news item with title, content, priority, target, optionally schedules it. System creates and shows `Tạo thông báo thành công!`.",
                ),
                (
                    "Abnormal Case:",
                    "1) Upload endpoint missing: error `Thiếu cấu hình NEXT_PUBLIC_UPLOAD_IMAGE_ENDPOINT`.\n2) Upload fails: toast `Không thể upload ảnh`.\n3) API fails: toast `Không thể tạo thông báo`.",
                ),
            ],
        ),
        UseCase(
            number="3.52",
            title="Update Newsfeed",
            blocks=[
                ("Function trigger:", None),
                (
                    "Navigation path:",
                    "`Tin Tức` (`/admin/news` or `/moderator/news`) > Row `Thao tác` > `Sửa`",
                ),
                ("Timing Frequency:", "On demand."),
                (
                    "Function description:",
                    "Actors/Roles: ADMIN, SUPERADMIN, MODERATOR. Purpose: Update an existing announcement. UI restricts editing to announcements with status `draft` or `pending`.",
                ),
                ("Interface:", None),
                (
                    "Actions:",
                    "- Open row menu `Thao tác`.\n- Click `Sửa` (only visible when status is `draft` or `pending`).\n- Update fields and click `Lưu thay đổi`.",
                ),
                (
                    "Edit dialog:",
                    "Dialog title: `Chỉnh sửa thông báo`.\nDialog description: `Cập nhật nội dung thông báo. Chỉ có thể sửa khi trạng thái là Bản nháp hoặc Chờ đăng.`\nFooter buttons: `Hủy`, `Lưu thay đổi` (loading: `Đang lưu...`).",
                ),
                ("Data processing:", None),
                (
                    "",
                    "1) FE pre-fills `UpdateAnnouncementPayload` from selected `Announcement`.\n2) FE validates required fields.\n3) FE calls `newsApi.updateAnnouncement(announcementData.id, payload)`.\n4) On success: toast `Cập nhật thông báo thành công!` and refresh listing.",
                ),
                ("Create/Update:", "Update via `UpdateAnnouncementPayload` → `PUT /admin/announcements/{id}`."),
                ("Delete:", "N/A."),
                ("Screen layout:", "Figure: Edit dialog `Chỉnh sửa thông báo`."),
                ("Function details:", None),
                (
                    "Data:",
                    "Types/payloads: `Announcement`, `UpdateAnnouncementPayload`.\nEndpoint: `PUT /admin/announcements/{id}`.",
                ),
                (
                    "Validation:",
                    "- `title` required (max 200).\n- `content` required (max 10,000).\n- If scheduled, date-time must be greater than current time.",
                ),
                (
                    "Business Rules:",
                    "- Can edit only when status is `draft` or `pending`.\n- Scheduling converts local datetime to ISO string.",
                ),
                (
                    "Normal Case:",
                    "User edits a draft announcement, saves changes, and sees `Cập nhật thông báo thành công!`.",
                ),
                (
                    "Abnormal Case:",
                    "1) Status not editable: `Sửa` action is not available.\n2) API failure: toast `Không thể cập nhật thông báo`.",
                ),
            ],
        ),
        UseCase(
            number="3.53",
            title="Delete Newsfeed",
            blocks=[
                ("Function trigger:", None),
                (
                    "Navigation path:",
                    "`Tin Tức` (`/admin/news` or `/moderator/news`) > Row `Thao tác` > `Xóa`",
                ),
                ("Timing Frequency:", "On demand."),
                (
                    "Function description:",
                    "Actors/Roles: ADMIN, SUPERADMIN, MODERATOR. Purpose: Delete an announcement. UI shows a confirmation modal `Xóa thông báo` and describes soft vs hard delete depending on status.",
                ),
                ("Interface:", None),
                (
                    "Actions:",
                    "- Open row menu `Thao tác` → click `Xóa`.\n- Confirm modal shows dynamic description:\n  - If status is `published` or `cancelled`: soft delete (`xóa mềm`): \"sẽ bị ẩn khỏi danh sách\".\n  - Otherwise: hard delete (`xóa cứng`): \"sẽ bị xóa vĩnh viễn\".",
                ),
                (
                    "Confirmation modal:",
                    "Title: `Xóa thông báo`.\nButtons: `Hủy`, `Xóa` (loading: `Đang xóa...`).",
                ),
                ("Data processing:", None),
                (
                    "",
                    "1) FE calls `newsApi.deleteAnnouncement(announcement.id)`.\n2) On success: toast `Đã xóa thông báo` and refresh listing.\n3) On failure: toast `Xóa thông báo thất bại`.",
                ),
                ("Create/Update:", "N/A."),
                ("Delete:", "Delete via `DELETE /admin/announcements/{id}`."),
                ("Screen layout:", "Figure: Delete confirmation modal `Xóa thông báo`."),
                ("Function details:", None),
                (
                    "Data:",
                    "Endpoint: `DELETE /admin/announcements/{id}`.\nType: `DeleteAnnouncementResponse`.",
                ),
                (
                    "Validation:",
                    "- Confirmation required.\n- Token/auth handled by `apiFetch`.",
                ),
                (
                    "Business Rules:",
                    "- Behavior described as soft/hard delete depends on announcement `status` in UI messaging.\n- After delete, listing refreshes.",
                ),
                (
                    "Normal Case:",
                    "User deletes an announcement, confirms in modal, system deletes and shows `Đã xóa thông báo`.",
                ),
                (
                    "Abnormal Case:",
                    "1) API failure: toast `Xóa thông báo thất bại`.\n2) Network error: listing remains unchanged until refreshed.",
                ),
            ],
        ),
    ]


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    template_path = repo_root / "doc" / "Report 3" / "Template Report 3.docx"
    out_path = repo_root / "doc" / "Report 3" / "Report3_UseCaseDescriptions_3.43-3.53.docx"

    if not template_path.exists():
        raise FileNotFoundError(str(template_path))

    with zipfile.ZipFile(template_path, "r") as zin:
        doc_xml = zin.read("word/document.xml").decode("utf-8")
        root = ET.fromstring(doc_xml)

        body = root.find("w:body", NS)
        if body is None:
            raise RuntimeError("Invalid template: missing w:body")

        # Capture sectPr (page settings) so we preserve layout
        sectpr = body.find("w:sectPr", NS)
        sectpr_copy = deep_copy(sectpr) if sectpr is not None else None

        # Locate sample paragraphs for style cloning
        p_title = find_first_paragraph_by_contains(body, "3.22")
        p_label_only = find_first_paragraph_by_contains(body, "Function trigger:")
        p_kv = find_first_paragraph_by_contains(body, "Navigation path:")

        # Clear body paragraphs (keep only sectPr at end)
        for child in list(body):
            body.remove(child)
        if sectpr_copy is not None:
            body.append(sectpr_copy)

        usecases = build_usecases()

        # Helper: append paragraph clones
        def append_title(num: str, title: str):
            p = deep_copy(p_title)
            # Ensure it has at least 2 runs (number + title)
            runs = p.findall("w:r", NS)
            if len(runs) < 2:
                p.clear()
            set_paragraph_text(p, [f"{num} ", title])
            body.insert(len(body) - (1 if sectpr_copy is not None else 0), p)

        def append_label_only(text: str):
            p = deep_copy(p_label_only)
            set_paragraph_text(p, [text])
            body.insert(len(body) - (1 if sectpr_copy is not None else 0), p)

        def append_kv(label: str, value: str):
            p = deep_copy(p_kv)
            set_paragraph_text(p, [label, f" {value}"])
            body.insert(len(body) - (1 if sectpr_copy is not None else 0), p)

        def append_multiline_as_kv(label: str, value: str):
            lines = [ln for ln in value.splitlines()]
            if not lines:
                append_kv(label, "")
                return
            append_kv(label, lines[0])
            for ln in lines[1:]:
                # continuation lines: keep same indent/list style but no label
                append_kv("", ln)

        def append_block(label: str, value: str | None):
            if value is None:
                append_label_only(label)
                return
            if "\n" in value:
                append_multiline_as_kv(label, value)
            else:
                append_kv(label, value)

        # Build new content
        for idx, uc in enumerate(usecases):
            append_title(uc.number, uc.title)
            for label, value in uc.blocks:
                if label == "" and value is not None:
                    # continuation paragraph without visible label
                    append_kv("", value)
                else:
                    append_block(label, value)

            # Add a blank paragraph between use cases (clone label-only and empty it)
            if idx != len(usecases) - 1:
                blank = deep_copy(p_label_only)
                set_paragraph_text(blank, [""])
                body.insert(len(body) - (1 if sectpr_copy is not None else 0), blank)

        new_doc_xml = ET.tostring(root, encoding="utf-8", xml_declaration=True)

        # Write new docx by copying everything and replacing document.xml
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(out_path, "w", compression=zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                if item.filename == "word/document.xml":
                    zout.writestr(item, new_doc_xml)
                else:
                    zout.writestr(item, zin.read(item.filename))

    print(f"OK: wrote {out_path}")


if __name__ == "__main__":
    main()

