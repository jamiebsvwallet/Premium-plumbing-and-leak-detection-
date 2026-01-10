import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Device {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  createdAt: string;
  _count?: { events: number };
}

export default function Devices() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'water_heater',
    serialNumber: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/devices`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch devices');

      const data = await response.json();
      setDevices(data);
    } catch (err) {
      setError('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/devices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create device');

      setFormData({ name: '', type: 'water_heater', serialNumber: '' });
      setShowForm(false);
      fetchDevices();
    } catch (err) {
      setError('Failed to create device');
    }
  };

  return (
    <div>
      <nav className="nav">
        <Link href="/dashboard"><h1>Premium Plumbing</h1></Link>
        <div>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/devices">Devices</Link>
          <Link href="/job-reports">Job Reports</Link>
        </div>
      </nav>

      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>My Devices</h1>
          <button className="button" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Device'}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {showForm && (
          <div className="card">
            <h2>Register New Device</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Device Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Device Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="water_heater">Water Heater</option>
                  <option value="pipe_sensor">Pipe Sensor</option>
                  <option value="leak_detector">Leak Detector</option>
                  <option value="pressure_sensor">Pressure Sensor</option>
                </select>
              </div>

              <div className="form-group">
                <label>Serial Number</label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  placeholder="e.g., DEVICE-001"
                  required
                />
              </div>

              <button type="submit" className="button">Register Device</button>
            </form>
          </div>
        )}

        {loading ? (
          <div>Loading devices...</div>
        ) : devices.length === 0 ? (
          <div className="card">
            <p>No devices registered yet. Click "Add Device" to register your first device.</p>
          </div>
        ) : (
          <div className="grid">
            {devices.map((device) => (
              <div
                key={device.id}
                className="device-card"
                onClick={() => router.push(`/digital-twin/${device.id}`)}
              >
                <h3>{device.name}</h3>
                <p><strong>Type:</strong> {device.type}</p>
                <p><strong>Serial:</strong> {device.serialNumber}</p>
                <p><strong>Events:</strong> {device._count?.events || 0}</p>
                <div style={{ marginTop: '10px' }}>
                  <Link href={`/digital-twin/${device.id}`}>
                    <button className="button" style={{ marginRight: '5px' }}>
                      Digital Twin
                    </button>
                  </Link>
                  <Link href={`/ar-diagnostics/${device.id}`}>
                    <button className="button button-secondary">
                      AR View
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
