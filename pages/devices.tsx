import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

interface Device {
  id: string
  name: string
  type: string | null
  location: string | null
  createdAt: string
  _count: {
    events: number
  }
}

export default function Devices() {
  const router = useRouter()
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    location: '',
  })

  useEffect(() => {
    loadDevices()
  }, [])

  async function loadDevices() {
    try {
      const response = await fetch('/api/devices')
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to load devices')
      }

      const data = await response.json()
      setDevices(data.devices)
    } catch (error) {
      console.error('Error loading devices:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      const response = await fetch('/api/devices/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to register device')
      }

      // Reset form and reload devices
      setFormData({ name: '', type: '', location: '' })
      setShowForm(false)
      loadDevices()
    } catch (error) {
      console.error('Error registering device:', error)
      alert('Failed to register device')
    }
  }

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>My Devices</h1>
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
            {showForm ? 'Cancel' : '+ Register Device'}
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

      {showForm && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '5px' }}>
          <h2>Register New Device</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Device Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Kitchen Pipe Monitor"
                style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Type
              </label>
              <input
                type="text"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="e.g., Leak Detector, Flow Sensor"
                style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Building A, Floor 2"
                style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
              />
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
              Register Device
            </button>
          </form>
        </div>
      )}

      {devices.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', background: '#f9f9f9', borderRadius: '5px' }}>
          <p>No devices registered yet.</p>
          <p>Click "Register Device" to add your first device.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {devices.map((device) => (
            <div
              key={device.id}
              style={{
                padding: '1.5rem',
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '5px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3>{device.name}</h3>
                  {device.type && <p><strong>Type:</strong> {device.type}</p>}
                  {device.location && <p><strong>Location:</strong> {device.location}</p>}
                  <p><strong>Events:</strong> {device._count.events}</p>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>
                    ID: <code>{device.id}</code>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link
                    href={`/digital-twin/${device.id}`}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#0070f3',
                      color: 'white',
                      borderRadius: '5px',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                    }}
                  >
                    Digital Twin
                  </Link>
                  <Link
                    href={`/ar-diagnostics/${device.id}`}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#4CAF50',
                      color: 'white',
                      borderRadius: '5px',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                    }}
                  >
                    AR Diagnostics
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#e3f2fd', borderRadius: '5px' }}>
        <h3>Testing with IoT Simulator</h3>
        <p>Copy a device ID and run:</p>
        <code style={{ display: 'block', padding: '0.5rem', background: 'white', marginTop: '0.5rem' }}>
          npm run simulate -- [deviceId]
        </code>
      </div>
    </div>
  )
}
