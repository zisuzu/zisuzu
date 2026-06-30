import { createAdminSupabaseClient } from '../../../lib/supabase'
import { format } from 'date-fns'

export default async function ReportsPage() {
  const supabase = createAdminSupabaseClient()
  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports Queue</h1>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Reason</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody>
            {(reports ?? []).map((r) => (
              <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900 capitalize">{r.target_type}</td>
                <td className="px-4 py-3 text-gray-600">{r.reason}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    r.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                    r.status === 'actioned' ? 'bg-green-50 text-green-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {format(new Date(r.created_at), 'MMM d, yyyy')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

