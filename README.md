# Premium Plumbing & Leak Detection MVP

A full-stack IoT leak detection and prevention system with blockchain-secured data integrity, real-time monitoring, digital twin visualization, and AR diagnostics.

## 🚀 Features

- **User Authentication**: JWT-based authentication with customer and operator roles
- **IoT Device Management**: Register and manage leak detection devices
- **Real-time Event Ingestion**: Receive and process device events with Socket.IO
- **Blockchain Integration**: BSV testnet integration for immutable data hashing
- **Consent-based Data Sharing**: Customers control which operators can access their data
- **Digital Twin Visualization**: 3D representation of devices with real-time updates
- **AR Diagnostics**: WebXR-based augmented reality diagnostics with AR.js fallback
- **Job Reports**: Operators can create and manage service reports
- **IoT Simulator**: Test the system with simulated device events

## 📋 Prerequisites

- Node.js 18+ and npm
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jamiebsvwallet/Premium-plumbing-and-leak-detection-.git
   cd Premium-plumbing-and-leak-detection-
   ```

2. **Checkout the MVP branch**
   ```bash
   git checkout scaffold/webxr-mvp
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration. For local development, the defaults work fine. For production:
   - Set a secure `JWT_SECRET`
   - Configure BSV credentials if you want actual blockchain anchoring

5. **Initialize the database**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

6. **Seed the database with demo data**
   ```bash
   npm run prisma:seed
   ```

   This creates:
   - Operator account: `operator@example.com` / `admin123`
   - Customer account: `customer@example.com` / `customer123`
   - Demo device: `DEMO-DEVICE-001`

## 🏃 Running Locally

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

3. **Login with demo credentials**
   - Customer: `customer@example.com` / `customer123`
   - Operator: `operator@example.com` / `admin123`

## 🧪 Testing the System

### 1. Register a Device

1. Login as a customer
2. Go to "My Devices"
3. Click "Register Device"
4. Enter device details (e.g., Device ID: `SENSOR-002`, Name: `Bathroom Sensor`)

### 2. Simulate IoT Events

Run the IoT simulator in a separate terminal:

```bash
# Normal operation
npm run simulate

# Simulate a leak
npm run simulate -- --leak

# Simulate with custom device
npm run simulate -- --device=SENSOR-002

# Custom interval (default 10 seconds)
npm run simulate -- --interval=5000
```

### 3. View Real-time Updates

1. Navigate to "My Devices"
2. Click "Digital Twin" on any device
3. Watch the 3D visualization update in real-time as events arrive

### 4. Test AR Diagnostics

1. Go to "My Devices"
2. Click "AR Diagnostics" on any device
3. On mobile devices with ARCore/ARKit support, tap "Start AR"
4. On desktop, you'll see a preview mode

### 5. Grant Data Sharing Consent

1. Login as a customer
2. Go to "Data Sharing"
3. Click "Grant Consent"
4. Enter your device ID and operator email: `operator@example.com`
5. Login as operator to verify you can see the shared data

### 6. Create Job Reports (Operator)

1. Login as operator
2. Navigate to operator tools
3. Create a job report for a customer
4. The report hash is automatically signed on BSV (mock mode by default)

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Devices
- `POST /api/devices/register` - Register a device
- `GET /api/devices/register` - List user's devices

### Events
- `POST /api/events/ingest` - Ingest device event
- `GET /api/events/query?deviceId=XXX` - Query device events

### Consents
- `POST /api/consents/manage` - Grant consent
- `GET /api/consents/manage` - List consents
- `DELETE /api/consents/manage` - Revoke consent

### Reports
- `POST /api/reports/manage` - Create job report (operator only)
- `GET /api/reports/manage` - List job reports

## 🔐 BSV Integration

The system generates SHA-256 hashes of device events and job reports, which can be anchored on the BSV blockchain.

### Mock Mode (Default)

By default, the system runs in mock mode for local testing without requiring BSV credentials.

### Enabling Real BSV Transactions

1. **Get BSV Testnet Credentials**
   - Create a testnet wallet
   - Get testnet BSV from a faucet
   - Export your private key (WIF format)

2. **Configure Environment**
   ```bash
   BSV_PRIVATE_KEY="your-testnet-private-key-wif"
   BSV_NETWORK="testnet"
   ```

