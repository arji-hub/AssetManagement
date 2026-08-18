const LOGO_URL =
  "https://firebasestorage.googleapis.com/v0/b/ams-cict.firebasestorage.app/o/images%2Fcictlogo.jfif?alt=media&token=5ce68321-b3ef-40a4-86b5-6bcc42d7735e";

function emailShell({ heading, bodyHtml }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #860100; padding: 24px; text-align: center;">
        <img src="${LOGO_URL}"
         width="60" alt="CICT AMS Logo" style="margin-bottom: 8px;" />
        <h1 style="color: #f5aa2c; margin: 0; font-size: 20px; letter-spacing: 1px;">CICT Asset Management System</h1>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #860100; font-size: 17px; margin: 0 0 16px;">${heading}</h2>
        ${bodyHtml}
      </div>
      <div style="background-color: #860100; padding: 16px; text-align: center;">
        <p style="font-size: 12px; color: #f5aa2c; margin: 0;">
          This is an automated message. Please do not reply to this email.
        </p>
        <p style="font-size: 12px; color: #f5aa2c; margin: 4px 0 0;">
          © ${new Date().getFullYear()} CICT Asset Management System. All rights reserved.
        </p>
      </div>
    </div>
  `;
}

module.exports = { emailShell, LOGO_URL };
