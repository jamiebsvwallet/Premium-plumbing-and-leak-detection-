# Premium Plumbing & Leak Detection - WebXR MVP

A complete MVP scaffold for an IoT-enabled plumbing monitoring and leak detection system with WebXR capabilities, BSV blockchain anchoring, and real-time data visualization.

## Features

- 🔐 **Authentication**: Secure JWT-based authentication with bcrypt password hashing
- 📊 **Real-time Monitoring**: Socket.IO-powered real-time device event streaming
- ⚓ **BSV Blockchain Anchoring**: Data integrity verification via BSV blockchain
- 🔒 **Consent Management**: Granular access control for device data sharing
- 🌐 **Digital Twin**: Real-time visualization of device state and events
- 📱 **AR Diagnostics**: WebXR-ready AR diagnostic interface (placeholder)
- 📝 **Job Reports**: Create and manage plumbing job reports
- 🔌 **IoT Simulator**: Built-in device event simulator for testing

## Architecture

### Frontend (Next.js + TypeScript)
- **Pages**: Landing, Auth (signup/login), Dashboard, Devices, Digital Twin, AR Diagnostics, Job Reports
- **API Routes**: Authentication, Device management, Consent, Job Reports, Event ingestion
- **Real-time**: Socket.IO client for live device updates

### Backend (Express + Socket.IO)
- **REST API**: Device registration, event ingestion, consent management
- **WebSocket**: Real-time event broadcasting with room-based access control
- **Anchor Worker**: Background worker for BSV blockchain anchoring
- **Database**: Prisma ORM with SQLite (easily swappable to PostgreSQL)

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd Premium-plumbing-and-leak-detection-
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Secret (IMPORTANT: Change this in production!)
JWT_SECRET="your-secure-jwt-secret-change-this-in-production"

# Server Configuration
PORT=4000
NODE_ENV=development

# Frontend URLs
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=http://localhost:4000
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with admin user
npm run db:seed
```

This creates:
- **admin@example.com** / AdminPass123 (admin role)
- **operator@example.com** / OperatorPass123 (operator role)

### 4. Start Development Servers

**Terminal 1 - Backend Server:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

### 5. Register a Device

1. Navigate to http://localhost:3000
2. Sign up or login with admin@example.com / AdminPass123
3. Go to "Devices" and click "+ Add Device"
4. Register a device with serial number `DEVICE-001`

### 6. Run IoT Simulator

**Terminal 3 - IoT Simulator:**
```bash
npm run simulate
```

The simulator will send events every 3 seconds to the device with serial number `DEVICE-001`.

### 7. View Real-time Updates

1. Navigate to "Devices"
2. Click on your device to view the Digital Twin
3. Watch real-time events appear as the simulator sends data
4. Events will show anchor status (pending → anchored with fake BSV txid)

## Testing the Complete Flow

### User Signup and Device Registration
1. Visit http://localhost:3000
2. Click "Sign Up" and create an account
3. After login, go to "Devices" → "+ Add Device"
4. Register device: Name="Water Heater", Type="water_heater", Serial="DEVICE-001"

### IoT Event Simulation
```bash
npm run simulate
# Or with custom settings:
npm run simulate -- --serial DEVICE-001 --interval 2000
```

### View Digital Twin
1. Click on your device in the Devices list
2. See real-time events streaming in
3. Observe anchor status changing from "pending" to "anchored"
4. View BSV transaction IDs (fake txid by default)

### Grant Consent to Operator
1. In Digital Twin view, click "Manage Consent"
2. Enter operator email: `operator@example.com`
3. Click "Grant Access"
4. Operator can now view this device's data

### Create Job Report
1. Go to "Job Reports"
2. Click "+ Create Report"
3. Fill in title and description
4. Optionally link to a device
5. Submit to create report

## Enabling Real BSV Broadcasting

By default, the system uses fake transaction IDs for development. To enable real BSV blockchain anchoring:

### 1. Set Environment Variables

Add to your `.env` file:

```env
BSV_PRIVATE_KEY=your_wif_format_private_key
BSV_NETWORK=mainnet  # or testnet
BSV_API_URL=https://api.whatsonchain.com/v1/bsv/main
```

### 2. Implement BSV Broadcasting

Edit `server/utils/bsv.ts` to implement real BSV transaction creation:

```typescript
// TODO: Add BSV transaction library (e.g., bsv.js)
// 1. Create transaction with OP_RETURN data
// 2. Sign with private key
// 3. Broadcast via API
// 4. Return real transaction ID
```

**Security Note**: NEVER commit private keys to version control!

## Deployment

### Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com) and import your repository
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`
   - `NEXT_PUBLIC_WS_URL=https://your-backend.onrender.com`
4. Deploy

### Backend Deployment (Render)

