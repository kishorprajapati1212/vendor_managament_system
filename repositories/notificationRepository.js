const pool = require('../config/db');

class NotificationRepository {
  // GET /notifications
  async findAllByUser(userId, { is_read, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    
    // Base List Selection Queries
    let baseQuery = `
      SELECT id, type, title, message, is_read, entity_type, entity_id, created_at
      FROM notifications
      WHERE user_id = $1
    `;
    let countQuery = 'SELECT COUNT(*) FROM notifications WHERE user_id = $1';
    const queryParams = [userId];
    let paramIndex = 2;

    // Filter by read/unread status if parameter explicitly specified
    if (is_read !== undefined) {
      const readBool = is_read === 'true';
      baseQuery += ` AND is_read = $${paramIndex}`;
      countQuery += ` AND is_read = $${paramIndex}`;
      queryParams.push(readBool);
      paramIndex++;
    }

    baseQuery += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;

    // 1. Fetch total list counts matching filters
    const totalRes = await pool.query(countQuery, queryParams.slice(0, paramIndex - 1));
    const total = parseInt(totalRes.rows[0].count);

    // 2. Fetch paginated data payload rows
    const dataRes = await pool.query(baseQuery, [...queryParams, limit, offset]);

    // 3. Aggregate total UNREAD count globally for this specific user account context
    const unreadCountRes = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE',
      [userId]
    );
    const unread_count = parseInt(unreadCountRes.rows[0].count);

    // Formats mapping outputs to match your specific document guide specifications
    const notifications = dataRes.rows.map(row => ({
      id: row.id,
      type: row.type,
      title: row.title,
      message: row.message,
      is_read: row.is_read,
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      created_at: row.created_at
    }));

    return { notifications, unread_count, total };
  }

  // PATCH /notifications/:id/read
  async markAsRead(id, userId) {
    const query = 'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING id;';
    const result = await pool.query(query, [id, userId]);
    return result.rows.length > 0;
  }

  // PATCH /notifications/read-all
  async markAllAsRead(userId) {
    const query = 'UPDATE notifications SET is_read = TRUE WHERE user_id = $1;';
    await pool.query(query, [userId]);
    return true;
  }
}

module.exports = new NotificationRepository();