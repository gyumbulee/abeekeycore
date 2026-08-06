import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroNetwork from '@/components/HeroNetwork';

const services = [
  { icon: '💻', title: 'Custom Software Development', desc: 'Bespoke systems built around how your business actually works — not the other way around.' },
  { icon: '📱', title: 'Web & Mobile App Development', desc: 'Fast, accessible, mobile-first products for customers, staff, or the public.' },
  { icon: '☁️', title: 'Cloud & API Solutions', desc: 'Scalable infrastructure and integrations that keep your systems talking to each other.' },
  { icon: '🏦', title: 'FinTech Solutions', desc: 'Payments, ledgers, and financial workflows built to Nigerian regulatory standards.' },
  { icon: '🛡️', title: 'IT Consulting & Cybersecurity', desc: 'Practical guidance and protection for organisations going through digital transformation.' },
  { icon: '🎓', title: 'Training & Capacity Building', desc: 'Hands-on programmes in Excel, digital marketing, design, and core digital skills.' },
];

const industries = ['Education', 'Healthcare', 'Finance', 'Government', 'Retail', 'Agriculture', 'NGOs', 'Startups'];

export default function HomePage() {
  return (
    <>
      <Navbar />

      <header className="relative bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,#16305a_0%,#0B1F3A_55%,#071426_100%)] pt-[170px] pb-[140px] px-8 overflow-hidden">
        <HeroNetwork />
        <div className="relative z-10 max-w-[780px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-accent/10 border border-blue-accent/30 text-[#93c5fd] text-[13px] font-mono mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_#10B981]" />
            RC 8152454 · Registered Nigerian Technology Company
          </div>
          <h1 className="font-heading font-bold text-white text-[clamp(38px,5.5vw,62px)] leading-[1.15] mb-5">
            Technology that moves{' '}
            <span className="bg-gradient-to-r from-[#93c5fd] via-blue-accent to-[#93c5fd] bg-clip-text text-transparent">
              business forward.
            </span>
          </h1>
          <p className="text-white/75 text-lg max-w-[560px] mx-auto mb-10">
            Abeekey designs, builds, and maintains secure, scalable digital solutions for businesses, governments, and institutions across Nigeria and Africa.
          </p>
          <div className="flex gap-3.5 justify-center flex-wrap">
            <a href="/contact" className="px-7 py-3.5 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent shadow-[0_4px_18px_rgba(37,99,235,0.35)]">
              Start a Project →
            </a>
            <a href="/services" className="px-7 py-3.5 rounded-sm font-semibold text-white/85 border border-white/20">
              Explore Services
            </a>
          </div>
        </div>

        <div className="relative z-10 flex justify-center gap-14 mt-[88px] flex-wrap">
          {[
            ['17+', 'Service Lines'],
            ['12+', 'Industries Served'],
            ['100%', 'Nigerian-Owned'],
          ].map(([num, label]) => (
            <div key={label} className="text-center">
              <div className="font-heading font-bold text-2xl text-white">{num}</div>
              <div className="text-[13px] text-white/55 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </header>

      <section className="py-24">
        <div className="max-w-6xl mx-auto px-8">
          <div className="max-w-[620px] mx-auto mb-14 text-center">
            <div className="font-mono text-[13px] font-medium text-blue-primary uppercase tracking-widest mb-3.5">What We Do</div>
            <h2 className="font-heading font-bold text-navy-primary text-[clamp(28px,3.5vw,38px)] mb-3.5">
              End-to-end technology, under one roof
            </h2>
            <p className="text-text-soft text-[16.5px]">
              From custom software to cloud infrastructure, we handle the full lifecycle of your digital products.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s) => (
              <div key={s.title} className="bg-surface border border-slate-200/70 rounded-lg p-7 hover:-translate-y-1 hover:shadow-xl transition-all">
                <div className="w-11 h-11 rounded-md bg-gradient-to-br from-blue-primary/10 to-blue-accent/15 flex items-center justify-center text-xl mb-5">
                  {s.icon}
                </div>
                <h3 className="font-heading font-semibold text-navy-primary text-lg mb-2.5">{s.title}</h3>
                <p className="text-text-soft text-[14.5px]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-surface">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="font-mono text-[13px] font-medium text-blue-primary uppercase tracking-widest mb-3.5">Our Mission</div>
              <h2 className="font-heading font-bold text-navy-primary text-[clamp(26px,3vw,34px)] mb-4.5">
                Built to help Africa&apos;s institutions thrive digitally
              </h2>
              <p className="text-text-soft text-base mb-6.5">
                We design, build, and maintain secure, scalable, and user-focused digital solutions that solve
                real-world problems — while delivering exceptional experiences for the people who use them.
              </p>
              <div className="flex flex-wrap gap-2.5">
                {['Integrity', 'Excellence', 'Security', 'Innovation', 'Transparency'].map((v) => (
                  <span key={v} className="text-[13px] font-medium px-3.5 py-2 rounded-full bg-blue-primary/[0.07] text-blue-primary border border-blue-primary/15">
                    {v}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-navy-primary to-navy-secondary rounded-lg p-10 min-h-[380px] flex flex-col justify-center gap-4.5">
              <div className="bg-white/[0.06] border border-white/10 backdrop-blur rounded-md p-5">
                <div className="font-mono text-xs text-[#93c5fd] uppercase tracking-wider mb-2">Vision</div>
                <p className="text-[14.5px] text-white/85">To become one of Africa&apos;s most trusted technology companies.</p>
              </div>
              <div className="bg-white/[0.06] border border-white/10 backdrop-blur rounded-md p-5">
                <div className="font-mono text-xs text-[#93c5fd] uppercase tracking-wider mb-2">Founder</div>
                <p className="text-[14.5px] text-white/85">Ibrahim Muazu Muazu — Founder &amp; CEO, Abeekey</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-bg">
        <div className="max-w-6xl mx-auto px-8">
          <div className="max-w-[620px] mx-auto mb-14 text-center">
            <div className="font-mono text-[13px] font-medium text-blue-primary uppercase tracking-widest mb-3.5">Who We Serve</div>
            <h2 className="font-heading font-bold text-navy-primary text-[clamp(28px,3.5vw,38px)]">Trusted across sectors</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {industries.map((ind) => (
              <div key={ind} className="bg-surface border border-slate-200/70 rounded-md p-5 text-center text-sm font-semibold text-navy-secondary hover:bg-navy-primary hover:text-white hover:-translate-y-0.5 transition-all">
                {ind}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-6xl mx-auto px-8">
          <div className="bg-gradient-to-br from-navy-primary via-navy-secondary to-[#1d4fa8] rounded-lg px-12 py-16 text-center">
            <h2 className="font-heading font-bold text-white text-[clamp(26px,3.2vw,34px)] mb-4">Have a project in mind?</h2>
            <p className="text-white/75 text-base mb-8">Tell us what you&apos;re building — we&apos;ll get back to you with a clear, no-pressure quote.</p>
            <a href="mailto:info@abeekey.com" className="inline-flex px-7 py-3.5 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent shadow-[0_4px_18px_rgba(37,99,235,0.35)]">
              info@abeekey.com
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
