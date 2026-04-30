/**
 * =============================================================================
 * LEGAL REVIEW REQUIRED BEFORE PRODUCTION DEPLOY
 * =============================================================================
 * This file contains the public Terms of Service. The current version was
 * drafted by engineering to reflect product policy decisions from the
 * Saastudio strategic review (3-month service-credit guarantee, mandatory
 * arbitration, limitation of liability).
 *
 * DO NOT PUBLISH until a licensed attorney has reviewed:
 *   - The arbitration clause (enforceability, class-action waiver scope,
 *     opt-out window, and AAA vs JAMS forum selection)
 *   - The limitation-of-liability cap and its interaction with consumer
 *     protection statutes in jurisdictions where TankGuard markets
 *   - Guarantee carve-outs for state rule changes, customer data accuracy,
 *     force majeure, and missed customer acknowledgments
 *   - Governing law + venue (currently Delaware; confirm it aligns with
 *     Saastudio LLC's state of formation)
 *   - Required CAN-SPAM, California CCPA, and EU GDPR disclosures
 *
 * Replace this banner after legal sign-off and include the reviewing
 * attorney / firm + date in the commit message.
 * =============================================================================
 */

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm mb-8 inline-block">&larr; Back to Home</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-2">Last updated: April 20, 2026</p>
        <p className="text-xs uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-10">
          Draft pending legal review. Contact support@tankguard.com for the currently-effective version.
        </p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using TankGuard (the &ldquo;Service&rdquo;), you agree to be bound by these Terms of Service (the &ldquo;Terms&rdquo;) and by our Privacy Policy, which is incorporated by reference. The Service is provided by Saastudio LLC (&ldquo;Saastudio&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). If you do not agree to these Terms, you may not use the Service. We may update these Terms from time to time; material changes will be announced at least 30 days before they take effect, and continued use after the effective date constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
            <p className="text-gray-600 leading-relaxed">
              TankGuard is a software-as-a-service compliance-tracking platform for owners and operators of underground storage tank (UST) systems. The Service includes facility management, compliance calendars, document storage, automated reminders, and reporting features. TankGuard is a tracking tool; it is not legal, regulatory, engineering, or environmental advice, and using it does not substitute for consultation with a qualified professional or communication with the agencies that regulate your facilities.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Account Responsibilities</h2>
            <p className="text-gray-600 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must provide accurate, complete, and current facility, tank, operator, and ownership information. You are responsible for acknowledging, completing, and documenting the compliance tasks the Service surfaces; automated reminders alone do not satisfy any regulatory requirement. Notify us immediately at security@tankguard.com if you suspect unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Pricing &amp; Payment</h2>
            <p className="text-gray-600 leading-relaxed">
              TankGuard is offered in three tiers: <strong>Essentials</strong> ($99 per month, single facility), <strong>Pro</strong> ($499 per month, up to 10 facilities with multi-site dashboard, bulk document upload, and priority email support), and <strong>Enterprise</strong> ($1,499 per month, up to 50 facilities with dedicated onboarding, quarterly compliance review calls, and SSO). A legacy single-plan price remains available only to grandfathered customers re-subscribing after a lapse via a signed support link; it is not offered for new subscriptions. Payment is processed through Stripe and subscriptions renew automatically at the end of each billing period until cancelled. You may cancel at any time through your account settings or the Stripe customer portal. Except as expressly provided in Section 5 (Service Credit Guarantee), fees are non-refundable, including for partial billing periods, unused features, or downgrades.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Service Credit Guarantee</h2>
            <p className="text-gray-600 leading-relaxed">
              If TankGuard fails to surface a recurring compliance deadline that was (a) correctly configured in your account at least 30 days before its due date and (b) supported by the jurisdiction rule set in effect at the time the deadline passed, we will issue a service credit equal to up to three (3) months of subscription fees at your then-current tier. The credit is payable as product credit applied against future invoices only; it is not redeemable for cash, check, or any other form of consideration, and its total value is capped at three (3) months of fees regardless of the number of deadlines affected.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              The guarantee is <strong>not conditioned on any regulatory or enforcement outcome</strong>. You do not need to have received a notice of violation, fine, penalty, or other agency action to claim it; conversely, receiving such an action does not by itself entitle you to the credit — only a documented failure by the Service to surface a properly-configured deadline does.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              The guarantee expressly <strong>does not apply</strong> to any deadline that:
            </p>
            <ul className="list-disc ml-6 text-gray-600 leading-relaxed mt-2">
              <li>depends on facility, tank, operator, or ownership information that was missing, inaccurate, or not updated by you when the deadline was calculated;</li>
              <li>arises under a federal, state, or local rule that took effect within the thirty (30) days preceding its first due date, or under a rule that was amended within that window and where the amendment changed the applicable cadence or scope;</li>
              <li>was surfaced by the Service via in-app calendar, email reminder, or dashboard notification but not acknowledged, completed, or documented by you;</li>
              <li>was affected by force majeure, including but not limited to outages of upstream email providers, payment processors, state agency databases, or internet infrastructure not under Saastudio&rsquo;s reasonable control; or</li>
              <li>falls outside the Service&rsquo;s published scope (e.g., hazardous waste manifesting, aboveground storage tanks, local fire marshal ordinances not encoded in our rule set).</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              To claim the credit, email support@tankguard.com within sixty (60) days of the affected deadline with the facility name, deadline date, and a screenshot of your account&rsquo;s compliance calendar for that month. Credits are applied within one billing cycle of approval.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              To the maximum extent permitted by law, Saastudio, its officers, employees, and agents shall not be liable for any indirect, incidental, consequential, special, exemplary, or punitive damages — including without limitation lost profits, lost revenue, lost data, business interruption, regulatory fines or penalties, cleanup or remediation costs, or third-party claims — arising out of or relating to your use of the Service, even if Saastudio has been advised of the possibility of such damages.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              Saastudio&rsquo;s total aggregate liability to you for all claims arising out of or relating to the Service, whether in contract, tort, warranty, statute, or otherwise, shall not exceed the greater of (a) the total fees you paid to Saastudio for the Service in the twelve (12) months preceding the event giving rise to the claim, or (b) one hundred U.S. dollars ($100). This cap applies regardless of the theory of liability and survives termination of these Terms.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              Some jurisdictions do not allow the exclusion or limitation of certain damages; in those jurisdictions, Saastudio&rsquo;s liability is limited to the smallest extent permitted by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Disclaimer of Warranties</h2>
            <p className="text-gray-600 leading-relaxed">
              THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ACCURACY OF DATA. Saastudio does not warrant that the Service will be uninterrupted, error-free, or that compliance rule data will be complete or free from inaccuracies. You are responsible for independently verifying any compliance requirement before relying on it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Binding Arbitration &amp; Class-Action Waiver</h2>
            <p className="text-gray-600 leading-relaxed">
              <strong>Please read this section carefully; it affects your legal rights.</strong> Except for claims for injunctive relief to protect intellectual property, any dispute, claim, or controversy arising out of or relating to these Terms or the Service shall be resolved exclusively through binding individual arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules and, where applicable, its Consumer Arbitration Rules. The arbitration shall be conducted by a single arbitrator in the English language. The seat of arbitration shall be Wilmington, Delaware, unless otherwise agreed. Judgment on the award rendered by the arbitrator may be entered in any court having jurisdiction.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              <strong>You and Saastudio each waive the right to a trial by jury and the right to participate in a class action, class arbitration, or representative proceeding.</strong> Claims must be brought individually; the arbitrator may not consolidate more than one person&rsquo;s claims or preside over any form of representative or class proceeding.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              <strong>30-day opt-out:</strong> You may opt out of this arbitration agreement by sending written notice to legal@tankguard.com within thirty (30) days of the date you first accepted these Terms. Your notice must include your full name, account email, and a clear statement that you wish to opt out of arbitration. Opting out will not affect any other provision of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Termination</h2>
            <p className="text-gray-600 leading-relaxed">
              Either party may terminate this agreement at any time. You may cancel your subscription through your account settings or the Stripe customer portal. We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or fail to pay fees when due. Upon termination you may request an export of your facility and compliance data within thirty (30) days; after that window, we may delete your data in the ordinary course of operating the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict-of-law provisions, and subject to the arbitration provisions in Section 8. The United Nations Convention on Contracts for the International Sale of Goods does not apply.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              Saastudio LLC &middot; support@tankguard.com &middot; legal@tankguard.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
