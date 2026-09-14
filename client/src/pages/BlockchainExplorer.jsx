import { useEffect, useState } from 'react'
import api from '../api/api.js'
import Spinner from '../components/Spinner.jsx'
import { Link2, ShieldCheck, AlertCircle, Hash, ChevronDown, ChevronUp, User, MapPin, CreditCard, ExternalLink, Lock, Eye, EyeOff } from 'lucide-react'

export default function BlockchainExplorer() {
  const [chain, setChain] = useState([])
  const [valid, setValid] = useState(null)
  const [contract, setContract] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [unlocking, setUnlocking] = useState(false)
  const [unlocked, setUnlocked] = useState(false)

  useEffect(() => {
    if (!unlocked) return

    setLoading(true)
    Promise.all([
      api.get('/blockchain/chain').then((res) => setChain(res.data)),
      api.get('/blockchain/validate').then((res) => setValid(res.data.valid)),
      api.get('/blockchain/contract').then((res) => setContract(res.data))
    ])
      .catch((err) => {
        sessionStorage.removeItem('blockchainLedgerToken')
        setUnlocked(false)
        setError(err.response?.data?.error || 'Unable to unlock the blockchain ledger')
      })
      .finally(() => setLoading(false))
  }, [unlocked])

  const unlockLedger = async (event) => {
    event.preventDefault()
    setError('')
    setUnlocking(true)
    try {
      const response = await api.post('/auth/blockchain-ledger/unlock', { password })
      sessionStorage.setItem('blockchainLedgerToken', response.data.ledgerToken)
      setPassword('')
      setUnlocked(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to verify password')
    } finally {
      setUnlocking(false)
    }
  }

  if (!unlocked) return (
    <div className="max-w-md mx-auto px-4 py-12">
      <form onSubmit={unlockLedger} className="bg-white border border-gray-200 rounded-2xl shadow-card p-6 space-y-5">
        <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center"><Lock className="w-6 h-6" /></div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Unlock Blockchain Ledger</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your admin password to view protected payment audit records.</p>
        </div>
        <div>
          <label htmlFor="ledger-password" className="block text-sm font-semibold text-gray-700 mb-1.5">Admin Password</label>
          <div className="relative">
            <input id="ledger-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required className="w-full rounded-xl border border-gray-300 px-3 py-2.5 pr-11 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-brand-700">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={unlocking} className="w-full rounded-xl bg-brand-600 text-white py-2.5 font-bold hover:bg-brand-700 disabled:opacity-60 transition">{unlocking ? 'Verifying...' : 'Unlock Ledger'}</button>
      </form>
    </div>
  )

  if (loading) return (
    <div className="flex items-center justify-center py-24"><Spinner size="lg" /></div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Blockchain Explorer</h1>
          <p className="text-gray-500 mt-1">Tamper-resistant payment ledger — {chain.length} block{chain.length !== 1 ? 's' : ''} recorded.</p>
        </div>
        <div className="flex items-center gap-3">
          {contract?.explorerUrl && (
            <a
              href={contract.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Contract
            </a>
          )}
          <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm ${
            valid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {valid ? <ShieldCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            Chain {valid ? 'Valid ✓' : 'INVALID ✗'}
          </div>
        </div>
      </div>

      {/* Chain */}
      <div className="space-y-2">
        {chain.map((block, idx) => {
          const txn = block.transaction
          const isGenesis = block.index === 0
          const isOpen = expanded === block.index

          return (
            <div key={block.index}>
              <div className={`bg-white rounded-2xl border shadow-card overflow-hidden transition-all ${
                isGenesis ? 'border-brand-200' : 'border-gray-100'
              }`}>
                {/* Block header row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : block.index)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      isGenesis ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}>
                      #{block.index}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm">
                          {isGenesis ? 'Genesis Block' : `Block #${block.index}`}
                        </span>
                        {isGenesis && (
                          <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-semibold">Origin</span>
                        )}
                        {txn && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                            ₱{Number(txn.amount).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono truncate max-w-xs">{block.hash}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    {txn?.eth_tx_hash && (
                      <a
                        href={`https://sepolia.etherscan.io/tx/${txn.eth_tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 transition"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Etherscan
                      </a>
                    )}
                    <span className="hidden sm:block text-xs text-gray-400">
                      {new Date(block.timestamp).toLocaleString()}
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-gray-100 px-5 py-4 space-y-4 bg-gray-50/50">
                    {/* Hashes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl border border-gray-100 p-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Block Hash</p>
                        <p className="font-mono text-xs break-all text-brand-700">{block.hash}</p>
                      </div>
                      <div className="bg-white rounded-xl border border-gray-100 p-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Previous Hash</p>
                        <p className="font-mono text-xs break-all text-gray-600">{block.previous_hash}</p>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="bg-white rounded-xl border border-gray-100 p-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Timestamp</p>
                        <p className="text-sm text-gray-800">{new Date(block.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="bg-white rounded-xl border border-gray-100 p-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nonce</p>
                        <p className="text-sm font-mono text-gray-800">{block.nonce}</p>
                      </div>
                      <div className="bg-white rounded-xl border border-gray-100 p-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Index</p>
                        <p className="text-sm font-mono text-gray-800">{block.index}</p>
                      </div>
                    </div>

                    {/* Transaction data */}
                    {txn ? (
                      <div className="bg-white rounded-xl border border-emerald-100 p-4 space-y-3">
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Transaction Record</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-400">Property</p>
                              <p className="font-semibold text-gray-900">{txn.listing?.title || '—'}</p>
                              {txn.listing?.location_text && (
                                <p className="text-xs text-gray-500">{txn.listing.location_text}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <CreditCard className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-400">Amount</p>
                              <p className="font-bold text-emerald-700 text-base">₱{Number(txn.amount).toLocaleString()}</p>
                              <p className="text-xs text-gray-500 capitalize">{txn.payment_method?.replace('_', ' ')}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <User className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-400">Buyer</p>
                              <p className="font-semibold text-gray-900">{txn.buyer?.full_name || '—'}</p>
                              <p className="text-xs text-gray-500">{txn.buyer?.email}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <User className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-400">Seller</p>
                              <p className="font-semibold text-gray-900">{txn.seller?.full_name || '—'}</p>
                              <p className="text-xs text-gray-500">{txn.seller?.email}</p>
                            </div>
                          </div>
                        </div>
                        {txn.reference_number && (
                          <div className="pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-400">Reference No.</p>
                            <p className="text-sm font-mono text-gray-700">{txn.reference_number}</p>
                          </div>
                        )}
                        {txn.eth_tx_hash && (
                          <div className="pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-400 mb-1">Ethereum (Sepolia)</p>
                            <a
                              href={`https://sepolia.etherscan.io/tx/${txn.eth_tx_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-mono text-brand-600 hover:underline bg-brand-50 px-2 py-1 rounded-lg"
                            >
                              {txn.eth_tx_hash.slice(0, 20)}…
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-brand-50 rounded-xl border border-brand-100 p-4 text-sm text-brand-700 font-medium text-center">
                        Genesis Block — Chain origin record, no transaction attached.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Chain link arrow */}
              {idx < chain.length - 1 && (
                <div className="flex justify-center py-1">
                  <Link2 className="w-4 h-4 text-brand-300 rotate-90" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
