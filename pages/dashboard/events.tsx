import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface DeviceEvent {
  id: string;
  timestamp: string;
  metrics: string;
  alertType: string | null;
  eventHash: string;
  device: {
    deviceId: string;
    name: string;
  };
}

export default function Events() {
  const router = useRouter();
  const [events, setEvents] = useState<DeviceEvent[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('all');
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      if (data.devices && data.devices.length > 0) {
        setDevices(data.devices);
        // Fetch events for first device
        fetchEvents(token, data.devices[0].deviceId);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async (token: string, deviceId: string) => {
    try {
      const response = await fetch(`/api/events/list?deviceId=${deviceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.events) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDevice(deviceId);
    const token = localStorage.getItem('token');
    if (token) {
      fetchEvents(token, deviceId);
    }
  };

  const parseMetrics = (metricsString: string) => {
    try {
      return JSON.parse(metricsString);
    } catch {
      return {};
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="header">
        <Link href="/dashboard">← Back to Dashboard</Link>
        <h1>Device Events</h1>
      </div>

      <div className="content">
        {devices.length === 0 ? (
          <div className="empty-state">
            <h3>No devices registered yet</h3>
            <p>Register a device to start viewing events.</p>
            <Link href="/dashboard/devices">
              <button className="btn-primary">Register Device</button>
            </Link>
          </div>
        ) : (
          <>
            <div className="toolbar">
              <label htmlFor="deviceSelect">Select Device:</label>
              <select
                id="deviceSelect"
                value={selectedDevice}
                onChange={(e) => handleDeviceChange(e.target.value)}
                className="device-select"
              >
                {devices.map((device) => (
                  <option key={device.id} value={device.deviceId}>
                    {device.name} ({device.deviceId})
                  </option>
                ))}
              </select>
            </div>

            <div className="events-list">
              <h2>Recent Events ({events.length})</h2>
              {events.length === 0 ? (
                <div className="no-events">
                  <p>No events recorded for this device yet.</p>
                  <p>Use the IoT simulator to generate test events.</p>
                </div>
              ) : (
                <div className="events-grid">
                  {events.map((event) => {
                    const metrics = parseMetrics(event.metrics);
                    return (
                      <div
                        key={event.id}
                        className={`event-card ${event.alertType ? 'alert' : ''}`}
                      >
                        <div className="event-header">
                          <div className="event-time">
                            {new Date(event.timestamp).toLocaleString()}
                          </div>
                          {event.alertType && (
                            <div className="alert-badge">{event.alertType}</div>
                          )}
                        </div>
                        <div className="event-metrics">
                          {metrics.waterFlow !== undefined && (
                            <div className="metric">
                              <span className="label">Water Flow:</span>
                              <span className="value">
                                {metrics.waterFlow.toFixed(2)} L/min
                              </span>
                            </div>
                          )}
                          {metrics.pressure !== undefined && (
                            <div className="metric">
                              <span className="label">Pressure:</span>
                              <span className="value">
                                {metrics.pressure.toFixed(2)} PSI
                              </span>
                            </div>
                          )}
                          {metrics.temperature !== undefined && (
                            <div className="metric">
                              <span className="label">Temperature:</span>
                              <span className="value">
                                {metrics.temperature.toFixed(2)}°C
                              </span>
                            </div>
                          )}
                          {metrics.batteryLevel !== undefined && (
                            <div className="metric">
                              <span className="label">Battery:</span>
                              <span className="value">
                                {metrics.batteryLevel.toFixed(0)}%
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="event-footer">
                          <small>Hash: {event.eventHash.substring(0, 16)}...</small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;
          background: #f5f5f5;
        }
        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          font-size: 1.25rem;
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
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }
        .toolbar {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .device-select {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          flex: 1;
          max-width: 400px;
        }
        .empty-state,
        .no-events {
          background: white;
          padding: 3rem;
          border-radius: 8px;
          text-align: center;
          color: #666;
        }
        .events-list {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h2 {
          margin: 0 0 1.5rem 0;
          color: #333;
        }
        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        .event-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 1.5rem;
          background: #fafafa;
          transition: all 0.3s;
        }
        .event-card:hover {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .event-card.alert {
          border-left: 4px solid #ff0000;
          background: #fff5f5;
        }
        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e0e0e0;
        }
        .event-time {
          font-size: 0.875rem;
          color: #666;
        }
        .alert-badge {
          background: #ff0000;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 600;
        }
        .event-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .metric {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .metric .label {
          font-size: 0.75rem;
          color: #888;
          text-transform: uppercase;
        }
        .metric .value {
          font-size: 1.125rem;
          font-weight: 600;
          color: #333;
        }
        .event-footer {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e0e0e0;
        }
        .event-footer small {
          color: #999;
          font-size: 0.75rem;
        }
        .btn-primary {
          padding: 0.75rem 1.5rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-primary:hover {
          background: #5568d3;
        }
      `}</style>
    </div>
  );
}
