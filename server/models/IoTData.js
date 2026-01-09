const mongoose = require('mongoose');

const iotDataSchema = new mongoose.Schema({
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IoTDevice',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reading: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    }
  },
  alert: {
    type: Boolean,
    default: false
  },
  alertMessage: {
    type: String
  },
  dataHash: {
    type: String
  },
  bsvTransactionId: {
    type: String
  },
  sharedWithCompany: {
    type: Boolean,
    default: false
  },
  sharedWithWaterBoard: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('IoTData', iotDataSchema);
