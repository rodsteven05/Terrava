import { MapPin, Shield, ShieldCheck, Clock } from 'lucide-react'



export default function AuthLayout({ children, mode = 'login' }) {

  const isLogin = mode === 'login'



  const features = [

    {

      icon: MapPin,

      title: 'Verified Listings',

      desc: 'Browse land listings verified on GIS maps.'

    },

    {

      icon: Clock,

      title: 'Track Payments',

      desc: 'Monitor payment milestones and deadlines.'

    },

    {

      icon: Shield,

      title: 'Blockchain Secured',

      desc: 'Every transaction is cryptographically verified.'

    }

  ]



  return (

    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center gap-10 p-20">

      {/* Left branding card */}

      <div

        className="w-full lg:w-[40%] text-white p-8 rounded-3xl shadow-2xl flex flex-col lg:min-h-[85vh] lg:max-h-[85vh]"

        style={{ background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)' }}

      >

        <div className="relative flex flex-col flex-1">

          {/* Secured badge */}

          <div className="absolute top-0 right-0 hidden md:block">

            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-3 py-1.5 text-xs font-medium">

              <ShieldCheck className="w-3.5 h-3.5" />

              Secured

            </div>

          </div>



          <div className="flex items-center gap-3 mb-6">

            <img

              src="/terrava-logo.png"

              alt="Terrava"

              className="w-11 h-11 rounded-xl bg-white/20 p-1.5 object-contain"

            />

            <div>

              <span className="text-2xl font-extrabold leading-none">Terrava</span>

              <p className="text-white/70 text-xs mt-0.5">Land Selling System</p>

            </div>

          </div>



          <div className="inline-flex items-center justify-center gap-1.5 bg-white/10 border border-white/20 rounded-full w-full max-w-[135px] py-1.5 text-xs font-medium mb-6">
  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 shrink-0" />
  <span className="truncate">Land Selling Portal</span>
</div>



          <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">

            {isLogin ? (

              <>Welcome<br />Back</>

            ) : (

              <>Join<br />Terrava</>

            )}

          </h2>

          <p className="text-white/70 text-base leading-relaxed mb-8">

            {isLogin

              ? 'Sign in to access your land listings, track payments, and manage your properties.'

              : 'Create an account to start buying or selling land with confidence, transparency, and blockchain-backed payments.'}

          </p>



          <div className="flex-1" />



          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {features.map((f) => (

              <div

                key={f.title}

                className={`bg-white/10 border border-white/15 rounded-xl p-4 ${f.title === 'Blockchain Secured' ? 'sm:col-span-2' : ''}`}

              >

                <f.icon className="w-5 h-5 mb-2 text-emerald-200" />

                <h3 className="font-semibold text-sm mb-1">{f.title}</h3>

                <p className="text-white/60 text-xs leading-relaxed">{f.desc}</p>

              </div>

            ))}

          </div>

        </div>



        <p className="text-white/30 text-xs mt-8">© 2025 Terrava. All rights reserved.</p>

      </div>



      {/* Right form card */}

      <div className="w-full lg:w-[40%] bg-white rounded-3xl shadow-2xl p-8 lg:min-h-[85vh] lg:max-h-[85vh] lg:overflow-y-auto">

        {children}

      </div>

    </div>

  )

}