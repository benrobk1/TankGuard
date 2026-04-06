import nodemailer from 'nodemailer';

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendEmail(to: string, subject: string, html: string) {
  const transporter = createTransporter();

  return transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html,
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  const subject = 'Welcome to TankGuard!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a56db;">Welcome to TankGuard, ${name}!</h1>
      <p>Thank you for signing up. TankGuard helps you stay on top of your underground storage tank compliance requirements so you never miss a deadline.</p>
      <h2>Getting Started</h2>
      <ol>
        <li>Add your facilities and tanks</li>
        <li>We'll automatically generate your compliance calendar</li>
        <li>Receive timely reminders before deadlines</li>
      </ol>
      <p>If you have any questions, simply reply to this email.</p>
      <p>— The TankGuard Team</p>
    </div>
  `;

  return sendEmail(email, subject, html);
}

export async function sendComplianceReminder(
  email: string,
  facilityName: string,
  items: { description: string; dueDate: string }[],
) {
  const subject = `Compliance Reminder: ${facilityName}`;
  const itemsHtml = items
    .map(
      (item) =>
        `<li><strong>${item.description}</strong> — Due: ${item.dueDate}</li>`,
    )
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a56db;">Compliance Reminder</h1>
      <p>The following compliance items are coming due for <strong>${facilityName}</strong>:</p>
      <ul>${itemsHtml}</ul>
      <p>Log in to TankGuard to mark items complete or upload documentation.</p>
      <p>— The TankGuard Team</p>
    </div>
  `;

  return sendEmail(email, subject, html);
}

export async function sendWeeklyDigest(
  email: string,
  name: string,
  stats: {
    dueThisWeek: number;
    dueNext30Days: number;
    overdue: number;
    completedThisMonth: number;
    complianceScore: number;
  },
) {
  const subject = 'Your Weekly TankGuard Compliance Digest';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a56db;">Weekly Compliance Digest</h1>
      <p>Hi ${name}, here's your compliance summary:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr style="background: #f3f4f6;">
          <td style="padding: 12px; border: 1px solid #e5e7eb;">Compliance Score</td>
          <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">${stats.complianceScore}%</td>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #e5e7eb;">Due This Week</td>
          <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">${stats.dueThisWeek}</td>
        </tr>
        <tr style="background: #f3f4f6;">
          <td style="padding: 12px; border: 1px solid #e5e7eb;">Due in Next 30 Days</td>
          <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">${stats.dueNext30Days}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #e5e7eb; color: #dc2626;">Overdue</td>
          <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #dc2626;">${stats.overdue}</td>
        </tr>
        <tr style="background: #f3f4f6;">
          <td style="padding: 12px; border: 1px solid #e5e7eb;">Completed This Month</td>
          <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">${stats.completedThisMonth}</td>
        </tr>
      </table>
      <p>Log in to TankGuard to view full details and take action on upcoming items.</p>
      <p>— The TankGuard Team</p>
    </div>
  `;

  return sendEmail(email, subject, html);
}

export async function sendOverdueAlert(
  email: string,
  facilityName: string,
  itemDescription: string,
  dueDate: string,
  daysOverdue: number,
) {
  const subject = `OVERDUE: ${itemDescription} — ${facilityName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #dc2626;">Overdue Compliance Alert</h1>
      <p>A compliance item at <strong>${facilityName}</strong> is now <strong>${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue</strong>.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Item</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${itemDescription}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Due Date</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${dueDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Days Overdue</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb; color: #dc2626;">${daysOverdue}</td>
        </tr>
      </table>
      <p>Failure to complete compliance items on time may result in regulatory penalties. Please take action immediately.</p>
      <p>— The TankGuard Team</p>
    </div>
  `;

  return sendEmail(email, subject, html);
}
