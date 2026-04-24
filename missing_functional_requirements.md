# Missing Functional Requirements Supplement

## Purpose
This document supplements **missing Functional Requirement sections** in **Section 3.x** of the current SRS, based on **Table 2.2.2 (Use Case Descriptions)** and the **implemented frontend source code**. It does **not** replace the full SRS document and does **not** regenerate the Word file.

## Covered Use Cases
- FE-05 Reset Password
- FE-07 Create User
- FE-08 View User
- FE-09 Update User
- FE-10 Delete User
- FE-11 Ban User
- FE-20 Evaluate Administrative Area-based Flood Updates
- FE-32 Hide Invalid Flood Report
- FE-38 Preview Alert Message Templates

---

## 3.3.x Reset Password (FE-05)

Function trigger:
- On the Login screen, the user selects **“Forgot password”** / **“Quên mật khẩu?”**.
- The user submits their email or phone number, receives an OTP, verifies it, and is prompted to set a new password.

Function description:
The system allows a user who has forgotten their password to recover access by verifying ownership of an identifier (email/phone) via OTP and then setting a new password. The password is updated securely (stored as a password hash in the backend).

Actors/Roles: Citizen, Moderator, Admin

Purpose:
- Restore account access without requiring administrator intervention.
- Ensure password reset is protected by OTP-based verification.

Interface:
- Entry screen: `GET /auth/login` (Login flow).
  - Identifier field: **Email / Phone number**
  - Action: **Forgot password**
- OTP verification step:
  - OTP input (6 digits)
  - Actions: **Verify OTP**, **Resend OTP** (after expiry)
- Reset password modal (shown after OTP verification on a protected portal screen):
  - New password
  - Confirm new password
  - Password policy checklist (minimum length and complexity indicators)
  - Action: **Set password** / **Đặt mật khẩu**

Data processing:
- The user submits an identifier (email/phone).
- The system triggers OTP delivery:
  - Endpoint: `POST /auth/send-otp` with `{ identifier }` (unauthenticated).
- The user enters OTP and submits:
  - Endpoint: `POST /auth/login` with `{ identifier, otpCode }` (unauthenticated).
- If OTP verification succeeds and the flow is “forgot password”, the frontend marks the session as requiring a password reset and opens the reset-password modal after redirect to a protected portal.
  - Implementation note: the modal guard is currently wired in the Admin portal providers; equivalent guards for Citizen/Moderator portals should follow the same pattern (Screen layout: TBD if not present).
- The user submits a new password and confirmation:
  - Endpoint: `POST /auth/reset-password` with `{ newPassword, confirmPassword }` (requires access token from OTP login).
- Backend updates stored password hash and returns success; frontend clears the reset flag and closes the modal.

Screen layout:
- Screen layout: TBD (use existing SRS figure references if available; this supplement does not embed images).

Function details:
- The reset flow is OTP-gated and requires the user to hold a valid access token obtained via OTP login before calling the reset endpoint.
- The UI may display OTP expiry countdown and disallow resend until the OTP expires (configurable policy note).

Data:
- Identifier (email or phone number)
- OTP code
- Access token (post OTP login)
- New password and confirmation

Validation:
- Identifier:
  - Must be non-empty after trimming.
- OTP:
  - Must be exactly 6 digits.
- New password:
  - Must meet password policy (frontend enforces):
    - Minimum length: 8 characters
    - Contains uppercase letter
    - Contains lowercase letter
    - Contains number
    - Contains special character
- Confirm password:
  - Must match new password.

Business rules:
- Only the account owner who can verify OTP for the identifier may reset the password.
- The reset operation updates the password hash (plain text passwords are never stored).
- If the account is inactive/banned (per system policy), the system may block reset or require additional verification (policy-dependent).
- OTP resend rate limits should be enforced by backend policy (recommended).

Error Handling:
- Unknown identifier or account not found:
  - Display: “Account does not exist” (or equivalent backend message).
- OTP invalid/expired:
  - Display: OTP validation error; do not proceed to reset step.
- Password policy failure:
  - Display password rule failures and prevent submission.
- Confirm mismatch:
  - Display mismatch error and prevent submission.
- Backend reset failure:
  - Display a generic error and log the incident server-side.

Normal case:
1. User selects “Forgot password”.
2. User enters email/phone and requests OTP.
3. System sends OTP successfully.
4. User enters OTP correctly and verifies.
5. System authenticates OTP login and prompts password reset.
6. User enters a valid new password and matching confirmation.
7. System updates password hash and shows success notification; user may continue using the portal.

