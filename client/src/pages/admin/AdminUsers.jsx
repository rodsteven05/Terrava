import { useEffect, useState } from 'react'
import { useToast } from '../../context/ToastContext.jsx'
import api from '../../api/api.js'
import Spinner from '../../components/Spinner.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { Users, User, Mail, Phone, Shield, Save, Archive, RotateCcw, AlertCircle, X } from 'lucide-react'

export default function AdminUsers() {
  const { addToast } = useToast()
  const [users, setUsers] = useState([])
  const [view, setView] = useState('active')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)
  const [actionTarget, setActionTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchUsers = (targetView = view) => {
    setLoading(true)
    const archived = targetView === 'archived' ? 'true' : 'false'
    api.get(`/admin/users?archived=${archived}`)
      .then((res) => setUsers(res.data))
      .catch(() => addToast('Failed to load users', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchUsers()
  }, [view, addToast])

  const updateRole = async (id, role) => {
    setSaving(id)
    try {
      await api.put(`/admin/users/${id}/role`, { role })
      setUsers(users.map((u) => u.id === id ? { ...u, role } : u))
      addToast('User role updated', 'success')
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to update role', 'error')
    } finally {
      setSaving(null)
    }
  }

  const archiveUser = async () => {
    if (!actionTarget) return
    setActionLoading(true)
    try {
      await api.put(`/admin/users/${actionTarget.id}/archive`)
      setUsers((prev) => prev.filter((user) => user.id !== actionTarget.id))
      addToast('User archived', 'success')
      setActionTarget(null)
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to archive user', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const restoreUser = async () => {
    if (!actionTarget) return
    setActionLoading(true)
    try {
      await api.put(`/admin/users/${actionTarget.id}/restore`)
      setUsers((prev) => prev.filter((user) => user.id !== actionTarget.id))
      addToast('User restored', 'success')
      setActionTarget(null)
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to restore user', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <Spinner size="lg" />

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-brand-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Users</h1>
        </div>
        <div className="inline-flex p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setView('active')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${view === 'active' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Active
          </button>
          <button
            onClick={() => setView('archived')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${view === 'archived' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Archives
          </button>
        </div>
      </div>

      {users.length === 0 ? (
        <EmptyState title="No users" message="No registered users found." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => (
            <div key={u.id} className="bg-white p-5 rounded-2xl shadow-card border border-gray-100 hover:shadow-card-hover transition-all duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-brand-700" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{u.full_name}</p>
                  <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs bg-brand-100 text-brand-700 capitalize font-medium">{u.role}</span>
                </div>
              </div>
              <div className="space-y-2.5 text-sm text-gray-600 bg-gray-50/50 rounded-xl p-3 mb-4">
                <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-brand-500" /> {u.email}</div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-brand-500" /> {u.phone || '—'}</div>
                <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-brand-500" /> <span className="capitalize">{u.role}</span></div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Update Role</label>
                <div className="flex items-center gap-2 mt-1.5">
                  <select
                    value={u.role}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                    disabled={saving === u.id}
                    className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                  {saving === u.id && <Save className="w-4 h-4 text-brand-600 animate-spin" />}
                </div>
                {view === 'active' ? (
                  <button
                    onClick={() => setActionTarget(u)}
                    className="mt-2.5 w-full flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2.5 rounded-xl text-amber-600 border border-amber-200 hover:bg-amber-50 transition"
                  >
                    <Archive className="w-3.5 h-3.5" /> Archive User
                  </button>
                ) : (
                  <button
                    onClick={() => setActionTarget(u)}
                    className="mt-2.5 w-full flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2.5 rounded-xl text-emerald-600 border border-emerald-200 hover:bg-emerald-50 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restore User
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {actionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fadeIn">
            <div className="flex items-start gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${view === 'active' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900">{view === 'active' ? 'Archive user account?' : 'Restore user account?'}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {view === 'active'
                    ? 'This hides the account from the active users list. You can restore it later from Archives.'
                    : 'This brings the account back to the active users list.'}
                </p>
              </div>
              <button onClick={() => setActionTarget(null)} disabled={actionLoading} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-50" aria-label="Close confirmation"><X className="w-4 h-4" /></button>
            </div>
            <div className={`mt-5 rounded-xl border p-4 ${view === 'active' ? 'border-amber-100 bg-amber-50' : 'border-emerald-100 bg-emerald-50'}`}>
              <p className="font-bold text-gray-900 truncate">{actionTarget.full_name || 'Unnamed user'}</p>
              <p className="text-sm text-gray-600 truncate mt-0.5">{actionTarget.email}</p>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setActionTarget(null)} disabled={actionLoading} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50">Cancel</button>
              {view === 'active' ? (
                <button onClick={archiveUser} disabled={actionLoading} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-60"><Archive className="w-4 h-4" /> {actionLoading ? 'Archiving…' : 'Archive Account'}</button>
              ) : (
                <button onClick={restoreUser} disabled={actionLoading} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60"><RotateCcw className="w-4 h-4" /> {actionLoading ? 'Restoring…' : 'Restore Account'}</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
