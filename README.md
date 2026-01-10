# Premium Plumbing & Leak Detection - MVP

IoT-powered water leak detection platform with blockchain-verified data integrity, real-time monitoring, 3D digital twin visualization, and AR diagnostics.

## 🌟 Features

- **IoT Device Management**: Register and monitor leak detection devices
- **Real-time Event Ingestion**: POST events from IoT devices with automatic persistence
- **Blockchain Anchoring**: Immutable BSV testnet/mainnet hash storage (OP_RETURN transactions)
- **Consent-based Data Sharing**: Customers control which operators can access their data
- **Digital Twin 3D Visualization**: Three.js-powered real-time device state rendering
- **AR Diagnostics**: WebXR, AR.js marker-based, and iOS Quick Look AR experiences
- **Job Reports**: Operator-created reports with PDF generation and email delivery
- **Socket.IO Real-time Updates**: Live data streaming to dashboards and visualizations
- **Secure Authentication**: JWT-based auth with bcrypt password hashing and role-based access control

## 📋 Prerequisites

- Node.js 18+ and npm
- Git

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/jamiebsvwallet/Premium-plumbing-and-leak-detection-.git
cd Premium-plumbing-and-leak-detection-
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Secret (generate a random string for production)
JWT_SECRET="your-secret-key-change-in-production"

# BSV Configuration (optional - for blockchain anchoring)
BSV_PRIVATE_KEY=""
BSV_NETWORK="testnet"

# MoneyButton Configuration (optional)
MONEYBUTTON_CLIENT_ID=""
MONEYBUTTON_CLIENT_SECRET=""

# Email Configuration (for job report notifications)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="noreply@example.com"

# Socket.IO Server URL
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### 3. Database Setup

Initialize Prisma and create the database:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

This creates the SQLite database and seeds it with default accounts:
- **Admin/Operator**: `admin@example.com` / `AdminPass123`
- **Test Customer**: `customer@example.com` / `Customer123`

### 4. Start Development Servers

You need to run two servers:

**Terminal 1 - Next.js Frontend + API Routes:**
```bash
npm run dev
```

**Terminal 2 - Socket.IO Server (for real-time updates):**
```bash
npm run socket-server
```

The application will be available at:
- Frontend: http://localhost:3000
- Socket.IO Server: http://localhost:3001
- Prisma Studio (database viewer): `npm run prisma:studio`

## 🧪 Testing with IoT Simulator

Simulate IoT device events:

```bash
# Register a device first (via UI or API), then simulate events
npm run simulate -- --deviceId sensor-001 --interval 3000

# Simulate leak events
npm run simulate -- --deviceId sensor-001 --leak --interval 2000

# Send specific number of events
npm run simulate -- --deviceId sensor-001 --count 10
```

### Manual API Testing with curl

```bash
# Health check
curl http://localhost:3001/health

# Register device (requires auth token)
curl -X POST http://localhost:3000/api/devices/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"deviceId":"sensor-001","name":"Kitchen Detector","location":"Kitchen"}'

# Ingest event (no auth required - for IoT devices)
curl -X POST http://localhost:3000/api/events/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId":"sensor-001",
    "timestamp":"2024-01-10T12:00:00Z",
    "metrics":{"flowRate":1.5,"pressure":45,"temperature":18},
    "alertType":"none"
  }'

# Get device events (requires auth)
curl http://localhost:3000/api/events/sensor-001 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📁 Project Structure

```
.
├── pages/                    # Next.js pages and API routes
│   ├── api/                  # API endpoints
│   │   ├── auth/            # Authentication (signup, login, me)
│   │   ├── devices/         # Device management
│   │   ├── events/          # Event ingestion and retrieval
│   │   ├── consent/         # Consent management
│   │   ├── bsv/             # BSV blockchain operations
│   │   └── jobs/            # Job report management
│   ├── auth/                # Auth pages (login, signup)
│   ├── digital-twin/        # 3D visualization pages
│   ├── ar-diagnostics/      # AR experience pages
│   ├── events/              # Event viewer pages
│   ├── dashboard.tsx        # Main dashboard
│   ├── consent.tsx          # Consent management UI
│   └── index.tsx            # Landing page
├── lib/                     # Shared utilities
│   ├── auth/                # JWT and middleware
│   ├── bsv/                 # BSV transaction creation
│   └── db/                  # Prisma client
├── prisma/                  # Database schema and migrations
│   ├── schema.prisma        # Database models
│   └── seed.ts              # Database seeding
├── server/                  # Standalone servers
│   └── socket-server.ts     # Socket.IO server for Render
├── scripts/                 # Utility scripts
│   └── iot-simulate.ts      # IoT device simulator
├── components/              # React components
├── styles/                  # CSS styles
├── public/                  # Static assets
│   └── models/              # 3D models (glTF, USDZ)
└── package.json             # Dependencies and scripts
```

## 🔐 Authentication & Authorization

### User Roles
- **customer**: Can register devices, view own events, grant/revoke consent
- **operator**: Can view shared data, create job reports, trigger BSV anchoring

### API Authentication
Most API routes require a JWT token in the Authorization header:

```bash
Authorization: Bearer <token>
```

Get a token by logging in via `/api/auth/login`.

## 🔗 BSV Blockchain Integration

### Overview
Events are automatically hashed (SHA-256) and queued for BSV anchoring. Transaction records are stored with status tracking.

### Enabling BSV Broadcasting

1. Set `BSV_PRIVATE_KEY` in `.env` with a testnet WIF private key
2. Configure `BSV_NETWORK` (testnet or mainnet)
3. Trigger anchoring via API (operator only):

```bash
curl -X POST http://localhost:3000/api/bsv/anchor \
  -H "Authorization: Bearer OPERATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"limit":10}'
