import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Text } from '@react-three/drei';

const Player = ({ position }) => {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.3, 32, 32]} position={position}>
      <meshStandardMaterial color="blue" />
    </Sphere>
  );
};

const Obstacle = ({ position, type }) => {
  const color = type === 'leak' ? 'red' : type === 'pipe' ? 'gray' : 'brown';
  
  return (
    <Box args={[1, 1, 1]} position={position}>
      <meshStandardMaterial color={color} />
    </Box>
  );
};

const GameScene = ({ score, onCollect }) => {
  const obstacles = [
    { position: [-3, 0, 0], type: 'pipe' },
    { position: [3, 0, 0], type: 'pipe' },
    { position: [0, 0, -3], type: 'leak' },
    { position: [0, 0, 3], type: 'pipe' }
  ];

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      <Player position={[0, 1, 0]} />
      
      {obstacles.map((obstacle, index) => (
        <Obstacle key={index} {...obstacle} />
      ))}
      
      <Box args={[15, 0.1, 15]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color="lightgreen" />
      </Box>
      
      <OrbitControls />
    </>
  );
};

const PlumbingGame = () => {
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const handleStart = () => {
    setGameStarted(true);
    setScore(0);
  };

  const handleCollect = () => {
    setScore(score + 10);
  };

  return (
    <div style={styles.container}>
      <h2>3D Plumbing Adventure Game</h2>
      
      <div style={styles.gameInfo}>
        <div style={styles.scoreBoard}>
          <h3>Score: {score}</h3>
          {!gameStarted && (
            <button onClick={handleStart} style={styles.startBtn}>
              Start Game
            </button>
          )}
        </div>
        <div style={styles.instructions}>
          <h4>How to Play:</h4>
          <ul>
            <li>Navigate through the plumbing system</li>
            <li>Find and fix leaks (red blocks)</li>
            <li>Avoid obstacles (gray pipes)</li>
            <li>Collect points by fixing issues</li>
          </ul>
        </div>
      </div>

      <div style={styles.canvas}>
        <Canvas camera={{ position: [8, 8, 8], fov: 50 }}>
          <GameScene score={score} onCollect={handleCollect} />
        </Canvas>
      </div>

      <div style={styles.controls}>
        <p>Use mouse to rotate view • Arrow keys to move (coming soon)</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px'
  },
  gameInfo: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '20px',
    marginBottom: '20px'
  },
  scoreBoard: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center'
  },
  startBtn: {
    padding: '12px 24px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  instructions: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px'
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

export default PlumbingGame;
