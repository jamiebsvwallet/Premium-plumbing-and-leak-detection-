# Premium Plumbing & Leak Detection MVP

A full-stack IoT leak detection platform with blockchain anchoring and AR diagnostics.

## Features

- 🔐 **Secure Authentication**: JWT-based authentication with role-based access control (customer/operator)
- 📡 **IoT Device Management**: Register and monitor leak detection devices in real-time
- 🔗 **BSV Blockchain Anchoring**: Immutable data integrity using Bitcoin SV blockchain
- 🤝 **Consent Management**: Control data sharing between customers and operators/water companies
- 🎮 **Digital Twin**: 3D visualization of device state with real-time Socket.IO updates
- 🥽 **AR Diagnostics**: Augmented reality overlay for on-site diagnostics (WebXR, AR.js, USDZ)
- 📊 **Job Reports**: Create and manage maintenance job reports with PDF generation
- 🔄 **Realtime Updates**: Live device event streaming via Socket.IO

## Tech Stack

### Frontend
- **Next.js 14** with TypeScript
- **Three.js** for 3D visualization and WebXR AR
- **Socket.IO Client** for realtime updates
- Deployed on **Vercel**

### Backend
- **Next.js API Routes** for REST endpoints
- **Express + Socket.IO** server for realtime communication
- **Prisma ORM** with SQLite (easy local dev, Postgres for production)
- **BSV library** for blockchain anchoring
- Deployed on **Render** (always-on service)

### Blockchain
- **Bitcoin SV (BSV)** for immutable data anchoring via OP_RETURN transactions
- Configurable testnet/mainnet support

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/jamiebsvwallet/Premium-plumbing-and-leak-detection-.git
cd Premium-plumbing-and-leak-detection-
git checkout scaffold/webxr-mvp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file and update values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Secret (generate a secure random string for production)
JWT_SECRET="your-jwt-secret-change-this-in-production"

# BSV Configuration (optional - for blockchain anchoring)
BSV_PRIVATE_KEY=""
BSV_NETWORK="testnet"

# MoneyButton Integration (optional)
MONEYBUTTON_CLIENT_ID=""
MONEYBUTTON_CLIENT_SECRET=""

# Email Configuration (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="noreply@example.com"

# Socket.IO Server URL
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"

# Port for Socket.IO server
PORT="3001"
```

### 4. Initialize the database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the database with admin account
npm run prisma:seed
```

### 5. Start the development servers

Open **two terminals**:

**Terminal 1 - Next.js frontend:**
```bash
npm run dev
```

**Terminal 2 - Socket.IO server:**
```bash
npm run socket-server
```

### 6. Access the application

- **Frontend**: http://localhost:3000
- **Socket.IO Server**: http://localhost:3001

### 7. Login with demo accounts

**Customer Account:**
- Email: `customer@example.com`
- Password: `DemoPass123`

**Admin/Operator Account:**
- Email: `admin@example.com`
- Password: `AdminPass123`

## Testing the MVP

### 1. Register a Device

1. Sign up or login as a customer
2. Go to Dashboard → Devices
3. Click "Register New Device"
4. Enter device details:
   - Device ID: `DEVICE-001`
   - Name: `Test Sensor`
   - Type: `leak_sensor`

### 2. Simulate IoT Events

Open a **third terminal** and run the IoT simulator:

```bash
npm run simulate DEVICE-001
```

Commands in the simulator:
- `n` - Send normal event
- `l` - Send leak event
- `a` - Auto-send normal events every 5 seconds
- `s` - Stop auto-send
- `q` - Quit

### 3. View Digital Twin

1. Navigate to Dashboard → Devices
2. Click "Digital Twin" on your device
3. Watch the 3D visualization update in real-time as events are ingested

### 4. Test AR Diagnostics

1. Click "AR View" on your device
2. For iOS: Use the USDZ Quick Look link
3. For Android with ARCore: Use WebXR in Chrome
4. Desktop: View the 3D preview

### 5. Manage Consent

1. As a customer, go to Dashboard → Consents
2. Grant consent to share data with operator: `admin@example.com`
3. Login as admin to verify shared access

### 6. Process BSV Anchors

1. Login as operator (`admin@example.com`)
2. Send some events using the IoT simulator
3. Call the admin API to process pending anchors:

