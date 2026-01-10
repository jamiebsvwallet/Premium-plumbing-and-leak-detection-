import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Server as SocketIOServer } from 'socket.io';
import { emitDeviceEvent } from './socket-server';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// Auth middleware
const authenticate = (req: Request, res: Response, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    (req as any).user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export function attachApi(app: express.Application, io: SocketIOServer) {
  const router = express.Router();

  // Health check
  router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth endpoints
  router.post('/auth/signup', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'user',
        },
      });

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        user: { id: user.id, email: user.email, role: user.role },
        token,
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        user: { id: user.id, email: user.email, role: user.role },
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Device endpoints
  router.get('/devices', authenticate, async (req, res) => {
    try {
      const user = (req as any).user as JWTPayload;

      const devices = await prisma.device.findMany({
        where: {
          ownerId: user.userId,
        },
        include: {
          _count: {
            select: { events: true },
          },
        },
      });

      res.json(devices);
    } catch (error) {
      console.error('Error fetching devices:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/devices', authenticate, async (req, res) => {
    try {
      const user = (req as any).user as JWTPayload;
      const { name, type, serialNumber } = req.body;

      if (!name || !type || !serialNumber) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const device = await prisma.device.create({
        data: {
          name,
          type,
          serialNumber,
          ownerId: user.userId,
        },
      });

      res.json(device);
    } catch (error) {
      console.error('Error creating device:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/devices/:deviceId', authenticate, async (req, res) => {
    try {
      const user = (req as any).user as JWTPayload;
      const { deviceId } = req.params;

      const device = await prisma.device.findFirst({
        where: {
          id: deviceId,
          OR: [
            { ownerId: user.userId },
            {
              consentGrants: {
                some: {
                  grantedTo: user.email,
                  active: true,
                },
              },
            },
          ],
        },
        include: {
          events: {
            orderBy: { timestamp: 'desc' },
            take: 50,
          },
        },
      });

      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      res.json(device);
    } catch (error) {
      console.error('Error fetching device:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Event ingestion webhook
  router.post('/events/ingest', async (req, res) => {
    try {
      const { deviceId, eventType, value, metadata, serialNumber } = req.body;

      let device;
      
      // Find device by ID or serial number
      if (deviceId) {
        device = await prisma.device.findUnique({ where: { id: deviceId } });
      } else if (serialNumber) {
        device = await prisma.device.findUnique({ where: { serialNumber } });
      }

      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      const event = await prisma.deviceEvent.create({
        data: {
          deviceId: device.id,
          eventType,
          value: value !== undefined ? parseFloat(value) : null,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });

      // Emit real-time event via Socket.IO
      emitDeviceEvent(io, device.id, event);

      res.json(event);
    } catch (error) {
      console.error('Error ingesting event:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Consent endpoints
  router.post('/consent/grant', authenticate, async (req, res) => {
    try {
      const user = (req as any).user as JWTPayload;
      const { deviceId, grantedTo, scope } = req.body;

      // Verify user owns the device
      const device = await prisma.device.findFirst({
        where: {
          id: deviceId,
          ownerId: user.userId,
        },
      });

      if (!device) {
        return res.status(404).json({ error: 'Device not found or access denied' });
      }

      const consent = await prisma.consentGrant.upsert({
        where: {
          userId_deviceId_grantedTo: {
            userId: user.userId,
            deviceId,
            grantedTo,
          },
        },
        update: {
          active: true,
          scope: scope || 'read',
          revokedAt: null,
        },
        create: {
          userId: user.userId,
          deviceId,
          grantedTo,
          scope: scope || 'read',
          active: true,
        },
      });

      res.json(consent);
    } catch (error) {
      console.error('Error granting consent:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/consent/revoke', authenticate, async (req, res) => {
    try {
      const user = (req as any).user as JWTPayload;
      const { deviceId, grantedTo } = req.body;

      const consent = await prisma.consentGrant.updateMany({
        where: {
          userId: user.userId,
          deviceId,
          grantedTo,
        },
        data: {
          active: false,
          revokedAt: new Date(),
        },
      });

      res.json({ success: true, updated: consent.count });
    } catch (error) {
      console.error('Error revoking consent:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Job reports
  router.get('/job-reports', authenticate, async (req, res) => {
    try {
      const user = (req as any).user as JWTPayload;

      const reports = await prisma.jobReport.findMany({
        where: {
          userId: user.userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json(reports);
    } catch (error) {
      console.error('Error fetching job reports:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/job-reports', authenticate, async (req, res) => {
    try {
      const user = (req as any).user as JWTPayload;
      const { deviceId, title, description } = req.body;

      const report = await prisma.jobReport.create({
        data: {
          userId: user.userId,
          deviceId,
          title,
          description,
          status: 'open',
        },
      });

      res.json(report);
    } catch (error) {
      console.error('Error creating job report:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.use('/api', router);
}
