const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { iotDataLimiter } = require('../middleware/rateLimiter');
const IoTDevice = require('../models/IoTDevice');
const IoTData = require('../models/IoTData');
const User = require('../models/User');
const bsvService = require('../utils/bsvService');

// Register new IoT device
router.post('/register', authMiddleware, async (req, res) => {
  try {
    const { deviceId, deviceName, deviceType, location } = req.body;

    // Check if device already exists
    const existingDevice = await IoTDevice.findOne({ deviceId });
    if (existingDevice) {
      return res.status(400).json({ error: 'Device ID already registered' });
    }

    const device = new IoTDevice({
      deviceId,
      customerId: req.userId,
      deviceName,
      deviceType,
      location
    });

    await device.save();

    res.status(201).json({
      message: 'IoT device registered successfully',
      device
    });
  } catch (error) {
    console.error('Device registration error:', error);
    res.status(500).json({ error: 'Failed to register device' });
  }
});

// Get all devices for current user
router.get('/my-devices', authMiddleware, async (req, res) => {
  try {
    const devices = await IoTDevice.find({ customerId: req.userId });
    res.json(devices);
  } catch (error) {
    console.error('Devices fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// Record IoT data
router.post('/data', authMiddleware, iotDataLimiter, async (req, res) => {
  try {
    const { deviceId, reading, alert, alertMessage } = req.body;

    // Verify device belongs to user
    const device = await IoTDevice.findOne({ 
      _id: deviceId, 
      customerId: req.userId 
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Get user consent settings
    const user = await User.findById(req.userId);

    // Generate hash of the data
    const dataToHash = {
      deviceId,
      customerId: req.userId,
      reading,
      timestamp: new Date()
    };

    const dataHash = bsvService.generateDataHash(dataToHash);

    // Create BSV transaction
    const bsvTransaction = await bsvService.createDataTransaction(
      dataHash,
      user.bsvAddress
    );

    // Create IoT data record
    const iotData = new IoTData({
      deviceId,
      customerId: req.userId,
      reading,
      alert,
      alertMessage,
      dataHash,
      bsvTransactionId: bsvTransaction.transactionId,
      sharedWithCompany: user.consentSettings.shareWithCompany,
      sharedWithWaterBoard: user.consentSettings.shareWithWaterBoard
    });

    await iotData.save();

    // Update device last reading
    device.lastReading = new Date();
    await device.save();

    // If consent given, simulate sending to company and water board
    const sharedWith = [];
    if (user.consentSettings.shareWithCompany) {
      sharedWith.push('company');
      // In real implementation, would send to company BSV address
    }
    if (user.consentSettings.shareWithWaterBoard) {
      sharedWith.push('waterboard');
      // In real implementation, would send to water board BSV address
    }

    res.status(201).json({
      message: 'IoT data recorded successfully',
      iotData,
      bsvTransaction,
      sharedWith
    });
  } catch (error) {
    console.error('IoT data recording error:', error);
    res.status(500).json({ error: 'Failed to record IoT data' });
  }
});

// Get IoT data for a device
router.get('/data/:deviceId', authMiddleware, async (req, res) => {
  try {
    // Verify device belongs to user
    const device = await IoTDevice.findOne({ 
      _id: req.params.deviceId, 
      customerId: req.userId 
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const iotData = await IoTData.find({ deviceId: req.params.deviceId })
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(iotData);
  } catch (error) {
    console.error('IoT data fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch IoT data' });
  }
});

// Get aggregated data for heat mapping
router.get('/heatmap/data', authMiddleware, async (req, res) => {
  try {
    const devices = await IoTDevice.find({ customerId: req.userId });
    const deviceIds = devices.map(d => d._id);

    const iotData = await IoTData.aggregate([
      { $match: { deviceId: { $in: deviceIds } } },
      { 
        $group: {
          _id: '$deviceId',
          avgValue: { $avg: '$reading.value' },
          maxValue: { $max: '$reading.value' },
          minValue: { $min: '$reading.value' },
          alertCount: { $sum: { $cond: ['$alert', 1, 0] } }
        }
      }
    ]);

    // Join with device location data
    const heatmapData = await Promise.all(iotData.map(async (data) => {
      const device = devices.find(d => d._id.toString() === data._id.toString());
      return {
        deviceId: data._id,
        deviceName: device.deviceName,
        location: device.location,
        avgValue: data.avgValue,
        maxValue: data.maxValue,
        minValue: data.minValue,
        alertCount: data.alertCount
      };
    }));

    res.json(heatmapData);
  } catch (error) {
    console.error('Heatmap data fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch heatmap data' });
  }
});

module.exports = router;
