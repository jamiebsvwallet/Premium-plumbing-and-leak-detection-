# API Examples

This file contains curl examples for testing the Premium Plumbing API.

## Setup

```bash
# Set your API URL
export API_URL="http://localhost:3000"

# Or for production
export API_URL="https://your-app.vercel.app"
```

## Authentication

### Sign Up

```bash
curl -X POST "$API_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "SecurePass123",
    "name": "John Doe",
    "role": "customer"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxxx",
    "email": "customer@example.com",
    "name": "John Doe",
    "role": "customer"
  }
}
```

### Login

```bash
curl -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "SecurePass123"
  }'
```

### Get Current User

```bash
curl -X GET "$API_URL/api/auth/me" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Device Management

### Register Device

```bash
export TOKEN="your-jwt-token-here"

curl -X POST "$API_URL/api/devices/register" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "LEAK-001",
    "name": "Kitchen Leak Detector",
    "type": "leak-detector"
  }'
```

### List Devices

```bash
curl -X GET "$API_URL/api/devices/register" \
  -H "Authorization: Bearer $TOKEN"
```

## Event Ingestion

### Send Normal Event

```bash
curl -X POST "$API_URL/api/events/ingest" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "LEAK-001",
    "timestamp": "2024-01-10T12:00:00Z",
    "metrics": {
      "flow": 5.2,
      "pressure": 45.3,
      "temperature": 22.1,
      "humidity": 55.0
    },
    "alertType": null
  }'
```

### Send Leak Alert

```bash
curl -X POST "$API_URL/api/events/ingest" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "LEAK-001",
    "timestamp": "2024-01-10T12:05:00Z",
    "metrics": {
      "flow": 150.0,
      "pressure": 15.2,
      "temperature": 22.1,
      "humidity": 85.0
    },
    "alertType": "leak"
  }'
```

### Query Events

```bash
curl -X GET "$API_URL/api/events/query?deviceId=LEAK-001&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

With pagination:
```bash
curl -X GET "$API_URL/api/events/query?deviceId=LEAK-001&limit=10&offset=20" \
  -H "Authorization: Bearer $TOKEN"
```

## Consent Management

### Grant Consent to Operator

```bash
curl -X POST "$API_URL/api/consents/manage" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "operatorId": "operator-user-id",
    "granted": true
  }'
```

### List Consents

```bash
curl -X GET "$API_URL/api/consents/manage" \
  -H "Authorization: Bearer $TOKEN"
```

### Revoke Consent

```bash
curl -X DELETE "$API_URL/api/consents/manage" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "operatorId": "operator-user-id"
  }'
```

### List Available Operators

```bash
curl -X GET "$API_URL/api/consents/operators" \
  -H "Authorization: Bearer $TOKEN"
```

## Job Reports (Operator Only)

### Create Job Report

```bash
curl -X POST "$API_URL/api/reports/manage" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Leak Repair - Kitchen",
    "description": "Repaired leak in kitchen pipe. Replaced faulty valve.",
    "userId": "customer-user-id",
    "deviceId": "device-id-optional",
    "status": "completed"
  }'
```

### List Job Reports

```bash
curl -X GET "$API_URL/api/reports/manage" \
  -H "Authorization: Bearer $TOKEN"
```

## Admin Operations (Operator Only)

### Process Blockchain Anchors

```bash
curl -X POST "$API_URL/api/admin/anchors" \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "processed": 5,
  "results": [
    {
      "anchorId": "clxxx",
      "eventHash": "abc123...",
      "txId": "mock-tx-xxx",
      "status": "pending"
    }
  ]
}
```

### List Blockchain Anchors

```bash
curl -X GET "$API_URL/api/admin/anchors" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Specific Anchor

```bash
curl -X GET "$API_URL/api/admin/anchors?eventId=event-id" \
  -H "Authorization: Bearer $TOKEN"
```

## Batch Testing Script

Save this as `test-api.sh`:

```bash
#!/bin/bash

API_URL="http://localhost:3000"

# 1. Sign up
echo "1. Creating account..."
SIGNUP=$(curl -s -X POST "$API_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-'$(date +%s)'@example.com",
    "password": "Test123",
    "name": "Test User",
    "role": "customer"
  }')

TOKEN=$(echo $SIGNUP | jq -r '.token')
echo "Token: ${TOKEN:0:20}..."

# 2. Register device
echo "2. Registering device..."
curl -s -X POST "$API_URL/api/devices/register" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "TEST-'$(date +%s)'",
    "name": "Test Device",
    "type": "leak-detector"
  }' | jq

# 3. Send events
echo "3. Sending events..."
for i in {1..3}; do
  curl -s -X POST "$API_URL/api/events/ingest" \
    -H "Content-Type: application/json" \
    -d '{
      "deviceId": "TEST-'$(date +%s)'",
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
      "metrics": {
        "flow": '$((RANDOM % 10 + 1))',
        "pressure": '$((RANDOM % 20 + 30))',
        "temperature": '$((RANDOM % 10 + 15))',
        "humidity": '$((RANDOM % 30 + 40))'
      }
    }' | jq
  sleep 1
done

echo "Done!"
```

## Postman Collection

To import into Postman:

1. Create a new collection: "Premium Plumbing API"
2. Set up environment variables:
   - `api_url`: `http://localhost:3000`
   - `token`: (will be set after login)
3. Add the above requests
4. Use `{{api_url}}` and `{{token}}` variables

## Testing with HTTPie

If you prefer HTTPie over curl:

```bash
# Install
pip install httpie

# Login
http POST $API_URL/api/auth/login email=customer@example.com password=Customer123

# Register device (with token)
http POST $API_URL/api/devices/register \
  "Authorization: Bearer $TOKEN" \
  deviceId=LEAK-001 \
  name="Kitchen Sensor" \
  type=leak-detector

# Send event
http POST $API_URL/api/events/ingest \
  deviceId=LEAK-001 \
  timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ) \
  metrics:='{"flow":5.2,"pressure":45.3,"temperature":22.1,"humidity":55.0}'
```

## WebSocket Testing

For testing Socket.IO connections:

```javascript
// In browser console or Node.js
const socket = io('http://localhost:3001', {
  auth: { token: 'your-jwt-token' }
});

socket.on('connect', () => {
  console.log('Connected!');
  socket.emit('subscribe-device', 'LEAK-001');
});

socket.on('subscribed', (data) => {
  console.log('Subscribed:', data);
});

socket.on('device-event', (data) => {
  console.log('New event:', data);
});
```

## Rate Limiting

Currently, the API does not implement rate limiting. For production, consider adding:

- Upstash Rate Limit
- Express rate limiter middleware
- Cloudflare rate limiting

## CORS

The API allows requests from `http://localhost:3000` by default. Update CORS settings in production.
