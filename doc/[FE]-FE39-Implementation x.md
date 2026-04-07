# FE-39: Manage Subscription Plans (Admin) - Frontend Implementation Guide

## 1. Tong quan
**Muc tieu:** Cho phep Admin quan ly cac pricing plans: xem tat ca plans (bao gom inactive), tao plan moi, cap nhat plan, va deactivate plan.
**Nghiep vu:** Admin co quyen CRUD tren cac subscription plans. Deactivate la soft-delete (plan van con trong DB nhung khong hien thi cho user). Features cua moi plan co the duoc them/xoa khi tao hoac cap nhat.

---

## 2. Business Flow

```
+-------------------+
| Admin truy cap    |
| trang Plans Mgmt  |
+--------+----------+
         |
         v
+-------------------+       +---------------------------+
| GET /api/v1/admin | ----> | Hien thi bang tat ca      |
| /plans            |       | plans (active + inactive) |
+-------------------+       +-------------+-------------+
                                          |
                     +--------------------+--------------------+
                     |                    |                    |
                     v                    v                    v
            +--------+------+    +--------+------+    +-------+--------+
            | Click "Create |    | Click "Edit"  |    | Click           |
            | New Plan"     |    | tren 1 plan   |    | "Deactivate"    |
            +--------+------+    +--------+------+    +-------+--------+
                     |                    |                    |
                     v                    v                    v
            +--------+------+    +--------+------+    +-------+--------+
            | POST /api/v1/ |    | PUT /api/v1/  |    | DELETE /api/v1/|
            | admin/plans   |    | admin/plans   |    | admin/plans    |
            | (form data)   |    | /{id}         |    | /{id}          |
            +--------+------+    +--------+------+    +-------+--------+
                     |                    |                    |
                     v                    v                    v
            +--------+------+    +--------+------+    +-------+--------+
            | Refresh danh  |    | Refresh danh  |    | Refresh danh   |
            | sach plans    |    | sach plans    |    | sach plans     |
            +---------------+    +---------------+    +----------------+
```

---

## 3. API Integration

### 3.1. Get All Plans (Admin)
- **Method:** GET
- **URL:** `/api/v1/admin/plans`
- **Auth:** Bearer Token (Admin role)
- **Request Body:** Khong co
- **Response:**
  - `success` (boolean)
  - `message` (string)
  - `statusCode` (number)
  - `data` (array of plan objects):
    - `id` (string - GUID)
    - `code` (string)
    - `name` (string)
    - `description` (string)
    - `priceMonth` (number - VND)
    - `priceYear` (number - VND)
    - `tier` (string)
    - `isActive` (boolean)
    - `sortOrder` (number)
    - `features` (array):
      - `id` (string - GUID)
      - `featureKey` (string)
      - `featureName` (string)
      - `featureValue` (string)
      - `description` (string | null)

### 3.2. Create Plan
- **Method:** POST
- **URL:** `/api/v1/admin/plans`
- **Auth:** Bearer Token (Admin role)
- **Request Body:**
  - `code` (string, required) - Ma plan duy nhat
  - `name` (string, required) - Ten plan
  - `description` (string, optional)
  - `priceMonth` (number, required, >= 0) - Gia thang
  - `priceYear` (number, required, >= 0) - Gia nam
  - `tier` (number, required) - Cap do plan
  - `sortOrder` (number, required) - Thu tu sap xep
  - `features` (array, optional):
    - `featureKey` (string)
    - `featureName` (string)
    - `featureValue` (string)
    - `description` (string | null)
- **Response:** Plan object (same as Get All Plans item)

### 3.3. Update Plan
- **Method:** PUT
- **URL:** `/api/v1/admin/plans/{id}`
- **Auth:** Bearer Token (Admin role)
- **Request Body:**
  - `name` (string)
  - `description` (string)
  - `priceMonth` (number)
  - `priceYear` (number)
  - `isActive` (boolean)
  - `sortOrder` (number)
  - `features` (array) - Thay the toan bo features hien co
- **Response:** Updated plan object

### 3.4. Deactivate Plan
- **Method:** DELETE
- **URL:** `/api/v1/admin/plans/{id}`
- **Auth:** Bearer Token (Admin role)
- **Request Body:** Khong co
- **Response:**
  - `success` (boolean)
  - `message` (string)
  - `statusCode` (number)

