import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface Device {
  id: string
  deviceId: string
  name: string
  type: string | null
  metadata: any
  createdAt: string
}

export default function Devices() {
  const router = useRouter()
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deviceId, setDeviceId] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState('leak-sensor')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch('/api/devices/register', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        setDevices(data.devices)
      }
    } catch (err) {
      console.error('Failed to fetch devices:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch('/api/devices/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ deviceId, name, type }),
      })

      const data = await res.json()

      if (res.ok) {
        setDevices([data.device, ...devices])
        setShowForm(false)
        setDeviceId('')
        setName('')
        setType('leak-sensor')
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <>
      <Head>
        <title>Devices - Premium Plumbing</title>
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">My Devices</h1>
            <div className="space-x-4">
              <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                {showForm ? 'Cancel' : 'Register Device'}
              </button>
              <Link href="/dashboard">
                <button className="btn-secondary">← Back</button>
              </Link>
            </div>
          </div>

          {showForm && (
            <div className="card mb-6">
              <h2 className="text-2xl font-bold mb-4">Register New Device</h2>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    Device Name
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Kitchen Leak Sensor"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Device Type
                  </label>
                  <select
                    className="input"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="leak-sensor">Leak Sensor</option>
                    <option value="flow-meter">Flow Meter</option>
                    <option value="pressure-monitor">Pressure Monitor</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary">
                  Register Device
                </button>
              </form>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.length === 0 ? (
              <div className="col-span-full card text-center text-gray-500">
                No devices registered yet. Click "Register Device" to add one.
              </div>
            ) : (
              devices.map((device) => (
                <div key={device.id} className="card hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold mb-2">{device.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">ID: {device.deviceId}</p>
                  <p className="text-sm text-gray-600 mb-4">Type: {device.type}</p>
                  <div className="space-y-2">
                    <Link href={`/digital-twin/${device.deviceId}`}>
                      <button className="btn-primary w-full text-sm">
                        Digital Twin
                      </button>
                    </Link>
                    <Link href={`/ar-diagnostics/${device.deviceId}`}>
                      <button className="btn-secondary w-full text-sm">
                        AR Diagnostics
                      </button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  )
}
