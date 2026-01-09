# BSV Integration Guide

## Overview

This application uses the Bitcoin SV (BSV) blockchain to ensure data integrity and immutability for plumbing job reports and IoT device data.

## How BSV Integration Works

### 1. User Account Creation
When a user registers, a unique BSV address is generated for them:
```javascript
const bsvAddress = bsvService.generateAddress();
```

This address is stored in their user profile and used for all blockchain transactions related to their account.

### 2. Data Hashing
Before any critical data is stored, it's cryptographically hashed using SHA-256:
```javascript
const dataHash = bsvService.generateDataHash(data);
```

This creates a unique fingerprint of the data that can be used to verify its integrity later.

### 3. Blockchain Transactions
When significant events occur (job completion, IoT data recording), a BSV transaction is created:
```javascript
const bsvTransaction = await bsvService.createDataTransaction(
  dataHash,
  recipientAddress
);
```

The transaction includes:
- The data hash
- Recipient BSV address (customer, company, or water board)
- Timestamp
- Network (mainnet or testnet)

### 4. Consent-Based Data Sharing
Users control who can see their IoT data through consent settings:
- **Share with Company**: When enabled, IoT data is also sent to the company's BSV address
- **Share with Water Board**: When enabled, IoT data is also sent to the water board's BSV address

All sharing is recorded on the blockchain with the user's consent status.

## Implementation Details

### BSV Service (`server/utils/bsvService.js`)

The BSV service provides these core functions:

#### generateDataHash(data)
Creates a SHA-256 hash of any data object:
```javascript
const jobData = {
  jobId: job._id,
  customerId: job.customerId,
  completionDate: new Date()
};
const hash = bsvService.generateDataHash(jobData);
```

#### createDataTransaction(dataHash, recipientAddress)
Records a hash on the BSV blockchain:
```javascript
const tx = await bsvService.createDataTransaction(
  hash,
  user.bsvAddress
);
// Returns: { transactionId, dataHash, recipient, timestamp, network }
```

#### generateAddress()
Generates a new BSV address for a user:
```javascript
const address = bsvService.generateAddress();
```

#### verifyDataIntegrity(data, storedHash)
Verifies that data hasn't been tampered with:
```javascript
const isValid = bsvService.verifyDataIntegrity(
  originalData,
  storedHash
);
```

## Use Cases

### Job Report Completion
When a plumber completes a job:
1. Job details are hashed
2. Hash is recorded on BSV blockchain
3. Transaction sent to customer's BSV address
4. Customer receives verifiable proof of work completion

```javascript
// From server/routes/jobs.js
const dataHash = bsvService.generateDataHash(reportData);
const bsvTransaction = await bsvService.createDataTransaction(
  dataHash,
  jobReport.customerId.bsvAddress
);
jobReport.bsvTransactionId = bsvTransaction.transactionId;
```

### IoT Data Recording
When an IoT device sends data:
1. Reading data is hashed
2. Hash is recorded on blockchain
3. Based on consent:
   - Sent to customer's address (always)
   - Sent to company's address (if consent given)
   - Sent to water board's address (if consent given)

```javascript
// From server/routes/iot.js
const dataHash = bsvService.generateDataHash(dataToHash);
const bsvTransaction = await bsvService.createDataTransaction(
  dataHash,
  user.bsvAddress
);

if (user.consentSettings.shareWithCompany) {
  // Also send to company address
}
if (user.consentSettings.shareWithWaterBoard) {
  // Also send to water board address
}
```

## Configuration

### Environment Variables

```bash
# BSV private key for the application
BSV_PRIVATE_KEY=your_bsv_private_key

# Network: mainnet or testnet
BSV_NETWORK=mainnet

# Company BSV address for receiving shared data
COMPANY_BSV_ADDRESS=your_company_bsv_address

# Water board BSV address
WATERBOARD_BSV_ADDRESS=waterboard_bsv_address
```

### Generating Keys

For production use, generate secure BSV keys:

```javascript
const bsv = require('bsv');
const privateKey = bsv.PrivateKey.fromRandom();
const address = privateKey.toAddress().toString();

console.log('Private Key:', privateKey.toString());
console.log('Address:', address);
```

**Important**: Store the private key securely and never commit it to version control.

## Testing

### Testnet vs Mainnet

For development and testing, use BSV testnet:
```bash
BSV_NETWORK=testnet
```

For production, use mainnet:
```bash
BSV_NETWORK=mainnet
```

### Simulated Transactions

The current implementation simulates BSV transactions for development purposes. For production:

1. Install the full BSV library
2. Configure proper node connections
3. Implement actual transaction broadcasting
4. Handle transaction fees

## Production Considerations

### Transaction Fees
- Budget for BSV transaction fees
- Implement fee estimation
- Consider batching transactions for efficiency

### Rate Limiting
- Implement rate limiting for blockchain writes
- Consider queueing system for high-volume data

### Error Handling
- Handle network failures gracefully
- Implement retry logic for failed transactions
- Store pending transactions for later processing

### Monitoring
- Monitor blockchain confirmation status
- Track transaction success rates
- Alert on failed transactions

## Data Verification

To verify data integrity at any time:

```javascript
// Get the stored hash from database
const iotData = await IoTData.findById(dataId);

// Get the original data
const originalData = {
  deviceId: iotData.deviceId,
  customerId: iotData.customerId,
  reading: iotData.reading,
  timestamp: iotData.timestamp
};

// Verify
const isValid = bsvService.verifyDataIntegrity(
  originalData,
  iotData.dataHash
);

if (isValid) {
  console.log('Data integrity verified!');
} else {
  console.log('Warning: Data may have been tampered with!');
}
```

## Benefits of BSV Integration

1. **Immutability**: Once recorded, data cannot be altered
2. **Transparency**: All transactions are publicly verifiable
3. **Trust**: Customers can verify their job reports
4. **Compliance**: Water board can audit data with customer consent
5. **Proof of Service**: Timestamped proof of work completion
6. **Data Integrity**: Cryptographic verification of all data

## Additional Resources

- [BSV Documentation](https://docs.bitcoinsv.io/)
- [BSV JavaScript Library](https://github.com/moneybutton/bsv)
- [BSV Block Explorer](https://whatsonchain.com/)
