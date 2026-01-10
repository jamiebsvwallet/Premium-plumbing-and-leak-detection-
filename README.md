# Premium Plumbing & Leak Detection - WebXR MVP

IoT-enabled plumbing diagnostics platform with real-time monitoring, WebXR visualization, and BSV blockchain anchoring.

## Features

- 🔐 **Authentication**: Email/password auth with JWT sessions
- 📱 **Device Management**: Register and monitor IoT plumbing devices
- 🔴 **Real-time Updates**: Socket.IO for live event streaming
- 🎨 **Digital Twin**: 3D visualization of plumbing systems
- 📱 **AR Diagnostics**: AR.js-based augmented reality diagnostics
- ⛓️ **Blockchain Anchoring**: Device events anchored to BSV blockchain
- 🤝 **Consent Management**: Control operator access to device data
- 📋 **Job Reports**: Create and manage service reports with PDF export

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Socket.IO Client, Three.js
- **Backend**: Express, Socket.IO, TypeScript
- **Database**: Prisma ORM with SQLite
- **Authentication**: JWT + bcrypt
- **Blockchain**: BSV (stubbed for MVP)

## Prerequisites

- Node.js 18+ and npm
- Git

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd Premium-plumbing-and-leak-detection-
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env if needed (defaults work for local development)
```

### 3. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with admin user (admin@example.com / AdminPass123)
npm run db:seed
```

### 4. Start Backend Server

In one terminal:

```bash
npm run server:dev
```

The server will start on http://localhost:3001

### 5. Start Frontend

In another terminal:

```bash
npm run dev
```

The frontend will start on http://localhost:3000

## Testing the Application

### 1. Sign Up and Login

1. Navigate to http://localhost:3000
2. Click "Sign Up" and create a new account
3. Login with your credentials

Alternatively, use the pre-seeded admin account:
- Email: `admin@example.com`
- Password: `AdminPass123`

### 2. Register a Device

1. Go to "Devices" from the dashboard
2. Click "Register Device"
3. Enter device details:
   - Name: "Main Water Line Sensor"
   - Serial Number: "SENSOR-001"
4. Click "Register"

### 3. Run IoT Simulator

In a third terminal:

```bash
npm run simulate
```

When prompted, enter the device ID (found in the device card on the Devices page).

The simulator will send random sensor events every 5 seconds:
- Temperature readings
- Pressure measurements
- Flow rate data
- Leak detection alerts
- Vibration data

### 4. View Real-time Events

1. Click "Digital Twin" on any device
2. Watch events appear in real-time as the simulator sends them
3. Notice the anchor status updating from "PENDING" to "ANCHORED"
4. Each event gets a BSV transaction ID (currently stubbed)

### 5. Test Consent Management

1. Create a second user account with OPERATOR role
2. As device owner, go to Consent page (not yet in UI, use API)
3. Grant consent to operator for specific device
4. Login as operator and verify you can see shared device events

### 6. Create Job Reports

1. Navigate to "Job Reports" from dashboard
2. Click "Create Report"
3. Select a device and fill in details
4. Click "Export PDF" to test PDF export stub

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login and get JWT token

### Devices
- `GET /api/devices` - List user's devices
- `POST /api/devices/register` - Register new device

### Events
- `POST /api/events/ingest` - Webhook for device events (used by IoT devices)
- `GET /api/events/:deviceId` - Get device events (with consent check)

### Consent
- `GET /api/consent` - List consents for user's devices
- `POST /api/consent` - Grant/revoke consent

### Job Reports
- `GET /api/job-reports` - List user's reports
- `POST /api/job-reports` - Create new report

## Architecture

### Database Schema

```
User (id, email, password, role)
├── Device (id, name, serialNo, ownerId)
│   ├── DeviceEvent (id, deviceId, eventType, payload, sha256, bsvTxId, anchorStatus)
│   ├── Consent (id, deviceId, operatorId, granted)
│   └── JobReport (id, deviceId, technicianId, title, description, status)
```

### Real-time Flow

1. IoT device → POST `/api/events/ingest`
2. Server creates DeviceEvent in database
3. Server emits event via Socket.IO to subscribed clients
4. Anchor worker processes event asynchronously
5. SHA256 hash sent to BSV blockchain (or stub)
6. DeviceEvent updated with bsvTxId and ANCHORED status

### Consent-based Access

- Device owners have full access to their device events
- Operators only see events for devices where consent.granted = true
- All event access routes check ownership or consent

## BSV Blockchain Integration

### Current State (MVP)

The BSV integration is currently **stubbed** for MVP demonstration:

