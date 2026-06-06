# VendorBridge — API Documentation

**Base URL:** `https://api.vendorbridge.com/v1`  
**Auth:** Bearer JWT token in `Authorization` header  
**Content-Type:** `application/json`

---

## Module 1 — Authentication

**Tables accessed:** `users`, `sessions`, `password_reset_tokens`

---

### POST /auth/register
Register a new internal user (admin only can set `role`).

**Request Body:**
```json
{
  "full_name": "Riya Sharma",
  "email": "riya@company.com",
  "password": "StrongPass@123",
  "phone": "+91-9876543210",
  "role": "procurement_officer"
}
```
**Success Response `201`:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "email": "riya@company.com",
    "full_name": "Riya Sharma",
    "role": "procurement_officer",
    "status": "active",
    "created_at": "2024-07-28T10:00:00Z"
  }
}
```

---

### POST /auth/login
Authenticate and receive a JWT.

**Request Body:**
```json
{ "email": "officer@vendorbridge.com", "password": "Password@123" }
```
**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "expires_at": "2024-08-28T10:00:00Z",
    "user": {
      "id": "uuid",
      "email": "officer@vendorbridge.com",
      "full_name": "Riya Sharma",
      "role": "procurement_officer",
      "status": "active"
    }
  }
}
```

---

### POST /auth/logout
Invalidate the current session.

**Headers:** `Authorization: Bearer <token>`  
**Success Response `200`:** `{ "success": true, "message": "Logged out successfully" }`

---

### POST /auth/forgot-password
Send reset link to user email.

**Request Body:** `{ "email": "officer@vendorbridge.com" }`  
**Success Response `200`:** `{ "success": true, "message": "Password reset email sent" }`

---

### POST /auth/reset-password
Reset password using token from email.

**Request Body:**
```json
{ "token": "reset-token-string", "new_password": "NewPass@456" }
```
**Success Response `200`:** `{ "success": true, "message": "Password updated successfully" }`

---

### GET /auth/me
Get current authenticated user's profile.

**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid", "email": "...", "full_name": "...",
    "role": "procurement_officer", "phone": "...", "last_login_at": "..."
  }
}
```

---

## Module 2 — Dashboard

**Tables accessed:** `rfqs`, `purchase_orders`, `invoices`, `approvals`, `activity_logs`, `notifications`  
**Roles:** All authenticated users (data filtered by role)

---

### GET /dashboard/summary
Returns KPI cards and summary counts.

**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "pending_approvals": 3,
    "active_rfqs": 5,
    "recent_purchase_orders": 2,
    "recent_invoices": 4,
    "total_spend_this_month": 450000.00,
    "total_vendors": 18,
    "analytics": {
      "monthly_spend": [
        { "month": "2024-06", "amount": 320000 },
        { "month": "2024-07", "amount": 450000 }
      ],
      "rfq_status_breakdown": {
        "draft": 2, "published": 5, "closed": 8, "cancelled": 1
      }
    }
  }
}
```

---

### GET /dashboard/recent-activity
Recent activity log for the current user's context.

**Query Params:** `limit=10`  
**Success Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "action": "approved",
      "entity_type": "quotation",
      "description": "Approved quotation QT-2024-002",
      "created_at": "2024-07-25T14:30:00Z",
      "user": { "full_name": "Arjun Mehta", "role": "manager" }
    }
  ]
}
```

---

## Module 3 — Vendor Management

**Tables accessed:** `vendors`, `vendor_user_accounts`, `users`  
**Roles:** `admin`, `procurement_officer` (full CRUD); `manager` (read); `vendor` (own profile only)

---

### GET /vendors
List all vendors with filtering.

**Query Params:** `status`, `category`, `search`, `page=1`, `limit=20`  
**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "vendors": [
      {
        "id": "uuid", "vendor_code": "VND-001",
        "company_name": "ACME Supplies Pvt Ltd",
        "category": "goods", "status": "active",
        "contact_person": "Priya Patel",
        "email": "vendor1@acmesupplies.com",
        "city": "Mumbai", "state": "Maharashtra",
        "gst_number": "27AAPCS1234A1Z5",
        "rating": 4.50, "created_at": "2024-07-01T00:00:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 4, "total_pages": 1 }
  }
}
```

