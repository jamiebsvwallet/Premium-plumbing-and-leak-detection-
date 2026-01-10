import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface Consent {
  id: string
  granted: boolean
  createdAt: string
  revokedAt: string | null
  operator: {
    id: string
    email: string
    name: string | null
  }
  device: {
    id: string
    deviceId: string
    name: string
  }
}

export default function Consents() {
  const router = useRouter()
  const [consents, setConsents] = useState<Consent[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deviceId, setDeviceId] = useState('')
  const [operatorEmail, setOperatorEmail] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchConsents()
  }, [])

  const fetchConsents = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch('/api/consents/manage', {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setConsents(data.consents)
      }
    } catch (err) {
      console.error('Failed to fetch consents:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch('/api/consents/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ deviceId, operatorEmail }),
      })

      const data = await res.json()

      if (res.ok) {
        fetchConsents()
        setShowForm(false)
        setDeviceId('')
        setOperatorEmail('')
      } else {
        setError(data.error || 'Failed to grant consent')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  const handleRevoke = async (consentId: string) => {
    if (!confirm('Are you sure you want to revoke this consent?')) return

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch('/api/consents/manage', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ consentId }),
      })

      if (res.ok) {
        fetchConsents()
      }
    } catch (err) {
      console.error('Failed to revoke consent:', err)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <>
      <Head>
        <title>Data Sharing Consents - Premium Plumbing</title>
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Data Sharing Consents</h1>
            <div className="space-x-4">
              <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                {showForm ? 'Cancel' : 'Grant Consent'}
              </button>
              <Link href="/dashboard">
                <button className="btn-secondary">← Back</button>
              </Link>
            </div>
          </div>

          {showForm && (
            <div className="card mb-6">
              <h2 className="text-2xl font-bold mb-4">Grant Data Sharing Consent</h2>
              <p className="text-gray-600 mb-4">
                Allow an operator (water company) to access your device data.
              </p>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              <form onSubmit={handleGrant} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Device ID
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
                    placeholder="e.g., SENSOR-001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operator Email
                  </label>
                  <input
                    type="email"
                    className="input"
                    value={operatorEmail}
                    onChange={(e) => setOperatorEmail(e.target.value)}
                    placeholder="e.g., operator@example.com"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Demo operator: operator@example.com
                  </p>
                </div>
                <button type="submit" className="btn-primary">
                  Grant Consent
                </button>
              </form>
            </div>
          )}

          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Active Consents</h2>
            {consents.length === 0 ? (
              <p className="text-gray-500">No consents granted yet.</p>
            ) : (
              <div className="space-y-4">
                {consents.map((consent) => (
                  <div
                    key={consent.id}
                    className="p-4 border rounded-lg flex justify-between items-start"
                  >
                    <div>
                      <h3 className="font-bold text-lg">{consent.device.name}</h3>
                      <p className="text-sm text-gray-600">Device ID: {consent.device.deviceId}</p>
                      <p className="text-sm text-gray-600">
                        Operator: {consent.operator.name || consent.operator.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        Granted: {new Date(consent.createdAt).toLocaleDateString()}
                      </p>
                      <p className={`text-sm font-semibold ${
                        consent.granted && !consent.revokedAt
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        Status: {consent.granted && !consent.revokedAt ? 'Active' : 'Revoked'}
                      </p>
                    </div>
                    {consent.granted && !consent.revokedAt && (
                      <button
                        onClick={() => handleRevoke(consent.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
