import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface User {
  id: string
  email: string
  name: string | null
  role: string
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (!token || !storedUser) {
      router.push('/login')
      return
    }

    setUser(JSON.parse(storedUser))
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <>
      <Head>
        <title>Dashboard - Premium Plumbing</title>
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <button onClick={handleLogout} className="btn-secondary">
              Logout
            </button>
          </div>

          <div className="card mb-6">
            <h2 className="text-2xl font-bold mb-4">Welcome, {user?.name || user?.email}!</h2>
            <p className="text-gray-600">Role: <span className="font-semibold">{user?.role}</span></p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/devices">
              <div className="card hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="text-xl font-bold mb-2 text-blue-600">My Devices</h3>
                <p className="text-gray-600">View and manage your IoT devices</p>
              </div>
            </Link>

            <Link href="/events">
              <div className="card hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="text-xl font-bold mb-2 text-blue-600">Events</h3>
                <p className="text-gray-600">View device events and alerts</p>
              </div>
            </Link>

            <Link href="/consents">
              <div className="card hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="text-xl font-bold mb-2 text-blue-600">Data Sharing</h3>
                <p className="text-gray-600">Manage consent for data sharing</p>
              </div>
            </Link>

            <Link href="/reports">
              <div className="card hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="text-xl font-bold mb-2 text-blue-600">Job Reports</h3>
                <p className="text-gray-600">View service job reports</p>
              </div>
            </Link>

            {user?.role === 'operator' && (
              <Link href="/operator">
                <div className="card hover:shadow-lg transition-shadow cursor-pointer bg-blue-50">
                  <h3 className="text-xl font-bold mb-2 text-blue-600">Operator Tools</h3>
                  <p className="text-gray-600">Access operator-specific features</p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
