import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface Device {
  id: string;
  deviceId: string;
  name: string;
  type: string;
  location?: string;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [newDevice, setNewDevice] = useState({
    deviceId: '',
    name: '',
    location: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchDevices(token);
  }, []);

  const fetchDevices = async (token: string) => {
    try {
      const response = await fetch('/api/devices/list', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setDevices(data.devices);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
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
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newDevice),
      });

      if (response.ok) {
        setShowRegisterForm(false);
        setNewDevice({ deviceId: '', name: '', location: '' });
        fetchDevices(token!);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to register device');
      }
    } catch (error) {
      alert('Error registering device');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                {user?.name || user?.email} ({user?.role})
              </span>
              <Link href="/consent" className="text-blue-600 hover:text-blue-700">
                Consent
              </Link>
              <button onClick={handleLogout} className="text-red-600 hover:text-red-700">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">My Devices</h2>
            <button
              onClick={() => setShowRegisterForm(!showRegisterForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Register Device
            </button>
          </div>

          {showRegisterForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-4">
              <form onSubmit={handleRegisterDevice} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Device ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDevice.deviceId}
                    onChange={(e) => setNewDevice({ ...newDevice, deviceId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., sensor-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Device Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDevice.name}
                    onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., Kitchen Leak Detector"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newDevice.location}
                    onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., Kitchen Sink"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Register
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRegisterForm(false)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500">No devices registered yet</p>
              </div>
            ) : (
              devices.map((device) => (
                <div key={device.id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{device.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">ID: {device.deviceId}</p>
                  {device.location && (
                    <p className="text-sm text-gray-600 mb-3">📍 {device.location}</p>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Link
                      href={`/events/${device.deviceId}`}
                      className="flex-1 text-center bg-blue-100 text-blue-700 px-3 py-2 rounded hover:bg-blue-200 text-sm"
                    >
                      Events
                    </Link>
                    <Link
                      href={`/digital-twin/${device.deviceId}`}
                      className="flex-1 text-center bg-purple-100 text-purple-700 px-3 py-2 rounded hover:bg-purple-200 text-sm"
                    >
                      Digital Twin
                    </Link>
                    <Link
                      href={`/ar-diagnostics/${device.deviceId}`}
                      className="flex-1 text-center bg-green-100 text-green-700 px-3 py-2 rounded hover:bg-green-200 text-sm"
                    >
                      AR
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
