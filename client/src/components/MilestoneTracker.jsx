import { CheckCircle2, Circle, FileText, ShieldCheck, CreditCard, Lock } from 'lucide-react'

export default function MilestoneTracker({ listing, hasTransaction }) {
  const steps = [
    { label: 'Listing Submitted', done: true, icon: FileText },
    { label: 'Admin Verified', done: listing.is_verified, icon: ShieldCheck },
    { label: 'Payment Recorded', done: hasTransaction, icon: CreditCard },
    { label: 'Title Processing', done: listing.status === 'sold', icon: Lock }
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="font-semibold text-lg text-gray-900 mb-4">Document Milestone Tracker</h3>
      <div className="relative">
        {steps.map((step, idx) => {
          const Icon = step.done ? CheckCircle2 : Circle
          return (
            <div key={idx} className="flex items-start gap-4 mb-6 last:mb-0">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${step.done ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-400'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className={`font-medium ${step.done ? 'text-gray-900' : 'text-gray-500'}`}>{step.label}</p>
                <p className="text-sm text-gray-500">{step.done ? 'Completed' : 'Pending'}</p>
              </div>
              {idx < steps.length - 1 && (
                <div className={`absolute left-5 top-10 w-0.5 h-8 ${steps[idx + 1].done ? 'bg-brand-500' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
