
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Create transporter with proper configuration
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify transporter configuration
    this.verifyTransporter();
  }

  async verifyTransporter() {
    try {
      await this.transporter.verify();
      console.log('✅ SMTP transporter is ready to send emails');
    } catch (error) {
      console.error('❌ SMTP transporter verification failed:', error);
    }
  }

  async sendVerificationEmail(email, verificationCode, userName) {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME || 'E-Commerce'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Verify Your Email Address',
        html: this.getVerificationEmailTemplate(verificationCode, userName),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Verification email sent to ${email}, Message ID: ${result.messageId}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Error sending verification email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(email, userName) {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME || 'E-Commerce'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Welcome to Our E-Commerce Platform!',
        html: this.getWelcomeEmailTemplate(userName),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent to ${email}, Message ID: ${result.messageId}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  getVerificationEmailTemplate(code, userName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .code { 
            background: #007bff; 
            color: white; 
            padding: 15px 30px; 
            font-size: 32px; 
            font-weight: bold; 
            text-align: center; 
            letter-spacing: 5px;
            border-radius: 8px;
            margin: 20px 0;
            display: inline-block;
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 4px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email Address</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>Thank you for registering with our e-commerce platform. To complete your registration, please use the following verification code:</p>
            
            <div style="text-align: center;">
              <div class="code">${code}</div>
            </div>
            
            <div class="warning">
              <strong>Important:</strong> This code will expire in 15 minutes for security reasons.
            </div>
            
            <p>If you didn't create an account with us, please ignore this email.</p>
            
            <p>Best regards,<br>The ${process.env.APP_NAME || 'E-Commerce'} Team</p>
          </div>
          <div class="footer">
            <p>This email was sent automatically. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getWelcomeEmailTemplate(userName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .feature-list { list-style: none; padding: 0; }
          .feature-list li { padding: 8px 0; border-bottom: 1px solid #eee; }
          .feature-list li:before { content: "✓ "; color: #28a745; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ${process.env.APP_NAME || 'Our E-Commerce Platform'}!</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>Your account has been successfully verified and is now active!</p>
            
            <p>You can now enjoy all the features of our platform:</p>
            <ul class="feature-list">
              <li>Browse our extensive product catalog</li>
              <li>Add items to your cart</li>
              <li>Complete purchases securely</li>
              <li>Track your orders in real-time</li>
              <li>Manage your profile and preferences</li>
              <li>Receive exclusive deals and offers</li>
            </ul>
            
            <p style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products" 
                 style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Start Shopping Now
              </a>
            </p>
            
            <p>Happy shopping!<br>The ${process.env.APP_NAME || 'E-Commerce'} Team</p>
          </div>
          <div class="footer">
            <p>This email was sent automatically. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendInquiryNotificationEmail(inquiryData, adminEmail = null) {
    try {
      // Priority: 1. adminEmail parameter, 2. ADMIN_EMAIL env, 3. SMTP_USER as fallback
      const recipientEmail = adminEmail || process.env.ADMIN_EMAIL || process.env.SMTP_USER;
      
      if (!recipientEmail) {
        console.error('❌ No admin email configured');
        return { success: false, error: 'No admin email configured' };
      }

      const mailOptions = {
        from: `"${process.env.APP_NAME || 'E-Commerce'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: recipientEmail,
        subject: `New Product Inquiry - ${inquiryData.helpType}`,
        html: this.getInquiryNotificationEmailTemplate(inquiryData),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Inquiry notification email sent to ${adminEmail}, Message ID: ${result.messageId}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Error sending inquiry notification email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendInquiryConfirmationEmail(inquiryData) {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME || 'E-Commerce'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: inquiryData.email,
        subject: 'Thank You for Your Inquiry',
        html: this.getInquiryConfirmationEmailTemplate(inquiryData),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Inquiry confirmation email sent to ${inquiryData.email}, Message ID: ${result.messageId}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Error sending inquiry confirmation email:', error);
      return { success: false, error: error.message };
    }
  }

  getInquiryNotificationEmailTemplate(inquiry) {
    const helpTypeLabels = {
      pricing: 'Volume Pricing',
      shipping: 'Shipping Options',
      specs: 'Product Specifications',
      availability: 'Product Availability',
      other: 'Other'
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #df2020; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #df2020; }
          .info-row { display: flex; padding: 8px 0; border-bottom: 1px solid #eee; }
          .info-label { font-weight: bold; width: 150px; color: #666; }
          .info-value { flex: 1; color: #333; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { background: #df2020; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Product Inquiry Received</h1>
          </div>
          <div class="content">
            <h2>Inquiry Details</h2>
            
            <div class="info-box">
              <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${inquiry.firstName} ${inquiry.lastName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Username:</span>
                <span class="info-value">${inquiry.username}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${inquiry.email}</span>
              </div>
              ${inquiry.companyName ? `
              <div class="info-row">
                <span class="info-label">Company:</span>
                <span class="info-value">${inquiry.companyName}</span>
              </div>
              ` : ''}
              ${inquiry.city ? `
              <div class="info-row">
                <span class="info-label">City:</span>
                <span class="info-value">${inquiry.city}</span>
              </div>
              ` : ''}
              <div class="info-row">
                <span class="info-label">Country:</span>
                <span class="info-value">${inquiry.country}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Inquiry Type:</span>
                <span class="info-value">${helpTypeLabels[inquiry.helpType] || inquiry.helpType}</span>
              </div>
              ${inquiry.productName ? `
              <div class="info-row">
                <span class="info-label">Product:</span>
                <span class="info-value">${inquiry.productName}</span>
              </div>
              ` : ''}
              ${inquiry.product?.sku ? `
              <div class="info-row">
                <span class="info-label">SKU:</span>
                <span class="info-value">${inquiry.product.sku}</span>
              </div>
              ` : ''}
              ${inquiry.message ? `
              <div class="info-row" style="flex-direction: column; border-bottom: none;">
                <span class="info-label" style="margin-bottom: 8px;">Message:</span>
                <span class="info-value">${inquiry.message}</span>
              </div>
              ` : ''}
            </div>

            <p style="margin-top: 20px;">
              <strong>Inquiry ID:</strong> #${inquiry.id}<br>
              <strong>Submitted:</strong> ${new Date(inquiry.createdAt).toLocaleString()}
            </p>

            <p style="text-align: center; margin-top: 30px;">
              <a href="${process.env.ADMIN_URL || 'http://localhost:5174'}/ecommerce/inquiries" class="button">
                View Inquiry in Dashboard
              </a>
            </p>
          </div>
          <div class="footer">
            <p>This is an automated notification. Please respond to the customer at: ${inquiry.email}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getInquiryConfirmationEmailTemplate(inquiry) {
    const helpTypeLabels = {
      pricing: 'Volume Pricing',
      shipping: 'Shipping Options',
      specs: 'Product Specifications',
      availability: 'Product Availability',
      other: 'Other'
    };

    // Get SKU from product if available
    const productSku = inquiry.product?.sku || null;
    const productInfo = inquiry.productName 
      ? `${inquiry.productName}${productSku ? ` (SKU: ${productSku})` : ''}`
      : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #28a745; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .product-details { background: #e8f5e9; padding: 12px; margin: 10px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You for Your Inquiry!</h1>
          </div>
          <div class="content">
            <h2>Hello ${inquiry.firstName},</h2>
            
            <p>We have received your inquiry regarding <strong>${helpTypeLabels[inquiry.helpType] || inquiry.helpType}</strong>${productInfo ? ` for <strong>${productInfo}</strong>` : ''}.</p>
            
            ${productInfo ? `
            <div class="product-details">
              <p style="margin: 0;"><strong>Product:</strong> ${inquiry.productName}</p>
              ${productSku ? `<p style="margin: 5px 0 0 0;"><strong>SKU:</strong> ${productSku}</p>` : ''}
            </div>
            ` : ''}
            
            <div class="info-box">
              <p><strong>Inquiry ID:</strong> #${inquiry.id}</p>
              <p><strong>Submitted:</strong> ${new Date(inquiry.createdAt).toLocaleString()}</p>
              <p><strong>Status:</strong> Pending Review</p>
            </div>

            <p>Our team will review your inquiry and get back to you within 24-48 hours at <strong>${inquiry.email}</strong>.</p>

            <p>If you have any urgent questions, please feel free to contact us directly.</p>
            
            <p>Best regards,<br>The ${process.env.APP_NAME || 'E-Commerce'} Team</p>
          </div>
          <div class="footer">
            <p>This email was sent automatically. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Test email configuration
  async testEmailConfiguration() {
    try {
      const testEmail = process.env.SMTP_USER;
      if (!testEmail) {
        console.log('❌ No test email configured');
        return { success: false, error: 'No test email configured' };
      }

      const result = await this.sendVerificationEmail(testEmail, '123456', 'Test User');
      if (result.success) {
        console.log('✅ Email configuration test passed');
        return { success: true };
      } else {
        console.log('❌ Email configuration test failed');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Email configuration test error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
module.exports = new EmailService();