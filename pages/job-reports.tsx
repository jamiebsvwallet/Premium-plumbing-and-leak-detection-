import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function JobReports() {
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    deviceId: '',
    title: '',
    description: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      // Fetch devices for the dropdown
      const devicesResponse = await fetch('/api/devices', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (devicesResponse.ok) {
        const devicesData = await devicesResponse.json();
        setDevices(devicesData.devices);
      }

      // Placeholder: Fetch job reports (API endpoint not yet created)
      // const reportsResponse = await fetch('/api/job-reports', {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      // if (reportsResponse.ok) {
      //   const reportsData = await reportsResponse.json();
      //   setReports(reportsData.reports);
      // }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      // Placeholder: Create job report (API endpoint not yet created)
      // const response = await fetch('/api/job-reports', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify(formData),
      // });

      // if (response.ok) {
      //   setShowCreateForm(false);
      //   setFormData({ deviceId: '', title: '', description: '' });
      //   fetchData();
      // }
      alert('Job report creation is a placeholder. API endpoint not yet implemented.');
    } catch (error) {
      console.error('Error creating job report:', error);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Job Reports</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#0070f3', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          {showCreateForm ? 'Cancel' : 'Create New Report'}
        </button>
      </header>

      {showCreateForm && (
        <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Create Job Report</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="deviceId" style={{ display: 'block', marginBottom: '0.5rem' }}>Device</label>
              <select
                id="deviceId"
                required
                value={formData.deviceId}
                onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
              >
                <option value="">Select a device</option>
                {devices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="title" style={{ display: 'block', marginBottom: '0.5rem' }}>Title</label>
              <input
                id="title"
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
              <textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', minHeight: '100px' }}
              />
            </div>
            <button
              type="submit"
              style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              Create Report
            </button>
          </form>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
            📄 PDF export stub - TODO: Implement PDF generation with libraries like pdfkit or puppeteer
          </p>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            📧 Email notification stub - TODO: Configure SendGrid or nodemailer
          </p>
        </div>
      )}

      <div>
        {reports.length === 0 ? (
          <p>No job reports yet. Create your first report above.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {reports.map((report) => (
              <div key={report.id} style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h3>{report.title}</h3>
                <p>{report.description}</p>
                <p style={{ fontSize: '0.8rem', color: '#999' }}>Created: {new Date(report.createdAt).toLocaleString()}</p>
                {report.bsvTxId && (
                  <p style={{ fontSize: '0.8rem', color: '#666' }}>BSV TxID: {report.bsvTxId}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
