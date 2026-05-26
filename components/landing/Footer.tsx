import { PASSPORT_TEMPLATES, COUNTRY_SLUGS } from '@/config/passport-templates'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border mt-8">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="font-display text-xl text-ink mb-2">
              EUID<span className="text-accent">Photo</span>
            </div>
            <p className="text-sm text-ink-4 leading-relaxed">
              Free biometric passport photo tool. ICAO-compliant, instant, no sign-up.
            </p>
          </div>

          {/* Country pages */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-ink-3 mb-4">
              By Country
            </h4>
            <ul className="space-y-2">
              {Object.entries(PASSPORT_TEMPLATES).map(([code, tmpl]) => (
                <li key={code}>
                  <a
                    href={`/${COUNTRY_SLUGS[code]}-passport-photo`}
                    className="text-sm text-ink-4 hover:text-ink transition-colors"
                  >
                    {tmpl.flag} {tmpl.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-ink-3 mb-4">
              Product
            </h4>
            <ul className="space-y-2">
              {[
                { label: 'How it works', href: '#how' },
                { label: 'Features', href: '#features' },
                { label: 'FAQ', href: '#faq' },
                { label: 'Countries', href: '#countries' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-sm text-ink-4 hover:text-ink transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-ink-3 mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-ink-4 hover:text-ink transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-ink-3 mb-4">
                Contact
              </h4>
              <a
                href="mailto:hello@euidphoto.com"
                className="text-sm text-ink-4 hover:text-ink transition-colors"
              >
                hello@euidphoto.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-12 pt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-ink-4">
            © {year} EUIDPhoto. All rights reserved.
          </p>
          <p className="text-xs text-ink-4">
            Not affiliated with any government authority. Photos are not guaranteed to be accepted.
          </p>
        </div>
      </div>
    </footer>
  )
}
