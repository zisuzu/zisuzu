import WaitlistForm from '../components/WaitlistForm'

const features = [
  { icon: '📍', title: 'Nearby First', desc: 'Discover activities within your radius using precise location search.' },
  { icon: '💬', title: 'Activity Chat', desc: 'Every activity has a live group chat for participants to coordinate.' },
  { icon: '⚡', title: 'Instant Join', desc: 'One tap to join. No forms, no waiting — just show up and have fun.' },
  { icon: '🛡️', title: 'Trust System', desc: 'Verified profiles and reviews keep the community safe and genuine.' },
]

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="text-2xl font-bold text-violet-600">Roame</span>
        <a href="/waitlist" className="text-sm font-medium text-violet-600 hover:underline">
          Join Waitlist →
        </a>
      </nav>

      {/* Hero */}
      <section className="text-center py-24 px-6 max-w-4xl mx-auto">
        <div className="inline-block bg-violet-50 text-violet-700 text-sm font-medium px-4 py-1 rounded-full mb-6">
          Coming soon to iOS & Android
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Discover activities<br />
          <span className="text-violet-600">happening right now</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Roame connects you with local activities — sports, food, music, outdoors & more.
          Find people near you doing things you love.
        </p>
        <a
          href="/waitlist"
          className="inline-block bg-violet-600 text-white text-lg font-semibold px-8 py-4 rounded-xl hover:bg-violet-700 transition-colors"
        >
          Get Early Access
        </a>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything you need to connect
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to explore?</h2>
        <p className="text-gray-500 mb-8">Join the waitlist and be among the first to get access.</p>
        <WaitlistForm />
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Roame. All rights reserved.
      </footer>
    </main>
  )
}

