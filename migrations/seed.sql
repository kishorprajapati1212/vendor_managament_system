

TRUNCATE TABLE users CASCADE;

-- Password encrypted via bcrypt corresponds to plain text: "Password@123"
INSERT INTO users (email, password_hash, full_name, role, status) VALUES
('admin@vendorbridge.com', '$2a$10$OsGRubnOAi4qLHgVdrxhJukY50pfsLKp2OcBHfCJf.bpUmwKv6pBi', 'Super Admin', 'admin', 'active'),
('officer@vendorbridge.com', '$2a$10$OsGRubnOAi4qLHgVdrxhJukY50pfsLKp2OcBHfCJf.bpUmwKv6pBi', 'Riya Sharma', 'procurement_officer', 'active'),
('manager@vendorbridge.com', '$2a$10$OsGRubnOAi4qLHgVdrxhJukY50pfsLKp2OcBHfCJf.bpUmwKv6pBi', 'Anjali Sharma', 'manager', 'active'),
('kjhgfdsa1014@gmail.com', '$2a$10$tNO.29Odn6rt0r9beqf.we.eh/tf8MaKklvMX9tTV8kx7CQ4D0Msm', 'Acme Corporate Account', 'vendor', 'active');

-- Seed a test vendor entity record
INSERT INTO vendors (vendor_code, company_name, category, status, gst_number, email, phone, contact_person) VALUES
('VEND-001', 'Acme Industrial Supplies', 'goods', 'active', '22AAAAA1111A1Z1', 'vendor@acme.com', '9876543210', 'John Doe');

-- Map vendor user log in to vendor database metadata record
INSERT INTO vendor_user_accounts (vendor_id, user_id) 
SELECT v.id, u.id FROM vendors v, users u WHERE v.email = 'vendor@acme.com' AND u.email = 'vendor@acme.com';