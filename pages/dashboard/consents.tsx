import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface Consent {
  id: string;
  granted: boolean;
  scope: string;
  createdAt: string;
  updatedAt: string;
  operator: {
    id: string;
    email: string;
    role: string;
  };
}

export default function Consents() {
  const router = useRouter();
  const [consents, setConsents] = useState<Consent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [operatorEmail, setOperatorEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchConsents(token);
  }, [router]);

  const fetchConsents = async (token: string) => {
    try {
      const response = await fetch('/api/consents/manage', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.consents) {
        setConsents(data.consents);
      }
    } catch (error) {
      console.error('Error fetching consents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch('/api/consents/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          operatorEmail,
          granted: true,
          scope: 'device_events',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Consent granted successfully!');
        setOperatorEmail('');
        setShowForm(false);
        fetchConsents(token);
      } else {
        setError(data.error || 'Failed to grant consent');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const handleRevokeConsent = async (operatorId: string) => {
    if (!confirm('Are you sure you want to revoke this consent?')) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/consents/manage', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ operatorId }),
      });

      if (response.ok) {
        setSuccess('Consent revoked successfully!');
        fetchConsents(token);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to revoke consent');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="header">
        <Link href="/dashboard">← Back to Dashboard</Link>
        <h1>Consent Management</h1>
      </div>

      <div className="content">
        <div className="info-box">
          <h3>📋 About Data Sharing Consent</h3>
          <p>
            Control which operators and water companies can access your device data.
            You can grant or revoke consent at any time. Operators can only see
            data for devices you explicitly allow them to access.
          </p>
        </div>

        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}

        <div className="toolbar">
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            {showForm ? 'Cancel' : '+ Grant Consent to Operator'}
          </button>
        </div>

        {showForm && (
          <div className="form-card">
            <h2>Grant Consent</h2>
            <form onSubmit={handleGrantConsent}>
              <div className="form-group">
                <label htmlFor="operatorEmail">Operator Email</label>
                <input
                  id="operatorEmail"
                  type="email"
                  value={operatorEmail}
                  onChange={(e) => setOperatorEmail(e.target.value)}
                  required
                  placeholder="operator@watercompany.com"
                />
                <small>
                  Enter the email address of the operator or water company
                  representative you want to share data with. For testing, use:
                  admin@example.com
                </small>
              </div>

              <button type="submit" className="btn-submit">
                Grant Consent
              </button>
            </form>
          </div>
        )}

        <div className="consents-list">
          <h2>Active Consents ({consents.length})</h2>
          {consents.length === 0 ? (
            <div className="empty-state">
              <p>You haven't granted consent to any operators yet.</p>
              <p>
                Click "Grant Consent to Operator" above to share your device
                data with a water company or service provider.
              </p>
            </div>
          ) : (
            <div className="consents-grid">
              {consents.map((consent) => (
                <div key={consent.id} className="consent-card">
                  <div className="consent-header">
                    <div className="operator-info">
                      <h3>{consent.operator.email}</h3>
                      <span className="role-badge">{consent.operator.role}</span>
                    </div>
                    <div
                      className={`status-badge ${consent.granted ? 'active' : 'revoked'}`}
                    >
                      {consent.granted ? 'Active' : 'Revoked'}
                    </div>
                  </div>
                  <div className="consent-body">
                    <div className="info-row">
                      <span className="label">Scope:</span>
                      <span className="value">{consent.scope}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Granted:</span>
                      <span className="value">
                        {new Date(consent.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">Last Updated:</span>
                      <span className="value">
                        {new Date(consent.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="consent-actions">
                    {consent.granted && (
                      <button
                        onClick={() => handleRevokeConsent(consent.operator.id)}
                        className="btn-danger"
                      >
                        Revoke Consent
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        .info-box {
          background: #e3f2fd;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          border-left: 4px solid #2196f3;
        }
        .info-box h3 {
          margin: 0 0 0.5rem 0;
          color: #1976d2;
        }
        .info-box p {
          margin: 0;
          color: #666;
          line-height: 1.6;
        }
        .error-box {
          background: #fee;
          color: #c00;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
        .success-box {
          background: #e8f5e9;
          color: #2e7d32;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
        .toolbar {
          margin-bottom: 2rem;
        }
        .form-card {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h2 {
          margin: 0 0 1.5rem 0;
          color: #333;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
          font-weight: 500;
        }
        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        small {
          display: block;
          margin-top: 0.25rem;
          color: #666;
          font-size: 0.875rem;
          line-height: 1.4;
        }
        .btn-primary,
        .btn-submit,
        .btn-danger {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-primary {
          background: #667eea;
          color: white;
        }
        .btn-primary:hover {
          background: #5568d3;
        }
        .btn-submit {
          width: 100%;
          background: #667eea;
          color: white;
        }
        .btn-submit:hover {
          background: #5568d3;
        }
        .btn-danger {
          background: #f44336;
          color: white;
          width: 100%;
        }
        .btn-danger:hover {
          background: #d32f2f;
        }
        .consents-list {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #666;
        }
        .consents-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        .consent-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 1.5rem;
          background: #fafafa;
        }
        .consent-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e0e0e0;
        }
        .operator-info h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.125rem;
          color: #333;
        }
        .role-badge {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          text-transform: uppercase;
        }
        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
        }
        .status-badge.active {
          background: #e8f5e9;
          color: #2e7d32;
        }
        .status-badge.revoked {
          background: #fce4ec;
          color: #c2185b;
        }
        .consent-body {
          margin-bottom: 1rem;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          font-size: 0.875rem;
        }
        .info-row .label {
          color: #666;
        }
        .info-row .value {
          color: #333;
          font-weight: 500;
        }
        .consent-actions {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e0e0e0;
        }
      `}</style>
    </div>
  );
}
