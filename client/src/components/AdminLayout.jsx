import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar.jsx'

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row bg-brand-50/30">
      <AdminSidebar mobileOpen={mobileOpen} onMobileToggle={setMobileOpen} />
      <main className="flex-1 min-h-screen overflow-auto pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  )
}
