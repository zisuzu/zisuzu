'use client'

import { useState } from 'react'
import { createClient } from '../lib/supabase'

export default function WaitlistForm() {
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) return

    setStatus('loading')
    const supabase = createClient()

    // Sign up via OTP — creates user + profile via trigger
    const { error: err } = await supabase.auth.signInWithOtp({
      phone: phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`,
    })

    if (err) {
      setError(err.message)
      setStatus('error')
      return
    }

    setStatus('success')
  }

  if (status === 'success') {
    return (
      <div className="inline-block bg-green-50 border border-green-200 text-green-700 px-8 py-4 rounded-xl">
        ✅ You&apos;re on the list! We&apos;ll reach out when we launch in your city.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+91 9876543210"
        className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
        required
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="bg-violet-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-60"
      >
        {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
      </button>
      {error && <p className="text-red-500 text-sm text-center w-full">{error}</p>}
    </form>
  )
}

