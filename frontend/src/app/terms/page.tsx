import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-[150px] pb-24 max-w-3xl mx-auto px-8">
        <div className="font-mono text-[13px] font-medium text-blue-primary uppercase tracking-widest mb-3">
          Legal
        </div>
        <h1 className="font-heading font-bold text-navy-primary text-4xl mb-2">Terms of Service</h1>
        <p className="text-text-soft text-sm mb-12">Last updated: August 2026</p>

        <div className="space-y-10 text-text-soft text-[15px] leading-relaxed">
          <section>
            <h2 className="font-heading font-semibold text-navy-primary text-lg mb-3">1. Acceptance of terms</h2>
            <p>
              By using this website, the Abeekey client portal, or engaging ASGL Limited, trading as
              Abeekey (RC 8152454), for services, you agree to these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-navy-primary text-lg mb-3">2. Services</h2>
            <p>
              Abeekey provides software development, web and mobile development, IT consultancy, FinTech
              solutions, cloud solutions, ICT training, and related business services. Specific project
              scope, deliverables, and pricing are set out in individual quotations and contracts issued
              to each client.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-navy-primary text-lg mb-3">3. Client portal accounts</h2>
            <p>
              You are responsible for keeping your login credentials confidential and for all activity
              under your account. Notify us immediately at{' '}
              <a href="mailto:info@abeekey.com" className="text-blue-primary hover:underline">
                info@abeekey.com
              </a>{' '}
              if you suspect unauthorised access.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-navy-primary text-lg mb-3">4. Payments</h2>
            <p>
              Invoices are payable within the terms stated on each invoice. Payments are processed
              securely through Flutterwave. All amounts are in Nigerian Naira (₦) unless otherwise stated.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-navy-primary text-lg mb-3">5. Domain registration</h2>
            <p>
              Domain registrations made through Abeekey are processed via our reseller partner,
              ConnectReseller, and are subject to the registration policies of the relevant domain
              registry. Domain registration fees are non-refundable once a domain has been successfully
              registered.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-navy-primary text-lg mb-3">6. Quotations and contracts</h2>
            <p>
              Quotations are valid until the date stated and may be accepted or declined through the
              client portal. Accepted quotations and signed contracts govern the specific terms of each
              engagement, including deliverables, timelines, and payment schedules.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-navy-primary text-lg mb-3">7. Intellectual property</h2>
            <p>
              Unless otherwise agreed in writing, ownership of deliverables transfers to the client upon
              full payment. Abeekey retains the right to reuse general knowledge, techniques, and
              non-proprietary code developed during an engagement.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-navy-primary text-lg mb-3">8. Limitation of liability</h2>
            <p>
              Abeekey provides services with reasonable skill and care but does not guarantee
              uninterrupted or error-free operation of any software or system. Our liability for any
              claim is limited to the amount paid for the specific service giving rise to the claim.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-navy-primary text-lg mb-3">9. Governing law</h2>
            <p>These Terms are governed by the laws of the Federal Republic of Nigeria.</p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-navy-primary text-lg mb-3">10. Contact</h2>
            <p>
              Questions about these Terms can be sent to{' '}
              <a href="mailto:info@abeekey.com" className="text-blue-primary hover:underline">
                info@abeekey.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}