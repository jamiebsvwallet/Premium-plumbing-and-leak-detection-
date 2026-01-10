import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    res.json(event);
  } catch (error) {
    console.error('Error ingesting event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
