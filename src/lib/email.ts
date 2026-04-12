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

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const subject = 'Reset your TankGuard password';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a56db;">Reset your password</h1>
      <p>We received a request to reset the password for your TankGuard account.</p>
      <p>Click the button below to choose a new password. This link will expire in <strong>1 hour</strong>.</p>
      <p style="margin: 24px 0;">
        <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
          Reset password
        </a>
      </p>
      <p style="color:#6b7280;font-size:13px;">Or copy and paste this link into your browser:<br/><span style="word-break:break-all;">${resetUrl}</span></p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
      <p style="color:#6b7280;font-size:13px;">If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.</p>
      <p>— The TankGuard Team</p>
    </div>
  `;

  return sendEmail(email, subject, html);
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

const ITEM_TYPE_LABELS: Record<string, string> = {
  INSPECTION: 'Inspection',
  TEST: 'Test',
  CERTIFICATION: 'Certification',
  TRAINING: 'Training',
  DOCUMENTATION: 'Documentation',
  REPORTING: 'Reporting',
  FINANCIAL: 'Financial',
  CLOSURE: 'Closure',
};

const ITEM_TYPE_COLORS: Record<string, string> = {
  INSPECTION: '#2563eb',
  TEST: '#2563eb',
  CERTIFICATION: '#7c3aed',
  TRAINING: '#059669',
  DOCUMENTATION: '#6b7280',
  REPORTING: '#dc2626',
  FINANCIAL: '#dc2626',
  CLOSURE: '#d97706',
};

function itemTypeBadge(itemType: string): string {
  const label = ITEM_TYPE_LABELS[itemType] || itemType;
  const color = ITEM_TYPE_COLORS[itemType] || '#6b7280';
  return `<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;color:#fff;background:${color}">${label}</span>`;
}

export async function sendComplianceReminder(
  email: string,
  facilityName: string,
  items: { description: string; dueDate: string; itemType?: string }[],
) {
  // Separate critical items (REPORTING, FINANCIAL) from standard items
  const critical = items.filter((i) => i.itemType === 'REPORTING' || i.itemType === 'FINANCIAL');
  const standard = items.filter((i) => i.itemType !== 'REPORTING' && i.itemType !== 'FINANCIAL');

  const hasCritical = critical.length > 0;
  const subject = hasCritical
    ? `ACTION REQUIRED: Regulatory/Financial Deadline — ${facilityName}`
    : `Compliance Reminder: ${facilityName}`;

  const formatItem = (item: typeof items[0]) =>
    `<li style="margin-bottom:8px;">
      ${item.itemType ? itemTypeBadge(item.itemType) + ' ' : ''}
      <strong>${item.description}</strong> — Due: ${item.dueDate}
    </li>`;

  const criticalHtml = critical.length > 0
    ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px;margin-bottom:16px;">
        <p style="color:#dc2626;font-weight:bold;margin:0 0 8px;">Critical Deadlines</p>
        <ul style="margin:0;padding-left:20px;">${critical.map(formatItem).join('')}</ul>
      </div>`
    : '';

  const standardHtml = standard.length > 0
    ? `<ul style="padding-left:20px;">${standard.map(formatItem).join('')}</ul>`
    : '';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a56db;">Compliance Reminder</h1>
      <p>The following compliance items are coming due for <strong>${facilityName}</strong>:</p>
      ${criticalHtml}
      ${standardHtml}
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
  itemType?: string,
) {
  const isFinancialOrReporting = itemType === 'FINANCIAL' || itemType === 'REPORTING';
  const subject = isFinancialOrReporting
    ? `URGENT: Overdue ${ITEM_TYPE_LABELS[itemType!] || ''} Deadline — ${facilityName}`
    : `OVERDUE: ${itemDescription} — ${facilityName}`;

  const urgencyBanner = isFinancialOrReporting
    ? `<div style="background:#fef2f2;border:2px solid #dc2626;border-radius:8px;padding:12px;margin-bottom:16px;">
        <p style="color:#dc2626;font-weight:bold;margin:0;">
          ${itemType === 'FINANCIAL' ? 'Financial responsibility lapse may trigger delivery prohibition.' : 'Overdue regulatory reporting may result in enforcement action.'}
        </p>
      </div>`
    : '';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #dc2626;">Overdue Compliance Alert</h1>
      ${urgencyBanner}
      <p>A compliance item at <strong>${facilityName}</strong> is now <strong>${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue</strong>.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Item</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${itemDescription}</td>
        </tr>
        ${itemType ? `<tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Type</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${itemTypeBadge(itemType)}</td>
        </tr>` : ''}
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
