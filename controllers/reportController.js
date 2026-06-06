const reportRepository = require('../repositories/reportRepository');
const asyncHandler = require('../utils/asyncHandler');
const PDFDocument = require('pdfkit');

// @desc    GET /reports/procurement-summary
const getProcurementSummary = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const data = await reportRepository.getSummary(from, to);
  res.status(200).json({ success: true, data });
});

// @desc    GET /reports/vendor-performance
const getVendorPerformanceReport = asyncHandler(async (req, res) => {
  const data = await reportRepository.getVendorPerformance();
  res.status(200).json({ success: true, data });
});

// @desc    GET /reports/monthly-spend
const getMonthlySpendTrendReport = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year);
  const data = await reportRepository.getMonthlySpendTrend(year);
  res.status(200).json({ success: true, data });
});

// @desc    GET /reports/export (Fulfills the complete Document Export Engine Requirements)
const exportReports = asyncHandler(async (req, res) => {
  const { type, format } = req.query;

  if (!type || !format) {
    res.statusCode = 400;
    throw new Error('Please append request query parameters for type and format.');
  }

  // 1. Gather historical raw metrics based on the type flag
  let dataset = null;
  if (type === 'vendor_performance') {
    dataset = await reportRepository.getVendorPerformance();
  } else if (type === 'monthly_spend') {
    dataset = await reportRepository.getMonthlySpendTrend();
  } else {
    dataset = await reportRepository.getSummary();
  }

  // 🎯 FORMAT STRATEGY 1: COMPILE AND STREAM EXCEL-COMPATIBLE CSV ENGINE
  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=Report-${type}-${Date.now()}.csv`);

    let csvContent = '';
    if (type === 'vendor_performance') {
      csvContent = 'Vendor Code,Company Name,Quotations Submitted,Quotations Accepted,Total POs,Total Billed,Avg Delivery Days,Rating\n';
      dataset.forEach(r => {
        csvContent += `"${r.vendor.vendor_code}","${r.vendor.company_name}",${r.quotations_submitted},${r.quotations_accepted},${r.total_pos},${r.total_billed},${r.avg_delivery_days},${r.rating}\n`;
      });
    } else if (type === 'monthly_spend') {
      csvContent = 'Month,Total Procurement Spend (INR)\n';
      dataset.forEach(r => {
        csvContent += `"${r.month}",${r.total_amount}\n`;
      });
    } else {
      csvContent = 'Metric Name,Value Summary Metrics\n';
      csvContent += `"Total RFQs",${dataset.total_rfqs}\n"Total Quotations",${dataset.total_quotations}\n"Total POs",${dataset.total_pos}\n"Total Invoices",${dataset.total_invoices}\n"Total Spend (INR)",${dataset.total_spend}\n"Avg PO Value (INR)",${dataset.avg_po_value}\n`;
    }
    return res.send(csvContent);
  }

  // 🎯 FORMAT STRATEGY 2: COMPILE AND STREAM HIGH-FIDELITY PDF VISUAL ENGINE
  if (format === 'pdf') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Report-${type}-${Date.now()}.pdf`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fillColor('#1e3a8a').fontSize(22).font('Helvetica-Bold').text('VENDORBRIDGE ANALYTICS MATRIX REPORT', { align: 'center' });
    doc.moveDown(0.5);
    doc.fillColor('#64748b').fontSize(10).font('Helvetica').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(1.5);
    doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, doc.y).lineTo(562, doc.y).stroke();
    doc.moveDown(1.5);

    doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text(`Report Scope: ${type.toUpperCase().replace('_', ' ')}`);
    doc.moveDown(1);
    doc.fontSize(11).font('Helvetica');

    if (type === 'vendor_performance') {
      dataset.forEach(r => {
        doc.fillColor('#1e40af').font('Helvetica-Bold').text(`${r.vendor.company_name} [${r.vendor.vendor_code}]`);
        doc.fillColor('#334155').font('Helvetica').text(`  • Quotations: Submitted (${r.quotations_submitted}) | Accepted (${r.quotations_accepted})`);
        doc.text(`  • Procurement Orders: ${r.total_pos} POs issued | Total Cleared Volume: INR ${r.total_billed}`);
        doc.text(`  • Historical Operational Efficiency: Delivery Line Latency (${r.avg_delivery_days} days) | User Rating: ${r.rating} / 5.0`);
        doc.moveDown(1);
      });
    } else if (type === 'monthly_spend') {
      dataset.forEach(r => {
        doc.text(`Month: ${r.month.padEnd(15)} --------------> Total Procurement Outflow: INR ${r.total_amount.toFixed(2)}`);
      });
    } else {
      doc.text(`Total Baseline Request RFQs Issued:       ${dataset.total_rfqs}`);
      doc.text(`Total Vendor Bids Logged:                 ${dataset.total_quotations}`);
      doc.text(`Total Awarded Purchase Orders (POs):      ${dataset.total_pos}`);
      doc.text(`Total Verified Audited Invoices:          ${dataset.total_invoices}`);
      doc.moveDown(1);
      doc.fillColor('#15803d').font('Helvetica-Bold').text(`Total Cumulative Capital Spend:      INR ${dataset.total_spend.toFixed(2)}`);
      doc.text(`Average Disbursed PO Transaction:    INR ${dataset.avg_po_value.toFixed(2)}`);
    }

    doc.end();
    return;
  }

  res.statusCode = 400;
  throw new Error('Unsupported format profile parameter selected.');
});

module.exports = { getProcurementSummary, getVendorPerformanceReport, getMonthlySpendTrendReport, exportReports };