---

### POST /vendors
Register a new vendor.

**Request Body:**
```json
{
  "company_name": "New Vendor Ltd",
  "category": "goods",
  "gst_number": "29XXXXX1234X1Z5",
  "pan_number": "XXXXX1234X",
  "contact_person": "Name",
  "email": "contact@vendor.com",
  "phone": "+91-9999999999",
  "address_line1": "Address",
  "city": "City", "state": "State", "pincode": "380001",
  "bank_name": "HDFC Bank",
  "bank_account_no": "12345678901234",
  "bank_ifsc": "HDFC0001234"
}
```
**Success Response `201`:**
```json
{
  "success": true,
  "message": "Vendor registered successfully",
  "data": { "id": "uuid", "vendor_code": "VND-005", ... }
}
```

---

### GET /vendors/:id
Get single vendor detail.

**Success Response `200`:** Full vendor object including bank details.

---

### PUT /vendors/:id
Update vendor details. Same body as POST.  
**Success Response `200`:** Updated vendor object.

---

### PATCH /vendors/:id/status
Update vendor status only.

**Request Body:** `{ "status": "active" }` — values: `active | inactive | blacklisted | pending`  
**Success Response `200`:** `{ "success": true, "message": "Vendor status updated" }`

---

## Module 4 — RFQ Management

**Tables accessed:** `rfqs`, `rfq_items`, `rfq_attachments`, `rfq_vendors`, `vendors`  
**Roles:** `procurement_officer`, `admin` (create/edit); all roles (read based on context)

---

### GET /rfqs
List RFQs with filtering.

**Query Params:** `status`, `search`, `page`, `limit`  
**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "rfqs": [
      {
        "id": "uuid", "rfq_number": "RFQ-2024-001",
        "title": "Office Furniture Procurement",
        "status": "published", "deadline": "2024-08-30",
        "vendor_count": 2, "quotation_count": 2,
        "created_by": { "id": "uuid", "full_name": "Riya Sharma" },
        "created_at": "2024-07-18T00:00:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 3 }
  }
}
```

---

### POST /rfqs
Create a new RFQ.

**Request Body:**
```json
{
  "title": "IT Equipment Purchase",
  "description": "Laptops and monitors for new hires",
  "deadline": "2024-09-15",
  "delivery_terms": "Within 21 days of PO",
  "payment_terms": "Net 30",
  "items": [
    { "item_name": "Laptop", "quantity": 30, "unit": "pcs", "specifications": "i7, 16GB RAM, 512GB SSD" },
    { "item_name": "Monitor", "quantity": 30, "unit": "pcs", "specifications": "24 inch FHD" }
  ],
  "vendor_ids": ["uuid1", "uuid2"]
}
```
**Success Response `201`:**
```json
{
  "success": true,
  "data": { "id": "uuid", "rfq_number": "RFQ-2024-004", "status": "draft", ... }
}
```

---

### GET /rfqs/:id
Get single RFQ with items, attachments, and invited vendors.

---

### PUT /rfqs/:id
Update RFQ (allowed only in `draft` status).

---

### PATCH /rfqs/:id/publish
Publish RFQ — sends invitations to assigned vendors.  
**Success Response `200`:** `{ "success": true, "message": "RFQ published and vendors notified", "data": { "status": "published" } }`

---

### POST /rfqs/:id/attachments
Upload attachment to RFQ (multipart/form-data).

---

### DELETE /rfqs/:rfqId/attachments/:attachmentId
Remove an attachment.

---

## Module 5 — Quotations

**Tables accessed:** `quotations`, `quotation_items`, `rfq_vendors`  
**Roles:** `vendor` (submit own); `procurement_officer`, `manager`, `admin` (read all)

---

### GET /rfqs/:rfqId/quotations
Get all quotations for an RFQ.

**Success Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid", "quotation_number": "QT-2024-001",
      "vendor": { "id": "uuid", "company_name": "ACME Supplies", "rating": 4.5 },
      "status": "submitted",
      "delivery_days": 25,
      "subtotal": 185000.00, "tax_amount": 33300.00,
      "total_amount": 213300.00,
      "submitted_at": "2024-07-21T09:00:00Z"
    }
  ]
}
```