---

## 4. UI Components

### 4.1. Plans Management Table (`/admin/plans`)

- **Cot:**
  | # | Column | Field | Mota |
  |---|--------|-------|------|
  | 1 | Code | `code` | Ma plan (vd: FREE, PREMIUM) |
  | 2 | Name | `name` | Ten plan |
  | 3 | Price/Month | `priceMonth` | Gia thang (format: 99.000 VND) |
  | 4 | Price/Year | `priceYear` | Gia nam |
  | 5 | Tier | `tier` | Cap do |
  | 6 | Status | `isActive` | Badge: Active (xanh) / Inactive (xam) |
  | 7 | Features | `features.length` | So luong features |
  | 8 | Actions | - | Edit, Deactivate buttons |

- **Filter:** Toggle "Show inactive plans" checkbox
- **Sort:** Theo `sortOrder` mac dinh

### 4.2. Create Plan Form (Modal hoac trang rieng)

- **Fields:**
  - Code (text input, required, uppercase, khong duoc trung)
  - Name (text input, required)
  - Description (textarea, optional)
  - Price Month (number input, >= 0, VND)
  - Price Year (number input, >= 0, VND)
  - Tier (number input hoac dropdown)
  - Sort Order (number input)
  - Features section:
    - Danh sach features hien co (co the xoa)
    - Nut "Add Feature" de them feature moi
    - Moi feature gom: Feature Key, Feature Name, Feature Value, Description

- **Validation phia client:**
  - Code: required, chi cho uppercase letters va underscore
  - Name: required
  - PriceMonth, PriceYear: >= 0
  - Feature Key: required neu co feature

### 4.3. Edit Plan Modal/Page

- Tuong tu Create Form nhung:
  - Code: readonly (khong duoc sua)
  - Pre-fill tat ca fields tu plan hien co
  - Features: hien thi features hien co, cho phep sua/xoa/them

### 4.4. Deactivate Confirmation Dialog

- Confirmation modal: "Are you sure you want to deactivate [Plan Name]?"
- Warning text: "This will hide the plan from users. Existing subscribers will not be affected."
- Nut "Cancel" va "Deactivate" (mau do)

---

## 5. State Management

### 5.1. Plans State
```
allPlans: PricingPlan[]           // tat ca plans (bao gom inactive)
isLoadingPlans: boolean
plansError: string | null
showInactive: boolean             // toggle hien thi inactive plans
```

### 5.2. Form State
```
formMode: 'create' | 'edit'
selectedPlan: PricingPlan | null  // plan dang edit
formData: {
  code: string
  name: string
  description: string
  priceMonth: number
  priceYear: number
  tier: number
  sortOrder: number
  features: FeatureInput[]
}
isSubmitting: boolean
formErrors: Record<string, string[]>
```

### 5.3. Data Flow
1. Component mount -> goi `GET /api/v1/admin/plans`
2. Render table voi tat ca plans
3. Click "Create" -> mo form/modal (formMode = 'create')
4. Submit form -> goi `POST /api/v1/admin/plans` -> refresh list
5. Click "Edit" -> load plan data vao form (formMode = 'edit')
6. Submit form -> goi `PUT /api/v1/admin/plans/{id}` -> refresh list
7. Click "Deactivate" -> show confirmation -> goi `DELETE /api/v1/admin/plans/{id}` -> refresh list

---

## 6. Error Handling

| Loi | HTTP Code | Xu ly |
|-----|-----------|-------|
| Khong load duoc plans | 500 | Hien thi error message voi nut "Retry" |
| Forbidden (khong phai admin) | 403 | Redirect ve trang chinh, hien thi "Access denied" |
| Tao plan duplicate code | 400 | Hien thi loi duoi field "Code" |
| Validation errors | 400 | Hien thi loi duoi tung field tuong ung |
| Plan not found (edit/delete) | 404 | Toast "Plan not found", refresh list |
| Plan already inactive | 400 | Toast "Plan is already inactive" |
| Token het han | 401 | Redirect ve login |
| Network error | - | Toast "Network error. Please try again." |
