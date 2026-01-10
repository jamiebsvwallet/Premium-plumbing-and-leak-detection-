# Premium Plumbing & Leak Detection MVP

A full-stack IoT leak detection system with blockchain verification, real-time monitoring, digital twin visualization, and AR diagnostics.

## 🎯 Features

- **User Authentication**: JWT-based auth with customer and operator roles
- **Device Management**: Register and manage IoT leak detection devices
- **Real-time Data Ingestion**: API endpoints for IoT device events
- **Blockchain Anchoring**: SHA-256 hashing and BSV blockchain integration (stubbed)
- **Consent Management**: Privacy-first data sharing with customer consent
- **Digital Twin**: 3D visualization with Three.js and real-time updates via Socket.IO
- **AR Diagnostics**: WebXR support for augmented reality device overlays
- **Job Reports**: Create, view, and manage service reports
- **IoT Simulator**: Built-in device simulator for testing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` and set:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-in-production-min-32-chars"
```

3. **Initialize database:**
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

This creates the SQLite database and seeds it with:
- Admin account: `admin@example.com` / `AdminPass123`
- Test customer: `customer@example.com` / `Customer123`

4. **Start development servers:**

In terminal 1 (Next.js app):
```bash
npm run dev
```

In terminal 2 (Socket.IO server - optional for real-time features):
```bash
npm run socket-server
```

5. **Open the app:**
```
http://localhost:3000
```

## 📱 Using the Application

### For Customers

1. **Sign up** at `/auth/signup` or use test account
2. **Register a device** from the dashboard
3. **Start IoT simulator** to send test events:
   ```bash
   npm run iot-simulate
   ```
4. **View data** in:
   - Digital Twin: Real-time 3D visualization
   - AR Diagnostics: WebXR augmented reality view
5. **Manage consent** to share data with operators

### For Operators/Admins

1. **Login** with admin account or create operator account
2. **View customer devices** (with consent)
3. **Create job reports** for customers
4. **Process blockchain anchors** via admin API
5. **Monitor real-time events** across all consented devices

## 🔧 IoT Simulator

The built-in simulator helps test the system without physical devices:

```bash
npm run iot-simulate
```

**Commands:**
- `start [interval]` - Start sending events (default: 5 seconds)
- `stop` - Stop sending events
- `leak` - Toggle leak detection alert
- `send` - Send single event immediately
- `status` - Show current status
- `help` - Show help
- `exit` - Exit simulator

**Environment variables:**
```bash
DEVICE_ID=sim-device-001 API_URL=http://localhost:3000 npm run iot-simulate
```

## 🗂️ Project Structure

```
├── pages/
│   ├── api/                    # API routes
│   │   ├── auth/               # Authentication
│   │   ├── devices/            # Device management
│   │   ├── events/             # Event ingestion & queries
│   │   ├── consents/           # Consent management
│   │   ├── reports/            # Job reports
│   │   └── admin/              # Admin operations
│   ├── auth/                   # Auth UI pages
│   ├── dashboard/              # Dashboard pages
│   ├── digital-twin/           # Digital twin 3D view
│   └── ar-diagnostics/         # AR experience
├── lib/                        # Shared utilities
│   ├── auth.ts                 # JWT authentication
│   ├── prisma.ts               # Database client
│   ├── hash.ts                 # Hashing utilities
│   └── bsv.ts                  # BSV blockchain integration
├── server/
│   └── socket-server.ts        # Socket.IO realtime server
├── scripts/
│   └── iot-simulate.ts         # IoT device simulator
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed data
└── public/
    └── models/                 # 3D models (glTF, USDZ)
```

## 🔐 API Documentation

### Authentication

