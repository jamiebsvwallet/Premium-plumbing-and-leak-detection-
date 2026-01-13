# BSV Premium Plumbing & Leak Detection

Full-stack MVP for IoT-powered water leak detection with BSV blockchain anchoring, real-time monitoring, digital twin visualization, and AR diagnostics.

## 🚀 Features

- **IoT Device Management**: Register and monitor leak detection devices
- **Real-time Event Ingestion**: Socket.IO powered real-time event streaming
- **BSV Blockchain Anchoring**: Immutable event hashing anchored to BSV (testnet/mainnet)
- **Digital Twin**: Real-time 3D visualization of device metrics
- **AR Diagnostics**: WebXR and AR.js powered augmented reality diagnostics
- **Consent Management**: Customer-controlled data sharing with operators
- **Job Reports**: Operator job reporting with PDF export
- **Multi-role Authentication**: Customer, Operator, and Admin roles

## 📋 Prerequisites

- Node.js 18+ and npm
- SQLite (for local development)

## 🛠️ Local Development Setup

### 1. Clone and Install

```bash
git clone https://github.com/jamiebsvwallet/Premium-plumbing-and-leak-detection-.git
cd Premium-plumbing-and-leak-detection-
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-in-production"
SERVER_PORT=3001
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"

# Optional: BSV Configuration (leave empty for stub mode)
BSV_PRIVATE_KEY=""
BSV_BROADCAST_ENDPOINT=""

# Optional: Email notifications
SENDGRID_API_KEY=""
SENDGRID_FROM_EMAIL=""
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with admin user
npm run seed
```

This creates:
- Admin user: `admin@example.com` / `AdminPass123`
- Operator user: `operator@example.com` / `OperatorPass123`

### 4. Start Development Servers

```bash
# Start both Next.js frontend and Express backend
npm run dev

# Or run separately:
npm run dev:next    # Frontend on http://localhost:3000
npm run dev:server  # Backend on http://localhost:3001
```

### 5. Start BSV Anchor Worker (Optional)

In a new terminal:

```bash
npm run worker
```

The worker runs in stub mode by default (generates fake txids). To enable real BSV broadcasting, configure `BSV_PRIVATE_KEY` and `BSV_BROADCAST_ENDPOINT` in `.env`.

## 🧪 Testing the Application

### 1. Sign Up and Login

1. Navigate to http://localhost:3000
2. Click "Sign Up" and create a customer account
3. Login with your credentials

### 2. Register a Device

1. Go to Dashboard
2. Click "Register Device"
3. Enter:
   - Name: "Kitchen Sensor"
   - Serial Number: "DEVICE-001"
   - Type: "Leak Sensor"

### 3. Run IoT Simulator

Copy the device ID from the dashboard, then run:

```bash
npm run simulate <device-id>
```

Example:
```bash
npm run simulate clxxxxxxxx123456
```

The simulator sends events every 5 seconds. You should see:
- Events appear in the console
- Real-time updates in the Digital Twin page
- Events stored in the database with SHA-256 hashes
- Anchor worker processing events (fake txids by default)

### 4. View Digital Twin

1. Click "Digital Twin" on a device card
2. Watch real-time metrics update as simulator sends events
3. See event history with alerts

### 5. Test Consent Management

1. Login as customer and grant consent to operator@example.com
2. Login as operator@example.com in another browser/incognito
3. Operator should see shared device events in real-time

### 6. AR Diagnostics

1. Click "AR Diagnostics" on a device
2. On supported devices (Android Chrome, iOS Safari), test WebXR/AR Quick Look
3. Download placeholder 3D models (replace with real models)

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user (default: CUSTOMER role)
- `POST /api/auth/login` - Login and get JWT token

### Devices
- `POST /api/devices/register` - Register new device (authenticated)
- `GET /api/devices` - List user's devices (authenticated)

### Events
- `POST /api/events/ingest` - Ingest IoT event (server endpoint)

### Consent
- `POST /api/consent` - Grant consent to operator
- `GET /api/consent?deviceId=xxx` - List consents
- `DELETE /api/consent?deviceId=xxx&operatorId=yyy` - Revoke consent

### Job Reports
- `POST /api/jobs` - Create job report (operators/admins only)
- `GET /api/jobs?deviceId=xxx` - List job reports

## 🔐 Authentication

