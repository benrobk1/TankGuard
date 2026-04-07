# TankGuard — Production Deployment Checklist

This document covers everything needed to take TankGuard from code to production.
Items are ordered by priority. Each section includes what to do, why, and estimated effort.

---

## 1. Infrastructure & Hosting

### 1.1 PostgreSQL Database
- [ ] Provision a production PostgreSQL 15+ instance (Supabase, Neon, AWS RDS, or Railway)
- [ ] Set `DATABASE_URL` in production environment
- [ ] Run `npx prisma migrate deploy` to apply all migrations
- [ ] Run `npx tsx prisma/seed.ts` to seed all 1,496 compliance rules (116 federal + 1,380 state)
- [ ] Enable connection pooling (PgBouncer) for production load
- [ ] Set up automated daily database backups with 30-day retention
- [ ] Configure read replicas if serving >1,000 concurrent users

### 1.2 Application Hosting
- [ ] Deploy to Vercel (recommended), Railway, or AWS Amplify
- [ ] Set all environment variables from `.env.example`
- [ ] Verify `next build` completes without errors
- [ ] Configure custom domain (e.g., `app.tankguard.com`)
- [ ] Enable HTTPS (automatic on Vercel/Railway)
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain

### 1.3 File Storage (Document Uploads)
- [ ] Set up AWS S3 bucket (or Cloudflare R2) for production document storage
- [ ] Replace local `/public/uploads` storage with S3 SDK in `/src/app/api/documents/upload/route.ts`
- [ ] Configure bucket CORS policy to allow uploads from your domain
- [ ] Set S3 environment variables: `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`
- [ ] Enable server-side encryption on the bucket (AES-256 or KMS)
- [ ] Set lifecycle policy to archive documents older than 7 years to Glacier

---

## 2. Stripe Payment Setup

### 2.1 Stripe Account & Product
- [ ] Create Stripe account at stripe.com
- [ ] Create a Product called "TankGuard" with a $99/month recurring price
- [ ] Copy the Price ID to `STRIPE_PRICE_ID` env var
- [ ] Set `STRIPE_SECRET_KEY` (use `sk_live_...` for production)
- [ ] Set `STRIPE_PUBLISHABLE_KEY` (`pk_live_...`)

