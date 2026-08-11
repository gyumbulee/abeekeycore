import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Industries We Serve | Abeekey',
  description:
    'Abeekey provides technology, software, digital transformation, hosting, and business solutions for education, healthcare, finance, government, retail, agriculture, logistics, NGOs, startups, and other sectors.',
  alternates: {
    canonical: '/industries',
  },
  openGraph: {
    title: 'Industries We Serve | Abeekey',
    description:
      'Technology solutions tailored to the operational realities of different industries.',
    url: 'https://abeekey.com/industries',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Abeekey — Industries We Serve',
      },
    ],
  },
};

const industries = [
  {
    name: 'Education',
    desc: 'Student platforms, school management systems, digital learning tools, websites, and training solutions.',
  },
  {
    name: 'Healthcare',
    desc: 'Digital systems that help organisations manage information, workflows, communication, and service delivery.',
  },
  {
    name: 'Finance & FinTech',
    desc: 'Payment systems, financial workflows, integrations, ledgers, dashboards, and secure digital products.',
  },
  {
    name: 'Government',
    desc: 'Digital platforms and operational systems designed around public-sector processes and accountability.',
  },
  {
    name: 'Retail & E-commerce',
    desc: 'Online stores, catalogues, payment integrations, customer experiences, and business automation.',
  },
  {
    name: 'Logistics',
    desc: 'Technology for managing operations, records, workflows, customers, and logistics processes.',
  },
  {
    name: 'Agriculture',
    desc: 'Digital tools supporting agricultural businesses, organisations, records, marketplaces, and operations.',
  },
  {
    name: 'Hospitality',
    desc: 'Websites, booking workflows, digital customer experiences, and operational technology.',
  },
  {
    name: 'Construction',
    desc: 'Business websites, internal systems, workflow automation, and digital infrastructure.',
  },
  {
    name: 'Manufacturing',
    desc: 'Technology that helps organisations manage processes, information, operations, and reporting.',
  },
  {
    name: 'NGOs & Nonprofits',
    desc: 'Websites, digital platforms, data systems, automation, and technology support for mission-driven organisations.',
  },
  {
    name: 'Startups',
    desc: 'MVP development, product engineering, infrastructure, integrations, and technology strategy for growing companies.',
  },
];

export default function IndustriesPage() {
  return (
    <>
      <Navbar />

      <main className="pt-[72px]">
        <section className="bg-navy-primary px-6 sm:px-8 py-24 sm:py-28">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-3xl">
              <div className="font-mono text-[13px] font-medium text-blue-300 uppercase tracking-widest mb-4">
                Industries We Serve
              </div>

              <h1 className="font-heading font-bold text-white text-[clamp(36px,5vw,58px)] leading-tight mb-6">
                Technology built around how your industry actually works.
              </h1>

              <p className="text-white/70 text-lg sm:text-xl leading-relaxed max-w-2xl">
                Different industries have different operational, regulatory,
                and customer requirements. We adapt our technology solutions
                accordingly.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 sm:px-8 py-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {industries.map((industry) => (
              <article
                key={industry.name}
                className="bg-surface border border-slate-200/80 rounded-xl p-7 hover:-translate-y-1 hover:shadow-lg transition-all"
              >
                <h2 className="font-heading font-bold text-navy-primary text-xl mb-3">
                  {industry.name}
                </h2>

                <p className="text-text-soft text-sm leading-relaxed">
                  {industry.desc}
                </p>

                <Link
                  href="/contact"
                  className="inline-flex mt-5 text-sm font-semibold text-blue-primary hover:underline"
                >
                  Discuss your needs →
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 sm:px-8 pb-24">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-7 sm:px-12 py-12">
            <div className="max-w-2xl">
              <div className="font-mono text-[13px] font-medium text-blue-primary uppercase tracking-widest mb-3">
                Not listed?
              </div>

              <h2 className="font-heading font-bold text-navy-primary text-3xl mb-4">
                We can still help.
              </h2>

              <p className="text-text-soft leading-relaxed mb-7">
                Our capabilities are not limited to a fixed list of industries.
                If your organisation has a technology or digital challenge,
                tell us what you need and we&apos;ll assess how we can help.
              </p>

              <Link
                href="/contact"
                className="inline-flex px-6 py-3 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent"
              >
                Talk to Abeekey
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
