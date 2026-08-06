import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const categories = [
  {
    name: 'Software & Web',
    items: [
      { icon: '💻', title: 'Custom Software Development', desc: 'Bespoke systems built around how your business actually works.' },
      { icon: '📱', title: 'Web & Mobile App Development', desc: 'Fast, accessible, mobile-first products for customers, staff, or the public.' },
      { icon: '🎨', title: 'UI/UX Design', desc: 'Interfaces people actually enjoy using, grounded in research and clear hierarchy.' },
      { icon: '🛒', title: 'E-commerce Solutions', desc: 'Online stores built to sell — from catalog to checkout to fulfilment.' },
    ],
  },
  {
    name: 'Cloud & Infrastructure',
    items: [
      { icon: '☁️', title: 'Cloud Solutions', desc: 'Scalable, reliable infrastructure that grows with your business.' },
      { icon: '🔌', title: 'API Development & Integration', desc: 'Connecting your systems so data moves without manual work.' },
      { icon: '🗄️', title: 'Database Design', desc: 'Well-structured, scalable data foundations for growing organisations.' },
      { icon: '🛡️', title: 'Cybersecurity', desc: 'Practical protection for organisations going through digital transformation.' },
    ],
  },
  {
    name: 'Business & Consulting',
    items: [
      { icon: '🏦', title: 'FinTech Solutions', desc: 'Payments, ledgers, and financial workflows built to Nigerian regulatory standards.' },
      { icon: '🧭', title: 'IT Consultancy', desc: 'Clear, practical guidance for organisations planning their next tech investment.' },
      { icon: '⚙️', title: 'Business Automation', desc: 'Removing repetitive manual work from your operations.' },
      { icon: '🔧', title: 'Technical Support', desc: 'Ongoing maintenance and support after launch, not just at handover.' },
    ],
  },
  {
    name: 'Training & Capacity Building',
    items: [
      { icon: '🎓', title: 'IT Training Programmes', desc: 'Hands-on courses in Excel, digital marketing, and graphic design — see our Training page.' },
      { icon: '👥', title: 'Digital Transformation', desc: 'Helping teams and organisations adopt new tools and workflows with confidence.' },
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-[150px] pb-24 max-w-6xl mx-auto px-8">
        <div className="max-w-[620px] mb-16">
          <div className="font-mono text-[13px] font-medium text-blue-primary uppercase tracking-widest mb-3">Our Services</div>
          <h1 className="font-heading font-bold text-navy-primary text-4xl mb-4">Full-lifecycle technology services</h1>
          <p className="text-text-soft text-lg">From strategy to deployment and support, one team handles it all.</p>
        </div>

        {categories.map((cat) => (
          <div key={cat.name} className="mb-14 last:mb-0">
            <h2 className="font-heading font-semibold text-navy-secondary text-sm uppercase tracking-wide mb-5 pb-3 border-b border-slate-200">
              {cat.name}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {cat.items.map((s) => (
                <div key={s.title} className="bg-surface border border-slate-200/70 rounded-lg p-6">
                  <div className="w-11 h-11 rounded-md bg-gradient-to-br from-blue-primary/10 to-blue-accent/15 flex items-center justify-center text-xl mb-5">
                    {s.icon}
                  </div>
                  <h3 className="font-heading font-semibold text-navy-primary text-base mb-2">{s.title}</h3>
                  <p className="text-text-soft text-[13.5px]">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-16 bg-gradient-to-br from-navy-primary to-navy-secondary rounded-lg px-10 py-12 text-center">
          <h2 className="font-heading font-bold text-white text-2xl mb-3">Not sure which service you need?</h2>
          <p className="text-white/70 mb-7">Tell us what you&apos;re trying to solve — we&apos;ll recommend the right approach.</p>
          <a
            href="/contact"
            className="inline-flex px-7 py-3.5 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent shadow-[0_4px_18px_rgba(37,99,235,0.35)]"
          >
            Talk to us →
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}