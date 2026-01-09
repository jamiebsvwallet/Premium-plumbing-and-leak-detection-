import React, { useEffect, useState } from 'react';
import { iotService } from '../services/api';

const HeatMap = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHeatmapData();
  }, []);

  const loadHeatmapData = async () => {
    try {
      const data = await iotService.getHeatmapData();
      setHeatmapData(data);
    } catch (error) {
      console.error('Failed to load heatmap data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColorByAlertCount = (count) => {
    if (count === 0) return '#4caf50';
    if (count < 3) return '#ff9800';
    return '#f44336';
  };

  if (loading) {
    return <div style={styles.loading}>Loading heat map data...</div>;
  }

  return (
    <div style={styles.container}>
      <h2>Leak Detection Heat Map</h2>
      <div style={styles.legend}>
        <span><span style={{...styles.legendDot, background: '#4caf50'}}></span> Normal</span>
        <span><span style={{...styles.legendDot, background: '#ff9800'}}></span> Warning</span>
        <span><span style={{...styles.legendDot, background: '#f44336'}}></span> Critical</span>
      </div>
      <div style={styles.grid}>
        {heatmapData.map((device) => (
          <div 
            key={device.deviceId} 
            style={{
              ...styles.deviceCell,
              borderLeft: `5px solid ${getColorByAlertCount(device.alertCount)}`
            }}
          >
            <h4>{device.deviceName}</h4>
            <p>Location: {device.location?.room || 'Unknown'}</p>
            <div style={styles.metrics}>
              <div>
                <small>Avg Value</small>
                <p>{device.avgValue?.toFixed(2)}</p>
              </div>
              <div>
                <small>Alerts</small>
                <p style={{color: getColorByAlertCount(device.alertCount)}}>
                  {device.alertCount}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px'
  },
  loading: {
    textAlign: 'center',
    padding: '40px'
  },
  legend: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
    padding: '15px',
    background: 'white',
    borderRadius: '5px'
  },
  legendDot: {
    display: 'inline-block',
    width: '15px',
    height: '15px',
    borderRadius: '50%',
    marginRight: '8px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px'
  },
  deviceCell: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  metrics: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '15px'
  }
};

export default HeatMap;
