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

interface Consent {
  id: string;
  granted: boolean;
  createdAt: string;
  operator?: {
    id: string;
    email: string;
    name: string | null;
  };
  customer?: {
    id: string;
    email: string;
    name: string | null;
  };
}

interface Operator {
  id: string;
  email: string;
  name: string | null;
}

export default function Consents() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [consents, setConsents] = useState<Consent[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOperator, setSelectedOperator] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    setUser(JSON.parse(userData));
    loadData(token);
  }, []);

  const loadData = async (token: string) => {
    try {
      // Load consents
      const consentsRes = await fetch('/api/consents/manage', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (consentsRes.ok) {
        const data = await consentsRes.json();
        setConsents(data.consents || []);
      }

      // Load operators list (for customers to select)
      try {
        const operatorsRes = await fetch('/api/consents/operators', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (operatorsRes.ok) {
          const data = await operatorsRes.json();
          setOperators(data.operators || []);
        }
      } catch (error) {
        console.log('Could not load operators:', error);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantConsent = async () => {
    if (!selectedOperator) return;

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/consents/manage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operatorId: selectedOperator,
          granted: true,
        }),
      });

      if (response.ok) {
        setSelectedOperator('');
        loadData(token!);
      } else {
        const data = await response.json();
        alert(data.error);
      }
    } catch (error) {
      console.error('Failed to grant consent:', error);
      alert('Failed to grant consent');
    }
  };

  const handleRevokeConsent = async (operatorId: string) => {
    const token = localStorage.getItem('token');

    if (!confirm('Are you sure you want to revoke this consent?')) {
      return;
    }

    try {
      const response = await fetch('/api/consents/manage', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ operatorId }),
      });

      if (response.ok) {
        loadData(token!);
      } else {
        const data = await response.json();
        alert(data.error);
      }
    } catch (error) {
      console.error('Failed to revoke consent:', error);
      alert('Failed to revoke consent');
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
        <title>Consent Management - Premium Plumbing</title>
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
            <Link href="/dashboard/consents" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Consents
            </Link>
            <Link href="/dashboard/reports" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              Reports
            </Link>
          </div>

          {/* Consents Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {user?.role === 'customer' ? 'Data Sharing Consent' : 'Consented Customers'}
            </h2>

            {user?.role === 'customer' && (
              <>
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-bold mb-2">🔒 Privacy Control</h3>
                  <p className="text-sm text-gray-700">
                    Grant consent to operators/water companies to access your device data. 
                    You can revoke consent at any time.
                  </p>
                </div>

                {operators.length > 0 && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold mb-4">Grant New Consent</h3>
                    <div className="flex space-x-4">
                      <select
                        value={selectedOperator}
                        onChange={(e) => setSelectedOperator(e.target.value)}
                        className="flex-1 px-4 py-2 border rounded-lg"
                      >
                        <option value="">Select an operator...</option>
                        {operators.map((op) => (
                          <option key={op.id} value={op.id}>
                            {op.name || op.email}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleGrantConsent}
                        disabled={!selectedOperator}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        Grant Consent
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {consents.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                {user?.role === 'customer' 
                  ? 'No consents granted yet.'
                  : 'No customers have granted consent yet.'}
              </p>
            ) : (
              <div className="space-y-4">
                {consents.map((consent) => (
                  <div key={consent.id} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      {user?.role === 'customer' && consent.operator && (
                        <>
                          <h3 className="font-bold">{consent.operator.name || consent.operator.email}</h3>
                          <p className="text-sm text-gray-600">{consent.operator.email}</p>
                        </>
                      )}
                      {user?.role === 'operator' && consent.customer && (
                        <>
                          <h3 className="font-bold">{consent.customer.name || consent.customer.email}</h3>
                          <p className="text-sm text-gray-600">{consent.customer.email}</p>
                        </>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        Granted: {new Date(consent.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${consent.granted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {consent.granted ? 'Active' : 'Revoked'}
                      </span>
                      {user?.role === 'customer' && consent.granted && consent.operator && (
                        <button
                          onClick={() => handleRevokeConsent(consent.operator!.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-yellow-50 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-2">ℹ️ About Consent</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Consent allows operators to view your device events and data</li>
              <li>You can revoke consent at any time</li>
              <li>Revoking consent immediately stops data sharing</li>
              <li>All data access is logged for audit purposes</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
