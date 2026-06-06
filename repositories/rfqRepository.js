const pool = require('../config/db');

class RfqRepository {
  // GET /rfqs (With nested item and quotation aggregations)
  async findAll({ status, search, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    let baseQuery = `
      SELECT r.id, r.rfq_number, r.title, r.status, r.deadline, r.created_at,
             u.id as user_id, u.full_name as user_full_name,
             (SELECT COUNT(*) FROM rfq_vendors rv WHERE rv.rfq_id = r.id) as vendor_count,
             (SELECT COUNT(*) FROM quotations q WHERE q.rfq_id = r.id) as quotation_count
      FROM rfqs r
      INNER JOIN users u ON r.created_by = u.id
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) FROM rfqs r WHERE 1=1';
    const queryParams = [];
    let paramIndex = 1;

    if (status) {
      baseQuery += ` AND r.status = $${paramIndex}`;
      countQuery += ` AND r.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (search) {
      baseQuery += ` AND (r.title ILIKE $${paramIndex} OR r.rfq_number ILIKE $${paramIndex})`;
      countQuery += ` AND (r.title ILIKE $${paramIndex} OR r.rfq_number ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    baseQuery += ` ORDER BY r.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;

    const totalRes = await pool.query(countQuery, queryParams.slice(0, paramIndex - 1));
    const total = parseInt(totalRes.rows[0].count);

    const paginatedParams = [...queryParams, limit, offset];
    const dataRes = await pool.query(baseQuery, paginatedParams);

    // Format output to match documentation specifications exactly
    const rfqs = dataRes.rows.map(row => ({
      id: row.id,
      rfq_number: row.rfq_number,
      title: row.title,
      status: row.status,
      deadline: row.deadline,
      vendor_count: parseInt(row.vendor_count),
      quotation_count: parseInt(row.quotation_count),
      created_by: { id: row.user_id, full_name: row.user_full_name },
      created_at: row.created_at
    }));

    return { rfqs, total };
  }

  // Generate sequence code tracking current calendar year
  async generateRfqNumber() {
    const currentYear = new Date().getFullYear();
    const res = await pool.query("SELECT COUNT(*) FROM rfqs WHERE rfq_number LIKE $1", [`RFQ-${currentYear}-%`]);
    const nextSequence = parseInt(res.rows[0].count) + 1;
    return `RFQ-${currentYear}-${String(nextSequence).padStart(3, '0')}`;
  }

  // POST /rfqs (Secure Nested Transaction Core Execution)
  async create(rfqData, creatorId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const rfqNumber = await this.generateRfqNumber();
      
      // 1. Insert Base RFQ Root Entry
      const rfqInsertQuery = `
        INSERT INTO rfqs (rfq_number, title, description, deadline, delivery_terms, payment_terms, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
      `;
      const rfqRes = await client.query(rfqInsertQuery, [
        rfqNumber, rfqData.title, rfqData.description || null, 
        rfqData.deadline, rfqData.delivery_terms || null, rfqData.payment_terms || null, creatorId
      ]);
      const newRfq = rfqRes.rows[0];

      // 2. Insert Nested Sub-Item Lines
      if (rfqData.items && rfqData.items.length > 0) {
        const itemInsertQuery = `
          INSERT INTO rfq_items (rfq_id, item_name, quantity, unit, specifications, sort_order)
          VALUES ($1, $2, $3, $4, $5, $6);
        `;
        for (let i = 0; i < rfqData.items.length; i++) {
          const item = rfqData.items[i];
          await client.query(itemInsertQuery, [newRfq.id, item.item_name, item.quantity, item.unit || 'unit', item.specifications || null, i]);
        }
      }

      // 3. Invite Associated Vendors
      if (rfqData.vendor_ids && rfqData.vendor_ids.length > 0) {
        const vendorInsertQuery = 'INSERT INTO rfq_vendors (rfq_id, vendor_id) VALUES ($1, $2);';
        for (const vendorId of rfqData.vendor_ids) {
          await client.query(vendorInsertQuery, [newRfq.id, vendorId]);
        }
      }

      await client.query('COMMIT');
      return newRfq;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // GET /rfqs/:id (Fetches full unified aggregate composition detail tree)
  async findById(id) {
    // Base object
    const rfqRes = await pool.query('SELECT * FROM rfqs WHERE id = $1', [id]);
    if (rfqRes.rows.length === 0) return null;
    const rfq = rfqRes.rows[0];

    // Sub-item records
    const itemsRes = await pool.query('SELECT id, item_name, quantity, unit, specifications FROM rfq_items WHERE rfq_id = $1 ORDER BY sort_order ASC', [id]);
    rfq.items = itemsRes.rows;

    // Attachments tracking lists
    const attachRes = await pool.query('SELECT id, file_name, file_url, file_size, mime_type FROM rfq_attachments WHERE rfq_id = $1', [id]);
    rfq.attachments = attachRes.rows;

    // Invited vendor properties details mapping
    const vendorRes = await pool.query(`
      SELECT v.id, v.vendor_code, v.company_name, v.email, rv.invited_at, rv.responded_at
      FROM vendors v
      INNER JOIN rfq_vendors rv ON v.id = rv.vendor_id
      WHERE rv.rfq_id = $1
    `, [id]);
    rfq.invited_vendors = vendorRes.rows;

    return rfq;
  }

  // PUT /rfqs/:id (Atomic Update transaction override blocks)
  async update(id, rfqData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const updateQuery = `
        UPDATE rfqs SET 
          title = $1, description = $2, deadline = $3, delivery_terms = $4, payment_terms = $5
        WHERE id = $6 RETURNING *;
      `;
      const res = await client.query(updateQuery, [rfqData.title, rfqData.description || null, rfqData.deadline, rfqData.delivery_terms || null, rfqData.payment_terms || null, id]);
      const updatedRfq = res.rows[0];

      // Re-align line item sets simply by cleaning past data entries inside transaction boundary
      await client.query('DELETE FROM rfq_items WHERE rfq_id = $1', [id]);
      if (rfqData.items && rfqData.items.length > 0) {
        const itemInsertQuery = 'INSERT INTO rfq_items (rfq_id, item_name, quantity, unit, specifications, sort_order) VALUES ($1, $2, $3, $4, $5, $6);';
        for (let i = 0; i < rfqData.items.length; i++) {
          const item = rfqData.items[i];
          await client.query(itemInsertQuery, [id, item.item_name, item.quantity, item.unit || 'unit', item.specifications || null, i]);
        }
      }

      await client.query('COMMIT');
      return updatedRfq;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // PATCH /rfqs/:id/publish
  async publish(id) {
    const query = "UPDATE rfqs SET status = 'published', published_at = NOW() WHERE id = $1 RETURNING status, rfq_number;";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Attachments Database Storage Mapping Actions
  async addAttachment(rfqId, file) {
    const query = `
      INSERT INTO rfq_attachments (rfq_id, file_name, file_url, file_size, mime_type)
      VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `;
    const result = await pool.query(query, [rfqId, file.originalname, file.path || file.url, file.size || null, file.mimetype || null]);
    return result.rows[0];
  }

  async deleteAttachment(rfqId, attachmentId) {
    const query = 'DELETE FROM rfq_attachments WHERE rfq_id = $1 AND id = $2 RETURNING id;';
    const result = await pool.query(query, [rfqId, attachmentId]);
    return result.rows[0];
  }
}

module.exports = new RfqRepository();