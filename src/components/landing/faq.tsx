"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What compliance requirements does TankGuard track?",
    a: "TankGuard tracks all EPA 40 CFR Part 280 requirements including release detection, corrosion protection, spill/overfill prevention, operator training, financial responsibility, and periodic inspections. We also track state-specific requirements that go beyond federal minimums.",
  },
  {
    q: "How is this different from an environmental consultant?",
    a: "Environmental consultants charge $3,000-$5,000+ per year and rely on manual tracking. TankGuard is software that never forgets a deadline, costs a fraction of the price, and gives you 24/7 access to your compliance status. Many operators use TankGuard alongside their consultant to ensure nothing falls through the cracks.",
  },
  {
    q: "What if my state has unique requirements?",
    a: "We cover all 50 states. Each state has its own UST program with specific requirements beyond federal EPA rules. TankGuard maintains a database of state-specific regulations and automatically applies them based on your facility locations.",
  },
  {
    q: "How does billing work?",
    a: "TankGuard is $99/month, billed through Stripe. You create your account, subscribe, and then set up your facilities and tanks. There is no free trial — you get full access to all features from day one of your subscription.",
  },
  {
    q: "What happens if regulations change?",
    a: "We continuously monitor EPA and state regulatory changes. When requirements are updated, TankGuard automatically adjusts your compliance calendar and notifies you of any new deadlines or documentation requirements.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto divide-y divide-gray-200">
      {faqs.map((faq, i) => (
        <div key={i}>
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex w-full items-center justify-between py-5 text-left"
          >
            <span className="text-base font-medium text-gray-900 pr-4">{faq.q}</span>
            <ChevronDown
              className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${
                openIndex === i ? "rotate-180" : ""
              }`}
            />
          </button>
          {openIndex === i && (
            <p className="pb-5 text-gray-600 leading-relaxed">{faq.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}
