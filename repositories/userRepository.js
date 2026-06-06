const pool = require('../config/db');

class UserRepository {
  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  async create(email, hashedPassword, fullName, phone, role) {
    const query = `
      INSERT INTO users (email, password_hash, full_name, phone, role) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id, email, full_name, role, status, created_at;
    `;
    const result = await pool.query(query, [
      email,
      hashedPassword,
      fullName,
      phone || null,
      role || 'procurement_officer'
    ]);
    return result.rows[0];
  }

  // Session Logging Storage Tracking
  async createSession(userId, token, expiresAt, ipAddress, userAgent) {
    const query = `
      INSERT INTO sessions (user_id, token, expires_at, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5);
    `;
    await pool.query(query, [userId, token, expiresAt, ipAddress, userAgent]);
  }

  async deleteSession(token) {
    const query = 'DELETE FROM sessions WHERE token = $1;';
    await pool.query(query, [token]);
  }

  // OTP Management Methods
  async saveOTP(email, otp, expiresAt) {
    const query = `
      INSERT INTO user_otps (email, otp, expires_at) 
      VALUES ($1, $2, $3) 
      RETURNING id;
    `;
    const result = await pool.query(query, [email, otp, expiresAt]);
    return result.rows[0];
  }

  async findActiveOTP(email, otp) {
    const query = `
      SELECT * FROM user_otps 
      WHERE email = $1 AND otp = $2 AND is_used = FALSE AND expires_at > NOW()
      ORDER BY created_at DESC LIMIT 1;
    `;
    const result = await pool.query(query, [email, otp]);
    return result.rows[0];
  }

  async linkResetTokenToOTP(otpId, resetToken) {
    const query = 'UPDATE user_otps SET is_used = TRUE, reset_token = $1 WHERE id = $2;';
    await pool.query(query, [resetToken, otpId]);
  }

  // Add this method inside your UserRepository class
  async deleteOTPRecord(otpId) {
    const query = 'DELETE FROM user_otps WHERE id = $1;';
    await pool.query(query, [otpId]);
  }

  async findByResetToken(token) {
    const query = `
      SELECT * FROM user_otps 
      WHERE reset_token = $1 AND is_used = TRUE AND expires_at > NOW()
      LIMIT 1;
    `;
    const result = await pool.query(query, [token]);
    return result.rows[0];
  }

  async updatePassword(email, newHashedPassword) {
    const query = 'UPDATE users SET password_hash = $1 WHERE email = $2;';
    await pool.query(query, [newHashedPassword, email]);
  }

  async updateLastLogin(userId) {
    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [userId]);
  }
}

module.exports = new UserRepository();