import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface Event {
  id: string;
  deviceId: string;
  timestamp: string;
  alertType: string;
  metrics: any;
  eventHash: string;
  createdAt: string;
}

export default function DeviceEvents() {
  const router = useRouter();
  const { deviceId } = router.query;
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deviceId) return;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchEvents(token, deviceId as string);
  }, [deviceId]);

  const fetchEvents = async (token: string, devId: string) => {
    try {
      const response = await fetch(`/api/events/${devId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
      } else {
        console.error('Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertColor = (alertType: string) => {
    switch (alertType) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-green-100 text-green-700 border-green-200';
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Device Events</h1>
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">Device ID: {deviceId}</h2>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No events recorded yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Use the IoT simulator to send test events to this device
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {new Date(event.timestamp).toLocaleString()}
                    </h3>
                    <p className="text-sm text-gray-500">Event ID: {event.id}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getAlertColor(
                      event.alertType
                    )}`}
                  >
                    {event.alertType.toUpperCase()}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500 mb-1">Flow Rate</p>
                    <p className="text-lg font-bold text-gray-900">
                      {event.metrics.flowRate} L/min
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500 mb-1">Pressure</p>
                    <p className="text-lg font-bold text-gray-900">
                      {event.metrics.pressure} PSI
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500 mb-1">Temperature</p>
                    <p className="text-lg font-bold text-gray-900">
                      {event.metrics.temperature}°C
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500 mb-1">Event Hash (BSV Anchor)</p>
                  <p className="text-xs font-mono text-gray-700 break-all">{event.eventHash}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
