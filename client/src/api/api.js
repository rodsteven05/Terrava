import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (config.url?.startsWith('/blockchain')) {
    const ledgerToken = sessionStorage.getItem('blockchainLedgerToken')
    if (ledgerToken) {
      config.headers['X-Ledger-Authorization'] = `Bearer ${ledgerToken}`
    }
  }
  return config
})

export default api
