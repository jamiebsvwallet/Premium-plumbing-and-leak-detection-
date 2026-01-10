# API Testing Examples

## cURL Examples

### 1. Sign Up

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "name": "Test User",
    "role": "CUSTOMER"
  }' \
  -c cookies.txt
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPass123"
  }' \
  -c cookies.txt
```

### 3. Register Device

```bash
curl -X POST http://localhost:3000/api/devices/register \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Kitchen Leak Detector",
    "type": "Leak Sensor",
    "location": "Kitchen, Floor 1"
  }'
```

### 4. Ingest IoT Event

```bash
curl -X POST http://localhost:3001/api/events/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "YOUR_DEVICE_ID",
    "timestamp": "2024-01-10T10:30:00Z",
    "metrics": {
      "temperature": 22.5,
      "pressure": 2.8,
      "flowRate": 12.3,
      "humidity": 65,
      "vibration": 3.2
    },
    "alertType": "HIGH_PRESSURE"
  }'
```

## Testing Workflow

1. Sign up or login to get authentication cookie
2. Register a device and note the device ID
3. Send IoT events using the simulator or curl
4. Check database to verify events are persisted
5. Monitor Socket.IO connection in browser
6. Run anchor worker to process pending events
7. Verify BSV transaction IDs are added to events
