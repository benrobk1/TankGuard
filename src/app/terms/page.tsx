import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm mb-8 inline-block">&larr; Back to Home</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: April 7, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using TankGuard, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the service. We reserve the right to update these terms at any time, and continued use of the service constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Description of Service</h2>
            <p className="text-gray-600 leading-relaxed">
              TankGuard is a software-as-a-service platform that helps underground storage tank owners and operators track compliance requirements, manage inspection schedules, and maintain regulatory documentation. The service includes facility management, compliance calendars, document storage, and automated reminders.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Account Responsibilities</h2>
            <p className="text-gray-600 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information when creating your account and keep it up to date. You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Payment Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              TankGuard is offered at $99 per month, billed monthly. Payment is processed through Stripe. Your subscription will automatically renew each billing period unless cancelled. You may cancel at any time through your account settings or billing portal. Refunds are not provided for partial billing periods.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              TankGuard is a compliance tracking tool and does not constitute legal, regulatory, or environmental advice. While we strive to maintain accurate and up-to-date regulatory information, you are ultimately responsible for ensuring your facilities meet all applicable federal, state, and local requirements. TankGuard shall not be held liable for any fines, penalties, or damages resulting from regulatory non-compliance. Our total liability is limited to the amount you have paid for the service in the preceding 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Termination</h2>
            <p className="text-gray-600 leading-relaxed">
              Either party may terminate this agreement at any time. You may cancel your subscription through your account settings. We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or fail to pay subscription fees. Upon termination, you may request an export of your data within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions. Any disputes arising from these terms or your use of the service shall be resolved in the state or federal courts located in Delaware.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
