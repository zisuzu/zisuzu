import { createAdminSupabaseClient } from '../../../lib/supabase'
import { format } from 'date-fns'

type UserRow = {
  id: string
  display_name: string | null
  username: string | null
  created_at: string
}

export default async function UsersPage() {
  const supabase = createAdminSupabaseClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, display_name, username, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const users = (data ?? []) as UserRow[]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users</h1>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Username</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Joined</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((user) => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900">{user.display_name || 'Unnamed user'}</td>
                <td className="px-4 py-3 text-gray-500">@{user.username || 'new-user'}</td>
                <td className="px-4 py-3 text-gray-400">{format(new Date(user.created_at), 'MMM d, yyyy')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

