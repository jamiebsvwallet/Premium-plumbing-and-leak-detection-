import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { jobService, iotService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout, updateConsent } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [devices, setDevices] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [jobsData, devicesData] = await Promise.all([
        jobService.getMyJobs(),
        iotService.getMyDevices()
      ]);
      setJobs(jobsData);
      setDevices(devicesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleConsentUpdate = async (field, value) => {
    try {
      const newConsent = {
        ...user.consentSettings,
        [field]: value
      };
      await updateConsent(newConsent);
    } catch (error) {
      console.error('Failed to update consent:', error);
    }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <h1 style={styles.logo}>PPLD Dashboard</h1>
        <div style={styles.userInfo}>
          <span>{user?.name}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div style={styles.content}>
        <div style={styles.sidebar}>
          <button 
            style={activeTab === 'overview' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            style={activeTab === 'jobs' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('jobs')}
          >
            Job Reports
          </button>
          <button 
            style={activeTab === 'devices' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('devices')}
          >
            IoT Devices
          </button>
          <button 
            style={activeTab === 'heatmap' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('heatmap')}
          >
            Heat Map
          </button>
          <button 
            style={activeTab === 'digital-twin' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('digital-twin')}
          >
            Digital Twin
          </button>
          <button 
            style={activeTab === 'game' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('game')}
          >
            3D Game
          </button>
          <button 
            style={activeTab === 'consent' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('consent')}
          >
            Consent Settings
          </button>
        </div>

        <div style={styles.main}>
          {activeTab === 'overview' && (
            <div>
              <h2>Welcome, {user?.name}!</h2>
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <h3>BSV Address</h3>
                  <p style={styles.address}>{user?.bsvAddress}</p>
                </div>
                <div style={styles.statCard}>
                  <h3>Total Jobs</h3>
                  <p style={styles.statValue}>{jobs.length}</p>
                </div>
                <div style={styles.statCard}>
                  <h3>Active Devices</h3>
                  <p style={styles.statValue}>{devices.filter(d => d.status === 'active').length}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div>
              <h2>Job Reports</h2>
              <div style={styles.jobsList}>
                {jobs.length === 0 ? (
                  <p>No job reports yet.</p>
                ) : (
                  jobs.map(job => (
                    <div key={job._id} style={styles.jobCard}>
                      <h3>{job.jobTitle}</h3>
                      <p>{job.description}</p>
                      <div style={styles.jobMeta}>
                        <span style={styles.badge}>{job.status}</span>
                        {job.completionDate && (
                          <span>Completed: {new Date(job.completionDate).toLocaleDateString()}</span>
                        )}
                      </div>
                      {job.bsvTransactionId && (
                        <p style={styles.txId}>TX: {job.bsvTransactionId.substring(0, 20)}...</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'devices' && (
            <div>
              <h2>IoT Devices</h2>
              <div style={styles.devicesList}>
                {devices.length === 0 ? (
                  <p>No devices registered yet.</p>
                ) : (
                  devices.map(device => (
                    <div key={device._id} style={styles.deviceCard}>
                      <h3>{device.deviceName}</h3>
                      <p>Type: {device.deviceType}</p>
                      <p>Location: {device.location?.room || 'Not specified'}</p>
                      <span style={{...styles.badge, background: device.status === 'active' ? '#4caf50' : '#ff9800'}}>
                        {device.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'heatmap' && (
            <div>
              <h2>Heat Map Visualization</h2>
              <div style={styles.placeholder}>
                <p>Heat map visualization of leak detection data</p>
                <p>Shows real-time water flow, pressure, and leak alerts across your property</p>
              </div>
            </div>
          )}

          {activeTab === 'digital-twin' && (
            <div>
              <h2>Digital Twin</h2>
              <div style={styles.placeholder}>
                <p>3D Digital Twin of your plumbing system</p>
                <p>Interactive visualization of pipes, sensors, and water flow</p>
              </div>
            </div>
          )}

          {activeTab === 'game' && (
            <div>
              <h2>3D Plumbing Game</h2>
              <div style={styles.placeholder}>
                <p>Interactive 3D game to learn about plumbing systems</p>
                <p>Explore virtual environments and fix plumbing issues</p>
              </div>
            </div>
          )}

          {activeTab === 'consent' && (
            <div>
              <h2>Consent Settings</h2>
              <div style={styles.consentCard}>
                <label style={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={user?.consentSettings?.shareWithCompany}
                    onChange={(e) => handleConsentUpdate('shareWithCompany', e.target.checked)}
                  />
                  Share IoT data with Premium Plumbing Company
                </label>
                <label style={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={user?.consentSettings?.shareWithWaterBoard}
                    onChange={(e) => handleConsentUpdate('shareWithWaterBoard', e.target.checked)}
                  />
                  Share IoT data with Water Board
                </label>
                <p style={styles.consentInfo}>
                  All data shared is recorded on the BSV blockchain with cryptographic hashes for verification.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5f5f5'
  },
  navbar: {
    background: '#667eea',
    color: 'white',
    padding: '15px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    margin: 0
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  logoutBtn: {
    background: 'white',
    color: '#667eea',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  content: {
    display: 'flex',
    minHeight: 'calc(100vh - 60px)'
  },
  sidebar: {
    width: '250px',
    background: 'white',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  tab: {
    padding: '12px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
    textAlign: 'left'
  },
  activeTab: {
    padding: '12px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    textAlign: 'left'
  },
  main: {
    flex: 1,
    padding: '30px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  },
  statCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  address: {
    fontSize: '12px',
    wordBreak: 'break-all',
    marginTop: '10px',
    color: '#666'
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#667eea',
    margin: '10px 0'
  },
  jobsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '20px'
  },
  jobCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  jobMeta: {
    display: 'flex',
    gap: '15px',
    marginTop: '10px',
    alignItems: 'center'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '15px',
    background: '#4caf50',
    color: 'white',
    fontSize: '12px'
  },
  txId: {
    fontSize: '12px',
    color: '#666',
    marginTop: '10px'
  },
  devicesList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  },
  deviceCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  placeholder: {
    background: 'white',
    padding: '40px',
    borderRadius: '10px',
    textAlign: 'center',
    marginTop: '20px'
  },
  consentCard: {
    background: 'white',
    padding: '30px',
    borderRadius: '10px',
    marginTop: '20px'
  },
  checkboxLabel: {
    display: 'block',
    marginBottom: '20px',
    fontSize: '16px'
  },
  consentInfo: {
    marginTop: '20px',
    padding: '15px',
    background: '#e3f2fd',
    borderRadius: '5px',
    color: '#1976d2'
  }
};

export default Dashboard;
