const pool = require('../config/db');

class DashboardRepository {
  // GET /dashboard/summary (Dynamic Role-Isolated Metric Compiler)
  async getSummaryMetrics(userId, userRole) {
    const currentYear = new Date().getFullYear();
    
    // Base Variable Bindings
    let pendingApprovalsCount = 0;
    let activeRfqsCount = 0;
    let recentPosCount = 0;
    let recentInvoicesCount = 0;
    let totalSpendThisMonth = 0;
    let totalVendorsCount = 0;
    let rfqStatusBreakdown = { draft: 0, published: 0, closed: 0, cancelled: 0 };
    let monthlySpendArr = [];

    // ─────────────────────────────────────────────────────────────
    // STRATEGY A: INTERNAL EXECUTIVE STAFF CONTEXT
    // ─────────────────────────────────────────────────────────────
    if (userRole !== 'vendor') {
      // 1. Fetch KPI Card Counts
      const countsQuery = `
        SELECT 
          (SELECT COUNT(*) FROM approvals WHERE status = 'pending') as pending_approvals,
          (SELECT COUNT(*) FROM rfqs WHERE status = 'published') as active_rfqs,
          (SELECT COUNT(*) FROM purchase_orders WHERE created_at >= NOW() - INTERVAL '30 days') as recent_pos,
          (SELECT COUNT(*) FROM invoices WHERE created_at >= NOW() - INTERVAL '30 days') as recent_invoices,
          (SELECT COUNT(*) FROM vendors WHERE status = 'active') as total_vendors,
          COALESCE((SELECT SUM(total_amount) FROM purchase_orders WHERE created_at >= DATE_TRUNC('month', NOW()) AND status != 'cancelled'), 0) as monthly_spend
      `;
      const countsRes = await pool.query(countsQuery);
      const row = countsRes.rows[0];

      pendingApprovalsCount = parseInt(row.pending_approvals || 0);
      activeRfqsCount = parseInt(row.active_rfqs || 0);
      recentPosCount = parseInt(row.recent_pos || 0);
      recentInvoicesCount = parseInt(row.recent_invoices || 0);
      totalVendorsCount = parseInt(row.total_vendors || 0);
      totalSpendThisMonth = parseFloat(row.monthly_spend || 0);

      // 2. Fetch RFQ Status Breakdown
      const rfqBreakdownRes = await pool.query('SELECT status, COUNT(*) FROM rfqs GROUP BY status');
      rfqBreakdownRes.rows.forEach(r => {
        if (rfqStatusBreakdown.hasOwnProperty(r.status)) {
          rfqStatusBreakdown[r.status] = parseInt(r.count);
        }
      });

      // 3. Fetch Monthly Spend Analytics (Last 6 Months Trend)
      const spendTrendQuery = `
        SELECT TO_CHAR(created_at, 'YYYY-MM') as spend_month, COALESCE(SUM(total_amount), 0) as amount
        FROM purchase_orders
        WHERE created_at >= NOW() - INTERVAL '6 months' AND status != 'cancelled'
        GROUP BY TO_CHAR(created_at, 'YYYY-MM')
        ORDER BY spend_month ASC;
      `;
      const trendRes = await pool.query(spendTrendQuery);
      monthlySpendArr = trendRes.rows.map(r => ({ month: r.spend_month, amount: parseFloat(r.amount) }));

    // ─────────────────────────────────────────────────────────────
    // STRATEGY B: EXTERNAL ISOLATED VENDOR CONTEXT
    // ─────────────────────────────────────────────────────────────
    } else {
      // Find the explicit vendor domain link bound to this token profile
      const vendorRes = await pool.query('SELECT vendor_id FROM vendor_user_accounts WHERE user_id = $1 LIMIT 1', [userId]);
      const vendorId = vendorRes.rows[0]?.vendor_id;

      if (vendorId) {
        const vendorCountsQuery = `
          SELECT 
            (SELECT COUNT(*) FROM rfq_vendors WHERE vendor_id = $1) as active_rfqs,
            (SELECT COUNT(*) FROM purchase_orders WHERE vendor_id = $1 AND created_at >= NOW() - INTERVAL '30 days') as recent_pos,
            (SELECT COUNT(*) FROM invoices WHERE vendor_id = $1 AND created_at >= NOW() - INTERVAL '30 days') as recent_invoices,
            COALESCE((SELECT SUM(total_amount) FROM invoices WHERE vendor_id = $1 AND status = 'paid' AND paid_at >= DATE_TRUNC('month', NOW())), 0) as monthly_earnings
        `;
        const vCountsRes = await pool.query(vendorCountsQuery, [vendorId]);
        const vRow = vCountsRes.rows[0];

        activeRfqsCount = parseInt(vRow.active_rfqs || 0);
        recentPosCount = parseInt(vRow.recent_pos || 0);
        recentInvoicesCount = parseInt(vRow.recent_invoices || 0);
        totalSpendThisMonth = parseFloat(vRow.monthly_earnings || 0); // Earnings representation for vendor view

        // Fetch RFQ Breakdown specific to their invitations
        const rfqVBreakdownQuery = `
          SELECT r.status, COUNT(*) 
          FROM rfq_vendors rv
          INNER JOIN rfqs r ON rv.rfq_id = r.id
          WHERE rv.vendor_id = $1
          GROUP BY r.status
        `;
        const rfqVRes = await pool.query(rfqVBreakdownQuery, [vendorId]);
        rfqVRes.rows.forEach(r => {
          if (rfqStatusBreakdown.hasOwnProperty(r.status)) {
            rfqStatusBreakdown[r.status] = parseInt(r.count);
          }
        });
      }
    }

    // Default Fallback Generator to ensure frontend visual chart tools have clean array inputs
    if (monthlySpendArr.length === 0) {
      const currentMonthStr = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      monthlySpendArr = [{ month: currentMonthStr, amount: totalSpendThisMonth }];
    }

    return {
      pending_approvals: pendingApprovalsCount,
      active_rfqs: activeRfqsCount,
      recent_purchase_orders: recentPosCount,
      recent_invoices: recentInvoicesCount,
      total_spend_this_month: totalSpendThisMonth,
      total_vendors: totalVendorsCount,
      analytics: {
        monthly_spend: monthlySpendArr,
        rfq_status_breakdown: rfqStatusBreakdown
      }
    };
  }

  // GET /dashboard/recent-activity
  async getRecentActivityTrails(userId, userRole, limit = 10) {
    let query = `
      SELECT al.id, al.action, al.entity_type, al.description, al.created_at,
             u.full_name, u.role
      FROM activity_logs al
      INNER JOIN users u ON al.user_id = u.id
    `;
    const params = [limit];

    // Security Filter: Non-admins only stream logs relating directly to their action context
    if (userRole !== 'admin') {
      query += ` WHERE al.user_id = $2 ORDER BY al.created_at DESC LIMIT $1`;
      params.push(userId);
    } else {
      query += ` ORDER BY al.created_at DESC LIMIT $1`;
    }

    const result = await pool.query(query, params);
    return result.rows.map(row => ({
      id: row.id,
      action: row.action,
      entity_type: row.entity_type,
      description: row.description,
      created_at: row.created_at,
      user: { full_name: row.full_name, role: row.role }
    }));
  }
}

module.exports = new DashboardRepository();