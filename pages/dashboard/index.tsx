import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface Device {
  id: string;
  deviceId: string;
  name: string;
  type: string;
  createdAt: string;
  _count?: {
    events: number;
  };
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [newDevice, setNewDevice] = useState({ deviceId: '', name: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    setUser(JSON.parse(userData));
    loadDevices(token);
  }, []);

  const loadDevices = async (token: string) => {
    try {
      const response = await fetch('/api/devices/register', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDevices(data.devices);
      }
    } catch (error) {
      console.error('Failed to load devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/devices/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDevice),
      });

      if (response.ok) {
        setNewDevice({ deviceId: '', name: '' });
        setShowRegister(false);
        loadDevices(token!);
      } else {
        const data = await response.json();
        alert(data.error);
      }
    } catch (error) {
      console.error('Failed to register device:', error);
      alert('Failed to register device');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Dashboard - Premium Plumbing</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Premium Plumbing Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{user?.email}</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {user?.role}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Navigation */}
          <div className="mb-8 flex space-x-4">
            <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Devices
            </Link>
            <Link href="/dashboard/consents" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              Consents
            </Link>
            <Link href="/dashboard/reports" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              Reports
            </Link>
          </div>

          {/* Devices Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Devices</h2>
              <button
                onClick={() => setShowRegister(!showRegister)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Register Device
              </button>
            </div>

            {showRegister && (
              <form onSubmit={handleRegisterDevice} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Device ID</label>
                    <input
                      type="text"
                      required
                      value={newDevice.deviceId}
                      onChange={(e) => setNewDevice({ ...newDevice, deviceId: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="e.g., LEAK-001"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Device Name</label>
                    <input
                      type="text"
                      required
                      value={newDevice.name}
                      onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="e.g., Kitchen Sensor"
                    />
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                    Register
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRegister(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {devices.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No devices registered yet.</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {devices.map((device) => (
                  <div key={device.id} className="border rounded-lg p-4 hover:shadow-lg transition">
                    <h3 className="font-bold text-lg mb-2">{device.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">ID: {device.deviceId}</p>
                    <p className="text-sm text-gray-600 mb-4">
                      Events: {device._count?.events || 0}
                    </p>
                    <div className="space-y-2">
                      <Link
                        href={`/digital-twin/${device.deviceId}`}
                        className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Digital Twin
                      </Link>
                      <Link
                        href={`/ar-diagnostics/${device.deviceId}`}
                        className="block w-full text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        AR View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Info */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-2">💡 Quick Start</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>1. Register a device using the button above</li>
              <li>2. Run the IoT simulator: <code className="bg-white px-2 py-1 rounded">npm run iot-simulate</code></li>
              <li>3. View real-time data in Digital Twin or AR View</li>
              <li>4. Manage data sharing consent in the Consents tab</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
