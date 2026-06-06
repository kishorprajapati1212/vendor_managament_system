const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const runMigrations = async () => {
  try {
    console.log('⏳ Starting fresh database configuration setup...');

    // 1. Drop all tables in cascade to prevent relation conflicts
    const dropTablesQuery = `
      DROP TABLE IF EXISTS activity_logs CASCADE;
      DROP TABLE IF EXISTS notifications CASCADE;
      DROP TABLE IF EXISTS invoice_email_logs CASCADE;
      DROP TABLE IF EXISTS invoice_items CASCADE;
      DROP TABLE IF EXISTS invoices CASCADE;
      DROP TABLE IF EXISTS po_items CASCADE;
      DROP TABLE IF EXISTS purchase_orders CASCADE;
      DROP TABLE IF EXISTS approvals CASCADE;
      DROP TABLE IF EXISTS quotation_items CASCADE;
      DROP TABLE IF EXISTS quotations CASCADE;
      DROP TABLE IF EXISTS rfq_vendors CASCADE;
      DROP TABLE IF EXISTS rfq_attachments CASCADE;
      DROP TABLE IF EXISTS rfq_items CASCADE;
      DROP TABLE IF EXISTS rfqs CASCADE;
      DROP TABLE IF EXISTS vendor_user_accounts CASCADE;
      DROP TABLE IF EXISTS vendors CASCADE;
      DROP TABLE IF EXISTS sessions CASCADE;
      DROP TABLE IF EXISTS user_otps CASCADE;
      DROP TABLE IF EXISTS password_reset_tokens CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TYPE IF EXISTS user_role CASCADE;
      DROP TYPE IF EXISTS user_status CASCADE;
      DROP TYPE IF EXISTS vendor_status CASCADE;
      DROP TYPE IF EXISTS vendor_category CASCADE;
      DROP TYPE IF EXISTS rfq_status CASCADE;
      DROP TYPE IF EXISTS quotation_status CASCADE;
      DROP TYPE IF EXISTS approval_status CASCADE;
      DROP TYPE IF EXISTS po_status CASCADE;
      DROP TYPE IF EXISTS invoice_status CASCADE;
      DROP TYPE IF EXISTS notification_type CASCADE;
      DROP TYPE IF EXISTS log_action CASCADE;
    `;
    
    await pool.query(dropTablesQuery);
    console.log('🗑️  Old relations and enums dropped clean.');

    // 2. Read and run schema migrations
    const initSqlPath = path.join(__dirname, '../migrations/init.sql');
    const initSql = fs.readFileSync(initSqlPath, 'utf8');
    await pool.query(initSql);
    console.log('✅ Migrations executed: Tables created successfully.');

    // 3. Read and run seed data
    const seedSqlPath = path.join(__dirname, '../migrations/seed.sql');
    const seedSql = fs.readFileSync(seedSqlPath, 'utf8');
    await pool.query(seedSql);
    console.log('✅ Seeders executed: Mock data inserted.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database migration/seed failed:', error.message);
    process.exit(1);
  }
};

runMigrations();