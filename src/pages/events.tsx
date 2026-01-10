import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface Device {
  id: string
  deviceId: string
  name: string
}

export default function Events() {
  const router = useRouter()
  const [devices, setDevices] = useState<Device[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDevices()
  }, [])

  useEffect(() => {
    if (selectedDevice) {
      fetchEvents(selectedDevice)
    }
  }, [selectedDevice])

  const fetchDevices = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch('/api/devices/register', {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setDevices(data.devices)
        if (data.devices.length > 0) {
          setSelectedDevice(data.devices[0].deviceId)
        }
      }
    } catch (err) {
      console.error('Failed to fetch devices:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchEvents = async (deviceId: string) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch(`/api/events/query?deviceId=${deviceId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setEvents(data.events)
      }
    } catch (err) {
      console.error('Failed to fetch events:', err)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <>
      <Head>
        <title>Events - Premium Plumbing</title>
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Device Events</h1>
            <Link href="/dashboard">
              <button className="btn-secondary">← Back</button>
            </Link>
          </div>

          {devices.length === 0 ? (
            <div className="card text-center">
              <p className="text-gray-500 mb-4">No devices registered yet.</p>
              <Link href="/devices">
                <button className="btn-primary">Register a Device</button>
              </Link>
            </div>
          ) : (
            <>
              <div className="card mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Device
                </label>
                <select
                  className="input"
                  value={selectedDevice}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                >
                  {devices.map((device) => (
                    <option key={device.id} value={device.deviceId}>
                      {device.name} ({device.deviceId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="card">
                <h2 className="text-2xl font-bold mb-4">Event History</h2>
                {events.length === 0 ? (
                  <p className="text-gray-500">No events recorded yet for this device.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Timestamp
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Alert
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Flow
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Temp
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Pressure
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            BSV TX
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {events.map((event) => (
                          <tr key={event.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {new Date(event.timestamp).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {event.alertType ? (
                                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                                  {event.alertType}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {event.metrics.flow || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {event.metrics.temperature || '-'}°C
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {event.metrics.pressure || '-'} PSI
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {event.bsvTxId ? (
                                <span className="text-xs text-blue-600" title={event.bsvTxId}>
                                  {event.bsvTxId.substring(0, 8)}...
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  )
}
