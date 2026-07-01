'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
        <p className="text-sm text-gray-500 mt-2 mb-6">Temporary placeholder until auth guard is wired.</p>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
              placeholder="admin@roame.app"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-violet-600 text-white font-semibold px-4 py-3 rounded-xl hover:bg-violet-700 transition-colors"
          >
            Continue
          </button>
        </form>

        <Link href="/" className="inline-block mt-6 text-sm text-violet-600 hover:underline">
          Back to dashboard
        </Link>
      </div>
    </main>
  )
}

