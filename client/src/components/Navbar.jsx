import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { MapPin, LogOut, User, Menu, X, ChevronDown, Home, BarChart3, Building2, Bell, Shield } from 'lucide-react'
import { useNotifications } from '../context/NotificationContext.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const dropdownRef = useRef(null)
  const notifRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setMobileOpen(false)
    setDropdownOpen(false)
  }

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const publicLinks = [
    { label: 'About', href: '#about' },
    { label: 'Features', href: '#features' },
    { label: 'Branches', href: '#branches' },
    { label: 'Contact', href: '#contact' },
  ]

  const initials = user?.full_name
    ? user.full_name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  const scrollTo = (id) => {
    const el = document.getElementById(id.replace('#', ''))
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-extrabold text-xl text-brand-800 flex-shrink-0">
            <img src="/terrava-logo.png" alt="Terrava" className="w-9 h-9 rounded-lg shadow-sm" />
            Terrava
          </Link>

          {/* Desktop — public nav links (only on landing) */}
          {!user && pathname === '/' && (
            <div className="hidden md:flex items-center gap-6">
              {publicLinks.map((l) => (
                <button
                  key={l.label}
                  onClick={() => scrollTo(l.href)}
                  className="text-sm font-medium text-gray-600 hover:text-brand-700 transition"
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}

          {/* Desktop — right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2 rounded-xl hover:bg-brand-50 transition text-gray-600 hover:text-brand-700"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50 max-h-[28rem] overflow-y-auto">
                      <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                        <p className="text-sm font-bold text-gray-900">Notifications</p>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markAllAsRead()}
                            className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-gray-500 text-center">No notifications yet</p>
                      ) : (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => {
                              if (!n.is_read) markAsRead(n.id)
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 last:border-0 ${
                              n.is_read ? 'bg-white' : 'bg-brand-50/40'
                            }`}
                          >
                            <p className={`text-sm ${n.is_read ? 'text-gray-700 font-medium' : 'text-gray-900 font-bold'}`}>
                              {n.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {new Date(n.created_at).toLocaleString()}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-brand-50 transition group"
                  >
                  <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {initials}
                  </div>
                  <span className="text-sm font-semibold text-gray-800 max-w-[120px] truncate">{user.full_name}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{user.full_name}</p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs bg-brand-100 text-brand-700 font-semibold capitalize">{user.role}</span>
                    </div>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition"
                      >
                        <Shield className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition"
                    >
                      <User className="w-4 h-4" /> View Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition w-full text-left"
                    >
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </div>
                )}
              </div>
            </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-700 hover:text-brand-700 px-4 py-2 rounded-lg hover:bg-brand-50 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-bold bg-brand-600 text-white px-5 py-2.5 rounded-xl hover:bg-brand-700 transition shadow-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-brand-700 rounded-lg hover:bg-brand-50 transition"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
          {!user && pathname === '/' && publicLinks.map((l) => (
            <button
              key={l.label}
              onClick={() => scrollTo(l.href)}
              className="block w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 rounded-lg transition"
            >
              {l.label}
            </button>
          ))}

          {user ? (
            <>
              <div className="flex items-center gap-3 px-3 py-3 border-b border-gray-100 mb-2">
                <div className="w-9 h-9 bg-brand-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{user.full_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
              <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2.5 text-sm text-gray-700">
                  <Bell className="w-4 h-4" /> Notifications
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => { markAllAsRead(); setMobileOpen(false) }}
                    className="text-xs text-brand-600 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              {user.role === 'admin' && (
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-brand-50 rounded-lg transition">
                  <Shield className="w-4 h-4" /> Admin Dashboard
                </Link>
              )}
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-brand-50 rounded-lg transition">
                <User className="w-4 h-4" /> View Profile
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition w-full text-left">
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="text-center text-sm font-semibold text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition">
                Login
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="text-center text-sm font-bold bg-brand-600 text-white px-4 py-2.5 rounded-xl hover:bg-brand-700 transition">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
