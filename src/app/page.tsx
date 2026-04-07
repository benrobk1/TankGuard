import Link from "next/link";
import {
  Calendar,
  Bell,
  FolderLock,
  FileCheck,
  Globe,
  Zap,
  Shield,
  Check,
} from "lucide-react";
import { ComplianceCostCalculator } from "@/components/landing/calculator";
import { EarlyAccessForm } from "@/components/landing/early-access-form";
import { FAQ } from "@/components/landing/faq";

const features = [
  {
    icon: Calendar,
    title: "Automatic Compliance Calendar",
    description:
      "Auto-generates every deadline based on EPA + state rules. No more spreadsheets or guesswork.",
  },
  {
    icon: Bell,
    title: "Escalating Reminders",
    description:
      "90/60/30/7 day notifications before every deadline. Never be caught off guard again.",
  },
  {
    icon: FolderLock,
    title: "Document Vault",
    description:
      "Store inspection reports, certificates, and training records in one secure location.",
  },
  {
    icon: FileCheck,
    title: "Audit-Ready Reports",
    description:
      "One-click compliance packet for state inspectors. Be ready for any audit in minutes.",
  },
  {
    icon: Globe,
    title: "50-State Coverage",
    description:
      "Federal EPA + state-specific rules for all 50 states. We handle the regulatory complexity.",
  },
  {
    icon: Zap,
    title: "Smart Onboarding",
    description:
      "Add your tanks, get your complete compliance schedule in minutes. Not weeks.",
  },
];

const steps = [
  {
    num: "1",
    title: "Add your facilities and tanks",
    description:
      "Enter your facility locations and tank details. Our smart onboarding pulls in relevant state requirements automatically.",
  },
  {
    num: "2",
    title: "TankGuard generates your compliance schedule",
    description:
      "We cross-reference EPA 40 CFR Part 280 and your state regulations to build a complete deadline calendar.",
  },
  {
    num: "3",
    title: "Get reminders before every deadline",
    description:
      "Escalating email notifications at 90, 60, 30, and 7 days ensure you never miss a compliance date.",
  },
  {
    num: "4",
    title: "Upload documents and stay audit-ready",
    description:
      "Store inspection reports and certificates in your vault. Generate audit packets with one click.",
  },
];

const pricingFeatures = [
  "Unlimited facilities",
  "Unlimited tanks",
  "All 50 states",
  "Email reminders",
  "Document storage",
  "Audit reports",
  "Compliance calendar",
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Navigation ── */}
      <nav className="bg-slate-900 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-blue-400" />
            <span className="text-lg font-bold text-white">TankGuard</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Never Miss a Tank
            <br />
            Inspection Again
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            TankGuard tracks every EPA and state compliance deadline for your
            underground storage tanks.{" "}
            <span className="text-white font-semibold">$99/month.</span>{" "}
            Replaces your $3,000/year consultant.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              Get Started
            </Link>
            <a
              href="#pricing"
              className="rounded-lg border border-white/20 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              View Pricing
            </a>
          </div>

          <div className="mt-10 flex flex-col items-center">
            <p className="text-sm text-gray-400 mb-2">
              Or sign up for early access updates:
            </p>
            <EarlyAccessForm />
          </div>
        </div>
      </section>

      {/* ── Penalty Section ── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-6xl sm:text-7xl font-extrabold text-red-600">
            $25,000/day
          </p>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            That&apos;s the federal penalty for operating without valid UST
            compliance documentation. State penalties can be even higher.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-8">
              <p className="text-4xl font-bold text-slate-900">152,000</p>
              <p className="mt-2 text-gray-500">Regulated UST facilities</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-8">
              <p className="text-4xl font-bold text-red-600">$25K/day</p>
              <p className="mt-2 text-gray-500">Federal penalty</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-8">
              <p className="text-4xl font-bold text-slate-900">$1M+</p>
              <p className="mt-2 text-gray-500">Average cleanup cost</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Calculator ── */}
      <section className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ComplianceCostCalculator />
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Everything you need to stay compliant
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              TankGuard replaces spreadsheets, calendar reminders, and expensive
              consultants with a single platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="inline-flex items-center justify-center h-11 w-11 rounded-lg bg-blue-50 mb-4">
                  <feature.icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              How it works
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Get compliant in four simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white text-lg font-bold mb-4">
                  {step.num}
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              One plan. Everything included. No surprises.
            </p>
          </div>

          <div className="max-w-md mx-auto rounded-2xl border-2 border-blue-600 bg-white shadow-xl overflow-hidden">
            <div className="bg-blue-600 px-8 py-8 text-center text-white">
              <p className="text-sm font-medium uppercase tracking-wide opacity-80">
                All-Inclusive
              </p>
              <p className="mt-2">
                <span className="text-5xl font-bold">$99</span>
                <span className="text-lg opacity-80">/month</span>
              </p>
              <p className="mt-2 text-sm opacity-80">
                No setup fee. Cancel anytime.
              </p>
            </div>

            <div className="px-8 py-8">
              <ul className="space-y-3">
                {pricingFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link
                  href="/register"
                  className="block w-full rounded-lg bg-blue-600 px-6 py-3 text-center text-base font-semibold text-white hover:bg-blue-500 transition-colors"
                >
                  Get Started
                </Link>
              </div>

              <div className="mt-6 rounded-lg bg-green-50 border border-green-200 p-4">
                <p className="text-sm text-green-800 leading-relaxed">
                  <span className="font-semibold">Guaranteed:</span> If
                  TankGuard misses a compliance deadline that results in a fine,
                  we refund 12 months of subscription fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Frequently asked questions
            </h2>
          </div>
          <FAQ />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-6 w-6 text-blue-400" />
                <span className="text-base font-bold text-white">TankGuard</span>
              </div>
              <p className="text-sm">
                TankGuard by{" "}
                <a
                  href="https://saastudio.org"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Saastudio
                </a>
              </p>
              <p className="text-sm mt-1">
                Contact:{" "}
                <a
                  href="mailto:admin@saastudio.org"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  admin@saastudio.org
                </a>
              </p>
            </div>

            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Link href="/blog" className="hover:text-white transition-colors">
                Blog
              </Link>
              <Link href="/login" className="hover:text-white transition-colors">
                Login
              </Link>
              <Link href="/register" className="hover:text-white transition-colors">
                Register
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
            </nav>
          </div>

          <div className="mt-8 border-t border-white/10 pt-8 text-sm text-center space-y-3">
            <p className="text-xs text-slate-500 max-w-2xl mx-auto">
              TankGuard is a compliance tracking tool and does not constitute legal, regulatory, or environmental advice. You are responsible for verifying compliance requirements with your state implementing agency.
            </p>
            <p>&copy; {new Date().getFullYear()} TankGuard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