```bash
curl -X POST http://localhost:3000/api/admin/process-anchors \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Note**: BSV anchoring runs in stub mode by default. See "Enabling BSV Broadcasting" below.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login and receive JWT token
- `GET /api/auth/me` - Get current user info

### Devices
- `GET /api/devices/register` - List user's devices
- `POST /api/devices/register` - Register new device

### Events
- `POST /api/events/ingest` - Ingest IoT device event
- `GET /api/events/list?deviceId=XXX` - List events for device

### Consents
- `GET /api/consents/manage` - List user's consents
- `POST /api/consents/manage` - Grant/update consent
- `DELETE /api/consents/manage` - Revoke consent

### Job Reports
- `GET /api/job-reports/manage` - List job reports
- `POST /api/job-reports/manage` - Create job report (operator only)

### Admin
- `POST /api/admin/process-anchors` - Process pending BSV anchors (operator only)

## Enabling BSV Broadcasting

By default, BSV anchoring runs in **stub mode** and creates mock transactions. To enable real broadcasting:

1. **Obtain a BSV private key** (WIF format) with funds
2. **Set environment variable**:
   ```env
   BSV_PRIVATE_KEY=your-wif-private-key-here
   BSV_NETWORK=testnet  # or mainnet
   ```
3. **Implement UTXO fetching** in `lib/bsv.ts`:
   - Connect to a BSV node or API service (e.g., WhatsOnChain)
   - Fetch UTXOs for your address
   - Build and sign transactions
   - Broadcast to the network

**Important**: Keep your private key secure. Never commit it to git. Use environment variables or a key management service.

## Database Schema

### Models

- **User**: Customer and operator accounts
- **Device**: IoT leak detection devices
- **DeviceEvent**: Time-series event data from devices
- **Consent**: Customer consent for data sharing
- **JobReport**: Maintenance job reports
- **BsvAnchor**: Blockchain anchor records

## Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Set environment variables:
   - `DATABASE_URL` (use Postgres for production)
   - `JWT_SECRET`
   - `NEXT_PUBLIC_SOCKET_URL` (your Render backend URL)
   - Other optional vars
4. Deploy

### Backend (Render)

1. Create new Web Service in Render dashboard
2. Connect GitHub repository
3. Configure:
   - **Build Command**: `npm install && npm run prisma:generate`
   - **Start Command**: `node server/socket-server.ts` (or use ts-node)
   - **Environment**: Node
4. Set environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `PORT=3001`
   - Other optional vars
5. Deploy

**Note**: For production, migrate from SQLite to PostgreSQL:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

## Project Structure

```
.
├── pages/                  # Next.js pages and API routes
│   ├── api/               # REST API endpoints
│   │   ├── auth/         # Authentication
│   │   ├── devices/      # Device management
│   │   ├── events/       # Event ingestion
│   │   ├── consents/     # Consent management
│   │   ├── job-reports/  # Job reports
│   │   └── admin/        # Admin operations
│   ├── auth/             # Auth pages (login, signup)
│   ├── dashboard/        # Dashboard pages
│   ├── digital-twin/     # Digital twin 3D view
│   ├── ar-diagnostics/   # AR diagnostics
│   └── index.tsx         # Home page
├── lib/                   # Shared libraries
│   ├── auth.ts           # JWT authentication
│   ├── bsv.ts            # BSV blockchain integration
│   └── prisma.ts         # Prisma client
├── server/               # Socket.IO server
│   ├── socket-server.ts  # Realtime server
│   └── socket-client.ts  # Socket client helper
├── prisma/               # Database
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
├── scripts/              # Utility scripts
│   └── iot-simulate.ts   # IoT device simulator
├── styles/               # Global styles
├── public/               # Static assets
│   └── models/           # 3D models (glTF, USDZ)
└── .env.example          # Environment variables template
```

## Development Scripts

```bash
# Development
npm run dev              # Start Next.js dev server
npm run socket-server    # Start Socket.IO server

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio GUI
npm run prisma:seed      # Seed database

# Testing
npm run simulate         # Run IoT simulator

# Production
npm run build            # Build for production
npm run start            # Start production server
```

## Security Considerations

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens with 7-day expiration
- ✅ Role-based access control (customer/operator)
- ✅ Consent-based data sharing
- ✅ Input validation with Zod (extensible)
- ⚠️ Change default `JWT_SECRET` in production
- ⚠️ Never commit private keys or secrets
- ⚠️ Use HTTPS in production
- ⚠️ Implement rate limiting for production APIs

## Troubleshooting

### "Cannot find module '@prisma/client'"
```bash
npm run prisma:generate
```

### Socket.IO connection errors
- Ensure Socket.IO server is running on port 3001
- Check `NEXT_PUBLIC_SOCKET_URL` in `.env`
- Verify CORS settings in production

### Database locked errors
- Only one process can write to SQLite at a time
- Consider upgrading to PostgreSQL for production

### AR not working
- WebXR requires HTTPS (except localhost)
- iOS requires USDZ models for Quick Look
- Android requires ARCore-compatible device and browser

## Contributing

This is an MVP scaffold. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the code comments for implementation details

## Roadmap

Future enhancements:
- [ ] PDF generation for job reports (puppeteer)
- [ ] Email notifications (nodemailer)
- [ ] MoneyButton integration for BSV signing
- [ ] Advanced 3D models (glTF with animations)
- [ ] Mobile apps (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] White-label customization

---

**Version**: 1.0.0 (MVP)  
**Last Updated**: January 2026
