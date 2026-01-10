import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

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
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me')
        
        if (!response.ok) {
          router.push('/login')
          return
        }

        const data = await response.json()
        setUser(data.user)
      } catch (error) {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f0f0f0', borderRadius: '5px' }}>
        <h2>Welcome, {user.name || user.email}!</h2>
        <p>Role: <strong>{user.role}</strong></p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <Link href="/devices" style={{ 
          textDecoration: 'none', 
          color: 'inherit',
          padding: '1.5rem',
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '5px',
        }}>
          <h3>📱 Devices</h3>
          <p>Manage your IoT devices</p>
        </Link>

        <Link href="/reports" style={{ 
          textDecoration: 'none', 
          color: 'inherit',
          padding: '1.5rem',
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '5px',
        }}>
          <h3>📋 Job Reports</h3>
          <p>View and create reports</p>
        </Link>

        {user.role === 'CUSTOMER' && (
          <Link href="/consent" style={{ 
            textDecoration: 'none', 
            color: 'inherit',
            padding: '1.5rem',
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '5px',
          }}>
            <h3>🔐 Consent Management</h3>
            <p>Share data with operators</p>
          </Link>
        )}
      </div>

      <div style={{ marginTop: '3rem', padding: '1rem', background: '#e3f2fd', borderRadius: '5px' }}>
        <h3>Quick Start</h3>
        <ol>
          <li>Register a device in the <Link href="/devices">Devices</Link> page</li>
          <li>Run the IoT simulator: <code>npm run simulate -- [deviceId]</code></li>
          <li>View real-time updates in the Digital Twin page</li>
          <li>Check device events are anchored to BSV blockchain</li>
        </ol>
      </div>
    </div>
  )
}
