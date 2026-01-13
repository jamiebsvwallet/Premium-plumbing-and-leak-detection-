import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-blue-900 dark:text-blue-100 mb-2">
            BSV Premium Plumbing & Leak Detection
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            IoT-powered water management with blockchain anchoring
          </p>
        </header>

        {user ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Welcome, {user.name || user.email}!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Role: {user.role}</p>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/dashboard" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <h3 className="text-xl font-semibold mb-2">Dashboard</h3>
                <p className="text-gray-600 dark:text-gray-400">Manage your devices and view events</p>
              </Link>

              {user.role === 'OPERATOR' || user.role === 'ADMIN' ? (
                <Link href="/operator" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition">
                  <h3 className="text-xl font-semibold mb-2">Operator Panel</h3>
                  <p className="text-gray-600 dark:text-gray-400">Manage job reports and shared devices</p>
                </Link>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link href="/auth/login" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 hover:shadow-lg transition text-center">
              <h3 className="text-2xl font-semibold mb-2">Login</h3>
              <p className="text-gray-600 dark:text-gray-400">Access your account</p>
            </Link>

            <Link href="/auth/signup" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 hover:shadow-lg transition text-center">
              <h3 className="text-2xl font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600 dark:text-gray-400">Create a new account</p>
            </Link>
          </div>
        )}

        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li>✓ IoT device registration and monitoring</li>
            <li>✓ Real-time event ingestion with Socket.IO</li>
            <li>✓ Digital twin visualization</li>
            <li>✓ AR diagnostics with WebXR</li>
            <li>✓ BSV blockchain anchoring (testnet/mainnet)</li>
            <li>✓ Consent-based data sharing with operators</li>
            <li>✓ Job reports with PDF export</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
