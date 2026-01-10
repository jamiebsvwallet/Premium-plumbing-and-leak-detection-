import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface Device {
  id: string;
  deviceId: string;
  name: string;
  type: string;
  createdAt: string;
}

export default function Devices() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    deviceId: '',
    name: '',
    type: 'leak_sensor',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchDevices(token);
  }, [router]);

  const fetchDevices = async (token: string) => {
    try {
      const response = await fetch('/api/devices/register', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.devices) {
        setDevices(data.devices);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch('/api/devices/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setShowForm(false);
        setFormData({ deviceId: '', name: '', type: 'leak_sensor' });
        fetchDevices(token);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <Link href="/dashboard">← Back to Dashboard</Link>
        <h1>Device Management</h1>
      </div>

      <div className="content">
        <div className="toolbar">
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            {showForm ? 'Cancel' : '+ Register New Device'}
          </button>
        </div>

        {showForm && (
          <div className="form-card">
            <h2>Register New Device</h2>
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="deviceId">Device ID</label>
                <input
                  id="deviceId"
                  type="text"
                  value={formData.deviceId}
                  onChange={(e) =>
                    setFormData({ ...formData, deviceId: e.target.value })
                  }
                  required
                  placeholder="DEVICE-001"
                />
                <small>Unique identifier for your device</small>
              </div>

              <div className="form-group">
                <label htmlFor="name">Device Name</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="Kitchen Sink Sensor"
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Device Type</label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="leak_sensor">Leak Sensor</option>
                  <option value="flow_meter">Flow Meter</option>
                  <option value="pressure_sensor">Pressure Sensor</option>
                </select>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register Device'}
              </button>
            </form>
          </div>
        )}

        <div className="devices-list">
          <h2>Your Devices ({devices.length})</h2>
          {devices.length === 0 ? (
            <div className="empty-state">
              <p>No devices registered yet.</p>
              <p>Click "Register New Device" to get started.</p>
            </div>
          ) : (
            <div className="device-grid">
              {devices.map((device) => (
                <div key={device.id} className="device-card">
                  <div className="device-header">
                    <h3>{device.name}</h3>
                    <span className="device-type">{device.type}</span>
                  </div>
                  <div className="device-body">
                    <p className="device-id">ID: {device.deviceId}</p>
                    <p className="device-date">
                      Registered:{' '}
                      {new Date(device.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="device-actions">
                    <Link href={`/digital-twin/${device.deviceId}`}>
                      <button className="btn-action">Digital Twin</button>
                    </Link>
                    <Link href={`/ar-diagnostics/${device.deviceId}`}>
                      <button className="btn-action">AR View</button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;
          background: #f5f5f5;
        }
        .header {
          background: white;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e0e0e0;
        }
        .header a {
          color: #667eea;
          text-decoration: none;
          font-size: 0.9rem;
        }
        h1 {
          margin: 0.5rem 0 0 0;
          color: #333;
        }
        .content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        .toolbar {
          margin-bottom: 2rem;
        }
        .form-card {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h2 {
          margin: 0 0 1.5rem 0;
          color: #333;
        }
        .error {
          background: #fee;
          color: #c00;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
          font-weight: 500;
        }
        input,
        select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        small {
          display: block;
          margin-top: 0.25rem;
          color: #666;
          font-size: 0.875rem;
        }
        .btn-primary,
        .btn-submit,
        .btn-action {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-primary {
          background: #667eea;
          color: white;
        }
        .btn-primary:hover {
          background: #5568d3;
        }
        .btn-submit {
          width: 100%;
          background: #667eea;
          color: white;
        }
        .btn-submit:hover:not(:disabled) {
          background: #5568d3;
        }
        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .devices-list {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #666;
        }
        .device-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }
        .device-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 1.5rem;
          background: #fafafa;
        }
        .device-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        .device-header h3 {
          margin: 0;
          color: #333;
        }
        .device-type {
          background: #667eea;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          text-transform: uppercase;
        }
        .device-body {
          margin-bottom: 1rem;
        }
        .device-id,
        .device-date {
          margin: 0.5rem 0;
          color: #666;
          font-size: 0.875rem;
        }
        .device-actions {
          display: flex;
          gap: 0.5rem;
        }
        .btn-action {
          flex: 1;
          padding: 0.5rem 1rem;
          background: #667eea;
          color: white;
          font-size: 0.875rem;
        }
        .btn-action:hover {
          background: #5568d3;
        }
      `}</style>
    </div>
  );
}
