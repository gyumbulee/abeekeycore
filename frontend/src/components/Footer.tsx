export default function Footer() {
  return (
    <footer className="bg-navy-primary pt-16 pb-8 text-white/60">
      <div className="max-w-6xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-11 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2.5 font-heading font-bold text-xl text-white mb-3.5">
              <span className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-blue-accent to-navy-secondary flex items-center justify-center text-sm">
                🔷
              </span>
              Abeekey
            </div>
            <p className="text-sm max-w-[260px]">
              Technology that moves business forward. A Nigerian-owned technology and business solutions company.
            </p>
          </div>

          <div>
            <h4 className="font-body text-xs font-semibold text-white/90 uppercase tracking-wider mb-4">Company</h4>
            <a href="/about" className="block text-sm mb-3 hover:text-white transition-colors">About</a>
            <a href="/services" className="block text-sm mb-3 hover:text-white transition-colors">Services</a>
            <a href="/industries" className="block text-sm mb-3 hover:text-white transition-colors">Industries</a>
          </div>

          <div>
            <h4 className="font-body text-xs font-semibold text-white/90 uppercase tracking-wider mb-4">Contact</h4>
            <a href="mailto:info@abeekey.com" className="block text-sm mb-3 hover:text-white transition-colors">info@abeekey.com</a>
            <a href="tel:+2349066772894" className="block text-sm mb-3 hover:text-white transition-colors">0906 677 2894</a>
            <span className="block text-sm mb-3">Wase, Plateau State</span>
          </div>

          <div>
            <h4 className="font-body text-xs font-semibold text-white/90 uppercase tracking-wider mb-4">Legal</h4>
            <span className="block text-sm mb-3">RC 8152454</span>
            <a href="/privacy" className="block text-sm mb-3 hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms" className="block text-sm mb-3 hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-3 pt-7 text-xs">
          <div>© 2026 Abeekey. All rights reserved.</div>
          <div className="font-mono">RC 8152454 · Registered Nigerian Technology Company</div>
        </div>
      </div>
    </footer>
  );
}