const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
const vendorRoutes = require('./routes/vendorRoutes');
const rfqRoutes = require('./routes/rfqRoutes');

dotenv.config();

const app = express();

// Body parsers
app.use(express.json());

// Auto-initialize DB Table for the hackathon
// userRepository.initTable()
//   .then(() => console.log('📁 Database tables verified/created.'))
//   .catch(err => console.error('❌ Failed to initialize tables:', err));

// Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/vendors', vendorRoutes);
app.use('/v1/rfqs', rfqRoutes);

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