Abnormal case:
- User enters empty identifier → system blocks submission and shows a field warning.
- User enters invalid OTP (not 6 digits) → system blocks submission.
- OTP expired or incorrect → system rejects verification and prompts retry/resend.
- Password fails complexity rules → system blocks submission and shows unmet rules.
- Confirm password does not match → system blocks submission and shows mismatch.
- API/network error → system shows error and user may retry.

---

## 3.5.1 View User (FE-08)

Function trigger:
- Super Admin opens **User Management Dashboard**.
- Super Admin uses search, filters, pagination, or opens a user row for additional detail.

Function description:
The system allows the Super Admin to view the user list with server-side pagination and filtering by search term, role, and status. The Super Admin can inspect basic user attributes necessary for administration (name, email, roles, status, last login).

Actors/Roles: Super Admin

Purpose:
- Provide global visibility into registered users and their operational status.
- Support administrative tasks such as verification, troubleshooting, and governance.

Interface:
- Route/UI:
  - Users listing page: `GET /admin/users`
  - Table columns: Name, Email, Role(s), Status, Last Login, Actions
- Search & filter:
  - Search box (name/email)
  - Role filter (USER, MODERATOR, ADMIN, SUPERADMIN)
  - Status filter (active, inactive, banned)
- Pagination:
  - Query parameters: `page`, `perPage`

Data processing:
- Frontend loads list using:
  - Endpoint: `GET /admin/users?pageNumber=&pageSize=&searchTerm=&role=&status=`
- The backend returns `{ users, totalCount }`.
- Frontend maps backend representation to display model and renders the data table.
- Filters update query parameters and re-fetch data.

Screen layout:
- Screen layout: The current UI uses a data table listing under “Quản Lý Người Dùng” (`/admin/users`). (No additional figures embedded here.)

Function details:
- View supports:
  - List view with pagination
  - Search by name/email
  - Filter by role and status
  - Optional view of user detail:
    - Endpoint exists: `GET /admin/users/:id`
    - Screen layout: TBD if not implemented as a dedicated detail page/dialog.

Data:
- User: id, email, fullName/name, roles, status, isAdminCreated, createdAt, lastLoginAt
- Query parameters: pageNumber, pageSize, searchTerm, role, status

Validation:
- Page and page size must be positive integers (frontend defaults apply).
- Role and status values must be within supported enumerations.

Business rules:
- Only Super Admin may access global user listing.
- The system should not expose sensitive authentication artifacts (password hashes, tokens) in listing responses.

Error Handling:
- 401 Unauthorized → force re-login.
- 403 Forbidden → show “Insufficient permissions”.
- Fetch failure (network/server) → show error state and allow reload.

Normal case:
1. Super Admin opens `/admin/users`.
2. System fetches paged users from `GET /admin/users`.
3. System shows table and total counts; Super Admin searches and filters.

Abnormal case:
- Invalid filter values → system ignores or resets invalid filters and refreshes list.
- Backend error → system shows an error card/state and provides a retry action.

---

## 3.5.2 Create User (FE-07)

Function trigger:
- Super Admin selects **Create user** on the User Management dashboard.

Function description:
The system allows the Super Admin to create a new user account and assign a fixed role at creation time.

Actors/Roles: Super Admin

Purpose:
- Provision user accounts for system operation, staffing, or controlled onboarding.
- Ensure roles are assigned explicitly as fixed roles.

Interface:
- Route/UI: `/admin/users` → Create dialog.
- Create form fields (current UI):
  - Email (required)
  - Password (required)
  - Full name (required)
  - Phone number (optional)
  - Status (active/inactive/banned)
  - Role (USER/MODERATOR/ADMIN; SUPERADMIN may appear in UI but should be restricted by policy)
- Action: Submit to create user.

Data processing:
- Super Admin opens the create dialog and enters user data.
- Frontend validates fields and sends:
  - Endpoint: `POST /admin/users`
  - Payload: `{ email, password, fullName, phoneNumber?, status, roleNames: [role] }`
- On success, the system refreshes the user listing.

Screen layout:
- Screen layout: TBD (dialog is implemented; formal figure may be added in Word later).

Function details:
- Newly created users become visible in the user list after refresh/invalidation.

Data:
- Email, password, full name, phone number, status, roleNames

Validation:
- Email:
  - Required; must match email format.
