import Link from 'next/link'
import WaitlistForm from '../../components/WaitlistForm'

export default function WaitlistPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-violet-600 hover:underline">← Back to home</Link>

        <div className="bg-white border border-gray-100 rounded-2xl p-8 mt-4">
          <h1 className="text-3xl font-bold text-gray-900">Join the Roame waitlist</h1>
          <p className="text-gray-500 mt-3 mb-8">
            Get early access when Roame launches in your city. We will send your OTP to confirm your spot.
          </p>
          <WaitlistForm />
        </div>
      </div>
    </main>
  )
}

