import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PortfolioPage() {
  return (
    <>
      <Navbar />
      <main className="pt-[150px] pb-24 max-w-6xl mx-auto px-8">
        <div className="max-w-[620px] mb-14">
          <div className="font-mono text-[13px] font-medium text-blue-primary uppercase tracking-widest mb-3">Our Work</div>
          <h1 className="font-heading font-bold text-navy-primary text-4xl mb-4">Recent work</h1>
          <p className="text-text-soft text-lg">A look at some of the programmes and systems we&apos;ve delivered.</p>
        </div>
        <div className="bg-surface border border-slate-200/70 rounded-lg p-8">
          <div className="font-mono text-xs text-blue-primary uppercase tracking-wider mb-3">Case Study</div>
          <h3 className="font-heading font-semibold text-navy-primary text-xl mb-3">Abeekey Digital Skills Training Programme</h3>
          <p className="text-text-soft">
            A 3-week capacity-building programme covering Microsoft Excel, Digital Marketing, and Basic Graphic
            Design (Canva), delivered to trainees in Wase, Plateau State, with structured curricula, assessment
            criteria, and certification.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