**POST /api/auth/signup**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name",
  "role": "customer"
}
```

**POST /api/auth/login**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**GET /api/auth/me**
Headers: `Authorization: Bearer <token>`

### Devices

**POST /api/devices/register**
```json
{
  "deviceId": "LEAK-001",
  "name": "Kitchen Sensor",
  "type": "leak-detector"
}
```

**GET /api/devices/register**
Returns all devices for authenticated user.

### Events

**POST /api/events/ingest**
```json
{
  "deviceId": "LEAK-001",
  "timestamp": "2024-01-10T12:00:00Z",
  "metrics": {
    "flow": 5.2,
    "pressure": 45.3,
    "temperature": 22.1,
    "humidity": 55.0
  },
  "alertType": null
}
```

**GET /api/events/query?deviceId=LEAK-001&limit=100**
Returns events for a device (with access control).

### Consents

**GET /api/consents/manage**
Get all consents for user.

**POST /api/consents/manage**
```json
{
  "operatorId": "operator-user-id",
  "granted": true
}
```

**DELETE /api/consents/manage**
Revoke consent.

### Blockchain Anchors (Admin)

**POST /api/admin/anchors**
Process pending blockchain anchors (operator only).

**GET /api/admin/anchors**
List all anchors.

## ⛓️ Blockchain Integration

The system uses BSV (Bitcoin SV) for immutable data anchoring:

1. **Event Ingestion**: Each device event is hashed (SHA-256)
2. **Anchor Queue**: Hash is queued for blockchain anchoring
3. **OP_RETURN Transaction**: Admin can process pending anchors
4. **Verification**: Transaction ID stored in database

### Enabling BSV Broadcasting

The MVP includes **stubbed** BSV integration. To enable actual broadcasting:

1. Set environment variables:
```env
BSV_PRIVATE_KEY="your-wif-private-key"
BSV_NETWORK="testnet"
```

2. Update `lib/bsv.ts` to uncomment the real implementation
3. Ensure you have testnet coins in your wallet
4. Run: `POST /api/admin/anchors` to process pending anchors

**Security Note**: Never commit private keys to git. Use environment variables only.

## 🚀 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import repository in Vercel
3. Set environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_SOCKET_URL` (your Render backend URL)
4. Deploy

### Backend Socket Server (Render)

1. Create new Web Service in Render
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm run socket-server`
5. Set environment variables:
   - `PORT=3001`
   - `FRONTEND_URL` (your Vercel URL)
   - `JWT_SECRET` (same as frontend)
6. Deploy

### Database

For production, replace SQLite with PostgreSQL:

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Set `DATABASE_URL` to PostgreSQL connection string
3. Run migrations: `npm run prisma:migrate`

## 🧪 Testing with curl

**Register device:**
```bash
curl -X POST http://localhost:3000/api/devices/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"TEST-001","name":"Test Device"}'
```

**Send event:**
```bash
curl -X POST http://localhost:3000/api/events/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId":"TEST-001",
    "timestamp":"2024-01-10T12:00:00Z",
    "metrics":{"flow":5.2,"pressure":45.3,"temperature":22.1,"humidity":55.0}
  }'
```

## 🔒 Security Considerations

- All passwords are hashed with bcrypt
- JWT tokens for stateless authentication
- API routes check authentication/authorization
- Consent-based access control for data sharing
- Environment variables for secrets (never committed)
- Blockchain hashing provides tamper-evident audit trail

## 📝 Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | Database connection string | Yes | `file:./dev.db` |
| `JWT_SECRET` | Secret for JWT signing | Yes | - |
| `BSV_PRIVATE_KEY` | BSV private key (WIF) | No | - |
| `BSV_NETWORK` | BSV network (testnet/mainnet) | No | `testnet` |
| `SOCKET_SERVER_URL` | Socket.IO server URL | No | `http://localhost:3001` |
| `FRONTEND_URL` | Frontend URL for CORS | No | `http://localhost:3000` |
| `PORT` | Socket server port | No | `3001` |

## 🐛 Troubleshooting

**Database errors:**
```bash
rm -rf prisma/migrations dev.db
npm run prisma:migrate
npm run prisma:seed
```

**Socket.IO not connecting:**
- Ensure socket server is running on port 3001
- Check `NEXT_PUBLIC_SOCKET_URL` environment variable
- Verify CORS settings in `server/socket-server.ts`

**Build errors:**
```bash
rm -rf .next node_modules
npm install
npm run build
```

## 📄 License

MIT

## 🤝 Contributing

This is an MVP scaffold. Contributions welcome!

## 📞 Support

For issues, please check the troubleshooting section or create an issue on GitHub.
