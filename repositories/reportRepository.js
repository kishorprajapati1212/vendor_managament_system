const pool = require('../config/db');

class ReportRepository {
  // GET /reports/procurement-summary
  async getSummary(from, to) {
    let dateClause = '';
    const params = [];
    if (from && to) {
      dateClause = ' WHERE created_at BETWEEN $1 AND $2 ';
      params.push(from, to);
    }

    const query = `
      SELECT 
        (SELECT COUNT(*) FROM rfqs ${dateClause}) as total_rfqs,
        (SELECT COUNT(*) FROM quotations ${dateClause}) as total_quotations,
        (SELECT COUNT(*) FROM purchase_orders ${dateClause}) as total_pos,
        (SELECT COUNT(*) FROM invoices ${dateClause}) as total_invoices,
        COALESCE((SELECT SUM(total_amount) FROM purchase_orders WHERE status != 'cancelled'), 0) as total_spend,
        COALESCE((SELECT AVG(total_amount) FROM purchase_orders WHERE status != 'cancelled'), 0) as avg_po_value
    `;
    const res = await pool.query(query, params);
    const row = res.rows[0];

    const totalRfqs = parseInt(row.total_rfqs || 0);
    const totalQuotes = parseInt(row.total_quotations || 0);

    return {
      total_rfqs: totalRfqs,
      total_quotations: totalQuotes,
      total_pos: parseInt(row.total_pos || 0),
      total_invoices: parseInt(row.total_invoices || 0),
      total_spend: parseFloat(row.total_spend),
      avg_quotations_per_rfq: totalRfqs > 0 ? parseFloat((totalQuotes / totalRfqs).toFixed(1)) : 0,
      avg_po_value: parseFloat(parseFloat(row.avg_po_value).toFixed(2))
    };
  }

  // GET /reports/vendor-performance
  async getVendorPerformance() {
    const query = `
      SELECT v.id, v.company_name, v.vendor_code, v.rating,
             COUNT(DISTINCT q.id) as quotations_submitted,
             COUNT(DISTINCT CASE WHEN q.status = 'accepted' THEN q.id END) as quotations_accepted,
             COUNT(DISTINCT po.id) as total_pos,
             COALESCE(SUM(i.total_amount), 0) as total_billed,
             COALESCE(AVG(q.delivery_days), 0) as avg_delivery_days
      FROM vendors v
      LEFT JOIN quotations q ON q.vendor_id = v.id
      LEFT JOIN purchase_orders po ON po.vendor_id = v.id
      LEFT JOIN invoices i ON i.vendor_id = v.id AND i.status = 'paid'
      GROUP BY v.id, v.company_name, v.vendor_code, v.rating
      ORDER BY rating DESC;
    `;
    const res = await pool.query(query);
    return res.rows.map(row => ({
      vendor: { id: row.id, company_name: row.company_name, vendor_code: row.vendor_code },
      quotations_submitted: parseInt(row.quotations_submitted || 0),
      quotations_accepted: parseInt(row.quotations_accepted || 0),
      total_pos: parseInt(row.total_pos || 0),
      total_billed: parseFloat(row.total_billed),
      avg_delivery_days: Math.round(parseFloat(row.avg_delivery_days || 0)),
      rating: parseFloat(parseFloat(row.rating || 0).toFixed(2))
    }));
  }

  // GET /reports/monthly-spend
  async getMonthlySpendTrend(year) {
    const targetYear = year || new Date().getFullYear();
    const query = `
      SELECT EXTRACT(MONTH FROM created_at) as month_num,
             COALESCE(SUM(total_amount), 0) as total_amount
      FROM purchase_orders
      WHERE EXTRACT(YEAR FROM created_at) = $1 AND status != 'cancelled'
      GROUP BY EXTRACT(MONTH FROM created_at)
      ORDER BY month_num ASC;
    `;
    const res = await pool.query(query, [targetYear]);
    
    // Map numerical month representations out to full nominal values safely
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    return monthNames.map((name, index) => {
      const match = res.rows.find(r => parseInt(r.month_num) === index + 1);
      return {
        month: name,
        total_amount: match ? parseFloat(match.total_amount) : 0.00
      };
    });
  }
}

module.exports = new ReportRepository();