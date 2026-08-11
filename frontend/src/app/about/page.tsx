import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'About Abeekey | Nigerian Technology & Digital Solutions Company',
  description:
    'Learn about Abeekey, a Nigerian technology and business solutions company providing software development, digital transformation, domain registration, shared hosting, IT consulting, and technology services.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Abeekey | Nigerian Technology & Digital Solutions Company',
    description:
      'Abeekey helps businesses, institutions, and organisations build, operate, and grow with reliable technology and digital solutions.',
    url: 'https://abeekey.com/about',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Abeekey — Technology & Digital Solutions',
      },
    ],
  },
};

const values = [
  {
    title: 'Integrity',
    desc: 'We communicate clearly, keep our commitments, and operate with accountability.',
  },
  {
    title: 'Excellence',
    desc: 'We focus on quality engineering, thoughtful design, and dependable delivery.',
  },
  {
    title: 'Security',
    desc: 'Security and responsible handling of information are built into our approach.',
  },
  {
    title: 'Innovation',
    desc: 'We use practical technology to solve real operational and business problems.',
  },
  {
    title: 'Transparency',
    desc: 'Clients should understand what we are building, why we are building it, and what it costs.',
  },
  {
    title: 'Customer Success',
    desc: 'Our work is measured by the value it creates for the people and organisations we serve.',
  },
];

const capabilities = [
  'Custom software development',
  'Websites and mobile applications',
  'Domain registration',
  'Shared web hosting',
  'Cloud and infrastructure solutions',
  'API development and integration',
  'FinTech systems',
  'IT consulting and business automation',
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="pt-[72px]">
        <section className="bg-navy-primary px-6 sm:px-8 py-24 sm:py-28">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-3xl">
              <div className="font-mono text-[13px] font-medium text-blue-300 uppercase tracking-widest mb-4">
                About Abeekey
              </div>

              <h1 className="font-heading font-bold text-white text-[clamp(36px,5vw,58px)] leading-tight mb-6">
                Technology that moves business forward.
              </h1>

              <p className="text-white/70 text-lg sm:text-xl leading-relaxed max-w-2xl">
                Abeekey is a Nigerian technology and business solutions company
                helping businesses and organisations build better digital
                products, modernise operations, and establish a reliable
                technology foundation.
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                <Link
                  href="/services"
                  className="inline-flex px-6 py-3 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent"
                >
                  Explore our services
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex px-6 py-3 rounded-sm font-semibold text-white border border-white/20 hover:bg-white/10 transition-colors"
                >
                  Talk to us
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 sm:px-8 py-20">
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-14 items-start">
            <div>
              <div className="font-mono text-[13px] font-medium text-blue-primary uppercase tracking-widest mb-3">
                Who we are
              </div>

              <h2 className="font-heading font-bold text-navy-primary text-3xl sm:text-4xl">
                A technology partner, not just a software vendor.
              </h2>
            </div>

            <div className="space-y-5 text-text-soft text-lg leading-relaxed">
              <p>
                Abeekey (ASGL Limited, RC 8152454) is a Nigerian-owned
                technology and business solutions company based in Wase,
                Plateau State.
              </p>

              <p>
                We design, build, deploy, and support digital solutions for
                businesses, institutions, governments, and organisations
                across Nigeria and beyond.
              </p>

              <p>
                From a business website or domain name to custom software,
                hosting infrastructure, APIs, and FinTech systems, our goal is
                to make technology practical, accessible, secure, and useful.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 px-6 sm:px-8 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-2xl mb-10">
              <div className="font-mono text-[13px] font-medium text-blue-primary uppercase tracking-widest mb-3">
                What we do
              </div>

              <h2 className="font-heading font-bold text-navy-primary text-3xl">
                One technology partner across the digital lifecycle.
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {capabilities.map((item) => (
                <div
                  key={item}
                  className="bg-white border border-slate-200 rounded-lg p-5 text-sm font-medium text-navy-secondary"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 sm:px-8 py-20">
          <div className="max-w-2xl mb-10">
            <div className="font-mono text-[13px] font-medium text-blue-primary uppercase tracking-widest mb-3">
              Our principles
            </div>

            <h2 className="font-heading font-bold text-navy-primary text-3xl">
              How we work
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((value) => (
              <div
                key={value.title}
                className="border border-slate-200 rounded-lg p-6 bg-surface"
              >
                <h3 className="font-heading font-semibold text-navy-primary text-lg mb-2">
                  {value.title}
                </h3>

                <p className="text-text-soft text-sm leading-relaxed">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 sm:px-8 pb-20">
          <div className="font-mono text-[13px] font-medium text-blue-primary uppercase tracking-widest mb-3">
            Leadership
          </div>

          <h2 className="font-heading font-bold text-navy-primary text-3xl mb-8">
            The person behind Abeekey
          </h2>

          <div className="bg-surface border border-slate-200 rounded-xl p-7 sm:p-9 flex flex-col sm:flex-row gap-7 items-center sm:items-start">
            <Image
              src="/founder.jpg"
              alt="Founder of Abeekey"
              width={144}
              height={144}
              className="w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover shrink-0"
            />

            <div>
              <h3 className="font-heading font-bold text-navy-primary text-xl">
                Ibrahim Muazu Muazu
              </h3>

              <p className="text-blue-primary font-medium text-sm mb-4">
                Founder & Lead Software Engineer
              </p>

              <p className="text-text-soft leading-relaxed max-w-2xl">
                Ibrahim founded Abeekey with a focus on delivering reliable,
                well-engineered technology for Nigerian businesses and
                institutions. He leads the company&apos;s technical direction,
                product development, architecture, and delivery.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 sm:px-8 pb-24">
          <div className="bg-gradient-to-br from-navy-primary to-navy-secondary rounded-xl px-7 sm:px-12 py-12 text-center">
            <h2 className="font-heading font-bold text-white text-3xl mb-3">
              Have a technology challenge?
            </h2>

            <p className="text-white/70 max-w-xl mx-auto mb-7">
              Tell us what you are trying to build, improve, automate, or
              launch. We&apos;ll help you determine the right approach.
            </p>

            <Link
              href="/contact"
              className="inline-flex px-7 py-3.5 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent"
            >
              Start a conversation
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
