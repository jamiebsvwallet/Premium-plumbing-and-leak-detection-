# API Testing with curl

This file contains curl commands to test all API endpoints.

## Authentication

### Signup (Create new customer account)
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123",
    "role": "customer"
  }'
```

### Login (Customer)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "DemoPass123"
  }'
```

### Login (Admin/Operator)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPass123"
  }'
```

### Get Current User
```bash
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## Device Management

### Register a Device
```bash
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:3000/api/devices/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "deviceId": "DEVICE-001",
    "name": "Kitchen Sink Sensor",
    "type": "leak_sensor",
    "metadata": {
      "location": "Kitchen",
      "floor": "1"
    }
  }'
```

### List User's Devices
```bash
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:3000/api/devices/register \
  -H "Authorization: Bearer $TOKEN"
```

## IoT Event Ingestion

### Send a Normal Event
```bash
curl -X POST http://localhost:3000/api/events/ingest \
  -H "Content-Type: application/json" \
  -d "{
    \"deviceId\": \"DEVICE-001\",
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\",
    \"metrics\": {
      \"waterFlow\": 8.5,
      \"pressure\": 45.2,
      \"temperature\": 20.1,
      \"batteryLevel\": 95
    },
    \"alertType\": null,
    \"rawPayload\": {
      \"sensorId\": \"DEVICE-001\",
      \"firmwareVersion\": \"1.0.0\",
      \"signalStrength\": 85
    }
  }"
```

### Send a Leak Alert Event
```bash
curl -X POST http://localhost:3000/api/events/ingest \
  -H "Content-Type: application/json" \
  -d "{
    \"deviceId\": \"DEVICE-001\",
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\",
    \"metrics\": {
      \"waterFlow\": 75.5,
      \"pressure\": 22.1,
      \"temperature\": 20.1,
      \"batteryLevel\": 95
    },
    \"alertType\": \"leak_detected\",
    \"rawPayload\": {
      \"sensorId\": \"DEVICE-001\",
      \"firmwareVersion\": \"1.0.0\",
      \"signalStrength\": 85
    }
  }"
```

### List Device Events
```bash
TOKEN="your-jwt-token-here"

curl -X GET "http://localhost:3000/api/events/list?deviceId=DEVICE-001" \
  -H "Authorization: Bearer $TOKEN"
```

## Consent Management

### Grant Consent to Operator
```bash
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:3000/api/consents/manage \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "operatorEmail": "admin@example.com",
    "granted": true,
    "scope": "device_events"
  }'
```

### List User's Consents
```bash
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:3000/api/consents/manage \
  -H "Authorization: Bearer $TOKEN"
```

### Revoke Consent
```bash
TOKEN="your-jwt-token-here"

curl -X DELETE http://localhost:3000/api/consents/manage \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "operatorId": "operator-user-id-here"
  }'
```

## Job Reports (Operator Only)

### Create Job Report
```bash
ADMIN_TOKEN="admin-jwt-token-here"

curl -X POST http://localhost:3000/api/job-reports/manage \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "userEmail": "customer@example.com",
    "deviceId": "DEVICE-001",
    "title": "Leak Repair - Kitchen Sink",
    "description": "Fixed leak under kitchen sink. Replaced pipe gasket.",
    "reportData": {
      "technicianName": "John Doe",
      "partsReplaced": ["Gasket", "Seal"],
      "laborHours": 2
    }
  }'
```

### List Job Reports
```bash
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:3000/api/job-reports/manage \
  -H "Authorization: Bearer $TOKEN"
```

## Admin Operations

### Process Pending BSV Anchors
```bash
ADMIN_TOKEN="admin-jwt-token-here"

curl -X POST http://localhost:3000/api/admin/process-anchors \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Testing Workflow

### 1. Complete Test Flow (Customer Journey)

```bash
# Step 1: Login as customer
CUSTOMER_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"DemoPass123"}' \
  | jq -r '.token')

echo "Customer Token: $CUSTOMER_TOKEN"

# Step 2: Register a device
curl -X POST http://localhost:3000/api/devices/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d '{
    "deviceId": "TEST-DEVICE-001",
    "name": "Test Sensor",
    "type": "leak_sensor"
  }'

# Step 3: Send an event
curl -X POST http://localhost:3000/api/events/ingest \
  -H "Content-Type: application/json" \
  -d "{
    \"deviceId\": \"TEST-DEVICE-001\",
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\",
    \"metrics\": {
      \"waterFlow\": 8.5,
      \"pressure\": 45.2,
      \"temperature\": 20.1,
      \"batteryLevel\": 95
    },
    \"alertType\": null,
    \"rawPayload\": {}
  }"

# Step 4: List events
curl -X GET "http://localhost:3000/api/events/list?deviceId=TEST-DEVICE-001" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN"

# Step 5: Grant consent to admin
curl -X POST http://localhost:3000/api/consents/manage \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d '{"operatorEmail":"admin@example.com","granted":true}'
```

### 2. Complete Test Flow (Admin Journey)

```bash
# Step 1: Login as admin
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"AdminPass123"}' \
  | jq -r '.token')

echo "Admin Token: $ADMIN_TOKEN"

# Step 2: Process BSV anchors
curl -X POST http://localhost:3000/api/admin/process-anchors \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Step 3: Create a job report
curl -X POST http://localhost:3000/api/job-reports/manage \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "userEmail": "customer@example.com",
    "deviceId": "TEST-DEVICE-001",
    "title": "Test Repair",
    "description": "Test job report"
  }'

# Step 4: List all job reports
curl -X GET http://localhost:3000/api/job-reports/manage \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Notes

- Replace `http://localhost:3000` with your actual API URL
- Replace `your-jwt-token-here` with actual JWT tokens from login responses
- All timestamps are in ISO 8601 format (UTC)
- Use `jq` for pretty JSON output: `curl ... | jq`
- For testing, you can use the demo accounts:
  - Customer: customer@example.com / DemoPass123
  - Admin: admin@example.com / AdminPass123
