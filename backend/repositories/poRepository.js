const pool = require('../config/db');

class PoRepository {
  // GET /purchase-orders
  async findAll({ status, vendor_id, page = 1, limit = 20, userId, userRole }) {
    const offset = (page - 1) * limit;
    let baseQuery = `
      SELECT po.id, po.po_number, po.status, po.total_amount, po.delivery_date, po.created_at,
             v.id as vendor_id, v.company_name as vendor_name
      FROM purchase_orders po
      INNER JOIN vendors v ON po.vendor_id = v.id
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) FROM purchase_orders po WHERE 1=1';
    const queryParams = [];
    let paramIndex = 1;

    if (status) {
      baseQuery += ` AND po.status = $${paramIndex}`;
      countQuery += ` AND po.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (vendor_id) {
      baseQuery += ` AND po.vendor_id = $${paramIndex}`;
      countQuery += ` AND po.vendor_id = $${paramIndex}`;
      queryParams.push(vendor_id);
      paramIndex++;
    }

    // Role Security Interceptor: Vendors only view their own corporate records [cite: 127]
    if (userRole === 'vendor') {
      baseQuery += ` AND po.vendor_id = (SELECT vendor_id FROM vendor_user_accounts WHERE user_id = $${paramIndex} LIMIT 1)`;
      countQuery += ` AND po.vendor_id = (SELECT vendor_id FROM vendor_user_accounts WHERE user_id = $${paramIndex} LIMIT 1)`;
      queryParams.push(userId);
      paramIndex++;
    }

    baseQuery += ` ORDER BY po.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;

    const totalRes = await pool.query(countQuery, queryParams.slice(0, paramIndex - 1));
    const total = parseInt(totalRes.rows[0].count);

    const dataRes = await pool.query(baseQuery, [...queryParams, limit, offset]);

    return { purchaseOrders: dataRes.rows, total };
  }

  // Auto-generate sequential numbers tracking calendar years 
  async generatePoNumber() {
    const currentYear = new Date().getFullYear();
    const res = await pool.query("SELECT COUNT(*) FROM purchase_orders WHERE po_number LIKE $1", [`PO-${currentYear}-%`]);
    const nextSequence = parseInt(res.rows[0].count) + 1;
    return `PO-${currentYear}-${String(nextSequence).padStart(3, '0')}`;
  }

  // POST /purchase-orders (Clones structural lines safely from approved quotes)
  async createFromQuotation(poData, creatorId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Fetch source approved quotation metadata 
      const qQuery = 'SELECT * FROM quotations WHERE id = $1 AND status = \'accepted\'';
      const qRes = await client.query(qQuery, [poData.quotation_id]);
      if (qRes.rows.length === 0) {
        throw new Error('Process Mismatch: Target quotation must be formally accepted and approved before PO issuance.');
      }
      const quotation = qRes.rows[0];

      // 2. Generate new structural PO code 
      const poNumber = await this.generatePoNumber();

      // 3. Insert base purchase order root record 
      const insertPoQuery = `
        INSERT INTO purchase_orders (
          po_number, quotation_id, vendor_id, rfq_id, status, delivery_date,
          billing_address, shipping_address, payment_terms, terms_and_conditions,
          subtotal, tax_amount, discount_amount, total_amount, issued_by
        ) VALUES ($1, $2, $3, $4, 'draft', $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id, po_number, status, total_amount;
      `;
      const poRes = await client.query(insertPoQuery, [
        poNumber, quotation.id, quotation.vendor_id, quotation.rfq_id,
        poData.delivery_date, poData.billing_address, poData.shipping_address,
        quotation.payment_terms, poData.terms_and_conditions || null,
        quotation.subtotal, quotation.tax_amount, quotation.discount_amount, quotation.total_amount,
        creatorId
      ]);
      const newPo = poRes.rows[0];

      // 4. Clone itemized line rows automatically from quotation_items
      const cloneItemsQuery = `
        INSERT INTO po_items (po_id, quotation_item_id, item_name, description, quantity, unit, unit_price, tax_rate, tax_amount, total_price, sort_order)
        SELECT $1, id, item_name, description, quantity, unit, unit_price, tax_rate, tax_amount, total_price, sort_order
        FROM quotation_items
        WHERE quotation_id = $2;
      `;
      await client.query(cloneItemsQuery, [newPo.id, quotation.id]);

      await client.query('COMMIT');
      return newPo;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // GET /purchase-orders/:id
  async findById(id) {
    // Fetch PO base details with vendor properties context
    const poQuery = `
      SELECT po.*, v.company_name as vendor_name, v.email as vendor_email, v.phone as vendor_phone,
             i.id as linked_invoice_id, i.invoice_number as linked_invoice_code, i.status as invoice_status
      FROM purchase_orders po
      INNER JOIN vendors v ON po.vendor_id = v.id
      LEFT JOIN invoices i ON i.po_id = po.id
      WHERE po.id = $1
    `;
    const poRes = await pool.query(poQuery, [id]);
    if (poRes.rows.length === 0) return null;
    const po = poRes.rows[0];

    // Fetch child lines
    const itemsRes = await pool.query('SELECT * FROM po_items WHERE po_id = $1 ORDER BY sort_order ASC', [id]);
    po.items = itemsRes.rows;

    return po;
  }

  // PATCH /purchase-orders/:id/issue
  async issueToVendor(id) {
    const updatedTime = new Date();
    const query = 'UPDATE purchase_orders SET status = \'issued\', issued_at = $1 WHERE id = $2 RETURNING status, issued_at;';
    const result = await pool.query(query, [updatedTime, id]);
    return result.rows[0];
  }
}

module.exports = new PoRepository();