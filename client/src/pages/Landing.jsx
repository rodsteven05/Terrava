import { Link, useNavigate } from 'react-router-dom'
import {
  MapPin, Shield, BarChart3, Search, ArrowRight, CheckCircle,
  Map, Users, Building2, Phone, Mail, ChevronDown, Landmark, Layers, Clock
} from 'lucide-react'

const features = [
  {
    icon: Map,
    title: 'GIS Geomapping',
    desc: 'Visualize exact lot boundaries, dimensions, and locations on interactive maps. Draw and explore land polygons in real time.'
  },
  {
    icon: Shield,
    title: 'Blockchain Payments',
    desc: 'Every payment is cryptographically recorded on the blockchain — tamper-proof, transparent, and permanently verifiable.'
  },
  {
    icon: BarChart3,
    title: 'Admin Analytics',
    desc: 'Track listings, users, transactions, and branch performance with real-time charts and activity logs.'
  },
  {
    icon: Search,
    title: 'Smart Search',
    desc: 'Find land by location, branch, price, and area size with instant, filtered results across all listings.'
  },
  {
    icon: Layers,
    title: 'Multi-Branch Support',
    desc: 'Manage listings across multiple branches. Each branch operates independently with its own seller account.'
  },
  {
    icon: Landmark,
    title: 'Secure Land Transfer',
    desc: 'Sellers assign listings directly to buyers. Payment milestones are tracked transparently until fully paid.'
  }
]

const steps = [
  {
    num: '01',
    title: 'Browse the Map',
    desc: 'Explore available land listings on an interactive GIS map. See exact lot shapes, sizes, and locations.'
  },
  {
    num: '02',
    title: 'Connect with a Branch',
    desc: 'Find the nearest branch to your location. Contact a seller directly to negotiate and reserve a property.'
  },
  {
    num: '03',
    title: 'Track Your Payment',
    desc: 'Once assigned, your dashboard shows your land with a full payment breakdown and blockchain receipt.'
  }
]

const branches = [
  { name: 'Main Branch — Tagum City', branchKey: 'Main Tagum', address: 'Tagum City, Davao del Norte', phone: '+63 912 000 0001', email: 'mainbranch@terrava.ph', hours: 'Monday - Saturday: 8:00 AM - 5:00 PM' },
  { name: '2nd Branch', branchKey: 'Panabo', address: 'Panabo City, Davao del Norte', phone: '+63 912 000 0002', email: '2ndbranch@terrava.ph', hours: 'Monday - Saturday: 8:00 AM - 5:00 PM' },
  { name: '3rd Branch', branchKey: 'Sto. Tomas', address: 'Sto. Tomas, Davao del Norte', phone: '+63 912 000 0003', email: '3rdbranch@terrava.ph', hours: 'Monday - Saturday: 8:00 AM - 5:00 PM' },
  { name: '4th Branch', branchKey: 'Davao City', address: 'Davao City, Davao del Sur', phone: '+63 912 000 0004', email: '4thbranch@terrava.ph', hours: 'Monday - Saturday: 8:00 AM - 5:00 PM' },
  { name: '5th Branch', branchKey: 'Mati City', address: 'Mati City, Davao Oriental', phone: '+63 912 000 0005', email: '5thbranch@terrava.ph', hours: 'Monday - Saturday: 8:00 AM - 5:00 PM' },
  { name: '6th Branch', branchKey: 'Digos City', address: 'Digos City, Davao del Sur', phone: '+63 912 000 0006', email: '6thbranch@terrava.ph', hours: 'Monday - Saturday: 8:00 AM - 5:00 PM' },
]

const benefits = [
  'Visualize exact lot boundaries and area on a live interactive map',
  'Immutable blockchain records prevent unauthorized payment changes',
  'Centralized dashboard replaces scattered paper-based records',
  'Admin verification system reduces fraudulent listings',
  'Multi-branch management with separate seller accounts per branch',
  'Buyers track payment milestones from reservation to full payment'
]

