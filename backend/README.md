# 🏗️ VendorBridge
### Procurement & Vendor Management ERP

*A centralized platform to manage vendors, RFQs, quotations, approvals, purchase orders, and invoices.*

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)](https://postgresql.org)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)

</div>

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Database Schema](#database-schema)
5. [Project Structure](#project-structure)
6. [Getting Started](#getting-started)
7. [Environment Variables](#environment-variables)
8. [User Roles](#user-roles)
9. [Procurement Workflow](#procurement-workflow)
10. [API Overview](#api-overview)
11. [Seed Credentials](#seed-credentials)
12. [Scripts](#scripts)

---

## Overview

VendorBridge is a full-featured Procurement & Vendor Management ERP designed to digitize and streamline organizational procurement. It replaces manual, email-based procurement processes with a structured workflow: from RFQ creation through vendor quotation comparison, multi-level approvals, purchase order generation, and invoice management.

---

## Features

| Module | Capabilities |
|--------|-------------|
| **Authentication** | JWT login, role-based access, password reset, session management |
| **Dashboard** | KPI cards, pending approvals, active RFQs, recent POs, spend analytics |
| **Vendor Management** | Registration, GST/PAN tracking, status management, categories, ratings |
| **RFQ Management** | Create RFQs with line items, attach documents, invite vendors, publish |
| **Quotations** | Vendor quotation submission, edit, line-item pricing, tax calculation |
| **Comparison** | Side-by-side quotation comparison, lowest-price highlighting, rating indicators |
| **Approvals** | Multi-level approval workflow, remarks, timeline, email notifications |
| **Purchase Orders** | Auto-generated PO from approved quotation, issue to vendor, status tracking |
| **Invoices** | Auto-generated invoice from PO, PDF download, print, send via email |
| **Notifications** | Real-time alerts for RFQ updates, approvals, PO and invoice events |
| **Activity Logs** | Full audit trail with entity-level tracking and user attribution |
| **Reports** | Vendor performance, monthly spend trends, exportable CSV/PDF reports |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express.js |
| Database | PostgreSQL 14+ |
| ORM | Prisma / Knex.js |
| Authentication | JWT (jsonwebtoken) + bcrypt |
| File Storage | AWS S3 / Cloudinary |
| PDF Generation | Puppeteer / PDFKit |
| Email | Nodemailer + SMTP |
| Validation | Joi / Zod |
| Frontend | React.js + Tailwind CSS |

---

## Database Schema

### Tables Summary

| Table | Purpose |
|-------|---------|
| `users` | All user accounts (admin, officer, manager, vendor) |
| `sessions` | Active login sessions / JWT blacklist |
| `password_reset_tokens` | Forgot-password tokens |
| `vendors` | Vendor master records with GST, PAN, bank details |
| `vendor_user_accounts` | Links vendor portal login to vendor record |
| `rfqs` | Request For Quotation master |
| `rfq_items` | Line items within an RFQ |
| `rfq_attachments` | Documents attached to an RFQ |
| `rfq_vendors` | Vendors invited to respond to an RFQ |
| `quotations` | Vendor-submitted quotation against an RFQ |
| `quotation_items` | Line item pricing in a quotation |
| `approvals` | Approval records with status and remarks |
| `purchase_orders` | Purchase orders generated from approved quotations |
| `po_items` | Line items on a purchase order |
| `invoices` | Invoices generated from purchase orders |
| `invoice_items` | Line items on an invoice |
| `invoice_email_logs` | Audit log of every invoice email sent |
| `notifications` | In-app notifications per user |
| `activity_logs` | Full system audit trail |

---

## Project Structure

```
vendorbridge/
├── database/
│   ├── init.sql          # Schema creation
│   └── seed.sql          # Initial seed data
├── src/
│   ├── config/
│   │   ├── db.js         # Database connection
│   │   └── env.js        # Environment config
│   ├── middleware/
│   │   ├── auth.js       # JWT verification
│   │   ├── rbac.js       # Role-based access control
│   │   └── logger.js     # Activity log middleware
│   ├── modules/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── vendors/
│   │   ├── rfqs/
│   │   ├── quotations/
│   │   ├── approvals/
│   │   ├── purchase-orders/
│   │   ├── invoices/
│   │   ├── notifications/
│   │   ├── activity-logs/
│   │   └── reports/
│   ├── services/
│   │   ├── email.service.js
│   │   ├── pdf.service.js
│   │   └── storage.service.js
│   ├── utils/
│   │   ├── codeGenerator.js    # Auto-generate VND-XXX, RFQ-XXXX, etc.
│   │   ├── taxCalculator.js
│   │   └── pagination.js
│   └── app.js
├── docs/
│   └── API_DOCUMENTATION.md
├── .env.example
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/your-org/vendorbridge.git
cd vendorbridge
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 4. Initialize the database
```bash
# Create database
createdb vendorbridge

# Run schema
psql -U postgres -d vendorbridge -f database/init.sql

# Run seed data
psql -U postgres -d vendorbridge -f database/seed.sql
```

### 5. Start the server
```bash
# Development
npm run dev

# Production
npm start
```

Server runs at `http://localhost:3000`

---

## Environment Variables

```env
# Application
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vendorbridge
DB_USER=postgres
DB_PASSWORD=yourpassword

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-app-password
MAIL_FROM=noreply@vendorbridge.com

# File Storage (AWS S3)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-south-1
S3_BUCKET=vendorbridge-files

# Frontend URL (for reset emails)
FRONTEND_URL=http://localhost:5173
```

---

## User Roles

| Role | Description |
|------|-------------|
| `admin` | Full system access — manages users, vendors, and views all analytics |
| `procurement_officer` | Creates RFQs, compares quotations, generates POs and invoices |
| `manager` | Approves or rejects procurement requests, monitors workflows |
| `vendor` | Submits quotations, views own RFQ invitations, tracks own POs/invoices |

---

## Procurement Workflow

```
[Procurement Officer]           [Vendors]              [Manager]
        │                          │                       │
        ▼                          │                       │
  1. Create RFQ  ──────────────►  Receive Invite           │
        │                          │                       │
        │                          ▼                       │
        │                   2. Submit Quotation             │
        │                          │                       │
        ▼                          │                       │
  3. Compare Quotations ◄──────────┘                       │
        │                                                  │
        ▼                                                  │
  4. Accept Best Quotation ──────────────────────────────► │
                                                           ▼
                                                  5. Approve / Reject
                                                           │
        ◄──────────────────────────────────────────────────┘
        │
        ▼
  6. Generate Purchase Order ─────────────────────────► Vendor notified
        │
        ▼
  7. Generate Invoice
        │
        ├──── Download / Print PDF
        │
        └──── Send via Email ──────────────────────────► Vendor receives invoice
        │
        ▼
  8. Track in Activity Logs & Reports
```

---

## API Overview

Full API documentation is available in [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md).

**Base URL:** `http://localhost:3000/api/v1`

**Quick reference:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login and get JWT |
| POST | `/auth/register` | Register new user |
| GET | `/dashboard/summary` | Get KPI summary |
| GET | `/vendors` | List all vendors |
| POST | `/vendors` | Register vendor |
| GET | `/rfqs` | List all RFQs |
| POST | `/rfqs` | Create RFQ |
| PATCH | `/rfqs/:id/publish` | Publish RFQ |
| POST | `/rfqs/:id/quotations` | Submit quotation (vendor) |
| GET | `/rfqs/:id/quotations/compare` | Compare quotations |
| PATCH | `/approvals/:id/approve` | Approve quotation |
| POST | `/purchase-orders` | Generate purchase order |
| POST | `/invoices` | Generate invoice |
| GET | `/invoices/:id/download` | Download PDF |
| POST | `/invoices/:id/send-email` | Email invoice |
| GET | `/reports/vendor-performance` | Vendor analytics |

---

## Seed Credentials

> **Default password for all seed users: `Password@123`**

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@vendorbridge.com` | `Password@123` |
| Procurement Officer | `officer@vendorbridge.com` | `Password@123` |
| Manager / Approver | `manager@vendorbridge.com` | `Password@123` |
| Vendor 1 (ACME Supplies) | `vendor1@acmesupplies.com` | `Password@123` |
| Vendor 2 (Global Trade) | `vendor2@globaltrade.com` | `Password@123` |
| Vendor 3 (Swift IT) | `vendor3@swiftsolutions.com` | `Password@123` |

---

## Scripts

```bash
npm run dev          # Start dev server with nodemon
npm start            # Start production server
npm run db:init      # Run init.sql schema
npm run db:seed      # Run seed.sql data
npm run db:reset     # Drop + re-init + re-seed
npm test             # Run test suite
npm run lint         # Run ESLint
```

---

## Auto-generated Document Numbers

VendorBridge automatically generates unique identifiers for key entities:

| Entity | Format | Example |
|--------|--------|---------|
| Vendor | `VND-{3-digit sequential}` | `VND-001` |
| RFQ | `RFQ-{YYYY}-{3-digit sequential}` | `RFQ-2024-001` |
| Quotation | `QT-{YYYY}-{3-digit sequential}` | `QT-2024-001` |
| Purchase Order | `PO-{YYYY}-{3-digit sequential}` | `PO-2024-001` |
| Invoice | `INV-{YYYY}-{3-digit sequential}` | `INV-2024-001` |

---
