import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface JobReport {
  id: string
  title: string
  description: string
  status: string
  createdAt: string
  reportHash: string | null
  bsvTxId: string | null
  customer: {
    id: string
    email: string
    name: string | null
  }
  device: {
    id: string
    deviceId: string
    name: string
  } | null
}

export default function Reports() {
  const router = useRouter()
  const [reports, setReports] = useState<JobReport[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    fetchReports()
  }, [])

  const fetchReports = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch('/api/reports/manage', {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setReports(data.reports)
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <>
      <Head>
        <title>Job Reports - Premium Plumbing</title>
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Job Reports</h1>
            <Link href="/dashboard">
              <button className="btn-secondary">← Back</button>
            </Link>
          </div>

          <div className="card">
            {reports.length === 0 ? (
              <p className="text-gray-500">No job reports available.</p>
            ) : (
              <div className="space-y-6">
                {reports.map((report) => (
                  <div key={report.id} className="p-6 border rounded-lg bg-white">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{report.title}</h3>
                        <p className="text-sm text-gray-600">
                          Date: {new Date(report.createdAt).toLocaleString()}
                        </p>
                        {user?.role === 'operator' && (
                          <p className="text-sm text-gray-600">
                            Customer: {report.customer.name || report.customer.email}
                          </p>
                        )}
                        {report.device && (
                          <p className="text-sm text-gray-600">
                            Device: {report.device.name} ({report.device.deviceId})
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded text-sm font-semibold ${
                        report.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {report.status}
                      </span>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Description:</h4>
                      <p className="text-gray-700">{report.description}</p>
                    </div>

                    {report.bsvTxId && (
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-gray-700">
                          <strong>Blockchain Verified:</strong>
                        </p>
                        <p className="text-xs text-gray-600 break-all">
                          TX ID: {report.bsvTxId}
                        </p>
                        {report.reportHash && (
                          <p className="text-xs text-gray-600 break-all">
                            Hash: {report.reportHash}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="mt-4 flex space-x-2">
                      <button className="btn-secondary text-sm">
                        Download PDF
                      </button>
                      {report.bsvTxId && (
                        <button className="btn-secondary text-sm">
                          View on Blockchain
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
