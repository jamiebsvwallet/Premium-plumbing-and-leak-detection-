import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { getToken, isAuthenticated } from '../lib/auth';

interface Device {
  id: string;
  name: string;
  serialNo: string;
  createdAt: string;
  _count?: {
    events: number;
  };
}

export default function Devices() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [name, setName] = useState('');
  const [serialNo, setSerialNo] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    fetchDevices();
  }, [router]);

  const fetchDevices = async () => {
    try {
      const token = getToken();
      const response = await axios.get('/api/devices', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDevices(response.data);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getToken();
      await axios.post(
        '/api/devices/register',
        { name, serialNo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName('');
      setSerialNo('');
      setShowRegister(false);
      fetchDevices();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to register device');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>My Devices</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowRegister(!showRegister)}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            {showRegister ? 'Cancel' : 'Register Device'}
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {showRegister && (
        <form onSubmit={handleRegister} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Register New Device</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            <div>
              <label>Device Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', fontSize: '16px', marginTop: '5px' }}
              />
            </div>
            <div>
              <label>Serial Number:</label>
              <input
                type="text"
                value={serialNo}
                onChange={(e) => setSerialNo(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', fontSize: '16px', marginTop: '5px' }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '12px',
                fontSize: '16px',
                backgroundColor: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Register
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {devices.map((device) => (
          <div key={device.id} style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
            <h3>{device.name}</h3>
            <p><strong>Serial:</strong> {device.serialNo}</p>
            <p><strong>Events:</strong> {device._count?.events || 0}</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button
                onClick={() => router.push(`/digital-twin/${device.id}`)}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: '#0070f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Digital Twin
              </button>
              <button
                onClick={() => router.push(`/ar-diagnostics/${device.id}`)}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: '#6610f2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                AR View
              </button>
            </div>
          </div>
        ))}
      </div>

      {devices.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>
          No devices registered yet. Click "Register Device" to add one.
        </p>
      )}
    </div>
  );
}
