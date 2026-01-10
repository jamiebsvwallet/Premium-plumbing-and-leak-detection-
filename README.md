# BSV Premium Plumbing and Leak Detection

IoT-powered leak detection platform with real-time monitoring, WebXR AR diagnostics, and BSV blockchain anchoring.

## Features

- **Real-time IoT Monitoring**: Ingest device events via webhook with Socket.IO real-time updates
- **Digital Twin Visualization**: View live device data and events with 3D placeholder
- **WebXR AR Diagnostics**: Augmented reality diagnostics with WebXR and AR.js fallback
- **BSV Blockchain Anchoring**: Automatic anchoring of device events to BSV blockchain
- **Consent Management**: Secure data sharing between device owners and operators
- **Job Reports**: Create and manage job reports with PDF export (stub)
- **JWT Authentication**: Secure email/password authentication

## Tech Stack

- **Frontend**: Next.js 14 (TypeScript, React 18)
- **Backend**: Express + Socket.IO (TypeScript)
- **Database**: SQLite with Prisma ORM
- **Blockchain**: BSV (stub mode by default, configurable for production)
- **Real-time**: Socket.IO for live event streaming
- **3D/AR**: Three.js, React Three Fiber, WebXR API, AR.js

## Project Structure

```
├── pages/                    # Next.js pages and API routes
│   ├── api/
│   │   ├── auth/            # Signup, login
│   │   ├── devices/         # Device registration, list
│   │   └── consent/         # Consent management
│   ├── auth/                # Auth pages (signup, login)
│   ├── digital-twin/        # Digital twin visualization
│   ├── ar-diagnostics/      # WebXR AR diagnostics
│   ├── dashboard.tsx        # User dashboard
│   ├── devices.tsx          # Device management
│   ├── job-reports.tsx      # Job reports
│   └── index.tsx            # Landing page
├── server/                   # Backend Express server
│   ├── middleware/          # JWT auth middleware
│   ├── routes/              # Express routes (events)
│   ├── utils/               # BSV utilities
│   └── workers/             # Anchor worker
├── prisma/                   # Database schema and seed
│   ├── schema.prisma        # Data models
│   └── seed.ts              # Seed script
├── scripts/                  # Utility scripts
│   └── iot-simulate.ts      # IoT simulator
├── package.json
├── tsconfig.json
└── .env.example
```

## Prerequisites

- Node.js 18+ and npm
- SQLite (included with Node.js)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd Premium-plumbing-and-leak-detection-
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
SERVER_PORT=4000
NEXT_PUBLIC_SOCKET_URL="http://localhost:4000"

# Optional: BSV Configuration (leave empty for stub mode)
BSV_PRIVATE_KEY=""
BSV_BROADCAST_ENDPOINT=""

# Optional: Email and Payment
SENDGRID_API_KEY=""
SENDGRID_FROM_EMAIL=""
MONEYBUTTON_CLIENT_ID=""
MONEYBUTTON_CLIENT_SECRET=""
```

### 3. Initialize Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with admin user
npm run prisma:seed
```

Default seeded users:
- **Admin**: `admin@example.com` / `AdminPass123`
- **Operator**: `operator@example.com` / `OperatorPass123`

### 4. Start Development Servers

Open **3 terminal windows**:

**Terminal 1: Next.js Frontend**
```bash
npm run dev
```
Frontend runs on http://localhost:3000

**Terminal 2: Express Backend + Socket.IO**
```bash
npm run server:dev
```
Backend runs on http://localhost:4000

**Terminal 3: BSV Anchor Worker**
```bash
npm run worker
```
Worker polls for PENDING events every 30 seconds

## Usage Guide

### 1. Sign Up and Login

1. Navigate to http://localhost:3000
2. Click "Sign Up" and create a customer account
3. Login with your credentials

### 2. Register a Device

1. Go to Dashboard → "My Devices"
2. Click "Register New Device"
3. Enter device name and type
4. Copy the device ID for simulation

### 3. Simulate IoT Events

```bash
npm run simulate <device-id> [interval_ms]

# Example:
npm run simulate abc-123-def 5000
```

This will send simulated sensor readings every 5 seconds.

### 4. View Real-time Updates

1. Go to "My Devices"
2. Click "Digital Twin" for your device
3. Watch events appear in real-time via Socket.IO
4. The page will show:
   - Connection status
   - 3D visualization placeholder
   - Real-time event stream with data and SHA-256 hashes

