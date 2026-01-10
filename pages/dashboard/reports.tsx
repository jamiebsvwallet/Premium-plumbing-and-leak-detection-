import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface JobReport {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  reportHash: string | null;
  txId: string | null;
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
  device?: {
    id: string;
    deviceId: string;
    name: string;
  };
}

export default function Reports() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<JobReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    setUser(JSON.parse(userData));
    loadReports(token);
  }, []);

  const loadReports = async (token: string) => {
    try {
      const response = await fetch('/api/reports/manage', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Job Reports - Premium Plumbing</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Premium Plumbing Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{user?.email}</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {user?.role}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Navigation */}
          <div className="mb-8 flex space-x-4">
            <Link href="/dashboard" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              Devices
            </Link>
            <Link href="/dashboard/consents" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              Consents
            </Link>
            <Link href="/dashboard/reports" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Reports
            </Link>
          </div>

          {/* Reports Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Job Reports</h2>
              {user?.role === 'operator' && (
                <button
                  onClick={() => alert('Create report form would open here')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  + Create Report
                </button>
              )}
            </div>

            {reports.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No reports yet.</p>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-6 hover:shadow-lg transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{report.title}</h3>
                        {report.user && (
                          <p className="text-sm text-gray-600">
                            Customer: {report.user.name || report.user.email}
                          </p>
                        )}
                        {report.device && (
                          <p className="text-sm text-gray-600">
                            Device: {report.device.name} ({report.device.deviceId})
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        report.status === 'completed' ? 'bg-green-100 text-green-800' :
                        report.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {report.status}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-4">{report.description}</p>

                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p className="font-semibold">Created:</p>
                        <p>{new Date(report.createdAt).toLocaleString()}</p>
                      </div>
                      {report.reportHash && (
                        <div>
                          <p className="font-semibold">Report Hash:</p>
                          <p className="font-mono text-xs">{report.reportHash.substring(0, 16)}...</p>
                        </div>
                      )}
                      {report.txId && (
                        <div>
                          <p className="font-semibold">Blockchain TX:</p>
                          <p className="font-mono text-xs">{report.txId}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                        View Details
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Download PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-2">📋 About Job Reports</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Operators can create job reports for customers</li>
              <li>Reports can be viewed and downloaded as PDF</li>
              <li>Each report is hashed and can be anchored on the blockchain</li>
              <li>Customers receive email notifications for new reports</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
