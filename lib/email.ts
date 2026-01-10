/**
 * Email Notification Stub
 * 
 * This file provides a stub implementation for email notifications.
 * To enable real email sending, configure environment variables:
 * 
 * Option 1: SMTP (nodemailer)
 *   EMAIL_HOST=smtp.example.com
 *   EMAIL_PORT=587
 *   EMAIL_USER=user@example.com
 *   EMAIL_PASSWORD=password
 *   EMAIL_FROM=noreply@example.com
 * 
 * Option 2: SendGrid
 *   SENDGRID_API_KEY=your-api-key
 *   SENDGRID_FROM_EMAIL=noreply@example.com
 * 
 * Example implementation with nodemailer:
 * 
 * import nodemailer from 'nodemailer'
 * 
 * const transporter = nodemailer.createTransport({
 *   host: process.env.EMAIL_HOST,
 *   port: parseInt(process.env.EMAIL_PORT || '587'),
 *   secure: false,
 *   auth: {
 *     user: process.env.EMAIL_USER,
 *     pass: process.env.EMAIL_PASSWORD,
 *   },
 * })
 * 
 * export async function sendReportNotification(data: EmailData) {
 *   await transporter.sendMail({
 *     from: process.env.EMAIL_FROM,
 *     to: data.to,
 *     subject: data.subject,
 *     html: data.html,
 *   })
 * }
 * 
 * Example implementation with SendGrid:
 * 
 * import sgMail from '@sendgrid/mail'
 * 
 * sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
 * 
 * export async function sendReportNotification(data: EmailData) {
 *   await sgMail.send({
 *     to: data.to,
 *     from: process.env.SENDGRID_FROM_EMAIL!,
 *     subject: data.subject,
 *     html: data.html,
 *   })
 * }
 */

export interface EmailData {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    path: string
  }>
}

/**
 * Stub function for sending email notifications
 */
export async function sendReportNotification(data: EmailData): Promise<boolean> {
  console.log('Email notification stub called')
  console.log('To:', data.to)
  console.log('Subject:', data.subject)
  console.log('HTML length:', data.html.length)
  
  console.log('\nTo enable email notifications:')
  console.log('1. Configure EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD in .env')
  console.log('   OR')
  console.log('   Configure SENDGRID_API_KEY in .env')
  console.log('2. Install dependencies:')
  console.log('   npm install nodemailer @types/nodemailer')
  console.log('   OR')
  console.log('   npm install @sendgrid/mail')
  console.log('3. Implement the sendReportNotification function in lib/email.ts')
  
  // Return false to indicate email was not sent
  return false
}

/**
 * Helper to generate report email HTML
 */
export function generateReportEmailHTML(report: {
  title: string
  description: string
  deviceName: string
  operatorName: string
  createdAt: string
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: #0070f3;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 0 0 5px 5px;
          }
          .info {
            background: white;
            padding: 15px;
            margin: 10px 0;
            border-left: 4px solid #0070f3;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>New Job Report</h1>
        </div>
        <div class="content">
          <h2>${report.title}</h2>
          <div class="info">
            <p><strong>Device:</strong> ${report.deviceName}</p>
            <p><strong>Operator:</strong> ${report.operatorName}</p>
            <p><strong>Date:</strong> ${new Date(report.createdAt).toLocaleString()}</p>
          </div>
          <p>${report.description}</p>
        </div>
        <div class="footer">
          <p>BSV Premium Plumbing & Leak Detection</p>
          <p>This is an automated notification</p>
        </div>
      </body>
    </html>
  `
}
