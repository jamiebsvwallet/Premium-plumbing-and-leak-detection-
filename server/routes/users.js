const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update consent settings
router.put('/consent', authMiddleware, async (req, res) => {
  try {
    const { shareWithCompany, shareWithWaterBoard } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.consentSettings = {
      shareWithCompany: shareWithCompany !== undefined ? shareWithCompany : user.consentSettings.shareWithCompany,
      shareWithWaterBoard: shareWithWaterBoard !== undefined ? shareWithWaterBoard : user.consentSettings.shareWithWaterBoard
    };

    await user.save();

    res.json({
      message: 'Consent settings updated',
      consentSettings: user.consentSettings
    });
  } catch (error) {
    console.error('Consent update error:', error);
    res.status(500).json({ error: 'Failed to update consent settings' });
  }
});

module.exports = router;
