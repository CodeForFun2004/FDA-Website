# FE-41: Manage Billing & Payment Records (Admin) - Frontend Implementation Guide

## 1. Tong quan
**Muc tieu:** Cho phep Admin xem va quan ly tat ca cac giao dich thanh toan trong he thong, bao gom loc theo status, phan trang, va xem chi tiet tung giao dich.
**Nghiep vu:** Admin co the xem toan bo payment records tu tat ca users, loc theo trang thai (paid/pending/cancelled), va xem thong ke tong quan (tong doanh thu, so giao dich). Day la trang read-only, admin khong chinh sua payment records.

---

## 2. Business Flow

```
+-------------------+
| Admin truy cap    |
| trang Payments    |
+--------+----------+
         |
         v
+-------------------+       +---------------------------+
| GET /api/v1/admin | ----> | Hien thi Summary Stats    |
| /payments         |       | + Payments Table          |
| ?page=1&pageSize  |       +-------------+-------------+
| =10               |                     |
+-------------------+           +---------+---------+
                                |                   |
                                v                   v
                       +--------+------+    +-------+--------+
                       | Admin loc     |    | Admin chuyen   |
                       | theo status   |    | trang          |
                       | (dropdown)    |    | (pagination)   |
                       +--------+------+    +-------+--------+
                                |                   |
                                v                   v
                       +--------+------+    +-------+--------+
                       | GET /api/v1/  |    | GET /api/v1/   |
                       | admin/payments|    | admin/payments |
                       | ?status=paid  |    | ?page=2        |
                       +---------------+    +----------------+
                                |
                                v
                       +--------+-------+
                       | Click row ->   |
                       | Xem chi tiet   |
                       | payment        |
                       +----------------+
```

---

## 3. API Integration

### 3.1. Get All Payments (Admin)
- **Method:** GET
- **URL:** `/api/v1/admin/payments`
- **Auth:** Bearer Token (Admin role)
- **Query Params:**
  - `page` (number, default: 1)
  - `pageSize` (number, default: 10)
  - `status` (string, optional - "paid", "pending", "cancelled")
- **Response:**
  - `success` (boolean)
  - `message` (string)
  - `statusCode` (number)
  - `totalCount` (number)
  - `data` (array):
    - `id` (string - GUID)
    - `orderCode` (number)
    - `planName` (string)
    - `planCode` (string)
    - `amount` (number - VND)
    - `currency` (string - "VND")
    - `paymentMethod` (string - "PAYOS")
    - `status` (string - "paid", "pending", "cancelled")
    - `durationMonths` (number)
    - `description` (string)
    - `paidAt` (ISO 8601 date | null)
    - `createdAt` (ISO 8601 date)
    - `userEmail` (string)
    - `userFullName` (string)

---

## 4. UI Components

### 4.1. Summary Stats Cards

- **Vi tri:** Phan tren cung cua trang, truoc bang payments
- **Cards (4 cards ngang hang):**
  | Card | Mota | Tinh toan |
  |------|------|-----------|
  | Total Transactions | Tong so giao dich | `totalCount` tu API (khong filter) |
  | Total Revenue | Tong doanh thu | Sum `amount` cua cac payment `status: "paid"` |
  | Pending | So giao dich dang cho | Count payments `status: "pending"` |
  | Cancelled | So giao dich da huy | Count payments `status: "cancelled"` |

- **Luu y:** Co the can goi API 3 lan (khong filter, filter=paid, filter=pending) de lay totalCount cho moi loai, hoac backend cung cap summary endpoint rieng.

### 4.2. Payments Table

- **Cot:**
  | # | Column | Field | Mota |
  |---|--------|-------|------|
  | 1 | Order Code | `orderCode` | Ma don hang |
  | 2 | User | `userFullName` + `userEmail` | Thong tin user (name, email duoi) |
  | 3 | Plan | `planName` (`planCode`) | Ten goi + ma goi |
  | 4 | Amount | `amount` + `currency` | So tien (format: 99.000 VND) |
  | 5 | Duration | `durationMonths` | Thoi han (vd: "1 month") |
  | 6 | Status | `status` | Badge mau |
  | 7 | Payment Date | `paidAt` or `createdAt` | Ngay thanh toan hoac ngay tao |

- **Status Badges:**
  - `paid` - Mau xanh la (#22C55E) - "Paid"
  - `pending` - Mau vang (#EAB308) - "Pending"
  - `cancelled` - Mau do (#EF4444) - "Cancelled"

### 4.3. Status Filter Dropdown

- **Vi tri:** Phia tren bang, ben phai
- **Options:**
  - All (mac dinh, khong truyen `status` param)
  - Paid (`status=paid`)
  - Pending (`status=pending`)
  - Cancelled (`status=cancelled`)
- **Hanh vi:** Khi thay doi filter, reset ve page 1, goi lai API

### 4.4. Pagination

- **Vi tri:** Cuoi bang
- **Hien thi:** "Showing X-Y of Z results"
- **Controls:** Previous, page numbers, Next
- **PageSize:** Co the cho phep thay doi (10, 25, 50)

### 4.5. Payment Detail (Click Row)

- **Khi click vao 1 row:** Expand hoac mo modal hien thi chi tiet:
  - Order Code
  - User: Full Name, Email
  - Plan: Name, Code
  - Amount + Currency
  - Duration
  - Payment Method
  - Status
  - Description
  - Created At
  - Paid At (neu co)

### 4.6. Empty State

- Khi khong co giao dich: Hien thi "No payment records found"
- Khi filter khong co ket qua: "No payments match the selected filter"

---

## 5. State Management

### 5.1. Payments State
```
payments: AdminPaymentRecord[]
totalCount: number
currentPage: number
pageSize: number
statusFilter: 'all' | 'paid' | 'pending' | 'cancelled'
isLoadingPayments: boolean
paymentsError: string | null
```

### 5.2. Detail State
```
selectedPayment: AdminPaymentRecord | null
isDetailOpen: boolean
```

### 5.3. Summary State (optional)
```
summaryStats: {
  totalTransactions: number
  totalRevenue: number
  pendingCount: number
  cancelledCount: number
}
isLoadingSummary: boolean
```

### 5.4. Data Flow
1. Component mount -> goi `GET /api/v1/admin/payments?page=1&pageSize=10`
2. Render Summary Stats va Payments Table
3. Admin thay doi filter -> update `statusFilter` -> goi lai API voi `status` param, reset `currentPage = 1`
4. Admin click pagination -> update `currentPage` -> goi lai API voi `page` param
5. Admin click row -> set `selectedPayment` -> hien thi detail modal/expand
6. Admin thay doi pageSize -> update `pageSize` -> goi lai API, reset `currentPage = 1`

---

## 6. Error Handling

| Loi | HTTP Code | Xu ly |
|-----|-----------|-------|
| Khong load duoc payments | 500 | Hien thi error message voi nut "Retry" |
| Forbidden (khong phai admin) | 403 | Redirect ve trang chinh, hien thi "Access denied" |
| Token het han | 401 | Refresh token hoac redirect ve login |
| Network error | - | Toast "Network error. Please try again." |
| Payments rong | 200 (empty) | Hien thi empty state message |
| Filter khong co ket qua | 200 (empty) | Hien thi "No payments match the selected filter" |