### 2.2 Stripe Webhook
- [ ] Create webhook endpoint in Stripe dashboard pointing to `https://app.tankguard.com/api/stripe/webhook`
- [ ] Subscribe to events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- [ ] Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`
- [ ] Test webhook with Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

### 2.3 Stripe Customer Portal
- [ ] Enable Stripe Customer Portal in dashboard settings
- [ ] Configure portal to allow: subscription cancellation, payment method updates, invoice history
- [ ] The `/api/stripe/portal` endpoint already creates portal sessions

---

## 3. Email / SMTP Setup

### 3.1 Transactional Email Provider
- [ ] Sign up for a transactional email service (Resend, SendGrid, AWS SES, or Postmark)
- [ ] Verify sending domain (add SPF, DKIM, DMARC DNS records)
- [ ] Set SMTP credentials in environment:
  - `SMTP_HOST` (e.g., `smtp.resend.com`)
  - `SMTP_PORT` (typically `587`)
  - `SMTP_USER`
  - `SMTP_PASS`
  - `FROM_EMAIL` (e.g., `noreply@tankguard.com`)
- [ ] Test email delivery with a test compliance reminder

### 3.2 Email Types Sent by TankGuard
The system sends these automated emails (see `/src/lib/email.ts`):
- **Compliance reminders** — 90, 60, 30, 7 days before due date
- **Overdue alerts** — daily for past-due items, with urgency banners for FINANCIAL/REPORTING types
- **Weekly digest** — summary of compliance status across all facilities

---

## 4. Cron Jobs / Scheduled Tasks

TankGuard requires three cron jobs to run automatically. All are protected by `API_SECRET`.

### 4.1 Compliance Reminder Processing (Daily)
```
POST https://app.tankguard.com/api/reminders/process
Header: x-api-secret: <API_SECRET>
Schedule: Daily at 8:00 AM ET
```
Sends compliance reminders and overdue alerts to customers.

### 4.2 Compliance Snapshot Generation (Daily)
```
POST https://app.tankguard.com/api/compliance/snapshots
Header: x-api-secret: <API_SECRET>
Schedule: Daily at 1:00 AM ET
```
Captures daily compliance scores for trend charts.

### 4.3 Compliance Item Status Updates (Hourly)
```
POST https://app.tankguard.com/api/compliance/generate
Header: x-api-secret: <API_SECRET>
Schedule: Hourly or daily
```
Generates new compliance items from rules, updates DUE_SOON/OVERDUE statuses.

**Setup Options:**
- **Vercel**: Use Vercel Cron Jobs in `vercel.json`
- **Railway**: Use Railway Cron service
- **External**: Use cron-job.org, EasyCron, or AWS EventBridge

Example `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/reminders/process", "schedule": "0 12 * * *" },
    { "path": "/api/compliance/snapshots", "schedule": "0 5 * * *" },
    { "path": "/api/compliance/generate", "schedule": "0 * * * *" }
  ]
}
```

---

## 5. DNS & Domain

- [ ] Purchase domain (e.g., `tankguard.com`)
- [ ] Point DNS to hosting provider (Vercel: add CNAME or A records)
- [ ] Configure subdomains:
  - `app.tankguard.com` → Next.js application
  - `www.tankguard.com` → Landing page (can be same app)
- [ ] Set up email DNS records (SPF, DKIM, DMARC) for `tankguard.com`
- [ ] Verify SSL certificate is active

---

## 6. Monitoring & Observability

### 6.1 Error Tracking
- [ ] Set up Sentry (sentry.io) for error tracking
- [ ] Install `@sentry/nextjs` and configure DSN
- [ ] Enable source maps for production error traces
- [ ] Set up Slack/email alerts for new errors

### 6.2 Uptime Monitoring
- [ ] Set up uptime monitoring (UptimeRobot, Betterstack, or Checkly)
- [ ] Monitor: `https://app.tankguard.com/api/monitoring` (health endpoint)
- [ ] Alert on downtime via email/SMS/Slack
- [ ] Target: 99.9% uptime SLA

### 6.3 Application Analytics
- [ ] Add Vercel Analytics or PostHog for user behavior tracking
- [ ] Track: sign-ups, onboarding completion rate, compliance item completion rate
- [ ] Set up conversion funnel: Landing → Register → Onboard → First Facility → Active Use

---

## 7. Security Hardening

### 7.1 Already Implemented (in codebase)
- [x] Security headers (CSP, HSTS, X-Frame-Options, etc.) — `next.config.ts`
- [x] HttpOnly, Secure, SameSite cookies — `src/lib/auth.ts`
- [x] Password hashing with bcrypt (cost factor 12) — `src/lib/auth.ts`
- [x] Session expiration (30 days) with server-side validation
- [x] Input validation with Zod on all API routes
- [x] File upload type/size restrictions (25MB, whitelisted extensions)
- [x] Field allowlists on all PUT endpoints (prevents mass assignment)
- [x] XSS sanitization on blog content

### 7.2 Remaining Security Tasks
- [ ] Enable rate limiting on auth endpoints (use Upstash Redis + `@upstash/ratelimit`)
  - `/api/auth/login`: 5 attempts per 15 minutes per IP
  - `/api/auth/register`: 3 attempts per hour per IP
  - `/api/documents/upload`: 20 uploads per hour per user
- [ ] Add CSRF token validation for state-changing operations (or verify SameSite cookies suffice)
- [ ] Run `npm audit` and fix any vulnerabilities
- [ ] Schedule quarterly dependency updates
- [ ] Add Content-Security-Policy reporting endpoint
- [ ] Conduct penetration testing before launch

---

## 8. Legal & Compliance (Business)

