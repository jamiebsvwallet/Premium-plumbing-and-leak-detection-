# Quick Start Guide

## Prerequisites
- Node.js 18+ and npm installed
- Git installed

## Installation (5 minutes)

```bash
# Clone the repository
git clone https://github.com/jamiebsvwallet/Premium-plumbing-and-leak-detection-.git
cd Premium-plumbing-and-leak-detection-

# Switch to the MVP branch
git checkout scaffold/webxr-mvp

# Install dependencies (skip puppeteer download)
PUPPETEER_SKIP_DOWNLOAD=true npm install

# Setup environment
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database with demo accounts
npm run prisma:seed
```

## Running the Application

### Terminal 1 - Frontend & API
```bash
npm run dev
```
Runs on: http://localhost:3000

### Terminal 2 - Socket.IO Server (Real-time updates)
```bash
npm run socket-server
```
Runs on: http://localhost:3001

## Demo Accounts

### Operator/Admin
- Email: `admin@example.com`
- Password: `AdminPass123`

### Customer
- Email: `customer@example.com`
- Password: `Customer123`

## Quick Test Workflow

1. **Login**: Go to http://localhost:3000/auth/login
2. **Register Device**: Use dashboard to register a device (e.g., `sensor-001`)
3. **Simulate Events**: 
   ```bash
   npm run simulate -- --deviceId sensor-001 --interval 3000
   ```
4. **View Events**: Click "Events" on your device card
5. **Digital Twin**: Click "Digital Twin" to see 3D visualization
6. **AR View**: Click "AR" to test AR diagnostics
7. **Consent**: Go to /consent to manage data sharing

## Testing BSV Anchoring

1. Login as admin/operator
2. Make API call to anchor pending events:
   ```bash
   curl -X POST http://localhost:3000/api/bsv/anchor \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"limit":10}'
   ```

Note: BSV broadcasting requires `BSV_PRIVATE_KEY` in `.env`

## API Testing

Get auth token:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"Customer123"}'
```

Register device:
```bash
curl -X POST http://localhost:3000/api/devices/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"sensor-001","name":"Test Sensor","location":"Kitchen"}'
```

Send event:
```bash
curl -X POST http://localhost:3000/api/events/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId":"sensor-001",
    "timestamp":"2024-01-10T12:00:00Z",
    "metrics":{"flowRate":1.5,"pressure":45,"temperature":18},
    "alertType":"none"
  }'
```

## Deployment

### Vercel (Frontend)
1. Push to GitHub
2. Import in Vercel
3. Set environment variables
4. Deploy

### Render (Socket.IO)
1. Create Web Service
2. Build: `npm install && npm run build:socket`
3. Start: `npm run socket-server:prod`
4. Set PORT and CORS_ORIGIN env vars

## Troubleshooting

**Port already in use:**
```bash
# Kill process on port 3000
npx kill-port 3000
```

**Database issues:**
```bash
# Reset database
rm prisma/dev.db
npx prisma migrate dev --name init
npm run prisma:seed
```

**Build errors:**
```bash
# Clean install
rm -rf node_modules package-lock.json
PUPPETEER_SKIP_DOWNLOAD=true npm install
```

## Documentation
- Full README: [README.md](./README.md)
- API Endpoints: See README.md
- Prisma Schema: [prisma/schema.prisma](./prisma/schema.prisma)

## Support
Open an issue on GitHub for help.
