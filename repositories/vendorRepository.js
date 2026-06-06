const pool = require('../config/db');

class VendorRepository {
  // GET /vendors (Dynamic Filter, Search, and Pagination Builder)
  async findAll({ status, category, search, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    let baseQuery = 'SELECT * FROM vendors WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM vendors WHERE 1=1';
    const queryParams = [];
    let paramIndex = 1;

    // Apply strict ENUM filters
    if (status) {
      baseQuery += ` AND status = $${paramIndex}`;
      countQuery += ` AND status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (category) {
      baseQuery += ` AND category = $${paramIndex}`;
      countQuery += ` AND category = $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    }

    // Apply global wild-card text search filters across context fields
    if (search) {
      baseQuery += ` AND (company_name ILIKE $${paramIndex} OR vendor_code ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR contact_person ILIKE $${paramIndex})`;
      countQuery += ` AND (company_name ILIKE $${paramIndex} OR vendor_code ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR contact_person ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Append Ordering & Pagination controls
    baseQuery += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    
    // Execute both operations
    const totalResult = await pool.query(countQuery, queryParams.slice(0, paramIndex - 1));
    const total = parseInt(totalResult.rows[0].count);

    const paginatedParams = [...queryParams, limit, offset];
    const dataResult = await pool.query(baseQuery, paginatedParams);

    return {
      vendors: dataResult.rows,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Auto-Generate a sequence safe VND code (e.g. VND-006)
  async generateVendorCode() {
    const res = await pool.query('SELECT COUNT(*) FROM vendors');
    const count = parseInt(res.rows[0].count) + 1;
    return `VND-${String(count).padStart(3, '0')}`;
  }

  // POST /vendors
  async create(vendorData, creatorId) {
    const vendorCode = await this.generateVendorCode();
    const query = `
      INSERT INTO vendors (
        vendor_code, company_name, category, gst_number, pan_number, 
        contact_person, email, phone, address_line1, city, state, 
        pincode, bank_name, bank_account_no, bank_ifsc, registered_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *;
    `;
    const values = [
      vendorCode, vendorData.company_name, vendorData.category, vendorData.gst_number || null,
      vendorData.pan_number || null, vendorData.contact_person, vendorData.email, vendorData.phone || null,
      vendorData.address_line1 || null, vendorData.city || null, vendorData.state || null,
      vendorData.pincode || null, vendorData.bank_name || null, vendorData.bank_account_no || null,
      vendorData.bank_ifsc || null, creatorId
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // GET /vendors/:id
  async findById(id) {
    const query = 'SELECT * FROM vendors WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Checks if a vendor is mapped to an internal system account ID
  async findByLinkedUserId(userId) {
    const query = `
      SELECT v.* FROM vendors v
      INNER JOIN vendor_user_accounts vua ON vua.vendor_id = v.id
      WHERE vua.user_id = $1;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  // PUT /vendors/:id
  async update(id, vendorData) {
    const query = `
      UPDATE vendors SET
        company_name = $1, category = $2, gst_number = $3, pan_number = $4,
        contact_person = $5, email = $6, phone = $7, address_line1 = $8,
        city = $9, state = $10, pincode = $11, bank_name = $12,
        bank_account_no = $13, bank_ifsc = $14
      WHERE id = $15
      RETURNING *;
    `;
    const values = [
      vendorData.company_name, vendorData.category, vendorData.gst_number || null, vendorData.pan_number || null,
      vendorData.contact_person, vendorData.email, vendorData.phone || null, vendorData.address_line1 || null,
      vendorData.city || null, vendorData.state || null, vendorData.pincode || null, vendorData.bank_name || null,
      vendorData.bank_account_no || null, vendorData.bank_ifsc || null, id
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // PATCH /vendors/:id/status
  async updateStatus(id, status) {
    const query = 'UPDATE vendors SET status = $1 WHERE id = $2 RETURNING id, vendor_code, status;';
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  // Add this inside your VendorRepository class
async findByCodeOrEmail(identifier) {
  const query = `
    SELECT id, vendor_code, company_name 
    FROM vendors 
    WHERE vendor_code = $1 OR email = $1;
  `;
  const result = await pool.query(query, [identifier]);
  return result.rows[0];
}
}

module.exports = new VendorRepository();