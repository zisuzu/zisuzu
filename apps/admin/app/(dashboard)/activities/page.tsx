import { createAdminSupabaseClient } from '../../../lib/supabase'
import { format } from 'date-fns'

type ActivityRow = {
  id: string
  title: string
  status: string
  max_participants: number
  creator_id: string
  start_time: string
  created_at: string
}

export default async function ActivitiesPage() {
  const supabase = createAdminSupabaseClient()
  const { data } = await supabase
    .from('activities')
    .select('id, title, status, max_participants, creator_id, start_time, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const activities = (data ?? []) as ActivityRow[]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Activities</h1>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Title</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Start</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Capacity</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Creator</th>
            </tr>
          </thead>
          <tbody>
            {(activities ?? []).map((activity) => (
              <tr key={activity.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900">{activity.title}</td>
                <td className="px-4 py-3 text-gray-500 capitalize">{activity.status}</td>
                <td className="px-4 py-3 text-gray-500">{format(new Date(activity.start_time), 'MMM d, yyyy h:mm a')}</td>
                <td className="px-4 py-3 text-gray-500">{activity.max_participants}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{activity.creator_id.slice(0, 8)}...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

