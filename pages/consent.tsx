import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface Operator {
  id: string;
  email: string;
  name?: string;
}

interface Consent {
  id: string;
  operatorId: string;
  granted: boolean;
  grantedAt: string;
  revokedAt?: string;
  operator: Operator;
}

export default function ConsentManagement() {
  const router = useRouter();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchData(token);
  }, []);

  const fetchData = async (token: string) => {
    try {
      const [operatorsRes, consentsRes] = await Promise.all([
        fetch('/api/consent/operators', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/consent/status', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (operatorsRes.ok) {
        const data = await operatorsRes.json();
        setOperators(data.operators);
      }

      if (consentsRes.ok) {
        const data = await consentsRes.json();
        setConsents(data.consents);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantConsent = async (operatorId: string) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/consent/grant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ operatorId }),
      });

      if (response.ok) {
        fetchData(token!);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to grant consent');
      }
    } catch (error) {
      alert('Error granting consent');
    }
  };

  const handleRevokeConsent = async (operatorId: string) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/consent/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ operatorId }),
      });

      if (response.ok) {
        fetchData(token!);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to revoke consent');
      }
    } catch (error) {
      alert('Error revoking consent');
    }
  };

  const getConsentStatus = (operatorId: string) => {
    return consents.find((c) => c.operatorId === operatorId);
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
            <h1 className="text-2xl font-bold text-gray-900">Consent Management</h1>
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About Data Sharing</h2>
          <p className="text-gray-600 mb-2">
            Control who can access your device data. When you grant consent to an operator, they
            will be able to view your device events and monitor your systems.
          </p>
          <p className="text-gray-600">
            You can revoke consent at any time, and the operator will immediately lose access to
            your data.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Available Operators</h2>

          {operators.length === 0 ? (
            <p className="text-gray-500">No operators available</p>
          ) : (
            <div className="space-y-4">
              {operators.map((operator) => {
                const consent = getConsentStatus(operator.id);
                const hasConsent = consent && consent.granted;

                return (
                  <div
                    key={operator.id}
                    className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {operator.name || operator.email}
                      </h3>
                      <p className="text-sm text-gray-600">{operator.email}</p>
                      {hasConsent && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Access granted on {new Date(consent.grantedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div>
                      {hasConsent ? (
                        <button
                          onClick={() => handleRevokeConsent(operator.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        >
                          Revoke Access
                        </button>
                      ) : (
                        <button
                          onClick={() => handleGrantConsent(operator.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                          Grant Access
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
