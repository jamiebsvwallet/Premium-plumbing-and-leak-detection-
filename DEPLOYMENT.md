# Deployment Guide

Complete guide for deploying the Premium Plumbing & Leak Detection MVP to production.

## Architecture Overview

The application consists of two parts:
1. **Next.js Frontend + API Routes** → Deploy to Vercel
2. **Socket.IO Real-time Server** → Deploy to Render (or similar)

## Prerequisites

- GitHub account with repository access
- Vercel account (free tier works)
- Render account (free tier works)
- Production database (PostgreSQL recommended)
- (Optional) BSV testnet/mainnet credentials

## Part 1: Database Setup

### Option A: PostgreSQL (Recommended for Production)

1. **Create PostgreSQL Database**
   - Use Vercel Postgres, Supabase, Railway, or any PostgreSQL provider
   - Note the connection string

2. **Update Environment Variables**
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   ```

3. **Update Prisma Schema** (if needed)
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

4. **Deploy Migrations**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

### Option B: SQLite (Development Only)
Keep `DATABASE_URL="file:./dev.db"` for testing, but NOT recommended for production.

## Part 2: Vercel Deployment (Frontend)

### Step 1: Prepare Repository
```bash
git push origin scaffold/webxr-mvp
```

### Step 2: Import to Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Select `scaffold/webxr-mvp` branch

### Step 3: Configure Build Settings
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `PUPPETEER_SKIP_DOWNLOAD=true npm install`

### Step 4: Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

```env
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-strong-random-secret-here

# Socket.IO (set after Render deployment)
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.onrender.com
NEXT_PUBLIC_API_URL=https://your-app.vercel.app

# BSV (optional)
BSV_PRIVATE_KEY=your-testnet-wif-key
BSV_NETWORK=testnet

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com

# MoneyButton (optional)
MONEYBUTTON_CLIENT_ID=
MONEYBUTTON_CLIENT_SECRET=
```

### Step 5: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Note your Vercel URL: `https://your-app.vercel.app`

### Step 6: Post-Deployment Tasks
1. **Run Database Migrations**:
   - In Vercel Dashboard → Project → Settings → Functions
   - Or use Prisma Studio locally with production DB URL

2. **Seed Production Database**:
   ```bash
   # Locally with production DATABASE_URL
   DATABASE_URL="postgresql://..." npm run prisma:seed
   ```

## Part 3: Render Deployment (Socket.IO Server)

### Step 1: Create New Web Service
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select `scaffold/webxr-mvp` branch

### Step 2: Configure Service
- **Name**: `premium-plumbing-socket`
- **Region**: Choose closest to Vercel
- **Branch**: `scaffold/webxr-mvp`
- **Root Directory**: Leave empty
- **Runtime**: Node
- **Build Command**: `npm install && npm run build:socket`
- **Start Command**: `npm run socket-server:prod`
- **Instance Type**: Free (or paid for always-on)

### Step 3: Environment Variables
Add these in Render Dashboard:

```env
# Render sets PORT automatically
PORT=3001

# CORS (your Vercel frontend URL)
CORS_ORIGIN=https://your-app.vercel.app

# Node environment
NODE_ENV=production
```

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment
3. Note your Render URL: `https://premium-plumbing-socket.onrender.com`

### Step 5: Update Vercel Environment
1. Go back to Vercel Dashboard
2. Update `NEXT_PUBLIC_SOCKET_URL` to your Render URL
3. Redeploy Vercel app to pick up new env var

## Part 4: Configure BSV Integration (Optional)

### Generate BSV Keys (Testnet)
```bash
# Use BSV SDK or online tools
# Save private key in WIF format
```

### Update Environment Variables
In both Vercel and your local `.env`:
```env
BSV_PRIVATE_KEY=your-wif-private-key
BSV_NETWORK=testnet
```

