import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

interface Consent {
  id: string
  granted: boolean
  createdAt: string
  operator: {
    id: string
    email: string
    name: string | null
  }
  device: {
    id: string
    name: string
  } | null
}

interface Device {
  id: string
  name: string
}

export default function ConsentManagement() {
  const router = useRouter()
  const [consents, setConsents] = useState<Consent[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    operatorId: '',
    deviceId: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // Check authentication
      const meResponse = await fetch('/api/auth/me')
      if (!meResponse.ok) {
        router.push('/login')
        return
      }

      // Load consents
      const consentsResponse = await fetch('/api/consent')
      if (consentsResponse.ok) {
        const consentsData = await consentsResponse.json()
        setConsents(consentsData.consents)
      }

      // Load devices
      const devicesResponse = await fetch('/api/devices')
      if (devicesResponse.ok) {
        const devicesData = await devicesResponse.json()
        setDevices(devicesData.devices)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleGrant(e: React.FormEvent) {
    e.preventDefault()

    try {
      const response = await fetch('/api/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operatorId: formData.operatorId,
          deviceId: formData.deviceId || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to grant consent')
      }

      // Reset form and reload consents
      setFormData({ operatorId: '', deviceId: '' })
      setShowForm(false)
      loadData()
      alert('Consent granted successfully!')
    } catch (error: any) {
      console.error('Error granting consent:', error)
      alert(error.message || 'Failed to grant consent')
    }
  }

  async function handleRevoke(operatorId: string, deviceId: string | null) {
    if (!confirm('Are you sure you want to revoke this consent?')) {
      return
    }

    try {
      const response = await fetch('/api/consent', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operatorId,
          deviceId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to revoke consent')
      }

      loadData()
      alert('Consent revoked successfully!')
    } catch (error) {
      console.error('Error revoking consent:', error)
      alert('Failed to revoke consent')
    }
  }

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Consent Management</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '0.5rem 1rem',
              background: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            {showForm ? 'Cancel' : '+ Grant Consent'}
          </button>
          <Link href="/dashboard" style={{
            padding: '0.5rem 1rem',
            background: '#666',
            color: 'white',
            borderRadius: '5px',
            textDecoration: 'none',
          }}>
            ← Back
          </Link>
        </div>
      </div>

      <div style={{ marginBottom: '2rem', padding: '1rem', background: '#e3f2fd', borderRadius: '5px' }}>
        <h3>About Consent Management</h3>
        <p>
          Grant operators access to view your device data. You control who can see your real-time events 
          and historical data. Revoke consent at any time.
        </p>
      </div>

      {showForm && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '5px' }}>
          <h2>Grant Consent to Operator</h2>
          <form onSubmit={handleGrant}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Operator ID *
              </label>
              <input
                type="text"
                value={formData.operatorId}
                onChange={(e) => setFormData({ ...formData, operatorId: e.target.value })}
                required
                placeholder="Enter operator user ID"
                style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
              />
              <small style={{ color: '#666' }}>
                Use the seeded operator: check database for operator@example.com's ID
              </small>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Device (Optional)
              </label>
              <select
                value={formData.deviceId}
                onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
              >
                <option value="">All devices</option>
                {devices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name}
                  </option>
                ))}
              </select>
              <small style={{ color: '#666' }}>
                Leave empty to grant access to all your devices
              </small>
            </div>

            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                background: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Grant Consent
            </button>
          </form>
        </div>
      )}

      {consents.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', background: '#f9f9f9', borderRadius: '5px' }}>
          <p>No active consents.</p>
          <p>Click "Grant Consent" to share your device data with an operator.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {consents.map((consent) => (
            <div
              key={consent.id}
              style={{
                padding: '1.5rem',
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '5px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3>{consent.operator.name || consent.operator.email}</h3>
                <p style={{ color: '#666', marginTop: '0.5rem' }}>
                  <strong>Email:</strong> {consent.operator.email}
                </p>
                <p style={{ color: '#666' }}>
                  <strong>Scope:</strong> {consent.device ? consent.device.name : 'All devices'}
                </p>
                <p style={{ fontSize: '0.9rem', color: '#999', marginTop: '0.5rem' }}>
                  Granted: {new Date(consent.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleRevoke(consent.operator.id, consent.device?.id || null)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Revoke
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#fff3cd', borderRadius: '5px' }}>
        <h3>Testing Consent Flow</h3>
        <ol>
          <li>Use the seeded operator account (operator@example.com / OperatorPass123)</li>
          <li>Get the operator's user ID from the database</li>
          <li>Grant consent to that operator for one of your devices</li>
          <li>Run the IoT simulator for that device</li>
          <li>Log in as the operator and verify they receive the events via Socket.IO</li>
        </ol>
      </div>
    </div>
  )
}
