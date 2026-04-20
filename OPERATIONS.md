# TankGuard — Operations & Deployment Handover

Replaces the prior `MANUS.md` deployment checklist. Reflects the state of the repo after the Saastudio strategic review landed on this branch (`claude/review-manus-handover-62MPk`), which itself is based on `claude/build-ust-target-list-RRiEb` (UST-scraper work preserved).

Items are ordered by priority. Each section includes what to do, why, and what changed in this branch vs. the prior single-plan build.

---

## 0. What Changed on This Branch (read first)

- **Pricing moved from a single $99/mo plan to three tiers**: Essentials ($99/mo, 1 facility), Pro ($499/mo, up to 10), Enterprise ($1,499/mo, up to 50). Internal tier slugs are `starter` / `growth` / `scale` in `src/lib/stripe.ts`; user-facing names match the live Stripe product names.
- **Live Stripe products provisioned** in account `acct_1TCHnKCBEqeOZm5B` (Saastudio). Price IDs pinned in `.env.example`. The prior $99 recurring `STRIPE_PRICE_ID` has been **archived** — kept in env only so existing grandfathered subscribers continue to bill.
- **Refund language rewritten** — the "12-month money-back guarantee" was replaced across landing, terms, and cold email copy with a **3-month service credit** (legal-review TODO). Credits are product-credit-only, capped at 3 months of fees, and not conditioned on a regulatory outcome. See `src/app/terms/page.tsx` §5.
- **Prisma `Tier` enum + `Customer.tier` column** added for subscription tier tracking, including a `LEGACY` value for grandfathered single-price customers. Migration is additive and has a safe default (STARTER).
- **UST scraper scaffolding preserved** from the cherry-picked branch — `src/lib/scraper/index.ts`, `src/app/api/scraper/route.ts`, and the `ProspectFacility` Prisma model.
- **Blog content engine seeded** — `prisma/seed-blog.ts` creates 12 SEO article stubs targeting TankGuard ICPs (multi-station operators, state enforcement hotspots, post-violation response). Bodies are `{{TODO_GENERATE}}` placeholders for the existing weekly `pnpm seo:generate` script.
- **Outbound email compliance**: zero-human-studio (the outbound orchestration repo, separate from this repo) retired the "Abigail Kurtz" persona and added a CAN-SPAM footer module. Relevant only if this repo starts sending outbound — it does not currently, but do not reintroduce a persona if that changes.

---

## 1. Infrastructure & Hosting

### 1.1 PostgreSQL Database
- [ ] Provision a production PostgreSQL 15+ instance (Supabase, Neon, AWS RDS, or Railway).
- [ ] Set `DATABASE_URL` in production environment.
- [ ] Run `npx prisma migrate deploy` to apply all migrations **including `add-customer-tier`** (generated on this branch; run `prisma migrate dev --create-only --name add-customer-tier` locally first to capture the SQL).
- [ ] Run `npx tsx prisma/seed.ts` to seed all 1,496 compliance rules (116 federal + 1,380 state).
- [ ] Run `pnpm tsx prisma/seed-blog.ts` to create the 12 SEO blog stubs.
- [ ] Enable connection pooling (PgBouncer) for production load.
- [ ] Set up automated daily database backups with 30-day retention.

### 1.2 Application Hosting
- [ ] Deploy to Vercel (recommended), Railway, or AWS Amplify.
- [ ] Set all environment variables from `.env.example` — in particular:
  - `STRIPE_PRICE_ID_TIER_STARTER` / `_GROWTH` / `_SCALE` (live Price IDs pinned in `.env.example`)
  - `STRIPE_PRICE_ID` — archived legacy price, kept for grandfathered subs only
  - `SAASTUDIO_MAILING_ADDRESS` — script THROWS on CAN-SPAM footer generation if unset
- [ ] Verify `next build` completes without errors.
- [ ] Configure custom domain (e.g., `app.tankguard.com`).
- [ ] Enable HTTPS (automatic on Vercel/Railway).
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain.

### 1.3 File Storage (Document Uploads)
- [ ] Set up AWS S3 bucket (or Cloudflare R2) for production document storage.
- [ ] Replace local `/public/uploads` storage with S3 SDK in `/src/app/api/documents/upload/route.ts`.
- [ ] Configure bucket CORS policy to allow uploads from your domain.
- [ ] Set S3 env vars: `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`.
- [ ] Enable server-side encryption (AES-256 or KMS).
- [ ] Lifecycle policy: archive documents older than 7 years to Glacier.

---

## 2. Stripe Payment Setup

### 2.1 Stripe Account & Products (live products already provisioned)

The three-tier live-mode products were created on this branch. Do **not** recreate them.

