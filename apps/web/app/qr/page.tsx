const links = [
  {
    label: 'Expo Go (Mobile App)',
    value: 'exp://192.168.1.8:8081',
  },
  {
    label: 'Roame Web',
    value: 'http://192.168.1.8:3000',
  },
  {
    label: 'Roame Admin',
    value: 'http://192.168.1.8:3001',
  },
]

function qrUrl(value: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(value)}`
}

export default function QrPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Device QR Links</h1>
        <p className="text-gray-500 mb-8">Open this page on your Mac and scan from iPhone camera / Expo Go.</p>

        <div className="grid gap-6 md:grid-cols-3">
          {links.map((item) => (
            <div key={item.label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">{item.label}</p>
              <img src={qrUrl(item.value)} alt={`QR for ${item.label}`} className="rounded-lg border border-gray-100" />
              <p className="text-xs text-gray-500 mt-4 break-all">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

