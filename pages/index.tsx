import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>Premium Plumbing & Leak Detection</title>
        <meta name="description" content="IoT-enabled leak detection with blockchain verification" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Premium Plumbing & Leak Detection
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              IoT-enabled leak detection with blockchain-verified data integrity
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">For Customers</h2>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li>✓ Real-time leak monitoring</li>
                <li>✓ Instant alerts and notifications</li>
                <li>✓ Digital twin visualization</li>
                <li>✓ AR diagnostics experience</li>
                <li>✓ Blockchain-verified data</li>
              </ul>
              <Link 
                href="/auth/signup" 
                className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Get Started
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">For Operators</h2>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li>✓ Multi-customer dashboard</li>
                <li>✓ Consented data access</li>
                <li>✓ Job report management</li>
                <li>✓ Blockchain audit trail</li>
                <li>✓ Real-time monitoring</li>
              </ul>
              <Link 
                href="/auth/login" 
                className="block w-full bg-gray-800 text-white text-center py-3 rounded-lg hover:bg-gray-900 transition"
              >
                Operator Login
              </Link>
            </div>
          </div>

          <div className="bg-blue-600 text-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-bold mb-2">🔒 Privacy-First</h3>
                <p className="text-blue-100">Customer-controlled consent for data sharing</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">⛓️ Blockchain Verified</h3>
                <p className="text-blue-100">Immutable BSV anchoring for data integrity</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">🥽 AR Ready</h3>
                <p className="text-blue-100">WebXR diagnostics for immersive troubleshooting</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600">
              Already have an account? <Link href="/auth/login" className="text-blue-600 hover:underline">Login</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
