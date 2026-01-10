# BSV Premium Plumbing & Leak Detection

A comprehensive IoT monitoring platform for plumbing and leak detection with BSV blockchain anchoring, WebXR/AR diagnostics, and real-time data visualization.

## Features

- 🔐 **Authentication**: Email/password auth with JWT sessions
- 📱 **Device Management**: Register and monitor IoT devices
- 🔗 **BSV Blockchain Anchoring**: Immutable event records with SHA-256 hashing
- 🌐 **Real-time Updates**: Socket.IO for live device monitoring
- 🎯 **Digital Twin**: Real-time 3D visualization of device metrics
- 🥽 **AR Diagnostics**: WebXR and marker-based AR for on-site diagnostics
- 📋 **Job Reports**: Create and track maintenance reports
- 🤝 **Consent Management**: Customer-controlled data sharing with operators
- 📧 **Notifications**: Email alerts (configurable)
- 📄 **PDF Reports**: Generate professional service reports

## Tech Stack

### Frontend
- **Next.js 14** with TypeScript
- **React 18** for UI components
- **Socket.IO Client** for real-time updates
- **Three.js** for 3D visualization
- **WebXR API** for AR experiences

### Backend
- **Express** server with TypeScript
- **Socket.IO** for real-time communication
- **Prisma ORM** with SQLite (dev) / PostgreSQL (prod)
- **bcrypt** for password hashing
- **JWT** for authentication

### Blockchain
- **BSV** blockchain for data anchoring
- SHA-256 hashing for event integrity
- Configurable broadcasting endpoint

## Project Structure

```
├── pages/                    # Next.js pages
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── devices/         # Device management
│   │   ├── consent/         # Consent management
│   │   └── reports/         # Job reports
│   ├── digital-twin/        # Real-time device visualization
│   ├── ar-diagnostics/      # WebXR AR experiences
│   ├── dashboard.tsx        # User dashboard
│   ├── devices.tsx          # Device list
│   ├── reports.tsx          # Job reports
│   └── consent.tsx          # Consent management
├── server/                   # Express backend
│   ├── index.ts             # Main server with Socket.IO
│   └── workers/
│       └── anchors.ts       # BSV anchoring worker
├── lib/                      # Shared utilities
│   ├── auth.ts              # JWT utilities
│   ├── prisma.ts            # Prisma client
│   ├── pdf.ts               # PDF generation (stub)
│   └── email.ts             # Email notifications (stub)
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seed data
└── scripts/
    └── iot-simulate.ts      # IoT device simulator
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jamiebsvwallet/Premium-plumbing-and-leak-detection-.git
   cd Premium-plumbing-and-leak-detection-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-secret-key-change-in-production"
   SERVER_PORT=3001
   NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
   ```

4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run seed
   ```

5. **Start the development servers**

   Terminal 1 - Frontend:
   ```bash
   npm run dev
   ```

   Terminal 2 - Backend:
   ```bash
   npm run server:dev
   ```

   Terminal 3 - Anchor Worker (optional):
   ```bash
   npm run worker
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

### Demo Accounts

After seeding, these accounts are available:

- **Admin**: admin@example.com / AdminPass123
- **Operator**: operator@example.com / OperatorPass123
- **Customer**: customer@example.com / CustomerPass123

## Usage Guide

### 1. Register and Login

1. Navigate to http://localhost:3000
2. Click "Sign Up" or use one of the demo accounts
3. Log in with your credentials

### 2. Register a Device

1. Go to Dashboard → Devices
2. Click "+ Register Device"
3. Enter device name, type, and location
4. Copy the device ID for testing

### 3. Simulate IoT Events

Run the IoT simulator with your device ID:

```bash
npm run simulate -- <deviceId>
```

Options:
```bash
# Send events every 5 seconds
npm run simulate -- <deviceId> --interval 5000

# Send 10 events then stop
npm run simulate -- <deviceId> --count 10
```

### 4. View Real-time Updates

1. Open the Digital Twin page for your device
2. Watch events appear in real-time via Socket.IO
3. Observe metrics visualization (placeholder - implement Three.js)

### 5. Check BSV Anchoring

1. Events are persisted with SHA-256 hash
2. Anchor worker processes pending events every 30 seconds
3. Check `anchorStatus` field: PENDING → SENT
4. By default, fake transaction IDs are used (see BSV Configuration)

### 6. Grant Consent to Operator

1. Log in as a customer
2. Go to Consent Management
3. Enter operator's user ID
4. Optionally select a specific device
5. Operator will now receive real-time events via Socket.IO

### 7. Create Job Reports (Operators)

1. Log in as an operator
2. Go to Job Reports
3. Click "+ Create Report"
4. Fill in details and submit
5. Customer receives notification (if email configured)

