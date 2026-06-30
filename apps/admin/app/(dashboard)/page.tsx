import { createAdminSupabaseClient } from '../../lib/supabase'
import Link from 'next/link'

async function getStats() {
  const supabase = createAdminSupabaseClient()
  const [{ count: users }, { count: activities }, { count: reports }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('activities').select('*', { count: 'exact', head: true }),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])
  return { users: users ?? 0, activities: activities ?? 0, pendingReports: reports ?? 0 }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const cards = [
    { label: 'Total Users',       value: stats.users,          href: '/users',      color: 'bg-violet-50 text-violet-700' },
    { label: 'Total Activities',  value: stats.activities,     href: '/activities', color: 'bg-blue-50 text-blue-700' },
    { label: 'Pending Reports',   value: stats.pendingReports, href: '/reports',    color: 'bg-red-50 text-red-700' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <div className={`rounded-2xl p-6 ${card.color} cursor-pointer hover:opacity-80 transition`}>
              <p className="text-sm font-medium opacity-70">{card.label}</p>
              <p className="text-4xl font-bold mt-1">{card.value}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

