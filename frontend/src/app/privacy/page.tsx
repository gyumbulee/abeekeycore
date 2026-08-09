import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-[150px] pb-24 max-w-3xl mx-auto px-8">
        <div className="font-mono text-[13px] font-medium text-blue-primary uppercase tracking-widest mb-3">
          Legal
        </div>
        <h1 className="font-heading font-bold text-navy-primary text-4xl mb-2">Privacy Policy</h1>
        <p className="text-text-soft text-sm mb-12">Last updated: August 2026</p>

        <div className="space-y-10 text-text-soft text-[15px] leading-relaxed">
          <section>
            <h2 className="font-heading font-semibold text-navy-primary text-lg mb-3">1. Who we are</h2>
            <p>
              This Privacy Policy explains how ASGL Limited, trading as Abeekey (RC 8152454), 51B Suleiman
              Street, Wase, Plateau State, Nigeria (&quot;Abeekey&quot;, &quot;we&quot;, &quot;us&quot;)
              collects, uses, and protects information when you use our website, client portal, or services.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-navy-primary text-lg mb-3">2. Information we collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Contact form submissions: name, email, phone, company, and message content.</li>
              <li>Client portal accounts: name, email, and password (stored hashed, never in plain text).</li>
              <li>Training applications: name, email, phone, and course preference.</li>
              <li>
                Payment information: processed directly by Flutterwave, our payment processor. We do not
                store your card details — only the transaction result and reference.
              </li>
              <li>
                Domain registration: registrant details (name, email, phone, address) required by domain
                registry policy, submitted to our registrar partner, ConnectReseller, to complete registration.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-navy-primary text-lg mb-3">3. How we use your information</h2>
            <p>
              We use the information above to respond to enquiries, deliver services, process payments,
              register domains on your behalf, and communicate with you about your account, invoices,
              quotations, and contracts. We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-navy-primary text-lg mb-3">4. Third parties we share data with</h2>
            <p>
              Payments are processed by Flutterwave. Domain registrations are processed by ConnectReseller.
              Each of these providers has its own privacy policy governing how they handle data they
              process on our behalf.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-navy-primary text-lg mb-3">5. Data retention</h2>
            <p>
              We retain account, invoice, and contract records for as long as your account is active and
              as required for tax, accounting, and legal compliance in Nigeria.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-navy-primary text-lg mb-3">6. Your rights</h2>
            <p>
              You may request access to, correction of, or deletion of your personal information by
              contacting us at{' '}
              <a href="mailto:info@abeekey.com" className="text-blue-primary hover:underline">
                info@abeekey.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-navy-primary text-lg mb-3">7. Contact</h2>
            <p>
              Questions about this policy can be sent to{' '}
              <a href="mailto:info@abeekey.com" className="text-blue-primary hover:underline">
                info@abeekey.com
              </a>{' '}
              or to our registered address above.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}