3. **Alternative: MoneyButton Integration**
   ```bash
   MONEYBUTTON_CLIENT_ID="your-client-id"
   MONEYBUTTON_CLIENT_SECRET="your-client-secret"
   ```

## 🚀 Deployment

### Vercel (Frontend + API Routes)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Environment Variables**
   Set these in Vercel dashboard:
   - `DATABASE_URL` (use PostgreSQL or another supported DB for production)
   - `JWT_SECRET`
   - `BSV_PRIVATE_KEY` (optional)
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_SOCKET_URL`

### Render (Alternative for Backend)

If you want to separate frontend and backend:

1. Deploy Next.js frontend to Vercel
2. Deploy API to Render as a Node.js service
3. Update `NEXT_PUBLIC_API_URL` to point to Render backend

### Database Migration

For production, migrate from SQLite to PostgreSQL:

1. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   ```

2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. Run migrations:
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```

## 📂 Project Structure

```
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed script
├── public/                 # Static assets
├── scripts/
│   └── iot-simulate.ts     # IoT device simulator
├── src/
│   ├── lib/                # Utility libraries
│   │   ├── auth.ts         # JWT authentication
│   │   ├── bsv.ts          # BSV integration
│   │   ├── prisma.ts       # Database client
│   │   └── socket.ts       # Socket.IO setup
│   ├── pages/              # Next.js pages
│   │   ├── api/            # API routes
│   │   │   ├── auth/       # Authentication endpoints
│   │   │   ├── devices/    # Device management
│   │   │   ├── events/     # Event ingestion
│   │   │   ├── consents/   # Consent management
│   │   │   └── reports/    # Job reports
│   │   ├── ar-diagnostics/ # AR diagnostics pages
│   │   ├── digital-twin/   # Digital twin pages
│   │   ├── dashboard.tsx   # User dashboard
│   │   ├── devices.tsx     # Device management UI
│   │   ├── consents.tsx    # Consent management UI
│   │   ├── reports.tsx     # Job reports UI
│   │   ├── login.tsx       # Login page
│   │   ├── signup.tsx      # Signup page
│   │   └── index.tsx       # Home page
│   └── styles/             # CSS styles
├── .env.example            # Environment variables template
├── next.config.js          # Next.js configuration
├── package.json            # Dependencies
├── prisma/                 # Prisma configuration
└── tsconfig.json           # TypeScript configuration
```

## 🔧 Development Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Lint code
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (DB GUI)
npm run prisma:seed      # Seed database
npm run simulate         # Run IoT simulator
```

## 🧩 Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (prod)
- **Authentication**: JWT with bcrypt
- **Real-time**: Socket.IO
- **3D/AR**: Three.js, WebXR
- **Blockchain**: BSV (Bitcoin SV)

## 🐛 Troubleshooting

### Database Issues
```bash
# Reset database
rm prisma/dev.db
npm run prisma:migrate
npm run prisma:seed
```

### Port Already in Use
```bash
# Use a different port
PORT=3001 npm run dev
```

### Socket.IO Connection Issues
- Make sure the API route `/api/socket` is accessible
- Check browser console for connection errors
- Verify `NEXT_PUBLIC_SOCKET_URL` is set correctly

### BSV Transaction Errors
- The system works in mock mode by default
- Real BSV transactions require valid testnet credentials
- Check console logs for detailed error messages

## 📝 Example curl Commands

```bash
# Register a device
curl -X POST http://localhost:3000/api/devices/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "deviceId": "SENSOR-003",
    "name": "Garden Sensor",
    "type": "leak-sensor"
  }'

# Ingest an event
curl -X POST http://localhost:3000/api/events/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "DEMO-DEVICE-001",
    "timestamp": "2024-01-10T12:00:00Z",
    "metrics": {
      "flow": 2.5,
      "temperature": 22.5,
      "pressure": 50
    },
    "alertType": null
  }'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- BSV blockchain for data integrity
- Three.js for 3D visualization
- WebXR for AR capabilities
- Prisma for database management

## 📞 Support

For issues or questions, please open an issue on GitHub or contact the development team.

---

**Note**: This is an MVP (Minimum Viable Product) implementation. For production use, additional security hardening, error handling, and testing should be implemented.
