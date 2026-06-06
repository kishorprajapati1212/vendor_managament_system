# VendorBridge — Procurement & Vendor Management ERP

VendorBridge is an enterprise-grade Procurement and Request For Quotation (RFQ) ERP system built to streamline corporate supply chains. It manages vendors, RFQs, indexing order quotations, manager approvals, purchase orders, and itemized invoice processing.

---

## 🏗️ Core System Data Flow & State Lineage

To prevent multi-role constraint errors during testing, data must progress through the tracking modules in this specific order:



1. **Procurement Officer** creates an RFQ (using simple vendor codes like `["VEND-001"]`).
2. **Vendor** submits a Quotation matching line items by array index positions (`"rfq_item_id": "0"`).
3. **Procurement Officer** evaluates the side-by-side matrix and accepts a target bid.
4. **Manager** acts on the pending approval record to authorize the procurement selection.
5. **Procurement Officer** generates a Purchase Order, issues it, and creates the final Invoice.

---

## 🛑 Critical Cloud Storage Notice

> [!CAUTION]
> **⚠️ TEMPORARY STAGING DATABASE ENVIRONMENT:**
> This repository is pre-configured to point directly to a live, shared cloud database instance. **This entire data cluster and its schema assets will be permanently destroyed and deleted immediately after the hackathon virtual round results are declared.**

---

## Prerequisites

- **Node.js**: v18+
- **Docker / Docker Compose** *(Optional, for containerized execution)*
- **npm**

---

## Setup & Execution Strategy 1: Local Terminal Launch

### 1. Clone the Repository
```bash
git clone https://github.com/kishorprajapati1212/vendor_managament_system.git
cd vendor_managament_system
```


### 2. Configure backend

```bash
cd backend
cp .env.example .env
```

Open `.env` and fill in:

```env
PORT=5000
DATABASE_URL=postgresql://neondb_owner:npg_zCry8DfXP2Vj@ep-odd-frog-ab54nkqt-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=hackathon_super_jwt_secret_key_2026
RESEND_API_KEY=re_your_secret_integration_key
EMAIL_USER=your_gmail_username@gmail.com
EMAIL_PASS=your_gmail_app_restricted_password
```

### 3. Install & start backend

```bash
npm install
npm run db:fresh
npm start
```

Backend runs at `http://localhost:5000`

### 4. Configure frontend

```bash
cd ../frontend
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:5000/api/v1
```

### 5. Install & start frontend

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@vendorbridge.com` | `Password@123` |
| Procurement Officer | `officer@vendorbridge.com` | `Password@123` |
| Manager | `manager@vendorbridge.com` | `Password@123` |
| Vendor | `kjhgfdsa1014@gmail.com` | `password` |

# 🌐 Live Workspace Deployment

You can test and interact with the live running deployment environment using the application endpoint below:

👉 **Live Server Application Endpoint**  
`https://vendermangement.netlify.app/`

---
