import { createAdminSupabaseClient } from '../../../lib/supabase'

export default async function FeatureFlagsPage() {
  const supabase = createAdminSupabaseClient()
  const { data: flags } = await supabase
    .from('feature_flags')
    .select('*')
    .order('flag_key')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Feature Flags</h1>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Flag</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Description</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {(flags ?? []).map((flag) => (
              <tr key={flag.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-violet-700">{flag.flag_key}</td>
                <td className="px-4 py-3 text-gray-500">{flag.description}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    flag.is_enabled ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {flag.is_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-4">
        Toggle flags directly in Supabase dashboard → Table Editor → feature_flags
      </p>
    </div>
  )
}

