import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { getToken, isAuthenticated } from '../lib/auth';

interface JobReport {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  device: {
    name: string;
    serialNo: string;
  };
}

export default function JobReports() {
  const router = useRouter();
  const [reports, setReports] = useState<JobReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    deviceId: '',
    title: '',
    description: '',
    status: 'DRAFT',
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    fetchReports();
    fetchDevices();
  }, [router]);

  const fetchReports = async () => {
    try {
      const token = getToken();
      const response = await axios.get('/api/job-reports', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(response.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDevices = async () => {
    try {
      const token = getToken();
      const response = await axios.get('/api/devices', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDevices(response.data);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getToken();
      await axios.post('/api/job-reports', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({ deviceId: '', title: '', description: '', status: 'DRAFT' });
      setShowCreate(false);
      fetchReports();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create report');
    }
  };

  const handleExportPDF = (reportId: string) => {
    alert('PDF Export: This is a stub. In production, use a library like jsPDF or pdfmake to generate PDF reports.');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Job Reports</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowCreate(!showCreate)}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            {showCreate ? 'Cancel' : 'Create Report'}
          </button>
          <button
            onClick={() => router.push('/dashboard')}
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
            Back to Dashboard
          </button>
        </div>
      </div>

      {showCreate && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Create New Report</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            <div>
              <label>Device:</label>
              <select
                value={formData.deviceId}
                onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', fontSize: '16px', marginTop: '5px' }}
              >
                <option value="">Select a device</option>
                {devices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name} ({device.serialNo})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Title:</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', fontSize: '16px', marginTop: '5px' }}
              />
            </div>
            <div>
              <label>Description:</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={5}
                style={{ width: '100%', padding: '8px', fontSize: '16px', marginTop: '5px' }}
              />
            </div>
            <div>
              <label>Status:</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ width: '100%', padding: '8px', fontSize: '16px', marginTop: '5px' }}
              >
                <option value="DRAFT">Draft</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING_REVIEW">Pending Review</option>
              </select>
            </div>
            <button
              type="submit"
              style={{
                padding: '12px',
                fontSize: '16px',
                backgroundColor: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Create Report
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {reports.map((report) => (
          <div key={report.id} style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h3>{report.title}</h3>
                <p><strong>Device:</strong> {report.device.name} ({report.device.serialNo})</p>
                <p><strong>Status:</strong> {report.status}</p>
                <p><strong>Date:</strong> {new Date(report.createdAt).toLocaleString()}</p>
                <p style={{ marginTop: '10px' }}>{report.description}</p>
              </div>
              <button
                onClick={() => handleExportPDF(report.id)}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Export PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      {reports.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>
          No job reports yet. Click "Create Report" to add one.
        </p>
      )}

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#e7f3ff', border: '1px solid #b3d9ff', borderRadius: '8px' }}>
        <h3>Email Delivery (Demo)</h3>
        <p>To enable email delivery of reports, configure nodemailer with SendGrid:</p>
        <pre style={{ backgroundColor: '#f4f4f4', padding: '10px', borderRadius: '5px', marginTop: '10px', fontSize: '12px' }}>
{`// Configure in .env
SENDGRID_API_KEY=your_api_key
SENDGRID_FROM_EMAIL=reports@yourcompany.com

// Use nodemailer with SendGrid transport
// See: https://www.npmjs.com/package/nodemailer`}
        </pre>
      </div>
    </div>
  );
}
