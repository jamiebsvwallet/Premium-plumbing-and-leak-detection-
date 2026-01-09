const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const JobReport = require('../models/JobReport');
const User = require('../models/User');
const bsvService = require('../utils/bsvService');

// Create new job report (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { customerId, jobTitle, description, technician, location } = req.body;

    // Verify customer exists
    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const jobReport = new JobReport({
      customerId,
      jobTitle,
      description,
      technician,
      location
    });

    await jobReport.save();

    res.status(201).json({
      message: 'Job report created',
      jobReport
    });
  } catch (error) {
    console.error('Job report creation error:', error);
    res.status(500).json({ error: 'Failed to create job report' });
  }
});

// Complete job report (admin only)
router.put('/:id/complete', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const jobReport = await JobReport.findById(req.params.id).populate('customerId');
    
    if (!jobReport) {
      return res.status(404).json({ error: 'Job report not found' });
    }

    // Generate hash of job report data
    const reportData = {
      jobId: jobReport._id,
      customerId: jobReport.customerId._id,
      jobTitle: jobReport.jobTitle,
      description: jobReport.description,
      completionDate: new Date()
    };

    const dataHash = bsvService.generateDataHash(reportData);

    // Create BSV transaction
    const bsvTransaction = await bsvService.createDataTransaction(
      dataHash,
      jobReport.customerId.bsvAddress
    );

    // Update job report
    jobReport.status = 'completed';
    jobReport.completionDate = new Date();
    jobReport.dataHash = dataHash;
    jobReport.bsvTransactionId = bsvTransaction.transactionId;

    await jobReport.save();

    res.json({
      message: 'Job report completed and sent to customer',
      jobReport,
      bsvTransaction
    });
  } catch (error) {
    console.error('Job completion error:', error);
    res.status(500).json({ error: 'Failed to complete job report' });
  }
});

// Get all job reports for current user
router.get('/my-jobs', authMiddleware, async (req, res) => {
  try {
    const jobReports = await JobReport.find({ customerId: req.userId }).sort({ createdAt: -1 });
    res.json(jobReports);
  } catch (error) {
    console.error('Job reports fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch job reports' });
  }
});

// Get all job reports (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const jobReports = await JobReport.find().populate('customerId', 'name email').sort({ createdAt: -1 });
    res.json(jobReports);
  } catch (error) {
    console.error('Job reports fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch job reports' });
  }
});

module.exports = router;
