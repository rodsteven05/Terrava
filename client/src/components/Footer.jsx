import { MapPin, Phone, Mail, Building2 } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#064e3b' }} className="text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/terrava-logo.png" alt="Terrava" className="w-9 h-9 rounded-lg" />
              <span className="text-xl font-extrabold">Terrava</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              A modern GIS + blockchain land management system that advances how real estate agencies handle land transactions in the Philippines.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm text-white/60">
              {['About', 'Features', 'How It Works', 'Branches', 'Contact'].map((l) => (
                <li key={l}>
                  <button
                    onClick={() => document.getElementById(l.toLowerCase().replace(/ /g, '-'))?.scrollIntoView({ behavior: 'smooth' })}
                    className="hover:text-white transition"
                  >
                    {l}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-4">Contact</h3>
            <div className="space-y-3 text-sm text-white/60">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>Tagum City, Davao del Norte</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>+63 912 000 0001</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>info@terrava.ph</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-white/30">
          <p>&copy; {new Date().getFullYear()} Terrava. All rights reserved.</p>
          <p>BSIT Capstone Project</p>
        </div>
      </div>
    </footer>
  )
}
