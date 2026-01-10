# Deployment Guide

This guide covers deploying the Premium Plumbing MVP to production with Vercel (frontend) and Render (Socket.IO backend).

## Architecture

- **Frontend (Next.js)**: Deployed on Vercel
- **Backend (Socket.IO)**: Deployed on Render as an always-on web service
- **Database**: PostgreSQL (recommended for production) or keep SQLite for demo

## Prerequisites

- GitHub account with repository access
- Vercel account (free tier works)
- Render account (free tier works, but may spin down)
- PostgreSQL database (optional, for production)

## Part 1: Database Setup (Optional)

### Option A: Keep SQLite (Simple, Demo)

SQLite works for demos but has limitations on Vercel's serverless functions.

### Option B: PostgreSQL (Production)

1. **Create PostgreSQL database**:
   - Option 1: Use Render's free PostgreSQL
   - Option 2: Use Supabase, Railway, or Neon
   - Option 3: Use your own PostgreSQL instance

2. **Get connection string**:
   ```
   postgresql://user:password@host:5432/database
   ```

3. **Update Prisma schema**:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

4. **Run migrations**:
   ```bash
   DATABASE_URL="your-postgres-url" npm run prisma:migrate
   DATABASE_URL="your-postgres-url" npm run prisma:seed
   ```

## Part 2: Deploy Socket.IO Backend to Render

The Socket.IO server needs to run continuously for real-time features.

### Steps:

1. **Go to [Render Dashboard](https://dashboard.render.com/)**

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Choose the repository: `jamiebsvwallet/Premium-plumbing-and-leak-detection-`

3. **Configure Service**:
   - **Name**: `premium-plumbing-socket-server`
   - **Environment**: Node
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your deployment branch)
   - **Build Command**: `npm install`
   - **Start Command**: `npm run socket-server`

4. **Set Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=<same-as-frontend-min-32-chars>
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```

5. **Choose Instance Type**:
   - Free tier: Service spins down after inactivity (not ideal for real-time)
   - Starter ($7/mo): Always on, recommended for production

6. **Deploy**: Click "Create Web Service"

7. **Note the URL**: You'll get a URL like:
   ```
   https://premium-plumbing-socket-server.onrender.com
   ```

## Part 3: Deploy Frontend to Vercel

### Steps:

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

2. **Import Project**:
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

4. **Set Environment Variables**:
   
   Click "Environment Variables" and add:
   
   ```
   # Required
   DATABASE_URL=<your-database-url>
   JWT_SECRET=<min-32-char-secret-key>
   
   # Socket.IO Backend
   NEXT_PUBLIC_SOCKET_URL=https://premium-plumbing-socket-server.onrender.com
   
   # BSV (Optional)
   BSV_PRIVATE_KEY=<your-bsv-private-key-wif>
   BSV_NETWORK=testnet
   
   # Email (Optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=<your-email>
   SMTP_PASS=<your-app-password>
   SMTP_FROM=noreply@premiumplumbing.com
   ```

5. **Deploy**: Click "Deploy"

6. **Wait for Build**: First deployment takes 2-3 minutes

7. **Note the URL**: You'll get a URL like:
   ```
   https://premium-plumbing-xxxx.vercel.app
   ```

8. **Update Render Backend**:
   - Go back to Render
   - Update `FRONTEND_URL` to your Vercel URL
   - Redeploy the Socket.IO service

## Part 4: Post-Deployment Setup

### 1. Run Database Migrations (if using PostgreSQL)

If you're using PostgreSQL in production, you need to run migrations:

```bash
# Local machine
DATABASE_URL="your-production-postgres-url" npm run prisma:migrate

