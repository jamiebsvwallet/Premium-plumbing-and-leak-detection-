import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import io, { Socket } from 'socket.io-client';

export default function DigitalTwin() {
  const router = useRouter();
  const { deviceId } = router.query;
  const [device, setDevice] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deviceId) return;

    // Fetch device details
    const fetchDevice = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const response = await fetch(`/api/devices?deviceId=${deviceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setDevice(data.device);
        }
      } catch (error) {
        console.error('Error fetching device:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevice();

    // Connect to Socket.IO
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
    const newSocket = io(socketUrl);

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO');
      const userId = localStorage.getItem('userId');
      if (userId) {
        newSocket.emit('join-user-room', userId);
      }
      newSocket.emit('join-device-room', deviceId);
    });

    newSocket.on('device-event', (event) => {
      console.log('Received device event:', event);
      setEvents((prev) => [event, ...prev].slice(0, 50)); // Keep last 50 events
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [deviceId, router]);

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  if (!device) {
    return <div style={{ padding: '2rem' }}>Device not found</div>;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Digital Twin: {device.name}</h1>
        <p style={{ color: '#666' }}>Device Type: {device.type}</p>
        <p style={{ fontSize: '0.8rem', color: '#999' }}>Device ID: {device.id}</p>
        <p style={{ fontSize: '0.9rem', color: socket?.connected ? 'green' : 'red' }}>
          Status: {socket?.connected ? '🟢 Connected' : '🔴 Disconnected'}
        </p>
      </header>

      <section style={{ marginBottom: '2rem' }}>
        <h2>3D Visualization</h2>
        <div
          style={{
            width: '100%',
            height: '400px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ddd',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <p>🔧 3D Model Placeholder</p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              TODO: Integrate Three.js or React Three Fiber for 3D visualization
            </p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              The digital twin would show device state, sensor readings, and alerts in real-time
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2>Real-time Events</h2>
        {events.length === 0 ? (
          <p>No events received yet. Waiting for device data...</p>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px', padding: '1rem' }}>
            {events.map((event, index) => (
              <div key={index} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong>{event.eventType}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
                <pre style={{ fontSize: '0.8rem', backgroundColor: '#f8f8f8', padding: '0.5rem', borderRadius: '4px', overflow: 'auto' }}>
                  {JSON.stringify(event.data, null, 2)}
                </pre>
                <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.5rem' }}>
                  SHA-256: {event.sha256}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