---

### POST /rfqs/:rfqId/quotations
Submit a quotation (vendor only).

**Request Body:**
```json
{
  "delivery_days": 25,
  "validity_date": "2024-08-10",
  "payment_terms": "Net 30",
  "notes": "Includes 1-year warranty",
  "items": [
    {
      "rfq_item_id": "uuid",
      "item_name": "Executive Desk",
      "quantity": 20, "unit": "pcs",
      "unit_price": 5500.00, "tax_rate": 18
    }
  ]
}
```
**Success Response `201`:**
```json
{
  "success": true,
  "data": { "id": "uuid", "quotation_number": "QT-2024-004", "status": "draft" }
}
```

---

### PUT /quotations/:id
Edit a quotation (vendor, draft status only).

---

### PATCH /quotations/:id/submit
Submit a draft quotation for review.  
**Success Response `200`:** `{ "success": true, "message": "Quotation submitted successfully", "data": { "status": "submitted" } }`

---

## Module 6 — Quotation Comparison

**Tables accessed:** `quotations`, `quotation_items`, `vendors`  
**Roles:** `procurement_officer`, `manager`, `admin`

---

### GET /rfqs/:rfqId/quotations/compare
Side-by-side comparison of all submitted quotations.

**Query Params:** `sort_by=total_amount|delivery_days|rating`  
**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "rfq": { "id": "uuid", "rfq_number": "RFQ-2024-001", "title": "Office Furniture" },
    "comparison": [
      {
        "quotation_id": "uuid",
        "quotation_number": "QT-2024-001",
        "vendor": { "id": "uuid", "company_name": "ACME Supplies", "rating": 4.50 },
        "total_amount": 213300.00,
        "delivery_days": 25,
        "is_lowest_price": false,
        "is_fastest_delivery": true,
        "items": [
          { "item_name": "Executive Desk", "quantity": 20, "unit_price": 5500, "total_price": 110000 }
        ]
      },
      {
        "quotation_id": "uuid",
        "quotation_number": "QT-2024-002",
        "vendor": { "id": "uuid", "company_name": "Global Trade Solutions", "rating": 4.20 },
        "total_amount": 202040.00,
        "delivery_days": 30,
        "is_lowest_price": true,
        "is_fastest_delivery": false,
        "items": [ ]
      }
    ]
  }
}
```

---

### PATCH /quotations/:id/accept
Accept a quotation and trigger approval workflow.  
**Success Response `200`:** `{ "success": true, "message": "Quotation accepted, approval workflow initiated" }`

---

## Module 7 — Approval Workflow

**Tables accessed:** `approvals`, `quotations`, `users`, `notifications`  
**Roles:** `manager`, `admin`

---

### GET /approvals
List pending/processed approvals.

**Query Params:** `status=pending|approved|rejected`, `page`, `limit`  
**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "approvals": [
      {
        "id": "uuid", "status": "pending", "level": 1,
        "quotation": {
          "id": "uuid", "quotation_number": "QT-2024-001",
          "total_amount": 213300.00,
          "vendor": { "company_name": "ACME Supplies" }
        },
        "approver": { "id": "uuid", "full_name": "Arjun Mehta" },
        "created_at": "2024-07-22T00:00:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 2 }
  }
}
```

---

### GET /approvals/:id
Get approval detail with quotation and timeline.

---

### PATCH /approvals/:id/approve
Approve the quotation.

**Request Body:** `{ "remarks": "Competitive pricing, approved." }`  
**Success Response `200`:** `{ "success": true, "message": "Quotation approved successfully", "data": { "status": "approved", "approved_at": "..." } }`

---