- Password:
  - Required; minimum length at least 6 characters (frontend rule).
- Full name:
  - Required; non-empty after trimming.
- Phone number (if provided):
  - Must be 10–11 digits (numeric only).

Business rules:
- Only Super Admin may create accounts and assign fixed roles.
- Roles are fixed and limited to predefined values (USER/Citizen, MODERATOR, ADMIN) as defined by the system role model.
- The system should enforce uniqueness constraints for email/phone at the backend.

Error Handling:
- Duplicate email/identifier → backend returns error; UI displays create failure message.
- Validation failures → UI shows field-level error messages and blocks submission.
- Server/network errors → UI shows error toast and preserves entered data for retry.

Normal case:
1. Super Admin clicks “Create user”.
2. Super Admin enters valid information and selects a role.
3. System creates account and returns success.
4. User list refreshes and includes the new user.

Abnormal case:
- Email invalid or missing → submission blocked with field error.
- Password too short → submission blocked with field error.
- Backend rejects creation (e.g., duplicate email) → show failure and allow correction.

---

## 3.5.3 Update User (FE-09)

Function trigger:
- Super Admin selects **Edit** on a user row from the user listing.

Function description:
The system allows Super Admin to update user information and administrative attributes (status and role), subject to constraints (e.g., only for accounts created by admins if required by policy).

Actors/Roles: Super Admin

Purpose:
- Maintain accurate user records.
- Correct role assignments and operational status.

Interface:
- Route/UI: `/admin/users` → Row action → Edit dialog.
- Editable fields (current UI):
  - Full name (required)
  - Phone number (optional)
  - Status (active/inactive/banned)
  - Role (USER/MODERATOR/ADMIN/SUPERADMIN)
- Read-only fields:
  - Email

Data processing:
- Super Admin opens edit dialog for a selected user.
- Frontend enforces a constraint:
  - If the user is not “admin-created”, the UI blocks edit and shows an error.
- If allowed, frontend sends:
  - Endpoint: `PATCH /admin/users/:id`
  - Payload: `{ fullName, phoneNumber?, status, roleNames: [role] }`
- On success, system refreshes the list view.

Screen layout:
- Screen layout: TBD (dialog is implemented; formal figure may be added in Word later).

Function details:
- Edit is applied to existing records and reflected in the list.
- Role and status changes take effect immediately for subsequent authorization checks.

Data:
- User id, fullName, phoneNumber, status, roleNames

Validation:
- Full name: required; non-empty after trimming.
- Phone number (if provided): 10–11 digits.
- Role: must be selected.

Business rules:
- Access is restricted to Super Admin.
- Accounts flagged as non-admin-created may be non-editable in the current UI (implementation constraint).
- Backend must validate role existence and enforce role/status integrity.

Error Handling:
- Forbidden edit attempt → show “Only admin-created accounts can be edited” (or equivalent).
- Backend validation failure → show error and keep dialog open.
- Network/server errors → show error and allow retry.

Normal case:
1. Super Admin selects “Edit”.
2. System shows edit dialog with current values.
3. Super Admin updates fields and submits.
4. System updates user and shows success message; list refreshes.

Abnormal case:
- User is not editable (not admin-created) → edit action is blocked.
- Phone number invalid → UI blocks submission.
- Backend failure → show error and keep data for retry.

---

## 3.5.4 Delete User (FE-10)

Function trigger:
- Super Admin selects **Delete** for a user from the user listing.

Function description:
The system allows Super Admin to delete a user account. The deletion may be implemented as either hard delete or soft delete depending on system data retention policy.

Actors/Roles: Super Admin

Purpose:
- Remove invalid, duplicate, or decommissioned accounts from active operation.

Interface:
- Route/UI: `/admin/users` → Row action → Delete confirmation (TBD).
- Backend endpoint exists:
  - `DELETE /admin/users/:id`

Data processing:
- Super Admin requests deletion for a user.
- System prompts for confirmation (recommended).
- Frontend calls deletion endpoint and refreshes the list.

Screen layout:
- Screen layout: TBD (no dedicated delete dialog was confirmed in current listing UI).

Function details:
- If soft delete is used, records remain for audit but are excluded from normal listings (policy-dependent).
- If hard delete is used, related references must be handled per referential integrity constraints (backend responsibility).

Data:
- User id, deletion timestamp (if soft delete), deletion actor id (audit log) (recommended)

Validation:
- The user id must exist.
- The system must prevent deletion of protected accounts (e.g., current Super Admin) (recommended).