```

**Note**: Full broadcasting requires UTXO fetching and BSV node/API integration. The current implementation creates OP_RETURN transactions but doesn't broadcast without additional configuration.

### MoneyButton Integration (Frontend)

For frontend BSV signing, configure MoneyButton credentials:
```env
MONEYBUTTON_CLIENT_ID="your-client-id"
MONEYBUTTON_CLIENT_SECRET="your-client-secret"
```

## 🌐 Deployment

### Vercel (Frontend + API Routes)

1. Push code to GitHub
2. Import repository in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

**Environment Variables for Vercel:**
- `DATABASE_URL` (use PostgreSQL or MySQL for production)
- `JWT_SECRET`
- `NEXT_PUBLIC_SOCKET_URL` (your Render Socket.IO URL)
- `NEXT_PUBLIC_API_URL` (your Vercel URL)

### Render (Socket.IO Server)

1. Create a new Web Service in Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `npm install && npm run build:socket`
   - **Start Command**: `npm run socket-server:prod`
4. Set environment variables:
   - `PORT` (Render sets this automatically)
   - `CORS_ORIGIN` (your Vercel frontend URL)

### Database for Production

**Important**: SQLite is for local development only. For production, use:
- PostgreSQL (recommended for Vercel)
- MySQL
- MongoDB (requires Prisma schema changes)

Update `DATABASE_URL` and run migrations:
```bash
npx prisma migrate deploy
npx prisma generate
```

## 📊 Database Models

- **User**: Authentication and role management
- **Device**: IoT device registration and ownership
- **DeviceEvent**: Event data with metrics and hashes
- **Consent**: Customer-operator data sharing agreements
- **BSVTransaction**: Blockchain anchoring records
- **JobReport**: Operator-created service reports

## 🎨 Digital Twin & AR

### Digital Twin (Three.js)
- Real-time 3D visualization of device state
- Color-coded alert status
- Dynamic scaling based on pressure
- Socket.IO integration for live updates

### AR Diagnostics
- **WebXR**: Native AR on supported Android devices
- **AR.js**: Marker-based AR fallback
- **iOS Quick Look**: USDZ model support for iPhone/iPad

To use AR features:
1. Add real 3D models to `public/models/`
2. Replace `.placeholder` files with actual `.glb` and `.usdz` files

## 🧪 Development Tools

```bash
# Database
npm run prisma:studio      # Visual database editor
npm run prisma:migrate     # Create new migration
npm run prisma:generate    # Regenerate Prisma client

# Development
npm run dev                # Next.js dev server
npm run socket-server      # Socket.IO dev server
npm run simulate           # IoT simulator

# Production
npm run build              # Build Next.js
npm run start              # Start production server
npm run build:socket       # Build Socket.IO server
npm run socket-server:prod # Start Socket.IO production
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Devices
- `POST /api/devices/register` - Register device
- `GET /api/devices/list` - List user's devices

### Events
- `POST /api/events/ingest` - Ingest IoT event (no auth)
- `GET /api/events/[deviceId]` - Get device events (with consent check)

### Consent
- `GET /api/consent/operators` - List available operators
- `GET /api/consent/status` - Get consent status
- `POST /api/consent/grant` - Grant consent to operator
- `POST /api/consent/revoke` - Revoke consent

### BSV
- `POST /api/bsv/anchor` - Process pending anchors (operator only)
- `GET /api/bsv/transactions` - List BSV transactions

### Jobs
- `POST /api/jobs/create` - Create job report (operator only)
- `GET /api/jobs/list` - List job reports
- `GET /api/jobs/[id]` - Get specific job report

## 🔒 Security Notes

- Never commit `.env` or private keys
- Change default JWT_SECRET in production
- Use HTTPS in production
- Implement rate limiting for API routes
- Keep dependencies updated
- Use environment-specific BSV keys (testnet vs mainnet)

## 🐛 Troubleshooting

### Database Issues
```bash
# Reset database
rm prisma/dev.db
npm run prisma:migrate
npm run prisma:seed
```

### Socket.IO Connection Issues
- Check that socket server is running on port 3001
- Verify `NEXT_PUBLIC_SOCKET_URL` in `.env`
- Check browser console for CORS errors

### BSV Anchoring Issues
- Verify `BSV_PRIVATE_KEY` is valid WIF format
- Check network setting (testnet vs mainnet)
- Review server logs for transaction errors

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Three.js Documentation](https://threejs.org/docs)
- [Socket.IO Documentation](https://socket.io/docs)
- [BSV Documentation](https://docs.moneybutton.com/)
- [WebXR API](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📧 Support

For issues or questions, please open a GitHub issue.
