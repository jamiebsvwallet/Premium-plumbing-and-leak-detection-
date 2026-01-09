# API Testing Guide

## Using curl for API Testing

### Setup
```bash
# Set API URL
API_URL="http://localhost:5000/api"

# Store your token after login
TOKEN="your_jwt_token_here"
```

## Authentication Tests

### 1. Register a New Customer
```bash
curl -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "password": "securepass123"
  }'
```

Expected Response:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "alice@example.com",
    "name": "Alice Johnson",
    "bsvAddress": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    "role": "customer"
  }
}
```

### 2. Login
```bash
curl -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "securepass123"
  }'
```

Save the token from response for subsequent requests.

## User Profile Tests

### 3. Get User Profile
```bash
curl -X GET $API_URL/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Update Consent Settings
```bash
curl -X PUT $API_URL/users/consent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "shareWithCompany": true,
    "shareWithWaterBoard": false
  }'
```

## IoT Device Tests

### 5. Register IoT Device
```bash
curl -X POST $API_URL/iot/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "deviceId": "LEAK-SENSOR-001",
    "deviceName": "Kitchen Leak Sensor",
    "deviceType": "leak-sensor",
    "location": {
      "room": "Kitchen",
      "coordinates": {
        "lat": 51.5074,
        "lng": -0.1278
      }
    }
  }'
```

Save the device `_id` from the response.

### 6. Get All My Devices
```bash
curl -X GET $API_URL/iot/my-devices \
  -H "Authorization: Bearer $TOKEN"
```

### 7. Record IoT Data - Normal Reading
```bash
curl -X POST $API_URL/iot/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "deviceId": "507f1f77bcf86cd799439011",
    "reading": {
      "value": 2.5,
      "unit": "liters/min",
      "type": "flow_rate"
    },
    "alert": false
  }'
```

### 8. Record IoT Data - Leak Alert
```bash
curl -X POST $API_URL/iot/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "deviceId": "507f1f77bcf86cd799439011",
    "reading": {
      "value": 1,
      "unit": "boolean",
      "type": "leak_detected"
    },
    "alert": true,
    "alertMessage": "Leak detected in kitchen!"
  }'
```

### 9. Get Device Data History
```bash
curl -X GET "$API_URL/iot/data/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer $TOKEN"
```

### 10. Get Heatmap Data
```bash
curl -X GET $API_URL/iot/heatmap/data \
  -H "Authorization: Bearer $TOKEN"
```

## Job Report Tests (Admin Only)

First, you need an admin account. Manually update a user in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### 11. Create Job Report
```bash
curl -X POST $API_URL/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "customerId": "507f1f77bcf86cd799439011",
    "jobTitle": "Emergency Leak Repair",
    "description": "Fixed major leak in bathroom pipe",
    "technician": "Bob Smith",
    "location": {
      "address": "123 Main St, London",
      "coordinates": {
        "lat": 51.5074,
        "lng": -0.1278
      }
    }
  }'
```

### 12. Complete Job Report
```bash
curl -X PUT "$API_URL/jobs/507f1f77bcf86cd799439012/complete" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

This will:
- Mark job as completed
- Generate data hash
- Create BSV transaction
- Send report to customer's BSV address

### 13. Get All Jobs (Admin)
```bash
curl -X GET $API_URL/jobs \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 14. Get My Jobs (Customer)
```bash
curl -X GET $API_URL/jobs/my-jobs \
  -H "Authorization: Bearer $TOKEN"
```

## Testing Data Flow

### Complete Customer Journey

1. **Customer registers** → Gets BSV address
2. **Customer registers IoT device** → Device linked to account
3. **Device sends data** → Data hashed and recorded on BSV
4. **Customer enables consent** → Future data shared with company/water board
5. **Plumber completes job** → Job report sent to customer's BSV address
6. **Customer views dashboard** → Sees all data with blockchain verification

### Testing Consent Management

1. Register customer
2. Register device
3. Send data with consent OFF:
```bash
# Data only goes to customer
```

4. Update consent to share with company:
```bash
curl -X PUT $API_URL/users/consent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"shareWithCompany": true}'
```

5. Send data with consent ON:
```bash
# Data now goes to customer AND company
# Check response: "sharedWith": ["company"]
```

## Using the IoT Simulator

After setting up devices, use the simulator for continuous testing:

```bash
# Get your token and device ID first
TOKEN="eyJhbGciOiJIUzI1NiIs..."
DEVICE_ID="507f1f77bcf86cd799439011"

# Run simulator
node iot-simulator.js $TOKEN $DEVICE_ID
```

This will:
- Send data every 5 seconds
- Randomly generate readings based on device type
- Show BSV transaction IDs
- Alert when leaks are detected

## Verification Tests

### Verify Data Integrity

1. Record data and note the hash:
```bash
# Response includes: "dataHash": "a1b2c3..."
```

2. Later, retrieve the data:
```bash
curl -X GET "$API_URL/iot/data/DEVICE_ID" \
  -H "Authorization: Bearer $TOKEN"
```

3. Verify the hash matches the original data

### Verify BSV Transactions

1. Note transaction IDs from responses
2. Check on BSV block explorer:
   - Testnet: https://test.whatsonchain.com/
   - Mainnet: https://whatsonchain.com/

## Error Testing

### Invalid Authentication
```bash
curl -X GET $API_URL/users/profile \
  -H "Authorization: Bearer invalid_token"
```

Expected: 401 Unauthorized

### Missing Required Fields
```bash
curl -X POST $API_URL/iot/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "deviceName": "Test Device"
  }'
```

Expected: 500 with validation error

### Access Control
```bash
# Customer trying to access admin endpoint
curl -X GET $API_URL/jobs \
  -H "Authorization: Bearer $CUSTOMER_TOKEN"
```

Expected: 403 Forbidden

## Load Testing

Use tools like Apache Bench or wrk for load testing:

```bash
# Install apache bench
sudo apt-get install apache2-utils

# Test login endpoint
ab -n 100 -c 10 -p login.json -T application/json \
  http://localhost:5000/api/auth/login
```

## Automated Testing Script

Create a test script `test-api.sh`:

```bash
#!/bin/bash
set -e

API_URL="http://localhost:5000/api"

echo "Testing Premium Plumbing API..."

# Test 1: Register
echo "1. Testing registration..."
RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}')
TOKEN=$(echo $RESPONSE | jq -r '.token')
echo "✓ Registration successful"

# Test 2: Login
echo "2. Testing login..."
curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}' > /dev/null
echo "✓ Login successful"

# Test 3: Get Profile
echo "3. Testing profile fetch..."
curl -s -X GET $API_URL/users/profile \
  -H "Authorization: Bearer $TOKEN" > /dev/null
echo "✓ Profile fetch successful"

echo "All tests passed!"
```

Run with: `bash test-api.sh`