Business rules:
- Only Super Admin may delete users.
- The system should retain audit trail of deletion actions (recommended).

Error Handling:
- Attempt to delete a protected account → system rejects and shows a business rule error.
- Backend failure → system shows a generic error and keeps user in list.

Normal case:
1. Super Admin selects Delete.
2. System asks for confirmation.
3. System deletes (or soft-deletes) the user and refreshes the list.

Abnormal case:
- User not found → system shows “User not found” and refreshes list.
- Backend rejects operation → system displays an error and does not remove the user from view.

---

## 3.5.5 Ban User (FE-11)

Function trigger:
- Super Admin selects **Ban/Unban** action for a user in the user listing.

Function description:
The system allows Super Admin to ban (lock) a user account to prevent future logins, and unban to restore access.

Actors/Roles: Super Admin

Purpose:
- Enforce policy compliance and block abusive or compromised accounts.
- Provide reversible account lockdown without deleting user data.

Interface:
- Route/UI: `/admin/users` → Row action → Ban dialog confirmation.
- Action label adapts to current state:
  - If currently banned → “Unban”
  - Else → “Ban”

Data processing:
- Super Admin opens ban dialog.
- System confirms the action.
- Frontend updates status using existing update endpoint:
  - Endpoint: `PATCH /admin/users/:id`
  - Payload: `{ status: 'banned' }` to ban, `{ status: 'active' }` to unban.
- List is refreshed after success.

Screen layout:
- Screen layout: TBD (dialog exists in UI; formal figure may be added later).

Function details:
- Banned users are prevented from logging in (enforced by backend authorization and login policy).

Data:
- User id
- Status value (`active` / `banned`)
- Audit log record (recommended): actor id, timestamp, reason (optional policy)

Validation:
- The target user must exist.
- Status transitions must be valid (`active` ↔ `banned`).

Business rules:
- Only Super Admin may ban/unban users.
- The system should prevent self-lockout of the acting Super Admin (recommended).

Error Handling:
- Backend rejects status change → show error and keep original status.
- Network/server errors → show error toast and allow retry.

Normal case:
1. Super Admin selects Ban.
2. Confirms ban.
3. System updates status to banned and refreshes list.

Abnormal case:
- Attempt to ban protected account → reject and show message.
- Backend failure → show error and do not change UI state.

---

## 3.11.x Evaluate Administrative Area-based Flood Updates (FE-20)

Function trigger:
- Admin/Moderator opens the administrative-area evaluation view from the monitoring/coordination portal.
- Admin/Moderator selects an administrative area (e.g., ward/district) and requests the current aggregated flood status.

Function description:
The system enables Admin and Moderator to evaluate flood conditions by administrative area, using water-level measurements from monitoring stations located within each respective area. The system aggregates station readings to compute and present an area-level flood status used for operational decision-making.

Actors/Roles: Admin, Moderator

Purpose:
- Provide an area-level operational view (ward/district) for coordination and warning decisions.
- Reduce cognitive load by summarizing station-level signals into administrative-area risk states.

Interface:
- Area selection:
  - Administrative area list and filters (e.g., ward/district) sourced from existing administrative area data services.
- Area overview panel:
  - Aggregated status for selected area (e.g., Safe/Caution/Warning/Critical/Unknown)
  - Station count in area, number of active stations, and latest update time
  - Links to underlying station readings (drill-down)
- Optional map overlay:
  - Highlight the selected area boundary and render contributing station markers.

Data processing:
- Fetch administrative areas:
  - Endpoint available in codebase: `GET /admin/administrative-areas` (requires auth), with pagination and optional `level` filter.
- Fetch station readings and station-to-area association:
  - Station objects may include `administrativeAreaId` (data model alignment).
- For a selected area:
  - Identify all stations mapped to the area.
  - Retrieve latest water levels and station severity indicators.
  - Compute aggregated area status using defined aggregation rules (see Business rules).
- Display area-level status and supporting evidence (stations and their readings).

Screen layout:
- Screen layout: TBD (a dedicated FE-20 screen was not confirmed as fully implemented; implementers should align with existing portal layout patterns).

Function details:
- The evaluation is an operational view and does not require citizen interaction.
- The system should support multiple levels (ward/district) depending on data availability.

Data:
- AdministrativeArea: id, name, level, geometry/boundary (optional)
- Station: id, name, code, administrativeAreaId, latestWaterLevel, measuredAt, severity/status
- AggregatedAreaStatus: severity, supporting stats, computedAt