# Seed admin account
DATABASE_URL="your-production-postgres-url" npm run prisma:seed
```

### 2. Test the Deployment

1. **Visit your Vercel URL**:
   ```
   https://premium-plumbing-xxxx.vercel.app
   ```

2. **Sign up** for a new account

3. **Register a device** from the dashboard

4. **Test event ingestion**:
   ```bash
   curl -X POST https://premium-plumbing-xxxx.vercel.app/api/events/ingest \
     -H "Content-Type: application/json" \
     -d '{
       "deviceId": "YOUR-DEVICE-ID",
       "timestamp": "2024-01-10T12:00:00Z",
       "metrics": {"flow": 5.2, "pressure": 45.3, "temperature": 22.1, "humidity": 55.0}
     }'
   ```

5. **Test Digital Twin**: Should connect to Socket.IO and update in real-time

### 3. Configure Custom Domain (Optional)

#### Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `app.premiumplumbing.com`)
3. Configure DNS according to Vercel's instructions

#### Render:
1. Go to Service Settings → Custom Domains
2. Add your custom domain (e.g., `api.premiumplumbing.com`)
3. Configure DNS with CNAME record

## Monitoring & Logs

### Vercel:
- **Logs**: Dashboard → Project → Deployments → View logs
- **Analytics**: Dashboard → Project → Analytics
- **Functions**: Monitor serverless function performance

### Render:
- **Logs**: Dashboard → Service → Logs (real-time)
- **Metrics**: Dashboard → Service → Metrics
- **Events**: Track deployments and restarts

## Troubleshooting

### Issue: Socket.IO not connecting

**Solution**:
1. Check `NEXT_PUBLIC_SOCKET_URL` in Vercel
2. Verify `FRONTEND_URL` in Render includes `https://`
3. Check Render service is running (not spun down)
4. Check browser console for CORS errors

### Issue: Database connection errors

**Solution**:
1. Verify `DATABASE_URL` format is correct
2. Check database is accessible from Vercel/Render
3. For PostgreSQL: Ensure SSL is configured if required
4. Check database connection limits

### Issue: Authentication fails

**Solution**:
1. Ensure `JWT_SECRET` is the same in both Vercel and Render
2. Check `JWT_SECRET` is at least 32 characters
3. Clear browser localStorage and try again

### Issue: Build fails on Vercel

**Solution**:
1. Check build logs for specific error
2. Verify all environment variables are set
3. Ensure `DATABASE_URL` is accessible during build
4. For Prisma: May need to run `prisma generate` in build command

### Issue: Render service keeps spinning down

**Solution**:
1. Upgrade to Render's Starter plan ($7/mo) for always-on service
2. Alternative: Implement keepalive pings from client
3. Consider other hosting for Socket.IO (Railway, Fly.io)

## Security Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Use strong admin password (change from default)
- [ ] Enable HTTPS only (automatic on Vercel/Render)
- [ ] Set up proper CORS configuration
- [ ] Review and limit database connection strings
- [ ] Enable Vercel's security headers
- [ ] Set up rate limiting (e.g., with Upstash)
- [ ] Monitor for suspicious activity
- [ ] Keep dependencies updated (`npm audit`)

## Cost Estimate

### Free Tier:
- **Vercel**: Free (100GB bandwidth, hobby)
- **Render**: Free (service spins down)
- **Database**: Free SQLite or Render PostgreSQL
- **Total**: $0/month (with limitations)

### Production Tier:
- **Vercel Pro**: $20/month
- **Render Starter**: $7/month (always-on)
- **Database**: $7/month (Render PostgreSQL)
- **Total**: $34/month

## Scaling Considerations

### When to scale:

1. **>100 concurrent users**: Upgrade Render instance
2. **>1000 devices**: Move to dedicated database
3. **High event volume**: Consider message queue (Redis, RabbitMQ)
4. **Global users**: Add CDN for static assets
5. **Compliance needs**: Consider SOC2/HIPAA hosting

### Scaling options:

- **Horizontal**: Multiple Render instances with load balancer
- **Database**: Connection pooling (PgBouncer)
- **Events**: Redis pub/sub or Kafka for event streaming
- **Storage**: S3 for reports and files

## Backup Strategy

### Database:
1. **Render**: Automatic backups (Starter plan+)
2. **Manual**: Schedule `pg_dump` with cron
3. **Testing**: Regularly restore backups to staging

### Code:
- Git repository is the source of truth
- Tag releases for rollback capability

## Support

For deployment issues:
- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- GitHub Issues on this repository
