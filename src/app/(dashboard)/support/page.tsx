'use client';

import { Phone, Mail, FileText, ExternalLink } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Help &amp; Support</h1>
        <p className="text-gray-500 mt-1">Get help with TankGuard or UST compliance questions</p>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Contact Us</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <a
            href="mailto:support@tankguard.com"
            className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <Mail className="h-5 w-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">Email Support</p>
              <p className="text-xs text-gray-500">support@tankguard.com</p>
            </div>
          </a>
          <a
            href="tel:+18005551234"
            className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <Phone className="h-5 w-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">Phone Support</p>
              <p className="text-xs text-gray-500">Mon–Fri, 8am–6pm ET</p>
            </div>
          </a>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            {
              q: 'How are compliance deadlines calculated?',
              a: 'TankGuard automatically generates compliance schedules based on federal EPA rules (40 CFR Part 280) and your state\'s specific UST regulations. Deadlines are calculated from your tank installation dates, last completion dates, and the required inspection/testing frequencies.',
            },
            {
              q: 'What does "Facility-wide" mean on a compliance item?',
              a: 'Facility-wide items apply to your entire facility rather than a specific tank. Examples include operator training, financial responsibility documentation, and regulatory reporting requirements.',
            },
            {
              q: 'How do I mark a compliance item as complete?',
              a: 'Go to the Compliance page, find the item, and click "Complete." You\'ll be asked to enter who performed the work, attach a document link (e.g., inspection report), and add any notes. This creates an audit trail for inspectors.',
            },
            {
              q: 'What are FINANCIAL and REPORTING items?',
              a: 'These are critical compliance categories. Financial items relate to financial responsibility mechanisms (insurance, bonds, trust funds) required under 40 CFR 280 Subpart H. Reporting items are regulatory filings like Tier II reports or release notifications. Missing these can result in delivery prohibition or enforcement actions.',
            },
            {
              q: 'Can I add a one-time compliance item?',
              a: 'Yes! Click "+ Create Item" on the Compliance page. This is useful for events like tank closures, new installations, ownership changes, or other non-recurring obligations that aren\'t part of the regular schedule.',
            },
            {
              q: 'How do I download an audit report?',
              a: 'On the Dashboard, find your facility in the "Your Facilities" section and click the "PDF" button. This generates a comprehensive audit-ready report including tank inventory, operator information, and all compliance items grouped by status and type.',
            },
          ].map((faq, i) => (
            <details key={i} className="group border border-gray-100 rounded-lg">
              <summary className="flex items-center justify-between cursor-pointer px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors">
                {faq.q}
                <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <p className="px-4 pb-3 text-sm text-gray-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Useful Links */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Useful Resources</h2>
        <div className="space-y-2">
          {[
            { label: 'EPA UST Program', desc: 'Official EPA underground storage tank regulations', icon: ExternalLink },
            { label: 'State UST Programs', desc: 'Find your state\'s UST regulatory agency', icon: ExternalLink },
            { label: '40 CFR Part 280', desc: 'Full text of federal UST technical standards', icon: FileText },
          ].map((link, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-gray-100 px-4 py-3">
              <link.icon className="h-4 w-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">{link.label}</p>
                <p className="text-xs text-gray-500">{link.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm font-medium text-amber-900">Important Disclaimer</p>
        <p className="text-xs text-amber-700 mt-1">
          TankGuard is a compliance tracking and scheduling tool. It does not provide legal, regulatory, or environmental advice. Compliance deadlines and requirements are based on our interpretation of federal and state regulations and may not reflect the most recent amendments. You are solely responsible for ensuring your facilities comply with all applicable laws. Always consult your state implementing agency and/or a qualified environmental compliance professional for authoritative guidance.
        </p>
      </div>
    </div>
  );
}
