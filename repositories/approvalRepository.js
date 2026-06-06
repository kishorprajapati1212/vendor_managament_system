const pool = require('../config/db');

class ApprovalRepository {
  // GET /approvals
  async findAll({ status = 'pending', page = 1, limit = 20, userId, userRole }) {
    const offset = (page - 1) * limit;
    
    // Base Queries
    let baseQuery = `
      SELECT a.id as approval_id, a.status as approval_status, a.level, a.created_at,
             q.id as quotation_id, q.quotation_number, q.total_amount,
             v.company_name as vendor_company_name,
             u.id as approver_id, u.full_name as approver_name
      FROM approvals a
      INNER JOIN quotations q ON a.quotation_id = q.id
      INNER JOIN vendors v ON q.vendor_id = v.id
      INNER JOIN users u ON a.approver_id = u.id
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) FROM approvals a WHERE 1=1';
    const queryParams = [];
    let paramIndex = 1;

    // Apply strict status ENUM boundaries
    if (status) {
      baseQuery += ` AND a.status = $${paramIndex}`;
      countQuery += ` AND a.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    // Role Security: Managers see items assigned specifically to them; Admins see everything
    if (userRole !== 'admin' && userId) {
      baseQuery += ` AND a.approver_id = $${paramIndex}`;
      countQuery += ` AND a.approver_id = $${paramIndex}`;
      queryParams.push(userId);
      paramIndex++;
    }

    baseQuery += ` ORDER BY a.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;

    // Execute aggregation and list selection
    const totalRes = await pool.query(countQuery, queryParams.slice(0, paramIndex - 1));
    const total = parseInt(totalRes.rows[0].count);

    const dataRes = await pool.query(baseQuery, [...queryParams, limit, offset]);

    // Match exact documentation output formats
    const approvals = dataRes.rows.map(row => ({
      id: row.approval_id,
      status: row.approval_status,
      level: row.level,
      created_at: row.created_at,
      quotation: {
        id: row.quotation_id,
        quotation_number: row.quotation_number,
        total_amount: parseFloat(row.total_amount),
        vendor: { company_name: row.vendor_company_name }
      },
      approver: {
        id: row.approver_id,
        full_name: row.approver_name
      }
    }));

    return { approvals, total };
  }

  // GET /approvals/:id
  async findById(id) {
    const query = `
      SELECT a.*, q.quotation_number, q.total_amount, r.rfq_number, r.title as rfq_title,
             u.full_name as approver_name
      FROM approvals a
      INNER JOIN quotations q ON a.quotation_id = q.id
      INNER JOIN rfqs r ON q.rfq_id = r.id
      INNER JOIN users u ON a.approver_id = u.id
      WHERE a.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // PATCH /approvals/:id/approve (Atomic Status Transition Engine)
  async processApproval(id, remarks) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Fetch approval node details to trace its assigned quotation link
      const appRes = await client.query('SELECT quotation_id, level FROM approvals WHERE id = $1', [id]);
      if (appRes.rows.length === 0) throw new Error('Approval row entry missing');
      const { quotation_id } = appRes.rows[0];

      // 2. Mark approval step entry as approved
      const updatedTime = new Date();
      const updateApprovalQuery = `
        UPDATE approvals 
        SET status = 'approved', remarks = $1, approved_at = $2, updated_at = NOW() 
        WHERE id = $3 
        RETURNING status, approved_at;
      `;
      const res = await client.query(updateApprovalQuery, [remarks || 'Approved', updatedTime, id]);

      // 3. Complete the workflow line by setting quotation status to 'accepted' or ready
      // For standard hackathon rules, 1 level of approval is sufficient to flag the quotation as completely verified!
      await client.query("UPDATE quotations SET status = 'accepted' WHERE id = $1", [quotation_id]);

      // 4. Inject an automated structural alert notification row for the Procurement Team
      const notifyQuery = `
        INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id)
        SELECT created_by, 'approval_required', 'Quotation Approved', 
               'Your selected quotation has been formally authorized by management.', 'quotation', $1
        FROM rfqs 
        WHERE id = (SELECT rfq_id FROM quotations WHERE id = $1 LIMIT 1);
      `;
      await client.query(notifyQuery, [quotation_id]);

      await client.query('COMMIT');
      return res.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // PATCH /approvals/:id/reject
  async processRejection(id, remarks) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const appRes = await client.query('SELECT quotation_id FROM approvals WHERE id = $1', [id]);
      if (appRes.rows.length === 0) throw new Error('Approval row entry missing');
      const { quotation_id } = appRes.rows[0];

      // 1. Invalidate approval tracking state node
      await client.query("UPDATE approvals SET status = 'rejected', remarks = $1, updated_at = NOW() WHERE id = $2", [remarks || 'Rejected', id]);

      // 2. Revert quotation status so procurement officer knows they must evaluate alternate options
      await client.query("UPDATE quotations SET status = 'rejected' WHERE id = $1", [quotation_id]);

      await client.query('COMMIT');
      return { status: 'rejected' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new ApprovalRepository();