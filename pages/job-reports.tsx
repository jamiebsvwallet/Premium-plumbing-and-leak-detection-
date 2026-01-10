import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface JobReport {
  id: string;
  title: string;
  description: string;
  status: string;
  deviceId: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function JobReports() {
  const router = useRouter();
  const [reports, setReports] = useState<JobReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deviceId: '',
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/job-reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch reports');

      const data = await response.json();
      setReports(data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/job-reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          deviceId: formData.deviceId || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to create report');

      setFormData({ title: '', description: '', deviceId: '' });
      setShowForm(false);
      fetchReports();
    } catch (err) {
      alert('Failed to create report');
    }
  };

  return (
    <div>
      <nav className="nav">
        <Link href="/dashboard"><h1>Premium Plumbing</h1></Link>
        <div>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/devices">Devices</Link>
          <Link href="/job-reports">Job Reports</Link>
        </div>
      </nav>

      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Job Reports</h1>
          <button className="button" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Create Report'}
          </button>
        </div>

        {showForm && (
          <div className="card">
            <h2>Create New Job Report</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label>Device ID (optional)</label>
                <input
                  type="text"
                  value={formData.deviceId}
                  onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                  placeholder="Leave empty if not device-specific"
                />
              </div>

              <button type="submit" className="button">Create Report</button>
            </form>
          </div>
        )}

        {loading ? (
          <div>Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="card">
            <p>No job reports yet. Click "Create Report" to add your first report.</p>
          </div>
        ) : (
          <div>
            {reports.map((report) => (
              <div key={report.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3>{report.title}</h3>
                    <p style={{ margin: '10px 0' }}>{report.description}</p>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>
                      Status: <strong>{report.status}</strong>
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#999' }}>
                      Created: {new Date(report.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`badge badge-${report.status === 'completed' ? 'anchored' : 'pending'}`}>
                    {report.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
