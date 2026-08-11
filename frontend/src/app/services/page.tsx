import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Software, Web & IT Services in Nigeria',
  description:
    'Abeekey provides custom software development, web and mobile app development, cloud solutions, API integration, cybersecurity, fintech solutions, IT consulting, business automation, and technical support in Nigeria.',
  alternates: {
    canonical: '/services',
  },
  openGraph: {
    title: 'Software, Web & IT Services in Nigeria | Abeekey',
    description:
      'Explore Abeekey technology services including custom software, websites, mobile apps, cloud infrastructure, APIs, fintech systems, cybersecurity, IT consulting, and business automation.',
    url: 'https://abeekey.com/services',
    type: 'website',
  },
};

const categories = [
  {
    name: 'Software & Web',
    items: [
      {
        icon: '💻',
        title: 'Custom Software Development',
        desc: 'Bespoke business systems built around how your organisation actually works.',
      },
      {
        icon: '🌐',
        title: 'Website Development',
        desc: 'Professional, responsive websites designed to build credibility and generate business.',
      },
      {
        icon: '📱',
        title: 'Mobile App Development',
        desc: 'Fast, user-friendly mobile applications for customers, staff, and public-facing services.',
      },
      {
        icon: '🎨',
        title: 'UI/UX Design',
        desc: 'Clear, intuitive interfaces designed around real users and business objectives.',
      },
      {
        icon: '🛒',
        title: 'E-commerce Solutions',
        desc: 'Online stores with product catalogues, payments, orders, and fulfilment workflows.',
      },
    ],
  },
  {
    name: 'Domains & Hosting',
    items: [
      {
        icon: '🌍',
        title: 'Domain Registration',
        desc: 'Register professional domain names for your business, organisation, project, or personal brand.',
      },
      {
        icon: '🖥️',
        title: 'Shared Web Hosting',
        desc: 'Reliable and affordable hosting for business websites, portfolios, blogs, and web applications.',
      },
      {
        icon: '✉️',
        title: 'Business Email',
        desc: 'Professional email addresses using your own domain to give your business a more credible presence.',
      },
      {
        icon: '🔒',
        title: 'SSL Certificates',
        desc: 'Secure your website with HTTPS and protect customer connections and sensitive information.',
      },
      {
        icon: '🔗',
        title: 'DNS & Website Migration',
        desc: 'DNS configuration, domain connection, hosting migration, and deployment support.',
      },
    ],
  },
  {
    name: 'Cloud & Infrastructure',
    items: [
      {
        icon: '☁️',
        title: 'Cloud Solutions',
        desc: 'Scalable infrastructure and deployment solutions that grow with your organisation.',
      },
      {
        icon: '🔌',
        title: 'API Development & Integration',
        desc: 'Connect your systems and third-party services so information moves without manual work.',
      },
      {
        icon: '🗄️',
        title: 'Database Design',
        desc: 'Secure, well-structured, and scalable data foundations for growing applications.',
      },
      {
        icon: '🛡️',
        title: 'Cybersecurity',
        desc: 'Practical security measures to protect systems, applications, data, and digital operations.',
      },
    ],
  },
  {
    name: 'Business & Digital Solutions',
    items: [
      {
        icon: '💳',
        title: 'FinTech Solutions',
        desc: 'Payment, wallet, ledger, billing, and financial technology solutions for digital businesses.',
      },
      {
        icon: '🧭',
        title: 'IT Consultancy',
        desc: 'Practical technology guidance for organisations planning their next digital investment.',
      },
      {
        icon: '⚙️',
        title: 'Business Automation',
        desc: 'Reduce repetitive manual work by connecting systems and automating business processes.',
      },
      {
        icon: '🔧',
        title: 'Technical Support',
        desc: 'Ongoing maintenance, troubleshooting, updates, and technical support after launch.',
      },
      {
        icon: '🚀',
        title: 'Digital Transformation',
        desc: 'Helping organisations adopt modern tools, systems, and workflows with confidence.',
      },
    ],
  },
  {
    name: 'Training & Capacity Building',
    items: [
      {
        icon: '🎓',
        title: 'IT Training Programmes',
        desc: 'Practical training in Excel, digital tools, graphic design, digital marketing, and other technology skills.',
      },
      {
        icon: '👥',
        title: 'Digital Skills Training',
        desc: 'Helping individuals, teams, and organisations build practical digital capabilities.',
      },
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-[150px] pb-24 max-w-6xl mx-auto px-8">
        <div className="max-w-[620px] mb-16">
          <div className="font-mono text-[13px] font-medium text-blue-primary uppercase tracking-widest mb-3">Technology & Digital Services</div>
          <h1 className="font-heading font-bold text-navy-primary text-4xl mb-4">Technology that helps your business move forward</h1>
          <p className="text-text-soft text-lg">From domains and hosting to software, websites, infrastructure, and business technology, Abeekey provides practical digital solutions for businesses and organisations.</p>
        </div>

        {categories.map((cat) => (
          <div key={cat.name} className="mb-14 last:mb-0">
            <h2 className="font-heading font-semibold text-navy-secondary text-sm uppercase tracking-wide mb-5 pb-3 border-b border-slate-200">
              {cat.name}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
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