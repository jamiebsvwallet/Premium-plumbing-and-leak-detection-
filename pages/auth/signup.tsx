import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'CUSTOMER',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Store token
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userRole', data.user.role);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
          <input
            id="password"
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem' }}>Name (optional)</label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="role" style={{ display: 'block', marginBottom: '0.5rem' }}>Role</label>
          <select
            id="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
          >
            <option value="CUSTOMER">Customer</option>
            <option value="OPERATOR">Operator</option>
          </select>
        </div>
        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', backgroundColor: '#0070f3', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Already have an account? <a href="/auth/login" style={{ color: '#0070f3' }}>Login</a>
      </p>
    </div>
  );
}
