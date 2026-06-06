const express = require('express');
const cors = require('cors'); // 🔥 FIXED: Imported CORS package
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
const vendorRoutes = require('./routes/vendorRoutes');
const rfqRoutes = require('./routes/rfqRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const comparisonRoutes = require('./routes/comparisonRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const poRoutes = require('./routes/poRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const auditRoutes = require('./routes/auditRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

dotenv.config();

const app = express();

// Body parsers
app.use(express.json());

// 🔥 FIXED: Enable CORS for all incoming cross-origin frontend channels
app.use(cors({
  origin: '*', // Allows connections from any frontend origin port (Perfect for quick hackathon deployment)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/vendors', vendorRoutes);
app.use('/v1/rfqs', rfqRoutes);
app.use('/v1', quotationRoutes);
app.use('/v1', comparisonRoutes);
app.use('/v1', approvalRoutes);
app.use('/v1', poRoutes);
app.use('/v1', invoiceRoutes);
app.use('/v1', notificationRoutes); 
app.use('/v1', auditRoutes);   
app.use('/v1', reportRoutes);  
app.use('/v1', dashboardRoutes);

// Root route check
app.get('/', (req, res) => {
  res.json({ status: 'healthy', project: 'Odoo Hackathon Backend' });
});

// Global Error Handler Middleware (Must be the last middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port http://localhost:${PORT}`);
});