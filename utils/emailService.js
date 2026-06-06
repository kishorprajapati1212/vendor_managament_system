const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendOTP(toEmail, otp) {
    try {
      const info = await this.transporter.sendMail({
        from: `Hackathon Auth <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Your OTP Code",
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Password Reset OTP</h2>
            <p>Your verification code is:</p>
            <h1>${otp}</h1>
            <p>This code expires in 10 minutes.</p>
          </div>
        `,
      });

      console.log("✅ Email Sent Successfully");
      console.log("📧 To:", toEmail);
      console.log("🔑 OTP:", otp);

      return info;
    } catch (error) {
      console.error("❌ Email Send Failed:", error.message);
      throw error;
    }
  }
}

module.exports = new EmailService();