### 8.1 Legal Pages
- [x] Privacy Policy page — `/privacy` (created, needs legal review)
- [x] Terms of Service page — `/terms` (created, needs legal review)
- [ ] **CRITICAL**: Have both pages reviewed by an attorney
- [ ] Add cookie consent banner (if serving EU customers)
- [ ] Add California CCPA disclosure (if serving CA customers)

### 8.2 Business Insurance
- [ ] Obtain E&O (Errors & Omissions) insurance — TankGuard provides compliance tracking, not legal advice. The Terms of Service include a liability limitation, but E&O insurance is recommended.

### 8.3 Disclaimers
- [x] Terms include disclaimer that TankGuard is a tracking tool, not legal/regulatory advice
- [ ] Consider adding in-app disclaimer banner during onboarding

---

## 9. Customer Support

### 9.1 Support Infrastructure
- [ ] Set up support email: `support@tankguard.com`
- [ ] Set up phone line or VoIP service for phone support
- [ ] Update contact info in `/src/app/(dashboard)/support/page.tsx` (currently has placeholder phone number)
- [ ] Consider adding live chat (Intercom, Crisp, or tawk.to)

### 9.2 Documentation
- [ ] Create a knowledge base or help center (Notion, GitBook, or Zendesk Guide)
- [ ] Document common workflows:
  - Adding a facility and tanks
  - Completing compliance items
  - Generating audit reports
  - Understanding compliance scores
  - Managing operators and training records

---

## 10. Pre-Launch Testing

### 10.1 Functional Testing
- [ ] Test complete user flow: Register → Onboard → Add Facility → Add Tanks → View Compliance → Complete Items → Download PDF
- [ ] Test Stripe checkout flow end-to-end (use test mode first)
- [ ] Test email delivery for all reminder types
- [ ] Test all 51 state rule generation (create facilities in different states)
- [ ] Test PDF report generation for facilities with 10+ tanks
- [ ] Test on mobile devices (iOS Safari, Android Chrome)

### 10.2 Performance Testing
- [ ] Run Lighthouse audit (target: 90+ on all scores)
- [ ] Test page load times with 100+ compliance items
- [ ] Verify database query performance with production-size data
- [ ] Load test cron endpoints with multiple customers

### 10.3 Data Integrity
- [ ] Verify all 1,496 rules seed correctly (116 federal + 1,380 state)
- [ ] Verify scheduling engine generates correct items for each tank type
- [ ] Verify facility-level rules (OPERATOR, FINANCIAL) create one item per facility, not per tank
- [ ] Verify EPCRA Tier II due dates align with March 1 deadline

---

## 11. Go-Live Sequence

1. **Database**: Provision PostgreSQL, run migrations, seed rules
2. **Deploy**: Push to Vercel/Railway, set all env vars
3. **Stripe**: Configure product, webhook, customer portal
4. **DNS**: Point domain, verify SSL
5. **Email**: Configure SMTP, verify domain, test delivery
6. **Cron**: Set up all three scheduled jobs
7. **Monitor**: Enable Sentry, uptime monitoring
8. **Test**: Run full functional test on production
9. **Launch**: Remove "Coming Soon" / enable registration

---

## Architecture Reference

```
TankGuard Stack:
├── Next.js 16 (App Router, TypeScript)
├── Prisma 7 (PostgreSQL ORM)
├── Tailwind CSS v4
├── Stripe (payments, $99/month)
├── Nodemailer (SMTP emails)
├── @react-pdf/renderer (audit reports)
├── Zod (API validation)
└── bcryptjs (password hashing)

Key Data Flow:
Rules (federal-rules.ts + state-rules.ts)
  → Seed (prisma/seed.ts)
  → Database (compliance_rules table)
  → Scheduling Engine (scheduling.ts)
  → Compliance Items (per tank/facility)
  → Reminders (reminders.ts → email.ts)
  → Dashboard / Calendar / PDF Reports
```

---

*Generated for TankGuard v0.1.0 — 1,496 compliance rules across 51 jurisdictions*
