import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

interface JobReport {
  id: string
  title: string
  description: string
  pdfPath: string | null
  bsvTxId: string | null
  createdAt: string
  user: {
    id: string
    email: string
    name: string | null
  }
  device: {
    id: string
    name: string
  }
}

interface Device {
  id: string
  name: string
}

interface User {
  id: string
  email: string
  role: string
}

export default function Reports() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [reports, setReports] = useState<JobReport[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    userId: '',
    deviceId: '',
    title: '',
    description: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // Check authentication
      const meResponse = await fetch('/api/auth/me')
      if (!meResponse.ok) {
        router.push('/login')
        return
      }
      const meData = await meResponse.json()
      setCurrentUser(meData.user)

      // Load reports
      const reportsResponse = await fetch('/api/reports')
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json()
        setReports(reportsData.reports)
      }

      // Load devices (for operators)
      if (meData.user.role === 'OPERATOR' || meData.user.role === 'ADMIN') {
        const devicesResponse = await fetch('/api/devices')
        if (devicesResponse.ok) {
          const devicesData = await devicesResponse.json()
          setDevices(devicesData.devices)
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create report')
      }

      // Reset form and reload reports
      setFormData({ userId: '', deviceId: '', title: '', description: '' })
      setShowForm(false)
      loadData()
      alert('Report created successfully!')
    } catch (error: any) {
      console.error('Error creating report:', error)
      alert(error.message || 'Failed to create report')
    }
  }

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>
  }

  const canCreateReports = currentUser?.role === 'OPERATOR' || currentUser?.role === 'ADMIN'

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Job Reports</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {canCreateReports && (
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                padding: '0.5rem 1rem',
                background: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              {showForm ? 'Cancel' : '+ Create Report'}
            </button>
          )}
          <Link href="/dashboard" style={{
            padding: '0.5rem 1rem',
            background: '#666',
            color: 'white',
            borderRadius: '5px',
            textDecoration: 'none',
          }}>
            ← Back
          </Link>
        </div>
      </div>

      {showForm && canCreateReports && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '5px' }}>
          <h2>Create Job Report</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Customer Email *
              </label>
              <input
                type="email"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                required
                placeholder="customer@example.com (use their User ID in production)"
                style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
              />
              <small style={{ color: '#666' }}>
                Note: In production, this would be a user picker showing consented customers
              </small>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Device ID *
              </label>
              <input
                type="text"
                value={formData.deviceId}
                onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                required
                placeholder="Device ID"
                style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., Leak Detection and Repair"
                style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={6}
                placeholder="Detailed description of work performed..."
                style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                background: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Create Report
            </button>
          </form>
        </div>
      )}

      {reports.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', background: '#f9f9f9', borderRadius: '5px' }}>
          <p>No job reports yet.</p>
          {canCreateReports && <p>Click "Create Report" to add your first report.</p>}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {reports.map((report) => (
            <div
              key={report.id}
              style={{
                padding: '1.5rem',
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '5px',
              }}
            >
              <h3>{report.title}</h3>
              <p style={{ color: '#666', marginTop: '0.5rem' }}>{report.description}</p>
              
              <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                <p><strong>Customer:</strong> {report.user.name || report.user.email}</p>
                <p><strong>Device:</strong> {report.device.name}</p>
                <p><strong>Created:</strong> {new Date(report.createdAt).toLocaleString()}</p>
                
                {report.pdfPath && (
                  <p><strong>PDF:</strong> <a href={report.pdfPath} target="_blank" rel="noopener noreferrer">Download</a></p>
                )}
                
                {report.bsvTxId && (
                  <p>
                    <strong>BSV TX:</strong>{' '}
                    <code style={{ fontSize: '0.8rem' }}>{report.bsvTxId.substring(0, 16)}...</code>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#e3f2fd', borderRadius: '5px' }}>
        <h3>📄 PDF Generation & Email Notifications</h3>
        <p>PDF generation and email notifications are stubbed in the API. To implement:</p>
        <ul>
          <li>
            <strong>PDF Generation:</strong> Use puppeteer or html-pdf library
            <pre style={{ background: 'white', padding: '0.5rem', marginTop: '0.5rem' }}>
npm install puppeteer
            </pre>
          </li>
          <li>
            <strong>Email Notifications:</strong> Configure nodemailer or SendGrid in .env
            <ul>
              <li>Set EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD</li>
              <li>Or use SENDGRID_API_KEY for SendGrid</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  )
}
