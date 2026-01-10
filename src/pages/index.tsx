import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Head>
        <title>Premium Plumbing & Leak Detection</title>
        <meta name="description" content="IoT-enabled leak detection and prevention system" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Premium Plumbing & Leak Detection
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              IoT-enabled leak detection with blockchain-secured data integrity
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="card hover:shadow-lg transition-shadow">
                <h2 className="text-2xl font-bold mb-4 text-blue-600">Features</h2>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ Real-time IoT device monitoring</li>
                  <li>✓ Blockchain-secured data hashing (BSV)</li>
                  <li>✓ Digital twin visualization</li>
                  <li>✓ AR diagnostics experience</li>
                  <li>✓ Consent-based data sharing</li>
                  <li>✓ Job reports and notifications</li>
                </ul>
              </div>

              <div className="card hover:shadow-lg transition-shadow">
                <h2 className="text-2xl font-bold mb-4 text-blue-600">Get Started</h2>
                <div className="space-y-4">
                  <Link href="/login" className="block">
                    <button className="btn-primary w-full">
                      Login
                    </button>
                  </Link>
                  <Link href="/signup" className="block">
                    <button className="btn-secondary w-full">
                      Sign Up
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-2xl font-bold mb-4 text-blue-600">Quick Links</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/dashboard" className="text-blue-600 hover:underline">
                  → Dashboard
                </Link>
                <Link href="/devices" className="text-blue-600 hover:underline">
                  → Devices
                </Link>
                <Link href="/reports" className="text-blue-600 hover:underline">
                  → Job Reports
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