Validation:
- Selected administrative area must exist.
- Water level values must be numeric; missing values mark station as unknown.
- Geometry/boundary must be valid if map visualization is enabled.

Business rules:
- Aggregation rule (recommended baseline):
  - If any station is Critical → area is Critical.
  - Else if any station is Warning → area is Warning.
  - Else if any station is Caution → area is Caution.
  - Else if all contributing stations are Safe → area is Safe.
  - Else → area is Unknown.
- Data freshness rule (recommended):
  - If latest reading is older than a threshold, station is treated as Unknown for aggregation.
- Access control:
  - Only Admin and Moderator can evaluate administrative-area updates.

Error Handling:
- No stations mapped to the area → display “No monitoring stations available for this area”.
- Station data fetch failure → show partial results where possible and indicate degraded state.
- Backend errors → display generic error and allow retry.

Normal case:
1. Admin/Moderator opens area evaluation.
2. Selects an administrative area.
3. System aggregates station readings and shows area status.
4. Admin/Moderator reviews stations contributing to the status.

Abnormal case:
- Selected area has no stations → system shows empty/unknown status with explanation.
- Data stale/unavailable → system marks status as unknown and prompts retry.

---

## 3.35.x Hide Invalid Flood Report (FE-32)

Function trigger:
- Moderator opens the community flood reports moderation view.
- Moderator selects **Hide** on a report identified as invalid/spam/inappropriate/duplicate/false information.

Function description:
The system allows the Moderator to hide an invalid community flood report from public-facing feeds and maps while keeping the record for audit purposes. Hiding is a soft-moderation action that changes report visibility state rather than deleting the record.

Actors/Roles: Moderator

Purpose:
- Protect citizens from misinformation and inappropriate content.
- Maintain operational integrity of community-sourced flood signals.
- Preserve auditability for moderation actions.

Interface:
- Route/UI:
  - Moderator page: `GET /moderator/community-report`
  - Report list with filters:
    - Status: published / hidden
    - Severity: low / medium / high
    - Min trust score
    - Time range (from/to)
  - Report card actions:
    - Hide button (disabled when already hidden)
  - Confirmation modal: “Hide report”

Data processing:
- Moderator loads reports list with pagination and filtering:
  - Endpoint (community list): `GET /flood-reports/community?...`
  - Filters include status, severity, minTrustScore, from, to, pageNumber, pageSize.
- Moderator chooses a report and confirms hide.
- System sends hide request:
  - Endpoint: `PATCH /admin/flood-reports/:reportId/hide`
- On success, the report is updated to hidden state and is no longer shown to citizens.

Screen layout:
- Screen layout: Implemented as a moderator listing + hide confirmation modal (no figures embedded here).

Function details:
- Hidden reports remain accessible to Moderator/Admin for review/audit.
- The UI currently confirms hide but does not collect a structured hide reason; reason capture may be implemented later (see Business rules).

Data:
- Report: id, reporterUserId, coordinates, address, description, severity, trustScore, status, createdAt, media
- Moderation action: reportId, actionType=hide, actorId, timestamp
- Hide reason: recommended (TBD in current UI)

Validation:
- Only a Moderator can execute hide action.
- A report already hidden cannot be hidden again.
- Report id must exist.

Business rules:
- Hide criteria include (non-exhaustive):
  - Spam, duplicate content, clearly incorrect location, inappropriate media, fabricated information.
- Hiding is a soft action:
  - The record is preserved; only visibility changes.
- The system should store moderation metadata (recommended):
  - Who hid the report, when, and an optional reason.

Error Handling:
- Forbidden operation (non-moderator) → show “Insufficient permissions”.
- Report already hidden → disable action and show status.
- Backend hide failure → show error and keep report visible in current list until refreshed.

Normal case:
1. Moderator opens community reports view.
2. Filters or finds a suspicious report.
3. Moderator selects Hide and confirms.
4. System updates report state to hidden and refreshes list/status badges.

Abnormal case:
- Moderator tries to hide an already hidden report → system prevents duplicate action.
- API error/network failure → system shows error and allows retry.

---

## 3.42.x Preview Alert Message Templates (FE-38)

Function trigger:
- Moderator opens the Alert Message Templates module.
- Moderator selects **Preview** on a chosen template.

