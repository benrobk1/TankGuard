import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm mb-8 inline-block">&larr; Back to Home</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: April 7, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Collection</h2>
            <p className="text-gray-600 leading-relaxed">
              TankGuard collects information you provide when creating an account, including your name, email address, company name, and phone number. We also collect data related to your underground storage tank facilities, compliance records, and inspection documentation that you enter into the platform. Usage data such as login times, pages visited, and feature usage may be collected automatically to improve our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Usage</h2>
            <p className="text-gray-600 leading-relaxed">
              Your data is used to provide and improve the TankGuard compliance tracking service. This includes generating compliance reports, sending deadline reminders, and maintaining your facility records. We may use aggregated, anonymized data for analytics and service improvement. We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Storage</h2>
            <p className="text-gray-600 leading-relaxed">
              Your data is stored on secure, encrypted servers hosted in the United States. We use industry-standard security measures including encryption at rest and in transit, regular backups, and access controls. Data is retained for as long as your account is active and for a reasonable period thereafter for legal and business purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Third-Party Services</h2>
            <p className="text-gray-600 leading-relaxed">
              TankGuard uses third-party services for payment processing (Stripe), email delivery, and infrastructure hosting. These providers are bound by their own privacy policies and data processing agreements. We share only the minimum data necessary for these services to function.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Your Rights</h2>
            <p className="text-gray-600 leading-relaxed">
              You have the right to access, correct, or delete your personal data at any time. You may export your compliance data through the platform. You can opt out of non-essential communications via your notification settings. To request data deletion, contact our support team and we will process your request within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have questions about this privacy policy or your data, please contact us at privacy@tankguard.com or through the support page in your dashboard.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