### PATCH /approvals/:id/reject
Reject the quotation.

**Request Body:** `{ "remarks": "Price too high. Please re-negotiate." }`  
**Success Response `200`:** `{ "success": true, "message": "Quotation rejected", "data": { "status": "rejected" } }`

---

## Module 8 — Purchase Orders

**Tables accessed:** `purchase_orders`, `po_items`, `quotations`, `vendors`, `rfqs`  
**Roles:** `procurement_officer`, `admin` (generate); all roles (read own context)

---

### GET /purchase-orders
List all POs.

**Query Params:** `status`, `vendor_id`, `page`, `limit`  
**Success Response `200`:** List of POs with vendor, status, amounts.

---

### POST /purchase-orders
Generate a PO from an approved quotation.

**Request Body:**
```json
{
  "quotation_id": "uuid",
  "delivery_date": "2024-08-25",
  "billing_address": "VendorBridge Corp, ...",
  "shipping_address": "VendorBridge Corp, ...",
  "terms_and_conditions": "Standard T&C apply"
}
```
**Success Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "po_number": "PO-2024-001",
    "status": "draft",
    "total_amount": 202040.00
  }
}
```

---

### GET /purchase-orders/:id
Get full PO detail with line items, vendor, and linked invoice.

---

### PATCH /purchase-orders/:id/issue
Issue the PO to vendor.  
**Success Response `200`:** `{ "success": true, "message": "PO issued to vendor", "data": { "status": "issued", "issued_at": "..." } }`

---

## Module 9 — Invoices

**Tables accessed:** `invoices`, `invoice_items`, `invoice_email_logs`, `purchase_orders`  
**Roles:** `procurement_officer`, `admin` (generate/manage); `vendor` (view own); `manager` (view)

---

### GET /invoices
List all invoices.

**Query Params:** `status`, `vendor_id`, `page`, `limit`  
**Success Response `200`:** List of invoices with PO reference, vendor, amount, status.

---

### POST /invoices
Generate invoice from a PO.

**Request Body:**
```json
{
  "po_id": "uuid",
  "invoice_date": "2024-07-28",
  "due_date": "2024-08-27",
  "billing_address": "VendorBridge Corp, ...",
  "notes": "Payment due within 30 days."
}
```
**Success Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "invoice_number": "INV-2024-001",
    "status": "draft",
    "total_amount": 202040.00
  }
}
```

---

### GET /invoices/:id
Full invoice detail with line items, tax breakdown, vendor, and PO reference.

---

### GET /invoices/:id/download
Generate and return invoice PDF.

**Response:** `Content-Type: application/pdf` — binary PDF stream  
On success also sets `pdf_url` in the invoice record.

---

### POST /invoices/:id/send-email
Email the invoice to vendor.

**Request Body:**
```json
{
  "to": "vendor@company.com",
  "subject": "Invoice INV-2024-001 from VendorBridge",
  "body": "Please find the attached invoice..."
}
```
**Success Response `200`:** `{ "success": true, "message": "Invoice sent via email", "data": { "sent_at": "...", "sent_to": "vendor@company.com" } }`

---

### PATCH /invoices/:id/mark-paid
Mark invoice as paid.

**Request Body:** `{ "paid_amount": 202040.00, "paid_at": "2024-08-20" }`  
**Success Response `200`:** Updated invoice with `status: "paid"`.

---

## Module 10 — Notifications

**Tables accessed:** `notifications`

---

### GET /notifications
Get notifications for the current user.