Function description:
The system allows a Moderator to preview the rendered content of an alert message template using sample data, across multiple channels (Push, SMS, Email, In-App). Preview is a non-persistent operation and does not write to the database.

Actors/Roles: Moderator

Purpose:
- Validate readability and formatting before operational use.
- Detect placeholder/variable mismatches early.
- Reduce erroneous alerts caused by incorrect templates.

Interface:
- Route/UI:
  - Templates page exists for both portals:
    - `/moderator/alerts` (Moderator portal)
    - `/admin/alerts` (Admin portal UI route also exists; access policy remains per SRS)
- Templates table actions:
  - Edit
  - Preview
  - Delete
- Preview dialog:
  - Input panel for sample data (key-value pairs)
  - Channel tabs: Push / Email / SMS / In-App
  - Rendered output panel
  - Warning section listing unreplaced placeholders (e.g., `{{unknownVar}}`)

Data processing:
- Moderator selects a template and opens preview.
- Moderator enters sample data or uses default sample data (e.g., station name, water level, threshold, severity, address).
- System requests preview rendering:
  - Endpoint: `POST /admin/alert-templates/preview`
  - Payload includes:
    - `templateId`
    - `titleTemplate`
    - `bodyTemplate`
    - sample values (e.g., `stationName`, `waterLevel`, `threshold`, `severity`, `address`)
- Backend returns rendered `{ title, body }`.
- Frontend displays previews per channel and detects any unreplaced `{{...}}` variables in the rendered result.

Screen layout:
- Screen layout: Implemented as a “Preview Template” dialog with two-column layout (sample input on the left, rendered output on the right).

Function details:
- Supported channels:
  - Push: plain text preview
  - SMS: plain text preview
  - Email: HTML-capable preview
  - In-App: app-style preview
- Placeholder validation:
  - If placeholders remain unreplaced in the rendered result, the UI highlights them as errors.
- Preview is stateless:
  - No template updates are saved during preview.

Data:
- Template: id, name, channel, severity, titleTemplate, bodyTemplate, isActive, sortOrder
- Preview sample data:
  - stationName, waterLevel, threshold, severity, address (extensible)

Validation:
- Template must exist and be accessible to Moderator.
- Numeric fields should parse correctly:
  - `waterLevel` and `threshold` should be valid numbers (fallback to 0 if parsing fails in current UI).
- Placeholder syntax:
  - Placeholders are expressed as `{{variableName}}` and must match supported keys.

Business rules:
- Only Moderator may preview templates as part of template governance.
- Preview does not mutate persisted template data.
- The system should define and document a canonical placeholder list (recommended), for example:
  - `{{stationName}}`, `{{waterLevel}}`, `{{threshold}}`, `{{severity}}`, `{{address}}`
- Unrecognized placeholders should be surfaced as preview errors and must be corrected before operational use.

Error Handling:
- 401 Unauthorized → force re-login.
- 403 Forbidden → show “Insufficient permissions”.
- Preview API failure → show preview error and keep dialog open.
- Unreplaced placeholders detected → show list of placeholders remaining in output.

Normal case:
1. Moderator opens templates module and selects a template.
2. Opens Preview and enters sample data.
3. System returns rendered title/body.
4. Moderator verifies output across channels and closes dialog.

Abnormal case:
- Placeholder mismatch → output contains unreplaced `{{...}}`; UI warns and lists issues.
- Preview API/network failure → UI shows error and allows retry.

---

## Integration Notes
- **FE-05 Reset Password** should be inserted into **`3.3 Manage Password`** as **`3.3.x Reset Password`** (recommended numbering: `3.3.2` if `3.3.1 Change Password` already exists).
- **FE-07 → FE-11** should replace/expand **`3.5 Manage Users (Global & Assign Fixed Roles)`** into:
  - `3.5.1 View User`
  - `3.5.2 Create User`
  - `3.5.3 Update User`
  - `3.5.4 Delete User`
  - `3.5.5 Ban User`
- **FE-20 Evaluate Administrative Area-based Flood Updates** should be placed near **`3.11 Receive Area-based Flood Updates`** as a new **`3.11.x`** section.
- **FE-32 Hide Invalid Flood Report** should be placed near the **Community Flood Reports** group, recommended as **`3.35.x`** immediately after **View Community Flood Reports** (and before/near Vote if needed).
- **FE-38 Preview Alert Message Templates** should be placed after **Delete Alert Message Templates**, recommended as **`3.42.x Preview Alert Message Templates`** to avoid renumbering later sections.
