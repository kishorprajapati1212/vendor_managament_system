const pool = require('../config/db');

class QuotationRepository {
  // GET /rfqs/:rfqId/quotations
  async findByRfqId(rfqId) {
    const query = `
      SELECT q.id, q.quotation_number, q.status, q.delivery_days, 
             q.subtotal, q.tax_amount, q.total_amount, q.submitted_at,
             v.id as vendor_id, v.company_name as vendor_company_name, v.rating as vendor_rating
      FROM quotations q
      INNER JOIN vendors v ON q.vendor_id = v.id
      WHERE q.rfq_id = $1
      ORDER BY q.total_amount ASC;
    `;
    const result = await pool.query(query, [rfqId]);

    // Formats payload exactly to documentation specs
    return result.rows.map(row => ({
      id: row.id,
      quotation_number: row.quotation_number,
      status: row.status,
      delivery_days: row.delivery_days,
      subtotal: parseFloat(row.subtotal),
      tax_amount: parseFloat(row.tax_amount),
      total_amount: parseFloat(row.total_amount),
      submitted_at: row.submitted_at,
      vendor: {
        id: row.vendor_id,
        company_name: row.vendor_company_name,
        rating: parseFloat(row.vendor_rating)
      }
    }));
  }

  // Find single quotation profile with line items
  async findById(id) {
    const query = 'SELECT * FROM quotations WHERE id = $1';
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return null;
    
    const quotation = result.rows[0];
    const itemsQuery = 'SELECT * FROM quotation_items WHERE quotation_id = $1 ORDER BY sort_order ASC';
    const itemsResult = await pool.query(itemsQuery, [id]);
    
    quotation.items = itemsResult.rows;
    return quotation;
  }

  // Automatically maps logged-in user account UUID to their vendor entity identity record
  async findVendorIdByUserId(userId) {
    const query = 'SELECT vendor_id FROM vendor_user_accounts WHERE user_id = $1 LIMIT 1;';
    const result = await pool.query(query, [userId]);
    return result.rows[0]?.vendor_id || null;
  }

  // Generate sequence tracking numbers (e.g. QT-2026-001)
  async generateQuotationNumber() {
    const currentYear = new Date().getFullYear();
    const res = await pool.query("SELECT COUNT(*) FROM quotations WHERE quotation_number LIKE $1", [`QT-${currentYear}-%`]);
    const nextSequence = parseInt(res.rows[0].count) + 1;
    return `QT-${currentYear}-${String(nextSequence).padStart(3, '0')}`;
  }

  // POST /rfqs/:rfqId/quotations (Atomic Multi-Item Financial Transaction Core)
  async create(rfqId, vendorId, quotationData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const quotationNumber = await this.generateQuotationNumber();
      
      // 1. Math engine: Iterate over array lines to pre-calculate total sums accurately on server
      let subtotal = 0;
      let totalTaxAmount = 0;
      const processedItems = [];

      for (let i = 0; i < quotationData.items.length; i++) {
        const item = quotationData.items[i];
        const qty = parseFloat(item.quantity);
        const price = parseFloat(item.unit_price);
        const taxRate = parseFloat(item.tax_rate || 0);

        const lineSubtotal = qty * price;
        const lineTaxAmount = lineSubtotal * (taxRate / 100);
        const lineTotalPrice = lineSubtotal + lineTaxAmount;

        subtotal += lineSubtotal;
        totalTaxAmount += lineTaxAmount;

        processedItems.push({
          ...item,
          lineSubtotal,
          lineTaxAmount,
          lineTotalPrice,
          sort_order: i
        });
      }

      const totalAmount = subtotal + totalTaxAmount;

      // 2. Insert root quotation profile entry
      const insertQuotationQuery = `
        INSERT INTO quotations (
          quotation_number, rfq_id, vendor_id, status, delivery_days, 
          validity_date, payment_terms, notes, subtotal, tax_amount, total_amount
        ) VALUES ($1, $2, $3, 'draft', $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, quotation_number, status;
      `;
      const qRes = await client.query(insertQuotationQuery, [
        quotationNumber, rfqId, vendorId, quotationData.delivery_days,
        quotationData.validity_date, quotationData.payment_terms || null, quotationData.notes || null,
        subtotal, totalTaxAmount, totalAmount
      ]);
      const newQuotation = qRes.rows[0];

      // 3. Insert individual item records linked via foreign key
      const insertItemQuery = `
        INSERT INTO quotation_items (
          quotation_id, rfq_item_id, item_name, description, 
          quantity, unit, unit_price, tax_rate, tax_amount, total_price, sort_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
      `;
      for (const item of processedItems) {
        await client.query(insertItemQuery, [
          newQuotation.id, item.rfq_item_id || null, item.item_name, item.description || null,
          item.quantity, item.unit || 'unit', item.unit_price, item.tax_rate || 0,
          item.lineTaxAmount, item.lineTotalPrice, item.sort_order
        ]);
      }

      await client.query('COMMIT');
      return newQuotation;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // PUT /quotations/:id
  async update(id, quotationData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let subtotal = 0;
      let totalTaxAmount = 0;
      const processedItems = [];

      for (let i = 0; i < quotationData.items.length; i++) {
        const item = quotationData.items[i];
        const qty = parseFloat(item.quantity);
        const price = parseFloat(item.unit_price);
        const taxRate = parseFloat(item.tax_rate || 0);

        const lineSubtotal = qty * price;
        const lineTaxAmount = lineSubtotal * (taxRate / 100);
        const lineTotalPrice = lineSubtotal + lineTaxAmount;

        subtotal += lineSubtotal;
        totalTaxAmount += lineTaxAmount;

        processedItems.push({ ...item, lineTaxAmount, lineTotalPrice, sort_order: i });
      }

      const totalAmount = subtotal + totalTaxAmount;

      const updateQuery = `
        UPDATE quotations SET
          delivery_days = $1, validity_date = $2, payment_terms = $3, notes = $4,
          subtotal = $5, tax_amount = $6, total_amount = $7
        WHERE id = $8 RETURNING *;
      `;
      const qRes = await client.query(updateQuery, [
        quotationData.delivery_days, quotationData.validity_date, quotationData.payment_terms || null,
        quotationData.notes || null, subtotal, totalTaxAmount, totalAmount, id
      ]);

      // Refresh item rows
      await client.query('DELETE FROM quotation_items WHERE quotation_id = $1', [id]);
      const insertItemQuery = `
        INSERT INTO quotation_items (
          quotation_id, rfq_item_id, item_name, description, 
          quantity, unit, unit_price, tax_rate, tax_amount, total_price, sort_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
      `;
      for (const item of processedItems) {
        await client.query(insertItemQuery, [
          id, item.rfq_item_id || null, item.item_name, item.description || null,
          item.quantity, item.unit || 'unit', item.unit_price, item.tax_rate || 0,
          item.lineTaxAmount, item.lineTotalPrice, item.sort_order
        ]);
      }

      await client.query('COMMIT');
      return qRes.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // PATCH /quotations/:id/submit
  async submitForReview(id, rfqId, vendorId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update quotation profile status
      await client.query("UPDATE quotations SET status = 'submitted', submitted_at = NOW() WHERE id = $1", [id]);

      // Update dynamic link state tracking inside invited vendor table block
      await client.query("UPDATE rfq_vendors SET responded_at = NOW() WHERE rfq_id = $1 AND vendor_id = $2", [rfqId, vendorId]);

      await client.query('COMMIT');
      return { status: 'submitted' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new QuotationRepository();