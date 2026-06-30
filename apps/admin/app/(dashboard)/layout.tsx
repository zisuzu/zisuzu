import Link from 'next/link'

const navItems = [
  { href: '/',           label: '📊 Overview' },
  { href: '/users',      label: '👥 Users' },
  { href: '/activities', label: '🏃 Activities' },
  { href: '/reports',    label: '🚩 Reports' },
  { href: '/flags',      label: '🚀 Feature Flags' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 p-4 flex flex-col gap-1">
        <div className="text-lg font-bold text-violet-600 px-3 py-4 mb-2">Roame Admin</div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}

