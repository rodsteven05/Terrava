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

    <div
      className="min-h-screen flex flex-col lg:flex-row items-center justify-center gap-10 p-20 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/uploads/backgroun%20picture.jpg')" }}
    >

      {/* Left branding card */}

      <div

        className="w-full lg:w-[40%] p-8 rounded-3xl flex flex-col lg:min-h-[85vh] lg:max-h-[85vh]"

      >

        <div className="relative flex flex-col flex-1">

          {/* Secured badge */}

          <div className="absolute top-0 right-0 hidden md:block">

            <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5)' }}>

              <ShieldCheck className="w-3.5 h-3.5 drop-shadow-lg" />

              Secured

            </div>

          </div>



          <div className="flex items-center gap-3 mb-6">

            <img

              src="/terrava-logo.png"

              alt="Terrava"

              className="w-11 h-11 rounded-xl p-1.5 object-contain bg-white/90 shadow-lg"

            />

            <div>

              <span className="text-2xl font-extrabold leading-none text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5)' }}>Terrava</span>

              <p className="text-white text-xs mt-0.5" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>Land Selling System</p>

            </div>

          </div>



          <div className="inline-flex items-center justify-center gap-1.5 rounded-full w-full max-w-[135px] py-1.5 text-xs font-medium mb-6 text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 shadow-lg" />
  <span className="truncate">Land Selling Portal</span>
</div>



          <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4 text-white" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.6)' }}>

            {isLogin ? (

              <>Welcome<br />Back</>

            ) : (

              <>Join<br />Terrava</>

            )}

          </h2>

          <p className="text-white text-base leading-relaxed mb-8" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5)' }}>

            {isLogin

              ? 'Sign in to access your land listings, track payments, and manage your properties.'

              : 'Create an account to start buying or selling land with confidence, transparency, and blockchain-backed payments.'}

          </p>



          <div className="flex-1" />



          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">

            {features.map((f) => (

              <div

                key={f.title}

                className="rounded-lg p-3"

              >

                <f.icon className="w-4 h-4 mb-1.5 text-emerald-300 drop-shadow-lg" />

                <h3 className="font-semibold text-xs mb-0.5 text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{f.title}</h3>

                <p className="text-white text-[10px] leading-relaxed" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{f.desc}</p>

              </div>

            ))}

          </div>

        </div>



        <p className="text-white text-xs mt-8" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>© 2025 Terrava. All rights reserved.</p>

      </div>



      {/* Right form card */}

      <div className="w-full lg:w-[40%] bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 lg:min-h-[85vh] lg:max-h-[85vh] lg:overflow-y-auto">

        {children}

      </div>

    </div>

  )

}