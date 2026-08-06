import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const industries = ['Education', 'Healthcare', 'Finance', 'Government', 'Retail', 'Logistics', 'Agriculture', 'Hospitality', 'Construction', 'Manufacturing', 'NGOs', 'Startups'];

export default function IndustriesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-[150px] pb-24 max-w-6xl mx-auto px-8">
        <div className="max-w-[620px] mb-14">
          <div className="font-mono text-[13px] font-medium text-blue-primary uppercase tracking-widest mb-3">Industries We Serve</div>
          <h1 className="font-heading font-bold text-navy-primary text-4xl mb-4">Built for sectors that can&apos;t afford downtime</h1>
          <p className="text-text-soft text-lg">We tailor our approach to the regulatory and operational realities of each sector.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {industries.map((ind) => (
            <div key={ind} className="bg-surface border border-slate-200/70 rounded-md p-5 text-center text-sm font-semibold text-navy-secondary">
              {ind}
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
