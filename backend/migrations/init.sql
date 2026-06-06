-- =============================================================
--  VendorBridge – Procurement & Vendor Management ERP
--  Database Initialization Script | PostgreSQL 14+
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────
CREATE TYPE user_role          AS ENUM ('admin', 'procurement_officer', 'manager', 'vendor');
CREATE TYPE user_status        AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE vendor_status      AS ENUM ('active', 'inactive', 'blacklisted', 'pending');
CREATE TYPE vendor_category    AS ENUM ('goods', 'services', 'both');
CREATE TYPE rfq_status         AS ENUM ('draft', 'published', 'closed', 'cancelled');
CREATE TYPE quotation_status   AS ENUM ('draft', 'submitted', 'accepted', 'rejected', 'expired');
CREATE TYPE approval_status    AS ENUM ('pending', 'approved', 'rejected', 'escalated');
CREATE TYPE po_status          AS ENUM ('draft', 'issued', 'acknowledged', 'completed', 'cancelled');
CREATE TYPE invoice_status     AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE notification_type  AS ENUM (
    'rfq_published', 'quotation_received', 'approval_required',
    'po_issued', 'invoice_generated', 'invoice_paid', 'general'
);
CREATE TYPE log_action         AS ENUM (
    'created', 'updated', 'deleted', 'submitted', 'approved',
    'rejected', 'sent', 'downloaded', 'printed', 'emailed'
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: users
-- ─────────────────────────────────────────────────────────────
CREATE TABLE users (
    id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(255) NOT NULL,
    phone         VARCHAR(20),
    role          user_role    NOT NULL DEFAULT 'procurement_officer',
    status        user_status  NOT NULL DEFAULT 'active',
    avatar_url    TEXT,
    last_login_at TIMESTAMPTZ,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: user_otps (FIXED: Supports Forgot Password Flow natively)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE user_otps (
    id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    email        VARCHAR(255) NOT NULL,
    otp          VARCHAR(6)   NOT NULL,
    reset_token  VARCHAR(255),
    expires_at   TIMESTAMPTZ  NOT NULL,
    is_used      BOOLEAN      DEFAULT FALSE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: sessions
-- ─────────────────────────────────────────────────────────────
CREATE TABLE sessions (
    id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      TEXT        NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: vendors
-- ─────────────────────────────────────────────────────────────
CREATE TABLE vendors (
    id               UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_code      VARCHAR(20)     NOT NULL UNIQUE,
    company_name     VARCHAR(255)    NOT NULL,
    category         vendor_category NOT NULL DEFAULT 'goods',
    status           vendor_status   NOT NULL DEFAULT 'pending',
    gst_number       VARCHAR(20)     UNIQUE,
    pan_number       VARCHAR(20),
    contact_person   VARCHAR(255),
    email            VARCHAR(255)    NOT NULL UNIQUE,
    phone            VARCHAR(20),
    alternate_phone  VARCHAR(20),
    website          TEXT,
    address_line1    TEXT,
    address_line2    TEXT,
    city             VARCHAR(100),
    state            VARCHAR(100),
    pincode          VARCHAR(10),
    country          VARCHAR(100)    NOT NULL DEFAULT 'India',
    bank_name        VARCHAR(255),
    bank_account_no  VARCHAR(50),
    bank_ifsc        VARCHAR(20),
    rating           NUMERIC(3,2)    NOT NULL DEFAULT 0.00 CHECK (rating BETWEEN 0 AND 5),
    notes            TEXT,
    registered_by    UUID            REFERENCES users(id) ON DELETE SET NULL,
    created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: vendor_user_accounts
-- ─────────────────────────────────────────────────────────────
CREATE TABLE vendor_user_accounts (
    id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id  UUID        NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (vendor_id, user_id)
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: rfqs
-- ─────────────────────────────────────────────────────────────
CREATE TABLE rfqs (
    id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfq_number       VARCHAR(30) NOT NULL UNIQUE,
    title            VARCHAR(255) NOT NULL,
    description      TEXT,
    status           rfq_status  NOT NULL DEFAULT 'draft',
    deadline         DATE        NOT NULL,
    delivery_terms   TEXT,
    payment_terms    TEXT,
    created_by       UUID        NOT NULL REFERENCES users(id),
    published_at     TIMESTAMPTZ,
    closed_at        TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: rfq_items
-- ─────────────────────────────────────────────────────────────
CREATE TABLE rfq_items (
    id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfq_id          UUID          NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    item_name       VARCHAR(255)  NOT NULL,
    description     TEXT,
    quantity        NUMERIC(12,2) NOT NULL CHECK (quantity > 0),
    unit            VARCHAR(50)   NOT NULL DEFAULT 'unit',
    specifications  TEXT,
    sort_order      INTEGER       NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: rfq_attachments
-- ─────────────────────────────────────────────────────────────
CREATE TABLE rfq_attachments (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfq_id      UUID         NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    file_name   VARCHAR(255) NOT NULL,
    file_url    TEXT         NOT NULL,
    file_size   INTEGER,
    mime_type   VARCHAR(100),
    uploaded_by UUID         REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: rfq_vendors
-- ─────────────────────────────────────────────────────────────
CREATE TABLE rfq_vendors (
    id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfq_id       UUID        NOT NULL REFERENCES rfqs(id)    ON DELETE CASCADE,
    vendor_id    UUID        NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    invited_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    UNIQUE (rfq_id, vendor_id)
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: quotations
-- ─────────────────────────────────────────────────────────────
CREATE TABLE quotations (
    id               UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_number VARCHAR(30)      NOT NULL UNIQUE,
    rfq_id           UUID             NOT NULL REFERENCES rfqs(id),
    vendor_id        UUID             NOT NULL REFERENCES vendors(id),
    status           quotation_status NOT NULL DEFAULT 'draft',
    delivery_days    INTEGER,
    delivery_date    DATE,
    validity_date    DATE,
    payment_terms    TEXT,
    notes            TEXT,
    subtotal         NUMERIC(14,2)    NOT NULL DEFAULT 0,
    tax_amount       NUMERIC(14,2)    NOT NULL DEFAULT 0,
    discount_amount  NUMERIC(14,2)    NOT NULL DEFAULT 0,
    total_amount     NUMERIC(14,2)    NOT NULL DEFAULT 0,
    submitted_at     TIMESTAMPTZ,
    created_at       TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    UNIQUE (rfq_id, vendor_id)
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: quotation_items
-- ─────────────────────────────────────────────────────────────
CREATE TABLE quotation_items (
    id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id      UUID          NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    rfq_item_id       UUID          REFERENCES rfq_items(id) ON DELETE SET NULL,
    item_name         VARCHAR(255)  NOT NULL,
    description       TEXT,
    quantity          NUMERIC(12,2) NOT NULL,
    unit              VARCHAR(50)   NOT NULL DEFAULT 'unit',
    unit_price        NUMERIC(14,2) NOT NULL,
    tax_rate          NUMERIC(5,2)  NOT NULL DEFAULT 0,
    tax_amount        NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_price       NUMERIC(14,2) NOT NULL,
    sort_order        INTEGER       NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: approvals
-- ─────────────────────────────────────────────────────────────
CREATE TABLE approvals (
    id            UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id  UUID            NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    approver_id   UUID            NOT NULL REFERENCES users(id),
    status        approval_status NOT NULL DEFAULT 'pending',
    remarks       TEXT,
    level         INTEGER         NOT NULL DEFAULT 1,
    approved_at   TIMESTAMPTZ,
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: purchase_orders
-- ─────────────────────────────────────────────────────────────
CREATE TABLE purchase_orders (
    id                   UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number            VARCHAR(30) NOT NULL UNIQUE,
    quotation_id         UUID      NOT NULL REFERENCES quotations(id),
    vendor_id            UUID      NOT NULL REFERENCES vendors(id),
    rfq_id               UUID      NOT NULL REFERENCES rfqs(id),
    status               po_status NOT NULL DEFAULT 'draft',
    delivery_date        DATE,
    billing_address      TEXT,
    shipping_address     TEXT,
    payment_terms        TEXT,
    terms_and_conditions TEXT,
    subtotal             NUMERIC(14,2) NOT NULL DEFAULT 0,
    tax_amount           NUMERIC(14,2) NOT NULL DEFAULT 0,
    discount_amount      NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_amount         NUMERIC(14,2) NOT NULL DEFAULT 0,
    issued_by            UUID      REFERENCES users(id) ON DELETE SET NULL,
    issued_at            TIMESTAMPTZ,
    acknowledged_at      TIMESTAMPTZ,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: po_items
-- ─────────────────────────────────────────────────────────────
CREATE TABLE po_items (
    id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id             UUID          NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    quotation_item_id UUID          REFERENCES quotation_items(id) ON DELETE SET NULL,
    item_name         VARCHAR(255)  NOT NULL,
    description       TEXT,
    quantity          NUMERIC(12,2) NOT NULL,
    unit              VARCHAR(50)   NOT NULL DEFAULT 'unit',
    unit_price        NUMERIC(14,2) NOT NULL,
    tax_rate          NUMERIC(5,2)  NOT NULL DEFAULT 0,
    tax_amount        NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_price       NUMERIC(14,2) NOT NULL,
    sort_order        INTEGER       NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: invoices
-- ─────────────────────────────────────────────────────────────
CREATE TABLE invoices (
    id              UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number  VARCHAR(30)    NOT NULL UNIQUE,
    po_id           UUID           NOT NULL REFERENCES purchase_orders(id),
    vendor_id       UUID           NOT NULL REFERENCES vendors(id),
    status          invoice_status NOT NULL DEFAULT 'draft',
    invoice_date    DATE           NOT NULL DEFAULT CURRENT_DATE,
    due_date        DATE,
    billing_address TEXT,
    notes           TEXT,
    subtotal        NUMERIC(14,2)  NOT NULL DEFAULT 0,
    tax_amount      NUMERIC(14,2)  NOT NULL DEFAULT 0,
    discount_amount NUMERIC(14,2)  NOT NULL DEFAULT 0,
    total_amount    NUMERIC(14,2)  NOT NULL DEFAULT 0,
    paid_amount     NUMERIC(14,2)  NOT NULL DEFAULT 0,
    pdf_url         TEXT,
    sent_at         TIMESTAMPTZ,
    paid_at         TIMESTAMPTZ,
    generated_by    UUID           REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: invoice_items
-- ─────────────────────────────────────────────────────────────
CREATE TABLE invoice_items (
    id           UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id   UUID          NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    po_item_id   UUID          REFERENCES po_items(id) ON DELETE SET NULL,
    item_name    VARCHAR(255)  NOT NULL,
    description  TEXT,
    quantity     NUMERIC(12,2) NOT NULL,
    unit         VARCHAR(50)   NOT NULL DEFAULT 'unit',
    unit_price   NUMERIC(14,2) NOT NULL,
    tax_rate     NUMERIC(5,2)  NOT NULL DEFAULT 0,
    tax_amount   NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_price  NUMERIC(14,2) NOT NULL,
    sort_order   INTEGER       NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: invoice_email_logs
-- ─────────────────────────────────────────────────────────────
CREATE TABLE invoice_email_logs (
    id         UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID         NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    sent_to    VARCHAR(255) NOT NULL,
    sent_by    UUID         REFERENCES users(id) ON DELETE SET NULL,
    subject    VARCHAR(255),
    body       TEXT,
    status     VARCHAR(50)  NOT NULL DEFAULT 'sent',
    sent_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: notifications
-- ─────────────────────────────────────────────────────────────
CREATE TABLE notifications (
    id          UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        notification_type NOT NULL,
    title       VARCHAR(255)      NOT NULL,
    message     TEXT,
    entity_type VARCHAR(50),
    entity_id   UUID,
    is_read     BOOLEAN           NOT NULL DEFAULT FALSE,
    read_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: activity_logs
-- ─────────────────────────────────────────────────────────────
CREATE TABLE activity_logs (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID        REFERENCES users(id) ON DELETE SET NULL,
    action      log_action  NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id   UUID,
    description TEXT        NOT NULL,
    metadata    JSONB,
    ip_address  VARCHAR(45),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────
CREATE INDEX idx_users_email              ON users(email);
CREATE INDEX idx_users_role               ON users(role);
CREATE INDEX idx_user_otps_email          ON user_otps(email);
CREATE INDEX idx_vendors_status           ON vendors(status);
CREATE INDEX idx_vendors_category         ON vendors(category);
CREATE INDEX idx_rfqs_status              ON rfqs(status);
CREATE INDEX idx_rfqs_created_by          ON rfqs(created_by);
CREATE INDEX idx_rfqs_deadline            ON rfqs(deadline);
CREATE INDEX idx_rfq_vendors_rfq          ON rfq_vendors(rfq_id);
CREATE INDEX idx_rfq_vendors_vendor       ON rfq_vendors(vendor_id);
CREATE INDEX idx_quotations_rfq           ON quotations(rfq_id);
CREATE INDEX idx_quotations_vendor        ON quotations(vendor_id);
CREATE INDEX idx_quotations_status        ON quotations(status);
CREATE INDEX idx_approvals_quotation      ON approvals(quotation_id);
CREATE INDEX idx_approvals_approver       ON approvals(approver_id);
CREATE INDEX idx_approvals_status         ON approvals(status);
CREATE INDEX idx_purchase_orders_vendor   ON purchase_orders(vendor_id);
CREATE INDEX idx_purchase_orders_status   ON purchase_orders(status);
CREATE INDEX idx_invoices_po              ON invoices(po_id);
CREATE INDEX idx_invoices_vendor          ON invoices(vendor_id);
CREATE INDEX idx_invoices_status          ON invoices(status);
CREATE INDEX idx_notifications_user       ON notifications(user_id);
CREATE INDEX idx_notifications_unread     ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX idx_activity_logs_user       ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity     ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created     ON activity_logs(created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- AUTO-UPDATE TRIGGER FUNCTION
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_rfqs_updated_at BEFORE UPDATE ON rfqs FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_quotations_updated_at BEFORE UPDATE ON quotations FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_approvals_updated_at BEFORE UPDATE ON approvals FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();