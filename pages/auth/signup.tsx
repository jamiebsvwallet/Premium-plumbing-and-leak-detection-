import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post('/api/auth/signup', { email, password });
      alert('Account created successfully! Please login.');
      router.push('/auth/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', fontSize: '16px', marginTop: '5px' }}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', fontSize: '16px', marginTop: '5px' }}
          />
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px',
            fontSize: '16px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
      <p style={{ marginTop: '20px' }}>
        Already have an account?{' '}
        <a href="/auth/login" style={{ color: '#0070f3' }}>
          Login
        </a>
      </p>
    </div>
  );
}