### 5. Grant Consent to Operators

To share device data with an operator:

```bash
# Using curl or Postman
curl -X POST http://localhost:3000/api/consent/<device-id> \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"operatorId": "<operator-user-id>", "granted": true}'
```

When consent is granted:
- Operators receive real-time events in their Socket.IO room
- Operators can view device data and create job reports

### 6. Check BSV Anchoring

1. After the anchor worker runs (every 30 seconds), check DeviceEvent records:

```bash
npm run prisma:studio
```

2. Open DeviceEvent table and verify:
   - `anchorStatus` changed from `PENDING` to `SENT`
   - `bsvTxId` populated with transaction ID

**Note**: By default, BSV is in stub mode and returns fake transaction IDs. To enable real BSV broadcasting, set `BSV_PRIVATE_KEY` and `BSV_BROADCAST_ENDPOINT` in `.env`.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user

### Devices
- `GET /api/devices` - List user's devices
- `GET /api/devices?deviceId=<id>` - Get specific device
- `POST /api/devices/register` - Register new device

### Consent
- `GET /api/consent/:deviceId` - List consents for device
- `POST /api/consent/:deviceId` - Grant/revoke consent

### IoT Ingestion
- `POST /api/events/ingest` - Ingest device event (server)

## Deployment

### Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - NEXT_PUBLIC_SOCKET_URL (production backend URL)
```

### Backend (Render)

1. Create a new Web Service on Render
2. Connect your repository
3. Configure:
   - **Build Command**: `npm install && npm run prisma:generate`
   - **Start Command**: `npm run server`
4. Add environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `SERVER_PORT`
   - `NODE_ENV=production`
5. Deploy

### Worker (Render Background Worker)

1. Create a new Background Worker on Render
2. Configure:
   - **Build Command**: `npm install && npm run prisma:generate`
   - **Start Command**: `npm run worker`
3. Use same environment variables as backend

## Acceptance Checklist

- [ ] Clone repository and install dependencies
- [ ] Configure `.env` file
- [ ] Run database migrations and seed
- [ ] Start frontend (Next.js), backend (Express), and worker
- [ ] Sign up as customer on http://localhost:3000
- [ ] Register a device and copy device ID
- [ ] Run IoT simulator with device ID
- [ ] View DeviceEvent records in Prisma Studio
- [ ] Open digital twin page and verify real-time updates
- [ ] Grant consent to operator user (admin@example.com or operator@example.com)
- [ ] Verify operator receives shared events
- [ ] Wait 30+ seconds and verify `anchorStatus` updated to SENT
- [ ] Verify `bsvTxId` populated (fake txid in stub mode)
- [ ] Test AR diagnostics page (WebXR instructions shown)

## TODOs and Future Enhancements

### BSV Broadcasting
- Implement real BSV transaction creation in `server/utils/bsv.ts`
- Integrate BSV SDK (e.g., `bsv` npm package)
- Sign transactions with `BSV_PRIVATE_KEY`
- Broadcast to `BSV_BROADCAST_ENDPOINT`
- Update anchor confirmation logic

### 3D/AR
- Integrate Three.js scenes in digital twin
- Add device-specific 3D models (glTF/USDZ)
- Implement WebXR session initialization
- Set up AR.js marker tracking
- Create AR overlay components

### Job Reports
- Implement PDF generation (pdfkit or puppeteer)
- Store PDFs in cloud storage (S3, etc.)
- Add email notifications via SendGrid/nodemailer
- Create job report API endpoints
- Build operator report management UI

### Testing
- Add unit tests (Jest)
- Add integration tests
- E2E tests (Playwright)

### Security
- Rate limiting
- Input validation/sanitization
- HTTPS enforcement
- Secure headers (helmet)

## Troubleshooting

### Port conflicts
If ports 3000 or 4000 are in use, update `package.json` and `.env`:
- Next.js: `PORT=3001 npm run dev`
- Server: Update `SERVER_PORT` in `.env`

### Database issues
```bash
# Reset database
rm prisma/dev.db prisma/dev.db-journal
npm run prisma:migrate
npm run prisma:seed
```

### Socket.IO connection issues
- Verify `NEXT_PUBLIC_SOCKET_URL` matches backend URL
- Check CORS configuration in `server/index.ts`
- Ensure backend is running before frontend

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
