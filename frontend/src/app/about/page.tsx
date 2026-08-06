'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const values = ['Integrity', 'Excellence', 'Security', 'Innovation', 'Transparency', 'Customer Success'];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-[150px] pb-24 max-w-3xl mx-auto px-8">
        <div className="font-mono text-[13px] font-medium text-blue-primary uppercase tracking-widest mb-3">
          About Abeekey
        </div>
        <h1 className="font-heading font-bold text-navy-primary text-4xl mb-6">
          Technology that moves business forward.
        </h1>

        <section className="mb-10">
          <h2 className="font-heading font-semibold text-navy-primary text-xl mb-3">Who we are</h2>
          <p className="text-text-soft text-lg">
            Abeekey (ASGL Limited, RC 8152454) is a Nigerian technology and business solutions company
            based in Wase, Plateau State. We design, build, and maintain secure, scalable, digital
            solutions for businesses, governments, and institutions across Nigeria and Africa.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-heading font-semibold text-navy-primary text-xl mb-3">What we do</h2>
          <p className="text-text-soft text-lg">
            From custom software and mobile apps to cloud infrastructure and FinTech systems, we handle
            the full lifecycle of a digital product — strategy, design, development, deployment, and
            ongoing support — so our clients can focus on running their business, not their tech stack.
          </p>
        </section>

        <section className="mb-14">
          <h2 className="font-heading font-semibold text-navy-primary text-xl mb-3">Our approach</h2>
          <p className="text-text-soft text-lg mb-6">
            Our vision is to become one of Africa&apos;s most trusted technology companies — building
            software that helps businesses, governments, and individuals thrive in the digital economy.
            Every engagement is guided by the same principles:
          </p>
          <div className="flex flex-wrap gap-2.5">
            {values.map((v) => (
              <span
                key={v}
                className="text-[13px] font-medium px-3.5 py-2 rounded-full bg-blue-primary/[0.07] text-blue-primary border border-blue-primary/15"
              >
                {v}
              </span>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-heading font-semibold text-navy-primary text-xl mb-5">Leadership</h2>
          <FounderCard />
        </section>
      </main>
      <Footer />
    </>
  );
}

function FounderCard() {
  return (
    <div className="bg-surface border border-slate-200/70 rounded-lg p-7 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
      <img
        src="/founder.jpg"
        alt="Ibrahim Muazu Muazu"
        className="w-28 h-28 rounded-full object-cover shrink-0 bg-navy-primary"
        onError={(e) => {
          // Falls back to an initials avatar until a real photo is added at
          // frontend/public/founder.jpg
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.classList.remove('hidden');
        }}
      />
      <div className="hidden w-28 h-28 rounded-full shrink-0 bg-gradient-to-br from-navy-primary to-navy-secondary text-white font-heading font-bold text-2xl flex items-center justify-center">
        IM
      </div>
      <div>
        <h3 className="font-heading font-semibold text-navy-primary text-lg">Ibrahim Muazu Muazu</h3>
        <p className="text-blue-primary text-sm font-medium mb-3">Founder &amp; Lead Software Engineer</p>
        <p className="text-text-soft text-[15px]">
          Ibrahim founded Abeekey to bring reliable, well-engineered software to Nigerian businesses and
          institutions. He leads the company&apos;s technical direction end to end — from architecture
          and development to the delivery of every client project.
        </p>
      </div>
    </div>
  );
}