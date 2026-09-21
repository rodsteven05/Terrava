import { MapPin, Shield, ShieldCheck, Clock } from 'lucide-react'

export default function AuthLayout({ children, mode = 'login' }) {
  const isLogin = mode === 'login'

  const features = [
    { icon: MapPin, title: 'Verified Listings', desc: 'Browse land listings verified on GIS maps.' },
    { icon: Clock, title: 'Track Payments', desc: 'Monitor payment milestones and deadlines.' },
    { icon: Shield, title: 'Blockchain Secured', desc: 'Every transaction is cryptographically verified.' }
  ]

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row items-center justify-center gap-10 p-6 lg:p-12 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/uploads/backgroun%20picture.jpg')" }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-emerald-950/55" />

      {/* Left branding card */}
      <div className="relative w-full lg:w-[42%] p-6 lg:p-10 rounded-3xl flex flex-col lg:min-h-[85vh] lg:max-h-[85vh] bg-emerald-950/35 backdrop-blur-sm border border-white/10 shadow-2xl">

        <div className="relative flex flex-col flex-1">
          {/* Secured badge */}
          <div className="absolute top-0 right-0 hidden md:block">
            <div className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white bg-emerald-800/60 border border-emerald-400/30 backdrop-blur-md shadow-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              Secured
            </div>
          </div>

          {/* Logo + brand */}
          <div className="flex items-center gap-3 mb-6">
            <img
              src="/terrava-logo.png"
              alt="Terrava"
              className="w-12 h-12 rounded-xl p-1.5 object-contain bg-white/95 shadow-lg"
            />
            <div>
              <span className="text-3xl font-extrabold leading-none text-white drop-shadow-md">Terrava</span>
              <p className="text-white/90 text-sm mt-1 font-medium">Land Selling System</p>
            </div>
          </div>

          {/* Portal badge */}
          <div className="inline-flex items-center justify-center gap-2 rounded-full w-fit px-4 py-2 text-sm font-semibold mb-6 text-white bg-emerald-800/50 border border-emerald-400/30 backdrop-blur-md shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span>Land Selling Portal</span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 text-white drop-shadow-lg">
            {isLogin ? <>Welcome<br />Back</> : <>Join<br />Terrava</>}
          </h2>

          <p className="text-white/95 text-base md:text-lg leading-relaxed mb-8 font-medium drop-shadow-md">
            {isLogin
              ? 'Sign in to access your land listings, track payments, and manage your properties.'
              : 'Create an account to start buying or selling land with confidence, transparency, and blockchain-backed payments.'}
          </p>

          <div className="flex-1" />

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl p-4 bg-white/10 border border-white/15 backdrop-blur-sm hover:bg-white/15 transition shadow-lg"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-3">
                  <f.icon className="w-5 h-5 text-emerald-300" />
                </div>
                <h3 className="font-bold text-sm mb-1 text-white">{f.title}</h3>
                <p className="text-white/85 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/80 text-sm mt-8 font-medium">© 2025 Terrava. All rights reserved.</p>
      </div>
      {/* Right form card */}
      <div className="relative w-full lg:w-[40%] bg-white/85 backdrop-blur-md rounded-3xl shadow-2xl p-8 lg:min-h-[85vh] lg:max-h-[85vh] lg:overflow-y-auto">
        {children}
      </div>
    </div>
  )
}