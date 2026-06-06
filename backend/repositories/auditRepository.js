const pool = require('../config/db');

class AuditRepository {
  async findAll({ entity_type, entity_id, user_id, action, from, to, page = 1, limit = 20, sessionUserId, sessionUserRole }) {
    const offset = (page - 1) * limit;
    let baseQuery = `
      SELECT al.id, al.action, al.entity_type, al.entity_id, al.description, al.ip_address, al.created_at,
             u.full_name as user_full_name, u.role as user_role
      FROM activity_logs al
      INNER JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) FROM activity_logs al WHERE 1=1';
    const queryParams = [];
    let paramIndex = 1;

    // Role Enforcement Safeguard: Non-admins can only look at their own historical actions
    if (sessionUserRole !== 'admin') {
      baseQuery += ` AND al.user_id = $${paramIndex}`;
      countQuery += ` AND al.user_id = $${paramIndex}`;
      queryParams.push(sessionUserId);
      paramIndex++;
    } else if (user_id) {
      // Admins can optionally filter by a specific target user ID
      baseQuery += ` AND al.user_id = $${paramIndex}`;
      countQuery += ` AND al.user_id = $${paramIndex}`;
      queryParams.push(user_id);
      paramIndex++;
    }

    if (entity_type) {
      baseQuery += ` AND al.entity_type = $${paramIndex}`;
      countQuery += ` AND al.entity_type = $${paramIndex}`;
      queryParams.push(entity_type);
      paramIndex++;
    }

    if (entity_id) {
      baseQuery += ` AND al.entity_id = $${paramIndex}`;
      countQuery += ` AND al.entity_id = $${paramIndex}`;
      queryParams.push(entity_id);
      paramIndex++;
    }

    if (action) {
      baseQuery += ` AND al.action = $${paramIndex}`;
      countQuery += ` AND al.action = $${paramIndex}`;
      queryParams.push(action);
      paramIndex++;
    }

    if (from) {
      baseQuery += ` AND al.created_at >= $${paramIndex}`;
      countQuery += ` AND al.created_at >= $${paramIndex}`;
      queryParams.push(from);
      paramIndex++;
    }

    if (to) {
      baseQuery += ` AND al.created_at <= $${paramIndex}`;
      countQuery += ` AND al.created_at <= $${paramIndex}`;
      queryParams.push(to);
      paramIndex++;
    }

    baseQuery += ` ORDER BY al.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;

    const totalRes = await pool.query(countQuery, queryParams.slice(0, paramIndex - 1));
    const total = parseInt(totalRes.rows[0].count);

    const dataRes = await pool.query(baseQuery, [...queryParams, limit, offset]);

    const logs = dataRes.rows.map(row => ({
      id: row.id,
      action: row.action,
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      description: row.description,
      ip_address: row.ip_address || '127.0.0.1',
      created_at: row.created_at,
      user: { full_name: row.user_full_name, role: row.user_role }
    }));

    return { logs, total };
  }
}

module.exports = new AuditRepository();