All protected routes require a JWT token in the `Authorization` header:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/devices
```

## 🌐 Socket.IO Events

### Client -> Server
- `join-device` - Join a device room for real-time updates

### Server -> Client
- `device-event` - New device event received
- `error` - Error message

## 🚢 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables:
   ```
   NEXT_PUBLIC_SOCKET_URL=https://your-backend.onrender.com
   ```
4. Deploy

### Backend (Render)

1. Create new Web Service on Render
2. Connect GitHub repository
3. Configure:
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `npm run dev:server`
4. Set environment variables:
   ```
   DATABASE_URL=file:./prod.db
   JWT_SECRET=your-production-secret
   SERVER_PORT=3001
   BSV_PRIVATE_KEY=your-key (optional)
   BSV_BROADCAST_ENDPOINT=https://api.whatsonchain.com/v1/bsv/main/tx/raw (optional)
   ```
5. Deploy

### Worker Deployment

Deploy the anchor worker as a separate Background Worker on Render:
- Build Command: `npm install && npx prisma generate`
- Start Command: `npm run worker`

## 🔗 Enabling Real BSV Broadcasting

By default, the anchor worker runs in stub mode (generates fake transaction IDs).

To enable real BSV blockchain anchoring:

1. Obtain a BSV private key (WIF format)
2. Choose network endpoint:
   - Testnet: `https://api.whatsonchain.com/v1/bsv/test/tx/raw`
   - Mainnet: `https://api.whatsonchain.com/v1/bsv/main/tx/raw`
3. Update `.env`:
   ```
   BSV_PRIVATE_KEY=your_wif_private_key_here
   BSV_BROADCAST_ENDPOINT=https://api.whatsonchain.com/v1/bsv/main/tx/raw
   ```
4. Restart the worker

**⚠️ SECURITY WARNING**: Never commit private keys to Git!

## 📨 Email Notifications (Optional)

To enable email notifications for job reports:

1. Sign up for SendGrid
2. Get API key
3. Update `.env`:
   ```
   SENDGRID_API_KEY=your_key
   SENDGRID_FROM_EMAIL=notifications@yourdomain.com
   ```
4. Implement nodemailer in job report creation

## 📦 Testing with cURL/Postman

### Register Device
```bash
curl -X POST http://localhost:3000/api/devices/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Test Device","serialNumber":"TEST-001","type":"leak-sensor"}'
```

### Ingest Event
```bash
curl -X POST http://localhost:3001/api/events/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId":"your-device-id",
    "timestamp":"2024-01-10T12:00:00Z",
    "metrics":{"temperature":25,"pressure":4.2,"flow":5.5,"humidity":60},
    "alertType":"HIGH_PRESSURE"
  }'
```

## ✅ Acceptance Criteria Checklist

### Core Functionality
- [x] Project scaffold with Next.js TypeScript frontend
- [x] Express + Socket.IO backend in server/
- [x] Prisma schema with User, Device, DeviceEvent, Consent, JobReport
- [x] Role enum (CUSTOMER/OPERATOR/ADMIN)
- [x] AnchorStatus enum (PENDING/SENT/FAILED)
- [x] Email/password authentication with bcrypt + JWT
- [x] Default CUSTOMER role on signup
- [x] Admin seed user (admin@example.com / AdminPass123)
- [x] Device registration API (/api/devices/register)
- [x] IoT ingestion endpoint (POST /api/events/ingest)
- [x] SHA-256 hashing of events
- [x] Socket.IO event emission to device owners and consented operators
- [x] BSV anchor worker with stub mode (safe without credentials)
- [x] Consent grant/revoke endpoints
- [x] Server-side access control for consents
- [x] Digital twin page with Socket.IO integration
- [x] AR diagnostics page with WebXR instructions
- [x] AR.js marker-based fallback
- [x] Placeholder glTF and USDZ assets
- [x] Job report model and API
- [x] IoT simulator script (scripts/iot-simulate.ts)
- [x] Socket.IO rooms (userId and operatorId)
- [x] Authenticated room joining
- [x] README with setup instructions
- [x] .env.example with all variables
- [x] Deployment instructions (Vercel + Render)
- [x] No secrets committed

### Testing Flow
1. ✓ Sign up as customer
2. ✓ Register a device
3. ✓ Run IoT simulator
4. ✓ See events in database
5. ✓ See real-time updates on digital twin
6. ✓ Grant consent to operator
7. ✓ Operator receives shared events
8. ✓ Anchor worker updates anchorStatus and bsvTxId

## 📝 Development Notes

- SQLite is used for local development (easy setup, no server required)
- For production, migrate to PostgreSQL by updating `DATABASE_URL`
- BSV broadcasting is stubbed by default to prevent accidental mainnet transactions
- Replace placeholder 3D models in `/public/models/` with real device models
- Customize AR experience based on device type

## 🤝 Contributing

This is an MVP scaffold. Extend functionality as needed:
- Add real BSV library integration
- Implement PDF generation for job reports
- Add email notifications via nodemailer
- Enhance 3D visualization with Three.js
- Implement full WebXR AR experience
- Add more IoT device types

## 📄 License

MIT

---

**Project Name**: bsv-premium-plumbing-and-leak-detection