1. Create new Web Service on [render.com](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `npm install && npm run db:generate && npm run server:build`
   - **Start Command**: `npm run server:start`
4. Set environment variables:
   - `DATABASE_URL=postgresql://...` (use Render PostgreSQL)
   - `JWT_SECRET=<secure-random-string>`
   - `NODE_ENV=production`
   - `PORT=4000`
5. Update Prisma schema to use PostgreSQL:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
6. Deploy

### Post-Deployment Setup

1. Run database migrations:
   ```bash
   npm run db:push
   npm run db:seed
   ```

2. Update frontend environment variables to point to production backend

3. Test the complete flow in production

## API Documentation

### Authentication

**POST /api/auth/signup**
- Body: `{ email, password }`
- Returns: `{ user, token }`

**POST /api/auth/login**
- Body: `{ email, password }`
- Returns: `{ user, token }`

### Devices

**GET /api/devices**
- Headers: `Authorization: Bearer <token>`
- Returns: Array of user's devices

**POST /api/devices**
- Headers: `Authorization: Bearer <token>`
- Body: `{ name, type, serialNumber }`
- Returns: Created device

**GET /api/devices/:deviceId**
- Headers: `Authorization: Bearer <token>`
- Returns: Device with recent events

### Events

**POST /api/events/ingest**
- Body: `{ serialNumber, eventType, value, metadata }`
- Returns: Created event
- Note: No authentication required (webhook endpoint)

### Consent

**POST /api/consent/grant**
- Headers: `Authorization: Bearer <token>`
- Body: `{ deviceId, grantedTo, scope }`
- Returns: Consent grant record

**POST /api/consent/revoke**
- Headers: `Authorization: Bearer <token>`
- Body: `{ deviceId, grantedTo }`
- Returns: Success status

### Job Reports

**GET /api/job-reports**
- Headers: `Authorization: Bearer <token>`
- Returns: Array of user's job reports

**POST /api/job-reports**
- Headers: `Authorization: Bearer <token>`
- Body: `{ title, description, deviceId? }`
- Returns: Created job report

## Socket.IO Events

### Client → Server
- `join-device`: Join device room for real-time updates
- `leave-device`: Leave device room

### Server → Client
- `device-event`: New device event
- `joined-device`: Confirmation of joining device room
- `error`: Error message

## Database Schema

See `prisma/schema.prisma` for complete schema. Key models:
- **User**: Authentication and authorization
- **Device**: IoT device registration
- **DeviceEvent**: Time-series sensor data
- **ConsentGrant**: Access control for data sharing
- **AnchorJob**: BSV anchoring job queue
- **JobReport**: Plumbing job reports

## Development Scripts

```bash
npm run dev          # Start Next.js development server
npm run server       # Start Express backend with hot-reload
npm run simulate     # Run IoT device simulator
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes to database
npm run db:seed      # Seed database with test data
npm run db:studio    # Open Prisma Studio (database GUI)
npm run build        # Build Next.js for production
npm run start        # Start Next.js production server
```

## Project Structure

```
├── lib/                  # Shared utilities
│   ├── auth.ts          # JWT & bcrypt functions
│   ├── middleware.ts    # API auth middleware
│   └── prisma.ts        # Prisma client singleton
├── pages/               # Next.js pages & API routes
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── digital-twin/   # Digital twin view
│   ├── ar-diagnostics/ # AR diagnostic view
│   ├── dashboard.tsx   # User dashboard
│   ├── devices.tsx     # Device management
│   └── job-reports.tsx # Job reports
├── prisma/             # Database
│   ├── schema.prisma   # Database schema
│   └── seed.ts         # Seed script
├── scripts/            # Utility scripts
│   └── iot-simulate.ts # IoT event simulator
├── server/             # Express backend
│   ├── attachApi.ts    # REST API routes
│   ├── index.ts        # Server entry point
│   ├── socket-server.ts # Socket.IO setup
│   ├── utils/          # Server utilities
│   │   └── bsv.ts      # BSV anchoring
│   └── workers/        # Background workers
│       └── anchors.ts  # Anchor worker
└── styles/             # CSS styles
    └── globals.css     # Global styles
```

## Security Considerations

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens for authentication
- ✅ API endpoints protected with auth middleware
- ✅ Consent-based access control
- ✅ No private keys in code
- ⚠️ Change JWT_SECRET in production
- ⚠️ Use HTTPS in production
- ⚠️ Implement rate limiting for production
- ⚠️ Add input validation and sanitization

## TODOs

- [ ] Implement real BSV transaction broadcasting
- [ ] Add WebXR AR experience implementation
- [ ] Implement data analytics and insights
- [ ] Add email notifications for alerts
- [ ] Implement device firmware update mechanism
- [ ] Add bulk device registration
- [ ] Implement advanced search and filtering
- [ ] Add unit and integration tests
- [ ] Implement rate limiting
- [ ] Add API documentation (Swagger/OpenAPI)

## License

MIT

## Support

For issues or questions, please open an issue on the GitHub repository.
