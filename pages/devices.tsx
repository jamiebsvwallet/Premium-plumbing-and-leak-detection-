import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Devices() {
  const router = useRouter();
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'water_sensor',
  });

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch('/api/devices', {
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/devices/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowRegisterForm(false);
        setFormData({ name: '', type: 'water_sensor' });
        fetchDevices();
      }
    } catch (error) {
      console.error('Error registering device:', error);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1>My Devices</h1>
        <button
          onClick={() => setShowRegisterForm(!showRegisterForm)}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#0070f3', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          {showRegisterForm ? 'Cancel' : 'Register New Device'}
        </button>
      </header>

      {showRegisterForm && (
        <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Register New Device</h3>
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem' }}>Device Name</label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="type" style={{ display: 'block', marginBottom: '0.5rem' }}>Device Type</label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
              >
                <option value="water_sensor">Water Sensor</option>
                <option value="leak_detector">Leak Detector</option>
                <option value="pressure_sensor">Pressure Sensor</option>
                <option value="flow_meter">Flow Meter</option>
              </select>
            </div>
            <button
              type="submit"
              style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              Register
            </button>
          </form>
        </div>
      )}

      <div>
        {devices.length === 0 ? (
          <p>No devices registered yet. Click "Register New Device" to add one.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {devices.map((device) => (
              <div key={device.id} style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h3>{device.name}</h3>
                <p style={{ color: '#666' }}>Type: {device.type}</p>
                <p style={{ fontSize: '0.8rem', color: '#999' }}>ID: {device.id}</p>
                <div style={{ marginTop: '1rem' }}>
                  <Link href={`/digital-twin/${device.id}`} style={{ marginRight: '1rem', color: '#0070f3' }}>
                    Digital Twin
                  </Link>
                  <Link href={`/ar-diagnostics/${device.id}`} style={{ color: '#0070f3' }}>
                    AR Diagnostics
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
