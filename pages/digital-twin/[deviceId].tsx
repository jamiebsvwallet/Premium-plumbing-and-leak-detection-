import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import io, { Socket } from 'socket.io-client';
import { getToken, isAuthenticated } from '../../lib/auth';

interface DeviceEvent {
  id: string;
  eventType: string;
  payload: any;
  sha256: string;
  bsvTxId: string | null;
  anchorStatus: string;
  createdAt: string;
}

export default function DigitalTwin() {
  const router = useRouter();
  const { deviceId } = router.query;
  const [events, setEvents] = useState<DeviceEvent[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    if (!deviceId || typeof deviceId !== 'string') return;

    // Fetch historical events
    fetchEvents(deviceId);

    // Connect to Socket.IO
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const newSocket = io(socketUrl);

    newSocket.on('connect', () => {
      console.log('Socket.IO connected');
      setConnected(true);
      newSocket.emit('subscribe', deviceId);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      setConnected(false);
    });

    newSocket.on('deviceEvent', (event: DeviceEvent) => {
      console.log('Received real-time event:', event);
      setEvents((prev) => [event, ...prev]);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.emit('unsubscribe', deviceId);
        newSocket.disconnect();
      }
    };
  }, [deviceId, router]);

  const fetchEvents = async (deviceId: string) => {
    try {
      const token = getToken();
      const response = await axios.get(`/api/events/${deviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Digital Twin - Device {deviceId?.slice(0, 8)}</h1>
        <button
          onClick={() => router.push('/devices')}
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
          Back to Devices
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'inline-block', padding: '10px 15px', borderRadius: '5px', backgroundColor: connected ? '#d4edda' : '#f8d7da' }}>
          Real-time Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </div>

      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
        <h3>3D Visualization Placeholder</h3>
        <div style={{ width: '100%', height: '400px', backgroundColor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <div style={{ textAlign: 'center' }}>
            <p>3D Model Viewer (Three.js/React Three Fiber)</p>
            <p style={{ fontSize: '12px', marginTop: '10px' }}>TODO: Load glTF/USDZ plumbing system model</p>
          </div>
        </div>
      </div>

      <h2>Recent Events ({events.length})</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
        {events.map((event) => (
          <div
            key={event.id}
            style={{
              padding: '15px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: event.anchorStatus === 'ANCHORED' ? '#d4edda' : '#fff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <strong>{event.eventType}</strong>
              <span style={{ fontSize: '12px', color: '#666' }}>
                {new Date(event.createdAt).toLocaleString()}
              </span>
            </div>
            <pre style={{ fontSize: '12px', overflow: 'auto', backgroundColor: '#f4f4f4', padding: '10px', borderRadius: '4px' }}>
              {JSON.stringify(typeof event.payload === 'string' ? JSON.parse(event.payload) : event.payload, null, 2)}
            </pre>
            <div style={{ marginTop: '10px', fontSize: '12px' }}>
              <div><strong>SHA256:</strong> {event.sha256}</div>
              <div>
                <strong>Anchor Status:</strong>{' '}
                <span style={{ color: event.anchorStatus === 'ANCHORED' ? 'green' : 'orange' }}>
                  {event.anchorStatus}
                </span>
              </div>
              {event.bsvTxId && (
                <div><strong>BSV TxID:</strong> {event.bsvTxId}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>
          No events yet. Run the IoT simulator to generate events.
        </p>
      )}
    </div>
  );
}
