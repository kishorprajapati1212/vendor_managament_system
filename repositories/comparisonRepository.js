const pool = require('../config/db');

class ComparisonRepository {
  // GET /rfqs/:rfqId/quotations/compare
  async getComparisonMatrix(rfqId, sortBy = 'total_amount') {
    // 1. Fetch base RFQ tracking details
    const rfqRes = await pool.query(
      'SELECT id, rfq_number, title FROM rfqs WHERE id = $1',
      [rfqId]
    );
    if (rfqRes.rows.length === 0) return null;
    const rfq = rfqRes.rows[0];

    // 2. Fetch all SUBMITTED quotations for this specific RFQ
    const qQuery = `
      SELECT q.id as quotation_id, q.quotation_number, q.total_amount, q.delivery_days,
             v.id as vendor_id, v.company_name, v.rating
      FROM quotations q
      INNER JOIN vendors v ON q.vendor_id = v.id
      WHERE q.rfq_id = $1 AND q.status = 'submitted'
    `;
    const qRes = await pool.query(qQuery, [rfqId]);
    const quotations = qRes.rows;

    if (quotations.length === 0) {
      return { rfq, comparison: [] };
    }

    // 3. Find the lowest price and fastest delivery time to apply highlights automatically
    const lowestPrice = Math.min(...quotations.map(q => parseFloat(q.total_amount)));
    const fastestDelivery = Math.min(...quotations.map(q => parseInt(q.delivery_days || 9999)));

    // 4. Map quotations and attach individual line items
    const comparisonList = [];
    for (const q of quotations) {
      const itemsRes = await pool.query(
        'SELECT item_name, quantity, unit_price, total_price FROM quotation_items WHERE quotation_id = $1 ORDER BY sort_order ASC',
        [q.quotation_id]
      );

      comparisonList.push({
        quotation_id: q.quotation_id,
        quotation_number: q.quotation_number,
        vendor: {
          id: q.vendor_id,
          company_name: q.company_name,
          rating: parseFloat(q.rating || 0)
        },
        total_amount: parseFloat(q.total_amount),
        delivery_days: parseInt(q.delivery_days || 0),
        is_lowest_price: parseFloat(q.total_amount) === lowestPrice,
        is_fastest_delivery: parseInt(q.delivery_days || 9999) === fastestDelivery,
        items: itemsRes.rows.map(row => ({
          item_name: row.item_name,
          quantity: parseFloat(row.quantity),
          unit_price: parseFloat(row.unit_price),
          total_price: parseFloat(row.total_price)
        }))
      });
    }

    // 5. Handle dynamic sorting strategies safely
    if (sortBy === 'delivery_days') {
      comparisonList.sort((a, b) => a.delivery_days - b.delivery_days);
    } else if (sortBy === 'rating') {
      comparisonList.sort((b, a) => a.vendor.rating - b.vendor.rating); // Higher rating comes first
    } else {
      comparisonList.sort((a, b) => a.total_amount - b.total_amount); // Default: Lowest price first
    }

    return { rfq, comparison: comparisonList };
  }

  // PATCH /quotations/:id/accept
  async acceptQuotationAndInitWorkflow(quotationId, approverId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Fetch target quotation details to locate the parent RFQ identity context
      const qRes = await client.query('SELECT rfq_id FROM quotations WHERE id = $1', [quotationId]);
      if (qRes.rows.length === 0) throw new Error('Quotation target not found');
      const { rfq_id } = qRes.rows[0];

      // 2. Mark the selected quotation as 'accepted'
      await client.query("UPDATE quotations SET status = 'accepted' WHERE id = $1", [quotationId]);

      // 3. Mark all OTHER submitted quotations for this parent RFQ as automatically 'rejected'
      await client.query(
        "UPDATE quotations SET status = 'rejected' WHERE rfq_id = $1 AND id != $2 AND status = 'submitted'",
        [rfq_id, quotationId]
      );

      // 4. Initialize the Approval Workflow state pipeline row (Level 1 Approver)
      const approvalQuery = `
        INSERT INTO approvals (quotation_id, approver_id, status, level, remarks)
        VALUES ($1, $2, 'pending', 1, 'Quotation chosen by procurement officer, initiating workflow approval sequence.')
        RETURNING id;
      `;
      await client.query(approvalQuery, [quotationId, approverId]);

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new ComparisonRepository();