| Product (Stripe dashboard name) | Price | Env var | Price ID |
|---|---|---|---|
| TankGuard Essentials | $99/mo | `STRIPE_PRICE_ID_TIER_STARTER` | `price_1TO2cbCBEqeOZm5BVME6l8g9` |
| TankGuard Pro        | $499/mo | `STRIPE_PRICE_ID_TIER_GROWTH` | `price_1TO2ccCBEqeOZm5Bqt6xlXI2` |
| TankGuard Enterprise | $1,499/mo | `STRIPE_PRICE_ID_TIER_SCALE` | `price_1TO2ccCBEqeOZm5BkQBY8EUl` |
| (archived) legacy $99/mo | archived | `STRIPE_PRICE_ID` | `price_1TKeyFCBEqeOZm5BIUBNcVa9` |

- [ ] Set `STRIPE_SECRET_KEY` (`sk_live_...`) and `STRIPE_PUBLISHABLE_KEY` (`pk_live_...`) in production env.

### 2.2 Stripe Webhook
- [ ] Create webhook in Stripe dashboard pointing to `https://app.tankguard.com/api/stripe/webhook`.
- [ ] Subscribe to: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.
- [ ] Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`.
- [ ] On `subscription.created` / `.updated`, the webhook must write the matching `Tier` to `Customer.tier` — map price ID → tier via the constants in `src/lib/stripe.ts`.
- [ ] Test webhook with Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

### 2.3 Stripe Customer Portal
- [ ] Enable Stripe Customer Portal in dashboard settings.
- [ ] Allow: subscription cancellation, payment-method updates, invoice history, **tier changes** across the three active prices (but not to the archived legacy price).
- [ ] `/api/stripe/portal` already creates portal sessions.

---

## 3. Email / SMTP Setup

### 3.1 Transactional Email Provider
- [ ] Sign up for Resend, SendGrid, AWS SES, or Postmark.
- [ ] Verify sending domain (SPF, DKIM, DMARC DNS records).
- [ ] Set SMTP credentials: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`.
- [ ] **Set `SAASTUDIO_MAILING_ADDRESS` to a real US postal address** — the email module throws on a placeholder because 15 USC §7704(a)(5) requires a physical address in every commercial message.
- [ ] Test email delivery with a test compliance reminder.

### 3.2 Email Types Sent
Automated emails in `/src/lib/email.ts`:
- Compliance reminders (90, 60, 30, 7 days before due).
- Overdue alerts (daily for past-due items; urgency banner for FINANCIAL/REPORTING).
- Weekly digest across all facilities.

---

## 4. Cron Jobs

All three are protected by `API_SECRET`.

### 4.1 Reminder Processing (Daily)
```
POST https://app.tankguard.com/api/reminders/process
Header: x-api-secret: <API_SECRET>
Schedule: Daily at 8:00 AM ET
```

### 4.2 Compliance Snapshot (Daily)
```
POST https://app.tankguard.com/api/compliance/snapshots
Header: x-api-secret: <API_SECRET>
Schedule: Daily at 1:00 AM ET
```

### 4.3 Compliance Item Status (Hourly)
```
POST https://app.tankguard.com/api/compliance/generate
Header: x-api-secret: <API_SECRET>
Schedule: Hourly
```

Example `vercel.json` already in repo. External options: cron-job.org, EasyCron, AWS EventBridge.

---

## 5. DNS & Domain

- [ ] Purchase `tankguard.com` (or the canonical Saastudio domain the product ships under).
- [ ] Point DNS to hosting provider.
- [ ] Subdomains: `app.tankguard.com` → Next.js app; `www.tankguard.com` → landing (can share app).
- [ ] Email DNS records (SPF, DKIM, DMARC).
- [ ] Verify SSL certificate.

---

## 6. Monitoring & Observability

### 6.1 Error Tracking
- [ ] Set up Sentry (sentry.io). Install `@sentry/nextjs`, configure DSN, enable source maps.
- [ ] Alert on new errors via Slack or email.

### 6.2 Uptime
- [ ] UptimeRobot / Betterstack / Checkly monitoring `https://app.tankguard.com/api/monitoring`.
- [ ] 99.9% uptime SLA target.

### 6.3 Analytics
- [ ] Vercel Analytics or PostHog.
- [ ] Conversion funnel: Landing → Register → Onboard → First Facility → Active.
- [ ] Tier-distribution metric: % Essentials vs Pro vs Enterprise subs, to validate the pricing split after 90 days live.

---

## 7. Security Hardening

### 7.1 Already Implemented
- [x] Security headers (CSP, HSTS, X-Frame-Options) — `next.config.ts`.
- [x] HttpOnly, Secure, SameSite cookies — `src/lib/auth.ts`.
- [x] bcrypt (cost factor 12) for password hashing.
- [x] 30-day session expiration with server-side validation.
- [x] Zod input validation on API routes.
- [x] File-upload type/size restrictions (25MB, whitelisted extensions).
- [x] Field allowlists on PUT endpoints (prevents mass assignment).
- [x] XSS sanitization on blog content.

### 7.2 Remaining
- [ ] Rate limiting via Upstash Redis + `@upstash/ratelimit` on `/api/auth/login` (5 / 15 min / IP), `/api/auth/register` (3 / hr / IP), `/api/documents/upload` (20 / hr / user).
- [ ] CSRF token validation for state-changing ops (or verify SameSite suffices).
- [ ] `npm audit` + quarterly dependency updates.
- [ ] CSP reporting endpoint.
- [ ] Pre-launch pen test.