## BSV Blockchain Configuration

### Development Mode (Default)

By default, the anchor worker uses **stub mode** and generates fake transaction IDs:

```env
# No BSV configuration = stub mode
```

### Production Mode (Real Broadcasting)

To enable real BSV blockchain anchoring:

1. **Install BSV library**
   ```bash
   npm install bsv
   ```

2. **Configure environment variables**
   ```env
   BSV_PRIVATE_KEY="your-private-key-in-wif-format"
   BSV_BROADCAST_ENDPOINT="https://api.whatsonchain.com/v1/bsv/main/tx/raw"
   ```

3. **Implement transaction broadcasting**
   
   Edit `server/workers/anchors.ts` and implement the `sendBsvOpReturn` function:
   
   ```typescript
   import bsv from 'bsv'
   
   async function sendBsvOpReturn(data: string): Promise<string> {
     const privateKey = bsv.PrivateKey.fromWIF(BSV_PRIVATE_KEY)
     const address = privateKey.toAddress()
     
     // Fetch UTXOs, create transaction, sign, and broadcast
     // See code comments in anchors.ts for full implementation
     
     return txId
   }
   ```

4. **Restart the worker**
   ```bash
   npm run worker
   ```

### BSV Transaction Format

Events are anchored as OP_RETURN transactions:
- Data: SHA-256 hash of event (deviceId, timestamp, metrics, etc.)
- Cost: ~$0.001 per transaction
- Verification: Immutable proof on BSV blockchain

## WebXR and AR Diagnostics

### WebXR Support

WebXR provides immersive AR experiences on compatible devices:

**Requirements:**
- HTTPS (or localhost for development)
- Android device with ARCore support + Chrome
- iOS 15+ with WebXR Viewer or Safari 17.4+

**Implementation:**
1. Navigate to AR Diagnostics page for a device
2. Click "Start AR Session"
3. Grant camera permissions
4. Place 3D device model in your environment

### AR.js Fallback

For broader device compatibility, use marker-based AR with AR.js:

1. Print a Hiro marker or custom marker
2. Point camera at marker
3. 3D model appears on marker

### 3D Models

Place your 3D models in `public/models/`:

- **glTF/GLB**: For WebXR and AR.js (`device.glb`)
- **USDZ**: For iOS Quick Look AR (`device.usdz`)

**Example:**
```html
<a rel="ar" href="/models/device.usdz">
  View in AR (iOS)
</a>
```

### Implementation Status

- ✅ WebXR detection and session management
- ✅ Documentation and instructions
- 🔲 Three.js WebXR rendering loop (TODO)
- 🔲 AR.js marker-based mode (TODO)
- 🔲 3D device models (placeholder)

See `pages/ar-diagnostics/[deviceId].tsx` for implementation details.

## Email Notifications

Email notifications are stubbed. To enable:

### Option 1: SMTP (nodemailer)

1. **Install dependencies**
   ```bash
   npm install nodemailer @types/nodemailer
   ```

2. **Configure .env**
   ```env
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT=587
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASSWORD="your-app-password"
   EMAIL_FROM="noreply@example.com"
   ```

3. **Implement email function**
   
   Edit `lib/email.ts` and uncomment the nodemailer implementation.

### Option 2: SendGrid

1. **Install dependencies**
   ```bash
   npm install @sendgrid/mail
   ```

2. **Configure .env**
   ```env
   SENDGRID_API_KEY="your-sendgrid-api-key"
   SENDGRID_FROM_EMAIL="noreply@example.com"
   ```

3. **Implement email function**
   
   Edit `lib/email.ts` and use the SendGrid example.

## PDF Generation

PDF generation is stubbed. To enable:

1. **Install puppeteer**
   ```bash
   npm install puppeteer
   ```

2. **Implement PDF function**
   
   Edit `lib/pdf.ts` and uncomment the puppeteer implementation.

3. **Usage**
   
   PDFs are automatically generated when operators create job reports.
   Files are saved to `/reports/` directory.

## Deployment

### Frontend (Vercel)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Import your GitHub repository on Vercel
   - Framework preset: Next.js
   - Build command: `npm run build`
   - Output directory: `.next`

3. **Configure environment variables**
   ```
   NEXT_PUBLIC_SOCKET_URL=https://your-backend.onrender.com
   DATABASE_URL=your-production-database-url
   JWT_SECRET=your-production-secret
   ```

### Backend (Render)

1. **Create a Web Service on Render**
   - Connect your GitHub repository
   - Build command: `npm install && npx prisma generate`
   - Start command: `npm run server`

