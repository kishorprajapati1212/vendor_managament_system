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

  // 1. Existing OTP Delivery Engine
  async sendOTP(toEmail, otp) {
    try {
      const info = await this.transporter.sendMail({
        from: `Hackathon Auth <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Your OTP Code",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="color: #333;">Password Reset OTP</h2>
            <p>Your verification code is:</p>
            <h1 style="color: #007bff; letter-spacing: 2px;">${otp}</h1>
            <p style="color: #777; font-size: 12px;">This code expires in 10 minutes.</p>
          </div>
        `,
      });

      console.log("✅ OTP Email Sent Successfully");
      console.log("📧 To:", toEmail);
      console.log("🔑 OTP:", otp);

      return info;
    } catch (error) {
      console.error("❌ OTP Email Send Failed:", error.message);
      throw error;
    }
  }

  // Upgraded Generic Document Delivery Method with Auto-Attachment Support
  async sendGenericEmail(toEmail, subject, bodyText, attachmentObj = null) {
    try {
      const mailOptions = {
        from: `VendorBridge ERP <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: subject,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
            <div style="background-color: #007bff; color: white; padding: 15px; text-align: center; border-radius: 5px 5px 0 0;">
              <h2 style="margin: 0; font-weight: 500;">VendorBridge Procurement System</h2>
            </div>
            <div style="background-color: #fdfdfd; padding: 20px; border: 1px solid #e9e9e9; border-top: none; border-radius: 0 0 5px 5px;">
              <p style="font-size: 16px; margin-top: 0;">Hello,</p>
              <p style="font-size: 15px; white-space: pre-line;">${bodyText}</p>
              ${attachmentObj ? `<p style="font-size: 14px; color: #28a745; font-weight: bold; margin-top: 15px;">📎 A detailed document (${attachmentObj.filename}) has been securely compiled and attached to this email.</p>` : ''}
              <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;" />
              <p style="font-size: 12px; color: #888; text-align: center; margin-bottom: 0;">
                This is an automated operational transmission from your company's instance on VendorBridge ERP.
              </p>
            </div>
          </div>
        `,
      };

      // 🔥 If an attachment object is present, inject it directly into Nodemailer's array
      if (attachmentObj) {
        mailOptions.attachments = [attachmentObj];
      }

      const info = await this.transporter.sendMail(mailOptions);
      console.log("✅ Procurement Document Email Dispatched with PDF Attachment");
      return info;
    } catch (error) {
      console.error("❌ Document Email Dispatch Failed:", error.message);
      throw error;
    }
  }
}

module.exports = new EmailService();