---

## 8. Legal & Compliance

### 8.1 Legal Pages
- [x] `/privacy` and `/terms` pages present.
- [ ] **CRITICAL**: attorney review of both, especially:
  - Terms §5 (3-month service credit)
  - Terms §6 (limitation of liability + $100 floor)
  - Terms §8 (AAA arbitration + class-action waiver + 30-day opt-out)
  - Governing law (currently Delaware)
- [ ] Cookie-consent banner if EU customers.
- [ ] California CCPA disclosure if CA customers.

### 8.2 Business Insurance
- [ ] E&O insurance — tracking tool, not legal advice. Terms cap liability, but E&O still recommended before GA.

### 8.3 CAN-SPAM Compliance (outbound flows)
This repo does not currently send cold outbound, but if it does in the future:
- [ ] Every commercial email MUST include a valid physical postal address (`SAASTUDIO_MAILING_ADDRESS` env).
- [ ] Functional one-click unsubscribe link.
- [ ] No fictitious sender name — real founder only (CA BPC §17529.5 statutory damages).

---

## 9. Customer Support

- [ ] Set up `support@tankguard.com` inbox + Intercom/Crisp/tawk.to for live chat.
- [ ] Update placeholder phone number in `src/app/(dashboard)/support/page.tsx`.
- [ ] Knowledge base (Notion / GitBook / Zendesk Guide) covering: adding facilities + tanks, completing compliance items, audit reports, compliance scores, operator management.

---

## 10. Pre-Launch Testing

### 10.1 Functional
- [ ] Full user flow per tier: Register → Onboard → Add Facility → Add Tanks → View Compliance → Complete Items → Download PDF.
- [ ] Stripe checkout end-to-end for **each** of the three tiers (test mode first, then live).
- [ ] Grandfathered-customer path — `/api/stripe/checkout/legacy` with a signed support link resubscribes against `STRIPE_PRICE_ID`.
- [ ] Webhook writes `Customer.tier` correctly on `subscription.created` for all three tiers + legacy.
- [ ] Email delivery for every reminder type.
- [ ] Rule generation for all 51 state jurisdictions.
- [ ] PDF reports for 10+ tank facilities.
- [ ] Mobile (iOS Safari + Android Chrome).

### 10.2 Performance
- [ ] Lighthouse ≥ 90 on all scores.
- [ ] Page load with 100+ compliance items.
- [ ] Load test cron endpoints with multiple customers.

### 10.3 Data Integrity
- [ ] All 1,496 rules seed correctly (116 federal + 1,380 state).
- [ ] Blog stubs seeded (12 entries; `published=false`).
- [ ] Facility-level rules (OPERATOR, FINANCIAL) create one item per facility, not per tank.
- [ ] EPCRA Tier II due dates align with March 1 deadline.

---

## 11. Go-Live Sequence

1. **Database** — provision PostgreSQL, run migrations (including `add-customer-tier`), seed rules, seed blog stubs.
2. **Deploy** — push to Vercel/Railway, set all env vars including all three tier price IDs + legacy + `SAASTUDIO_MAILING_ADDRESS`.
3. **Stripe** — webhook endpoint, portal settings, confirm live products active.
4. **DNS** — point domain, verify SSL.
5. **Email** — configure SMTP, verify domain, test.
6. **Cron** — all three scheduled jobs.
7. **Monitor** — Sentry + uptime.
8. **Test** — full functional test across all three tiers on production.
9. **Legal** — attorney sign-off on `/privacy` + `/terms` before public launch.
10. **Launch** — enable registration.

---

## Architecture Reference

```
TankGuard Stack:
├── Next.js 16 (App Router, TypeScript)
├── Prisma 7 (PostgreSQL ORM)
├── Tailwind CSS v4
├── Stripe (payments — 3 tiers: $99/$499/$1,499)
├── Nodemailer (SMTP emails)
├── @react-pdf/renderer (audit reports)
├── Zod (API validation)
└── bcryptjs (password hashing)

Data Flow:
Rules (federal-rules.ts + state-rules.ts)
  → Seed (prisma/seed.ts)
  → Database (compliance_rules)
  → Scheduling (scheduling.ts)
  → Compliance Items (per tank/facility)
  → Reminders (reminders.ts → email.ts)
  → Dashboard / Calendar / PDF Reports

Subscription Flow:
Pricing page (TIERS in src/lib/stripe.ts)
  → Checkout (createCheckoutSession(tier))
  → Stripe live price (STARTER/GROWTH/SCALE)
  → Webhook (sets Customer.tier)
  → Dashboard gates features by tier (maxSites, supportLevel)
```

---

*Generated for TankGuard post-Saastudio-strategic-review (branch `claude/review-manus-handover-62MPk`). 1,496 compliance rules × 51 jurisdictions × 3 pricing tiers.*
