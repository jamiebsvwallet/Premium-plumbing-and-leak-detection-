import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import io, { Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

interface Device {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  events: DeviceEvent[];
}

interface DeviceEvent {
  id: string;
  eventType: string;
  value: number | null;
  metadata: string | null;
  timestamp: string;
  anchorStatus: string;
  bsvTxId: string | null;
}

export default function DigitalTwin() {
  const router = useRouter();
  const { deviceId } = router.query;
  const [device, setDevice] = useState<Device | null>(null);
  const [events, setEvents] = useState<DeviceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [grantEmail, setGrantEmail] = useState('');

  useEffect(() => {
    if (!deviceId) return;

    fetchDevice();

    // Setup Socket.IO connection
    const token = localStorage.getItem('token');
    if (token) {
      const newSocket = io(WS_URL, {
        auth: { token },
      });

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket');
        setConnected(true);
        newSocket.emit('join-device', deviceId);
      });

      newSocket.on('device-event', (event: DeviceEvent) => {
        console.log('Received device event:', event);
        setEvents((prev) => [event, ...prev]);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from WebSocket');
        setConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [deviceId]);

  const fetchDevice = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/devices/${deviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch device');

      const data = await response.json();
      setDevice(data);
      setEvents(data.events || []);
    } catch (err) {
      console.error('Error fetching device:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/consent/grant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          deviceId,
          grantedTo: grantEmail,
          scope: 'read',
        }),
      });

      if (!response.ok) throw new Error('Failed to grant consent');

      alert('Consent granted successfully!');
      setShowConsent(false);
      setGrantEmail('');
    } catch (err) {
      alert('Failed to grant consent');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!device) return <div>Device not found</div>;

  return (
    <div>
      <nav className="nav">
        <Link href="/dashboard"><h1>Premium Plumbing</h1></Link>
        <div>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/devices">Devices</Link>
        </div>
      </nav>

      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Digital Twin: {device.name}</h1>
          <div>
            <span style={{ marginRight: '10px' }}>
              {connected ? '🟢 Live' : '🔴 Disconnected'}
            </span>
            <button className="button button-secondary" onClick={() => setShowConsent(!showConsent)}>
              Manage Consent
            </button>
          </div>
        </div>

        {showConsent && (
          <div className="card">
            <h3>Grant Access to Operator</h3>
            <form onSubmit={handleGrantConsent}>
              <div className="form-group">
                <label>Operator Email</label>
                <input
                  type="email"
                  value={grantEmail}
                  onChange={(e) => setGrantEmail(e.target.value)}
                  placeholder="operator@example.com"
                  required
                />
              </div>
              <button type="submit" className="button">Grant Access</button>
            </form>
          </div>
        )}

        <div className="card">
          <h3>Device Information</h3>
          <p><strong>Type:</strong> {device.type}</p>
          <p><strong>Serial Number:</strong> {device.serialNumber}</p>
          <p><strong>Total Events:</strong> {events.length}</p>
        </div>

        <div className="card">
          <h2>Recent Events</h2>
          {events.length === 0 ? (
            <p>No events yet. Start the IoT simulator to generate events.</p>
          ) : (
            <ul className="event-list">
              {events.slice(0, 20).map((event) => (
                <li key={event.id} className="event-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong>{event.eventType}</strong>
                      {event.value !== null && `: ${event.value.toFixed(2)}`}
                      {event.metadata && (
                        <span style={{ fontSize: '0.9rem', color: '#666', marginLeft: '10px' }}>
                          {JSON.parse(event.metadata).unit}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className={`badge badge-${event.anchorStatus}`}>
                        {event.anchorStatus}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '5px' }}>
                    {new Date(event.timestamp).toLocaleString()}
                    {event.bsvTxId && (
                      <span style={{ marginLeft: '10px' }}>
                        TxID: {event.bsvTxId.substring(0, 12)}...
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
