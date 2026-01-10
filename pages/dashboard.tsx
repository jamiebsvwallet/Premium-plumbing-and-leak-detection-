import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getToken, removeToken, isAuthenticated } from '../lib/auth';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    removeToken();
    router.push('/');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div
          onClick={() => router.push('/devices')}
          style={{
            padding: '30px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: '#f8f9fa',
          }}
        >
          <h2>Devices</h2>
          <p>Manage your IoT devices</p>
        </div>

        <div
          onClick={() => router.push('/job-reports')}
          style={{
            padding: '30px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: '#f8f9fa',
          }}
        >
          <h2>Job Reports</h2>
          <p>Create and manage reports</p>
        </div>
      </div>
    </div>
  );
}
