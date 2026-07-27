import { Inbox } from 'lucide-react'

export default function EmptyState({ title = 'No data found', message = '' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-gray-100 p-4 rounded-full mb-4">
        <Inbox className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      {message && <p className="text-sm text-gray-500 mt-1 max-w-md">{message}</p>}
    </div>
  )
}