- `server/utils/bsv.ts` contains `sendBsvOpReturn()` function
- Returns fake transaction IDs when BSV credentials are not configured
- Events still get anchored with status updates

### Production Setup

To enable real BSV anchoring:

1. Set environment variables in `.env`:
   ```
   BSV_PRIVATE_KEY="your_bsv_private_key"
   BSV_BROADCAST_ENDPOINT="https://api.whatsonchain.com/v1/bsv/main/tx/raw"
   ```

2. Implement actual BSV broadcasting in `server/utils/bsv.ts`:
   - Use BSV SDK or library of choice
   - Create transaction with OP_RETURN output containing SHA256 hash
   - Sign with private key
   - Broadcast to endpoint
   - Return actual transaction ID

3. The anchor worker (`server/workers/anchors.ts`) will automatically use the real implementation

### TODO for Production

- [ ] Implement real BSV transaction creation
- [ ] Add transaction verification
- [ ] Handle blockchain errors and retries
- [ ] Monitor transaction confirmation status
- [ ] Add cost estimation and rate limiting

## WebXR and AR Features

### Digital Twin (3D Visualization)

- Location: `/digital-twin/[deviceId]`
- Uses Three.js / React Three Fiber
- Currently shows placeholder - needs glTF/USDZ models
- Real-time event visualization

**TODO**: 
- Load 3D plumbing system models
- Map sensor data to 3D positions
- Color-code based on readings (temperature, pressure)
- Animate flow rates
- Highlight leak locations

### AR Diagnostics

- Location: `/ar-diagnostics/[deviceId]`
- Uses AR.js with marker-based tracking
- Falls back when WebXR not supported
- Displays Hiro marker for testing

**TODO**:
- Integrate A-Frame + AR.js properly
- Load USDZ models for iOS AR Quick Look
- Add interactive hotspots
- Overlay sensor readings in AR space
- Implement location-based AR (GPS/compass)

## Deployment

### Frontend (Vercel/Netlify)

```bash
npm run build
npm start
```

Environment variables needed:
- `NEXT_PUBLIC_SOCKET_URL` - Backend Socket.IO URL

### Backend (Render/Railway/Heroku)

1. Set environment variables from `.env.example`
2. Run database migrations: `npm run db:push`
3. Seed database: `npm run db:seed`
4. Start server: `npm run server`

**Note**: For production, switch from SQLite to PostgreSQL:
- Update `prisma/schema.prisma` datasource to `postgresql`
- Set `DATABASE_URL` to PostgreSQL connection string

## Development Scripts

```bash
npm run dev          # Start Next.js dev server
npm run build        # Build Next.js for production
npm run start        # Start Next.js production server
npm run server       # Start Express backend (production)
npm run server:dev   # Start Express backend (development with nodemon)
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes to database
npm run db:seed      # Seed database with admin user
npm run db:studio    # Open Prisma Studio (database GUI)
npm run simulate     # Run IoT device simulator
```

## Troubleshooting

### Database Issues

```bash
# Reset database
rm prisma/dev.db
npm run db:push
npm run db:seed
```

### Port Conflicts

If ports 3000 or 3001 are in use:
- Change `SERVER_PORT` in `.env`
- Update `NEXT_PUBLIC_SOCKET_URL` to match
- Or kill processes using those ports

### Socket.IO Connection Issues

- Ensure backend server is running on correct port
- Check `NEXT_PUBLIC_SOCKET_URL` in `.env`
- Check browser console for connection errors
- Verify CORS configuration in `server/index.ts`

## Security Notes

⚠️ **Important for Production**:

- Change `JWT_SECRET` to a strong random value
- Use HTTPS for all production deployments
- Switch to PostgreSQL from SQLite
- Implement rate limiting
- Add input validation and sanitization
- Enable CSRF protection
- Set secure cookie flags
- Implement proper error handling (don't leak stack traces)
- Add logging and monitoring
- Regular security audits
- Keep dependencies updated

## Future Enhancements

- [ ] Complete WebXR integration with actual 3D models
- [ ] Full AR.js implementation with custom markers
- [ ] Real BSV blockchain integration
- [ ] Email notifications via SendGrid/nodemailer
- [ ] PDF generation for job reports (jsPDF/pdfmake)
- [ ] Multi-language support
- [ ] Mobile apps (React Native)
- [ ] Advanced analytics dashboard
- [ ] Machine learning for leak prediction
- [ ] Integration with third-party IoT platforms
- [ ] GraphQL API option
- [ ] Websocket authentication
- [ ] File upload for device documentation
- [ ] Team management features
- [ ] Audit logging
- [ ] Data export features

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
