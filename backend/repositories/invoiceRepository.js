const pool = require('../config/db');

class InvoiceRepository {
  // GET /invoices
  async findAll({ status, vendor_id, page = 1, limit = 20, userId, userRole }) {
    const offset = (page - 1) * limit;
    let baseQuery = `
      SELECT i.id, i.invoice_number, i.status, i.total_amount, i.invoice_date, i.due_date,
             po.id as po_id, po.po_number,
             v.id as vendor_id, v.company_name as vendor_name
      FROM invoices i
      INNER JOIN purchase_orders po ON i.po_id = po.id
      INNER JOIN vendors v ON i.vendor_id = v.id
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) FROM invoices i WHERE 1=1';
    const queryParams = [];
    let paramIndex = 1;

    if (status) {
      baseQuery += ` AND i.status = $${paramIndex}`;
      countQuery += ` AND i.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (vendor_id) {
      baseQuery += ` AND i.vendor_id = $${paramIndex}`;
      countQuery += ` AND i.vendor_id = $${paramIndex}`;
      queryParams.push(vendor_id);
      paramIndex++;
    }

    // Role Security: Vendors only see their own corporate invoices
    if (userRole === 'vendor') {
      baseQuery += ` AND i.vendor_id = (SELECT vendor_id FROM vendor_user_accounts WHERE user_id = $${paramIndex} LIMIT 1)`;
      countQuery += ` AND i.vendor_id = (SELECT vendor_id FROM vendor_user_accounts WHERE user_id = $${paramIndex} LIMIT 1)`;
      queryParams.push(userId);
      paramIndex++;
    }

    baseQuery += ` ORDER BY i.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;

    const totalRes = await pool.query(countQuery, queryParams.slice(0, paramIndex - 1));
    const total = parseInt(totalRes.rows[0].count);

    const dataRes = await pool.query(baseQuery, [...queryParams, limit, offset]);
    return { invoices: dataRes.rows, total };
  }

  // Generate sequence numbers tracking current calendar years
  async generateInvoiceNumber() {
    const currentYear = new Date().getFullYear();
    const res = await pool.query("SELECT COUNT(*) FROM invoices WHERE invoice_number LIKE $1", [`INV-${currentYear}-%`]);
    const nextSequence = parseInt(res.rows[0].count) + 1;
    return `INV-${currentYear}-${String(nextSequence).padStart(3, '0')}`;
  }

  // POST /invoices (Clones data from active issued PO records)
  async createFromPo(invoiceData, creatorId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Fetch source PO metadata
      const poQuery = "SELECT * FROM purchase_orders WHERE id = $1 AND status = 'issued'";
      const poRes = await client.query(poQuery, [invoiceData.po_id]);
      if (poRes.rows.length === 0) {
        throw new Error('Process Mismatch: Invoices can only be generated from Purchase Orders that are explicitly in an "issued" state.');
      }
      const po = poRes.rows[0];

      // 2. Generate clean tracking sequence code
      const invoiceNumber = await this.generateInvoiceNumber();

      // 3. Insert base invoice root record
      const insertInvoiceQuery = `
        INSERT INTO invoices (
          invoice_number, po_id, vendor_id, status, invoice_date, due_date,
          billing_address, notes, subtotal, tax_amount, discount_amount, total_amount, generated_by
        ) VALUES ($1, $2, $3, 'draft', $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, invoice_number, status, total_amount;
      `;
      const invRes = await client.query(insertInvoiceQuery, [
        invoiceNumber, po.id, po.vendor_id, invoiceData.invoice_date, invoiceData.due_date,
        invoiceData.billing_address, invoiceData.notes || null,
        po.subtotal, po.tax_amount, po.discount_amount, po.total_amount, creatorId
      ]);
      const newInvoice = invRes.rows[0];

      // 4. Clone itemized line structures automatically from po_items
      const cloneItemsQuery = `
        INSERT INTO invoice_items (invoice_id, po_item_id, item_name, description, quantity, unit, unit_price, tax_rate, tax_amount, total_price, sort_order)
        SELECT $1, id, item_name, description, quantity, unit, unit_price, tax_rate, tax_amount, total_price, sort_order
        FROM po_items
        WHERE po_id = $2;
      `;
      await client.query(cloneItemsQuery, [newInvoice.id, po.id]);

      await client.query('COMMIT');
      return newInvoice;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // GET /invoices/:id
  async findById(id) {
    const invQuery = `
      SELECT i.*, po.po_number, v.company_name as vendor_name, v.email as vendor_email
      FROM invoices i
      INNER JOIN purchase_orders po ON i.po_id = po.id
      INNER JOIN vendors v ON i.vendor_id = v.id
      WHERE i.id = $1
    `;
    const invRes = await pool.query(invQuery, [id]);
    if (invRes.rows.length === 0) return null;
    const invoice = invRes.rows[0];

    const itemsRes = await pool.query('SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY sort_order ASC', [id]);
    invoice.items = itemsRes.rows;

    return invoice;
  }

  // Update PDF location string parameters
  async updatePdfUrl(id, url) {
    await pool.query('UPDATE invoices SET pdf_url = $1 WHERE id = $2', [url, id]);
  }

  // Log email deliveries
  async logEmailDelivery(invoiceId, sentTo, sentBy, subject, body) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query("UPDATE invoices SET status = 'sent', sent_at = NOW() WHERE id = $1", [invoiceId]);
      
      const logQuery = `
        INSERT INTO invoice_email_logs (invoice_id, sent_to, sent_by, subject, body, status)
        VALUES ($1, $2, $3, $4, $5, 'sent');
      `;
      await client.query(logQuery, [invoiceId, sentTo, sentBy, subject, body]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // PATCH /invoices/:id/mark-paid
  async markAsPaid(id, paidAmount, paidAt) {
    const query = `
      UPDATE invoices
      SET status = 'paid', paid_amount = $1, paid_at = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *;
    `;
    const result = await pool.query(query, [paidAmount, paidAt || new Date(), id]);
    return result.rows[0];
  }
}

module.exports = new InvoiceRepository();