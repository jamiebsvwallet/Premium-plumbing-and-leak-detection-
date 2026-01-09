import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Line } from '@react-three/drei';

const Pipe = ({ start, end, color = 'gray' }) => {
  const points = [start, end];
  return (
    <Line
      points={points}
      color={color}
      lineWidth={3}
    />
  );
};

const Sensor = ({ position, status }) => {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current && status === 'alert') {
      meshRef.current.rotation.y += 0.05;
    }
  });

  const color = status === 'alert' ? 'red' : status === 'warning' ? 'orange' : 'green';

  return (
    <Sphere ref={meshRef} args={[0.2, 16, 16]} position={position}>
      <meshStandardMaterial color={color} />
    </Sphere>
  );
};

const PlumbingSystem = () => {
  // Simplified plumbing system layout
  const pipes = [
    { start: [-2, 0, 0], end: [2, 0, 0], color: 'lightblue' },
    { start: [0, -2, 0], end: [0, 2, 0], color: 'lightblue' },
    { start: [-2, 0, 0], end: [-2, -2, 0], color: 'lightblue' },
    { start: [2, 0, 0], end: [2, 2, 0], color: 'lightblue' }
  ];

  const sensors = [
    { position: [-2, 0, 0], status: 'normal' },
    { position: [2, 0, 0], status: 'normal' },
    { position: [0, 2, 0], status: 'warning' },
    { position: [0, -2, 0], status: 'normal' }
  ];

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      {pipes.map((pipe, index) => (
        <Pipe key={index} {...pipe} />
      ))}
      
      {sensors.map((sensor, index) => (
        <Sensor key={index} {...sensor} />
      ))}
      
      <OrbitControls />
    </>
  );
};

const DigitalTwin = () => {
  return (
    <div style={styles.container}>
      <h2>Digital Twin - Plumbing System</h2>
      <div style={styles.info}>
        <p>Interactive 3D visualization of your plumbing system</p>
        <div style={styles.legend}>
          <span><span style={{...styles.dot, background: 'green'}}></span> Normal</span>
          <span><span style={{...styles.dot, background: 'orange'}}></span> Warning</span>
          <span><span style={{...styles.dot, background: 'red'}}></span> Alert</span>
        </div>
      </div>
      <div style={styles.canvas}>
        <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
          <PlumbingSystem />
        </Canvas>
      </div>
      <div style={styles.controls}>
        <p>Use mouse to rotate and zoom the 3D model</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px'
  },
  info: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '20px'
  },
  legend: {
    display: 'flex',
    gap: '20px',
    marginTop: '10px'
  },
  dot: {
    display: 'inline-block',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    marginRight: '8px'
  },
  canvas: {
    width: '100%',
    height: '500px',
    background: 'white',
    borderRadius: '10px',
    overflow: 'hidden'
  },
  controls: {
    textAlign: 'center',
    marginTop: '20px',
    padding: '15px',
    background: 'white',
    borderRadius: '10px'
  }
};

export default DigitalTwin;
