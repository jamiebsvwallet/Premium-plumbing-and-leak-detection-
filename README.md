# Premium Plumbing & Leak Detection (PPLD)

A comprehensive BSV blockchain-based platform for plumbing services and IoT leak detection management.

## Features

### Core Functionality
- **Customer Account Management**: Users can create accounts with BSV addresses
- **Job Report System**: Plumbers can send job completion reports directly to customer accounts
- **IoT Device Integration**: Real-time data recording from leak prevention devices
- **Consent Management**: Customer-controlled data sharing with company and water board
- **Blockchain Integration**: Cryptographic hashing and on-chain storage of data via BSV network
- **Heat Mapping**: Visual representation of leak detection data
- **Digital Twin**: 3D visualization of plumbing systems
- **3D Game**: Interactive plumbing adventure game

### Technical Features
- **Real-time Updates**: WebSocket support for live IoT data streaming
- **BSV Transactions**: All critical data is hashed and stored on the BSV blockchain
- **Data Integrity**: Cryptographic verification of all recorded data
- **Privacy Controls**: Granular consent management for data sharing

## Architecture

### Backend (Node.js/Express)
- RESTful API endpoints
- MongoDB database for application data
- BSV blockchain integration for data integrity
- WebSocket server for real-time IoT updates
- JWT authentication

### Frontend (React)
- Modern single-page application
- Interactive dashboards
- 3D visualizations using Three.js
- Real-time data displays
- Responsive design

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start MongoDB:
```bash
# Make sure MongoDB is running on localhost:27017
# Or update MONGODB_URI in .env
```

4. Start the server:
```bash
npm start
# Or for development with auto-reload:
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### POST /api/auth/login
Login to existing account
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### User Endpoints

#### GET /api/users/profile
Get current user profile (requires authentication)

#### PUT /api/users/consent
Update consent settings
```json
{
  "shareWithCompany": true,
  "shareWithWaterBoard": false
}
```

### Job Report Endpoints

#### GET /api/jobs/my-jobs
Get all job reports for current user

#### POST /api/jobs (Admin only)
Create new job report
```json
{
  "customerId": "user_id",
  "jobTitle": "Leak Repair",
  "description": "Fixed leak in bathroom",
  "technician": "Jane Smith",
  "location": {
    "address": "123 Main St",
    "coordinates": {
      "lat": 51.5074,
      "lng": -0.1278
    }
  }
}
```

#### PUT /api/jobs/:id/complete (Admin only)
Mark job as completed and record on blockchain

### IoT Device Endpoints

#### POST /api/iot/register
Register new IoT device
```json
{
  "deviceId": "DEVICE-001",
  "deviceName": "Kitchen Leak Sensor",
  "deviceType": "leak-sensor",
  "location": {
    "room": "Kitchen",
    "coordinates": {
      "lat": 51.5074,
      "lng": -0.1278
    }
  }
}
```

#### GET /api/iot/my-devices
Get all registered devices for current user

#### POST /api/iot/data
Record IoT sensor data
```json
{
  "deviceId": "device_id",
  "reading": {
    "value": 2.5,
    "unit": "liters/min",
    "type": "flow"
  },
  "alert": false
}
```

#### GET /api/iot/data/:deviceId
Get historical data for specific device

#### GET /api/iot/heatmap/data
Get aggregated data for heat map visualization

## BSV Integration

### Data Hashing
All critical data (job reports, IoT readings) is hashed using SHA-256 before being recorded on the BSV blockchain.

### Transaction Recording
Each significant event creates a BSV transaction containing:
- Data hash
- Timestamp
- Recipient address (customer, company, or water board)

### Verification
Data integrity can be verified at any time by comparing stored hashes with current data.

## Consent Management

Users have granular control over data sharing:
- **Share with Company**: Allow plumbing company to access IoT data
- **Share with Water Board**: Allow water board to access IoT data

All consent settings are respected when recording data on the blockchain.

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- CORS protection
- Input validation on all endpoints
- Blockchain-based data integrity verification

## Development

### Project Structure
```
├── server/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── utils/           # Utility functions (BSV service)
│   ├── config/          # Configuration files
│   └── index.js         # Server entry point
├── client/
│   ├── public/          # Static files
│   └── src/
│       ├── components/  # React components
│       ├── pages/       # Page components
│       ├── services/    # API services
│       ├── context/     # React context
│       └── App.js       # Main app component
├── package.json
└── README.md
```

### Adding New Features

1. Backend: Add routes in `server/routes/`
2. Frontend: Add components in `client/src/components/`
3. Update API service in `client/src/services/api.js`

## Deployment

### Production Environment Variables

Update `.env` for production:
- Set `NODE_ENV=production`
- Use secure `JWT_SECRET`
- Configure production MongoDB URI
- Set real BSV private keys and addresses
- Configure CORS for production domain

### Building for Production

```bash
# Build frontend
cd client
npm run build

# The build folder can be served by the backend
# Or deployed to a CDN
```

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