export default function Landing() {
  const navigate = useNavigate()

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const viewBranchOnMap = (branchKey) => {
    navigate(`/map?branch=${encodeURIComponent(branchKey)}`)
  }

  return (
    <div className="bg-white">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-brand-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Shield className="w-4 h-4 text-brand-300" />
            <span>Secure · Transparent · Blockchain-Verified</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Buy & Sell Land with<br className="hidden md:block" />
            <span className="text-brand-300"> Confidence & Clarity</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Terrava (Terra + VA) advances real estate in the Philippines — combining GIS geomapping and blockchain payment verification to make land transactions transparent, secure, and simple.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-brand-800 px-7 py-3.5 rounded-xl font-bold hover:bg-brand-50 transition shadow-lg"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <button
              onClick={() => scrollTo('about')}
              className="inline-flex items-center gap-2 border border-white/30 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition"
            >
              Learn More <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      </section>

      {/* ── PURPOSE / ABOUT ── */}
      <section id="about" className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-brand-100 text-brand-700 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">About Terrava</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-snug">
              A Modern Platform Built for Real-World Land Transactions
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Terrava is a digital land management system designed for real estate agencies in the Philippines. It bridges the gap between traditional land selling and modern technology — giving buyers, sellers, and administrators a single unified platform.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              With integrated GIS mapping, buyers can explore the exact shape and dimensions of a property before visiting. With blockchain-backed payment records, every transaction becomes tamper-proof and permanently verifiable.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {['GIS Geomapping', 'Blockchain Receipts', 'Multi-Branch', 'Payment Tracking'].map((tag) => (
                <div key={tag} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  {tag}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl p-10 flex flex-col items-center text-center shadow-card">
            <div className="bg-brand-600 rounded-2xl p-5 mb-6 shadow-lg">
              <img src="/terrava-logo.png" alt="Terrava logo" className="w-12 h-12 object-contain rounded-lg" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Why Terrava?</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Paper-based land records are prone to fraud, loss, and disputes. Terrava solves this by digitizing the entire process — from listing to payment — while keeping physical land transfer secure and compliant.
            </p>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="bg-brand-900 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block bg-white/10 text-brand-200 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">Features</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Everything You Need in One Place</h2>
            <p className="text-white/60 max-w-xl mx-auto">Built for buyers, sellers, branch agents, and administrators.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition group">
                <div className="bg-brand-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-500 transition">
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <span className="inline-block bg-brand-100 text-brand-700 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">Process</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">How It Works</h2>
          <p className="text-gray-500 max-w-xl mx-auto">From browsing to fully paid — here's how Terrava makes land buying simple.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-brand-100 z-0" />
              )}
              <div className="relative z-10 inline-flex w-20 h-20 bg-white border-2 border-brand-200 rounded-2xl items-center justify-center mx-auto mb-5 shadow-card">
                <span className="text-2xl font-extrabold text-brand-600">{s.num}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="bg-gradient-to-br from-brand-50 to-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-brand-100 text-brand-700 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">Benefits</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-snug">Designed for Real-World Trust</h2>
              <ul className="space-y-4">
                {benefits.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-gray-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl shadow-card p-8 space-y-4 border border-brand-100">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="bg-brand-600 p-2 rounded-lg"><Shield className="w-5 h-5 text-white" /></div>
                <div>
                  <p className="font-semibold text-gray-900">Blockchain Verified</p>
                  <p className="text-xs text-gray-500">Every payment has a cryptographic block hash</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="bg-brand-600 p-2 rounded-lg"><Map className="w-5 h-5 text-white" /></div>
                <div>
                  <p className="font-semibold text-gray-900">GIS Geomapping</p>
                  <p className="text-xs text-gray-500">Draw and view exact land polygon boundaries</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="bg-brand-600 p-2 rounded-lg"><Building2 className="w-5 h-5 text-white" /></div>
                <div>
                  <p className="font-semibold text-gray-900">6 Branch Offices</p>
                  <p className="text-xs text-gray-500">Serving Davao Region with dedicated branch accounts</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-brand-600 p-2 rounded-lg"><Users className="w-5 h-5 text-white" /></div>
                <div>
                  <p className="font-semibold text-gray-900">Role-Based Access</p>
                  <p className="text-xs text-gray-500">Separate dashboards for Buyers, Sellers & Admins</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BRANCHES ── */}
      <section id="branches" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <span className="inline-block bg-brand-100 text-brand-700 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">Our Branches</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Find a Branch Near You</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Visit any of our branch offices to connect with a seller and start your land transaction journey.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {branches.map((b, i) => (
            <button
              key={i}
              onClick={() => viewBranchOnMap(b.branchKey)}
              className="text-left bg-white border border-gray-100 rounded-2xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-brand-100 p-2 rounded-lg flex-shrink-0 group-hover:bg-brand-600 transition">
                  <Building2 className="w-5 h-5 text-brand-700 group-hover:text-white transition" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-brand-700 transition">{b.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" /> {b.address}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-brand-600 flex-shrink-0" /> {b.phone}</p>
                <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-brand-600 flex-shrink-0" /> {b.email}</p>
                <p className="flex items-start gap-2"><Clock className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" /> {b.hours}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── CREATORS ── */}
      <section id="creators" className="bg-brand-50 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <span className="inline-block bg-brand-100 text-brand-700 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">The Team</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Meet the Creators</h2>
          <p className="text-gray-500 mb-12 max-w-xl mx-auto">The dedicated team behind Terrava — building a better way to buy and sell land in the Philippines.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Homer J. Batawang', role: 'UI/UX Designer & QA Engineer', img: '/Homer.jpg' },
              { name: 'Cristian Li G. Madrona', role: 'Team Lead & Systems Analyst', img: '/Chanli.jpg' },
              { name: 'Rodsteven S. Labad', role: 'Lead Software Engineer', img: '/Steven.jpg' },
            ].map((member) => (
              <div key={member.name} className="bg-white rounded-2xl p-6 shadow-card text-center">
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-4 border-brand-100"
                />
                <p className="font-semibold text-gray-900">{member.name}</p>
                <p className="text-xs text-brand-600 font-medium mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT US ── */}
      <section id="contact" className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div>
            <span className="inline-block bg-brand-100 text-brand-700 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">Contact Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Get in Touch</h2>
            <p className="text-gray-500 leading-relaxed mb-8">
              Have questions about Terrava or want to know more about a specific property? Reach out to our main office or the branch nearest you.
            </p>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="bg-brand-100 p-2.5 rounded-xl"><MapPin className="w-5 h-5 text-brand-700" /></div>
                <div>
                  <p className="font-semibold text-gray-900">Main Office</p>
                  <p className="text-sm text-gray-500">Tagum City, Davao del Norte, Philippines</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-brand-100 p-2.5 rounded-xl"><Phone className="w-5 h-5 text-brand-700" /></div>
                <div>
                  <p className="font-semibold text-gray-900">Phone</p>
                  <p className="text-sm text-gray-500">+63 912 000 0001</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-brand-100 p-2.5 rounded-xl"><Mail className="w-5 h-5 text-brand-700" /></div>
                <div>
                  <p className="font-semibold text-gray-900">Email</p>
                  <p className="text-sm text-gray-500">info@terrava.ph</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-card">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Send us a Message</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Your Full Name" className="input-field" />
              <input type="email" placeholder="Email Address" className="input-field" />
              <input type="text" placeholder="Subject" className="input-field" />
              <textarea rows={4} placeholder="Your message..." className="input-field resize-none" />
              <button type="submit" className="btn-primary w-full justify-center py-3">
                Send Message <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-gradient-to-r from-brand-700 to-brand-900 py-16 px-4 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Find Your Land?</h2>
        <p className="text-white/70 mb-8 max-w-xl mx-auto">Join Terrava today and experience a smarter, safer way to buy and sell land in the Philippines.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-white text-brand-800 px-7 py-3.5 rounded-xl font-bold hover:bg-brand-50 transition shadow-lg">
            Create an Account <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/login" className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition">
            Sign In
          </Link>
        </div>
      </section>

    </div>
  )
}