**Query Params:** `is_read=true|false`, `page`, `limit`  
**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid", "type": "approval_required",
        "title": "Approval Required: QT-2024-001",
        "message": "...", "is_read": false,
        "entity_type": "quotation", "entity_id": "uuid",
        "created_at": "2024-07-22T09:00:00Z"
      }
    ],
    "unread_count": 3,
    "pagination": { "page": 1, "limit": 20, "total": 5 }
  }
}
```

---

### PATCH /notifications/:id/read
Mark a notification as read.  
**Success Response `200`:** `{ "success": true }`

---

### PATCH /notifications/read-all
Mark all notifications as read.  
**Success Response `200`:** `{ "success": true, "message": "All notifications marked as read" }`

---

## Module 11 — Activity Logs & Audit

**Tables accessed:** `activity_logs`, `users`  
**Roles:** `admin` (all logs); others (own logs only)

---

### GET /activity-logs
Fetch audit trail.

**Query Params:** `entity_type`, `entity_id`, `user_id`, `action`, `from`, `to`, `page`, `limit`  
**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "uuid", "action": "approved",
        "entity_type": "quotation", "entity_id": "uuid",
        "description": "Approved quotation QT-2024-002",
        "user": { "full_name": "Arjun Mehta", "role": "manager" },
        "ip_address": "192.168.1.1",
        "created_at": "2024-07-25T14:30:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 42 }
  }
}
```

---

## Module 12 — Reports & Analytics

**Tables accessed:** `rfqs`, `quotations`, `purchase_orders`, `invoices`, `vendors`  
**Roles:** `admin`, `manager`, `procurement_officer`

---

### GET /reports/procurement-summary
Overall procurement stats.

**Query Params:** `from`, `to`  
**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "total_rfqs": 12,
    "total_quotations": 28,
    "total_pos": 9,
    "total_invoices": 9,
    "total_spend": 1850000.00,
    "avg_quotations_per_rfq": 2.3,
    "avg_po_value": 205555.55
  }
}
```

---

### GET /reports/vendor-performance
Vendor-wise performance metrics.

**Success Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "vendor": { "id": "uuid", "company_name": "ACME Supplies", "vendor_code": "VND-001" },
      "quotations_submitted": 5,
      "quotations_accepted": 3,
      "total_pos": 3,
      "total_billed": 620000.00,
      "avg_delivery_days": 22,
      "rating": 4.50
    }
  ]
}
```

---

### GET /reports/monthly-spend
Monthly procurement spending trend.

**Query Params:** `year=2024`  
**Success Response `200`:** Array of `{ month, total_amount }` for each month.

---

### GET /reports/export
Export reports as CSV or PDF.

**Query Params:** `type=procurement_summary|vendor_performance|monthly_spend`, `format=csv|pdf`  
**Response:** File download (`application/csv` or `application/pdf`)

---

## Standard Error Responses

| HTTP Code | Meaning |
|-----------|---------|
| 400 | Bad Request — validation failed |
| 401 | Unauthorized — missing or invalid token |
| 403 | Forbidden — insufficient role |
| 404 | Not Found |
| 409 | Conflict — duplicate record |
| 422 | Unprocessable Entity — business rule violation |
| 500 | Internal Server Error |

**Error Body:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The deadline field is required",
    "details": { "field": "deadline" }
  }
}
```

---

## Role Permission Matrix

| Endpoint Group       | admin | manager | procurement_officer | vendor |
|----------------------|:-----:|:-------:|:-------------------:|:------:|
| Auth                 | ✅    | ✅      | ✅                  | ✅     |
| Dashboard            | ✅    | ✅      | ✅                  | ✅*    |
| Vendor Management    | ✅    | 👁       | ✅                  | 👁 own |
| RFQ Management       | ✅    | 👁       | ✅                  | 👁 inv |
| Quotations           | ✅    | 👁       | 👁                  | ✅ own |
| Quotation Comparison | ✅    | ✅      | ✅                  | ❌     |
| Approvals            | ✅    | ✅      | 👁                  | ❌     |
| Purchase Orders      | ✅    | 👁       | ✅                  | 👁 own |
| Invoices             | ✅    | 👁       | ✅                  | 👁 own |
| Notifications        | ✅    | ✅      | ✅                  | ✅     |
| Activity Logs        | ✅    | 👁 own   | 👁 own              | ❌     |
| Reports              | ✅    | ✅      | ✅                  | ❌     |

`✅` = Full access  `👁` = Read only  `👁 own` = Read own records  `👁 inv` = Invited RFQs only  `❌` = No access  `✅*` = Limited dashboard