2. **Configure environment variables**
   ```
   NODE_ENV=production
   SERVER_PORT=3001
   DATABASE_URL=postgresql://user:password@host/db
   JWT_SECRET=your-production-secret
   BSV_PRIVATE_KEY=your-bsv-key (optional)
   BSV_BROADCAST_ENDPOINT=https://api.whatsonchain.com/v1/bsv/main/tx/raw
   ```

3. **Set up PostgreSQL**
   - Create a PostgreSQL database on Render
   - Update DATABASE_URL
   - Run migrations:
     ```bash
     npx prisma migrate deploy
     npm run seed
     ```

### Anchor Worker (Render Background Worker)

1. **Create a Background Worker on Render**
   - Same repository
   - Start command: `npm run worker`
   - Use same environment variables as the web service

## Testing Checklist

### Local Development Testing

- [ ] Sign up as a new customer
- [ ] Register a device
- [ ] Run IoT simulator
- [ ] View real-time events in Digital Twin page
- [ ] Verify events persist in database
- [ ] Check `anchorStatus` updates from PENDING to SENT
- [ ] Verify fake `bsvTxId` is assigned (default mode)
- [ ] Log in as operator
- [ ] Grant consent from customer to operator
- [ ] Verify operator receives shared events via Socket.IO
- [ ] Create job report as operator
- [ ] View job reports as customer

### Production Testing (if BSV enabled)

- [ ] Configure real BSV credentials
- [ ] Deploy anchor worker
- [ ] Verify real transaction IDs on BSV blockchain
- [ ] Check transaction on BSV explorer (whatsonchain.com)

## API Documentation

### Authentication

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Devices

- `GET /api/devices` - List user's devices
- `POST /api/devices/register` - Register new device

### Consent

- `GET /api/consent` - List active consents
- `POST /api/consent` - Grant consent to operator
- `DELETE /api/consent` - Revoke consent

### Reports

- `GET /api/reports` - List job reports
- `POST /api/reports` - Create job report (operators only)

### Events (Backend)

- `POST /api/events/ingest` - Ingest IoT event (webhook)

## Database Schema

### User
- Roles: CUSTOMER, OPERATOR, ADMIN
- Authentication with bcrypt hashed passwords

### Device
- Owned by User
- Has many DeviceEvents

### DeviceEvent
- Linked to Device
- SHA-256 hash for integrity
- AnchorStatus: PENDING, SENT, FAILED
- BSV transaction ID

### Consent
- Owner (Customer) grants access to Operator
- Optional device-specific or all devices
- Can be revoked

### JobReport
- Created by Operator for User's Device
- Optional PDF and BSV transaction ID

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Database connection string |
| `JWT_SECRET` | Yes | Secret for JWT token signing |
| `SERVER_PORT` | No | Backend server port (default: 3001) |
| `NEXT_PUBLIC_SOCKET_URL` | Yes | Socket.IO server URL |
| `BSV_PRIVATE_KEY` | No | BSV private key (WIF) for anchoring |
| `BSV_BROADCAST_ENDPOINT` | No | BSV broadcast endpoint |
| `EMAIL_HOST` | No | SMTP host |
| `EMAIL_PORT` | No | SMTP port |
| `EMAIL_USER` | No | SMTP username |
| `EMAIL_PASSWORD` | No | SMTP password |
| `EMAIL_FROM` | No | Email sender address |
| `SENDGRID_API_KEY` | No | SendGrid API key (alternative to SMTP) |
| `SENDGRID_FROM_EMAIL` | No | SendGrid sender email |
| `MONEYBUTTON_CLIENT_ID` | No | MoneyButton client ID (future use) |
| `MONEYBUTTON_CLIENT_SECRET` | No | MoneyButton secret (future use) |

## Troubleshooting

### Socket.IO Connection Issues

- Check `NEXT_PUBLIC_SOCKET_URL` matches backend URL
- Verify backend server is running
- Check CORS configuration in `server/index.ts`
- Ensure auth cookie is being sent

### Database Issues

- Run `npx prisma generate` after schema changes
- Run `npx prisma migrate dev` to apply migrations
- Check `DATABASE_URL` is correct

### BSV Anchoring Not Working

- Verify anchor worker is running
- Check worker logs for errors
- Ensure events exist with `PENDING` status
- Verify BSV credentials if broadcasting enabled

## Contributing

This is a scaffold MVP. To extend:

1. Implement Three.js visualization in digital twin
2. Complete WebXR rendering loop
3. Add AR.js marker-based mode
4. Implement PDF generation with puppeteer
5. Set up email notifications
6. Add real BSV transaction broadcasting
7. Enhance UI/UX
8. Add tests

## License

MIT

## Support

For issues and questions:
- Open an issue on GitHub
- Check implementation notes in code comments
- Review this README carefully
