import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Premium Plumbing & Leak Detection
            </h1>
            <p className="text-xl text-gray-600">
              IoT-powered water leak detection with blockchain-verified data integrity
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🔐 Get Started</h2>
              <p className="text-gray-600 mb-6">
                Sign up for an account to register your devices and monitor your water systems in real-time.
              </p>
              <div className="space-y-4">
                <Link
                  href="/auth/signup"
                  className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
                <Link
                  href="/auth/login"
                  className="block w-full bg-gray-100 text-gray-900 text-center py-3 rounded-lg hover:bg-gray-200 transition"
                >
                  Log In
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🔧 Features</h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Real-time IoT device monitoring</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Blockchain-verified data integrity</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>3D Digital Twin visualization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>AR diagnostics experience</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Secure data sharing with operators</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📚 Quick Links</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link
                href="/dashboard"
                className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition"
              >
                <h3 className="font-bold text-gray-900 mb-2">Dashboard</h3>
                <p className="text-sm text-gray-600">View your devices and events</p>
              </Link>
              <Link
                href="/consent"
                className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition"
              >
                <h3 className="font-bold text-gray-900 mb-2">Consent Management</h3>
                <p className="text-sm text-gray-600">Control data sharing</p>
              </Link>
              <a
                href="https://github.com/jamiebsvwallet/Premium-plumbing-and-leak-detection-"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition"
              >
                <h3 className="font-bold text-gray-900 mb-2">Documentation</h3>
                <p className="text-sm text-gray-600">Read the docs</p>
              </a>
            </div>
          </div>

          <footer className="text-center mt-12 text-gray-600">
            <p>
              Demo Credentials: admin@example.com / AdminPass123 (operator) | customer@example.com / Customer123 (customer)
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