### Test BSV Anchoring
```bash
curl -X POST https://your-app.vercel.app/api/bsv/anchor \
  -H "Authorization: Bearer OPERATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"limit":5}'
```

## Part 5: Domain Configuration (Optional)

### Vercel Custom Domain
1. Vercel Dashboard → Project → Settings → Domains
2. Add your domain (e.g., `app.yourdomain.com`)
3. Update DNS records as instructed

### Render Custom Domain
1. Render Dashboard → Service → Settings → Custom Domains
2. Add subdomain (e.g., `socket.yourdomain.com`)
3. Update DNS records

### Update Environment Variables
After adding domains, update:
- `NEXT_PUBLIC_SOCKET_URL`
- `NEXT_PUBLIC_API_URL`
- `CORS_ORIGIN`

## Part 6: Post-Deployment Verification

### Checklist
- [ ] Frontend loads at Vercel URL
- [ ] Login/signup works
- [ ] Device registration works
- [ ] Socket.IO server health check responds: `https://socket-url/health`
- [ ] Real-time updates work in Digital Twin
- [ ] Events persist in production database
- [ ] API endpoints respond correctly
- [ ] BSV anchoring creates transactions (if configured)

### Test Real-time Connection
Open browser console on Digital Twin page:
```javascript
// Should show Socket.IO connection
// Look for: "Connected to Socket.IO"
```

### Test IoT Ingestion
```bash
curl -X POST https://your-app.vercel.app/api/events/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId":"sensor-001",
    "timestamp":"2024-01-10T12:00:00Z",
    "metrics":{"flowRate":2.5,"pressure":50,"temperature":20},
    "alertType":"none"
  }'
```

## Troubleshooting

### Vercel Build Fails
- Check build logs in Vercel Dashboard
- Ensure `PUPPETEER_SKIP_DOWNLOAD=true` in install command
- Verify all environment variables are set

### Database Connection Issues
- Check `DATABASE_URL` format
- Verify database allows connections from Vercel IPs
- Run migrations: `npx prisma migrate deploy`

### Socket.IO Not Connecting
- Check CORS_ORIGIN in Render matches Vercel URL
- Verify Socket.IO server is running (check Render logs)
- Check browser console for errors
- Ensure `NEXT_PUBLIC_SOCKET_URL` points to Render

### BSV Transactions Fail
- Verify `BSV_PRIVATE_KEY` is in correct WIF format
- Check you have UTXOs for testnet/mainnet
- Review server logs for detailed errors

## Monitoring

### Vercel
- Dashboard → Project → Analytics
- View function logs, errors, and performance

### Render
- Dashboard → Service → Logs
- Monitor real-time server logs
- Set up health check notifications

### Database
- Use Prisma Studio: `npx prisma studio`
- Connect with production DATABASE_URL

## Scaling Considerations

### Free Tier Limitations
- **Vercel**: 100GB bandwidth, 100 serverless function executions per day
- **Render**: Free tier sleeps after 15 min inactivity

### Upgrade Options
- Vercel Pro: More bandwidth, better performance
- Render Paid: Always-on, no sleep, better resources

### Database Scaling
- Connection pooling with PgBouncer
- Read replicas for heavy read operations
- Consider Prisma Accelerate for caching

## Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use strong database passwords
- [ ] Enable HTTPS only (automatic with Vercel/Render)
- [ ] Implement rate limiting (optional, use Vercel middleware)
- [ ] Review CORS settings
- [ ] Use environment-specific BSV keys
- [ ] Enable database SSL connections
- [ ] Regularly update dependencies: `npm audit fix`

## Backup Strategy

### Database Backups
- Enable automated backups on database provider
- Export data regularly: `npx prisma db push --force-reset`

### Code Backups
- Keep repository on GitHub
- Tag releases: `git tag -a v1.0.0 -m "Production release"`

## Support

For deployment issues:
1. Check Vercel/Render logs
2. Review this guide
3. Open GitHub issue with logs

## Additional Resources

- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
