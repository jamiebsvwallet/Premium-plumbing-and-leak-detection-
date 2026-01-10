import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [devices, setDevices] = useState<any[]>([])
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [deviceName, setDeviceName] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [deviceType, setDeviceType] = useState('leak-sensor')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/auth/login')
      return
    }

    setUser(JSON.parse(userData))
    loadDevices(token)
  }, [])

  const loadDevices = async (token: string) => {
    try {
      const response = await fetch('/api/devices', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setDevices(data)
    } catch (error) {
      console.error('Failed to load devices:', error)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('token')

    try {
      const response = await fetch('/api/devices/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: deviceName,
          serialNumber,
          type: deviceType,
        }),
      })

      if (response.ok) {
        setDeviceName('')
        setSerialNumber('')
        setShowRegisterForm(false)
        loadDevices(token!)
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to register device')
      }
    } catch (error) {
      alert('Network error')
    }
  }

  if (!user) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Welcome, {user.name || user.email}</p>
          </div>
          <Link href="/" className="text-blue-600 hover:underline">
            Home
          </Link>
        </header>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">My Devices</h2>
            <button
              onClick={() => setShowRegisterForm(!showRegisterForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              {showRegisterForm ? 'Cancel' : 'Register Device'}
            </button>
          </div>

          {showRegisterForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Register New Device</h3>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Device Name</label>
                  <input
                    type="text"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Serial Number</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={deviceType}
                    onChange={(e) => setDeviceType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700"
                  >
                    <option value="leak-sensor">Leak Sensor</option>
                    <option value="flow-meter">Flow Meter</option>
                    <option value="pressure-sensor">Pressure Sensor</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Register
                </button>
              </form>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => (
              <div key={device.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-2">{device.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Serial: {device.serialNumber}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Type: {device.type || 'N/A'}
                </p>
                <div className="space-y-2">
                  <Link
                    href={`/digital-twin/${device.id}`}
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Digital Twin
                  </Link>
                  <Link
                    href={`/ar-diagnostics/${device.id}`}
                    className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                  >
                    AR Diagnostics
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {devices.length === 0 && !showRegisterForm && (
            <div className="text-center text-gray-600 dark:text-gray-400 py-12">
              No devices registered yet. Click "Register Device" to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
