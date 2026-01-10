#!/bin/bash

# Test script for Premium Plumbing MVP
# This script validates the complete workflow

set -e

echo "═══════════════════════════════════════════════════════"
echo "  Premium Plumbing MVP - Integration Test"
echo "═══════════════════════════════════════════════════════"
echo ""

API_URL="http://localhost:3000"
TOKEN=""
USER_ID=""
DEVICE_ID="TEST-DEVICE-001"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

success() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check if server is running
info "Checking if server is running..."
if ! curl -s "$API_URL" > /dev/null 2>&1; then
    error "Server not running at $API_URL. Please start it with: npm run dev"
fi
success "Server is running"

# Test 1: User signup
info "Testing user signup..."
SIGNUP_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/signup" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "test-'$(date +%s)'@example.com",
        "password": "TestPass123",
        "name": "Test User",
        "role": "customer"
    }')

if echo "$SIGNUP_RESPONSE" | grep -q '"token"'; then
    TOKEN=$(echo "$SIGNUP_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    USER_ID=$(echo "$SIGNUP_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    success "User signup successful"
else
    error "User signup failed: $SIGNUP_RESPONSE"
fi

# Test 2: Login with test credentials
info "Testing login with existing user..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "customer@example.com",
        "password": "Customer123"
    }')

if echo "$LOGIN_RESPONSE" | grep -q '"token"'; then
    success "Login successful"
else
    error "Login failed: $LOGIN_RESPONSE"
fi

# Test 3: Register a device
info "Registering device..."
DEVICE_RESPONSE=$(curl -s -X POST "$API_URL/api/devices/register" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "deviceId": "'$DEVICE_ID'",
        "name": "Test Leak Detector",
        "type": "leak-detector"
    }')

if echo "$DEVICE_RESPONSE" | grep -q '"device"'; then
    success "Device registered successfully"
else
    error "Device registration failed: $DEVICE_RESPONSE"
fi

# Test 4: Ingest an event
info "Ingesting device event..."
EVENT_RESPONSE=$(curl -s -X POST "$API_URL/api/events/ingest" \
    -H "Content-Type: application/json" \
    -d '{
        "deviceId": "'$DEVICE_ID'",
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
        "metrics": {
            "flow": 5.2,
            "pressure": 45.3,
            "temperature": 22.1,
            "humidity": 55.0
        },
        "alertType": null
    }')

if echo "$EVENT_RESPONSE" | grep -q '"eventHash"'; then
    EVENT_HASH=$(echo "$EVENT_RESPONSE" | grep -o '"eventHash":"[^"]*"' | cut -d'"' -f4)
    success "Event ingested successfully (Hash: ${EVENT_HASH:0:16}...)"
else
    error "Event ingestion failed: $EVENT_RESPONSE"
fi

# Test 5: Ingest a leak event
info "Ingesting leak alert event..."
LEAK_RESPONSE=$(curl -s -X POST "$API_URL/api/events/ingest" \
    -H "Content-Type: application/json" \
    -d '{
        "deviceId": "'$DEVICE_ID'",
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
        "metrics": {
            "flow": 150.0,
            "pressure": 15.2,
            "temperature": 22.1,
            "humidity": 85.0
        },
        "alertType": "leak"
    }')

if echo "$LEAK_RESPONSE" | grep -q '"eventHash"'; then
    success "Leak event ingested successfully"
else
    error "Leak event ingestion failed: $LEAK_RESPONSE"
fi

# Test 6: Query events
info "Querying device events..."
QUERY_RESPONSE=$(curl -s "$API_URL/api/events/query?deviceId=$DEVICE_ID" \
    -H "Authorization: Bearer $TOKEN")

if echo "$QUERY_RESPONSE" | grep -q '"events"'; then
    EVENT_COUNT=$(echo "$QUERY_RESPONSE" | grep -o '"id"' | wc -l)
    success "Events queried successfully ($EVENT_COUNT events found)"
else
    error "Event query failed: $QUERY_RESPONSE"
fi

# Test 7: List devices
info "Listing user devices..."
DEVICES_RESPONSE=$(curl -s "$API_URL/api/devices/register" \
    -H "Authorization: Bearer $TOKEN")

if echo "$DEVICES_RESPONSE" | grep -q '"devices"'; then
    DEVICE_COUNT=$(echo "$DEVICES_RESPONSE" | grep -o '"deviceId"' | wc -l)
    success "Devices listed successfully ($DEVICE_COUNT devices)"
else
    error "Device listing failed: $DEVICES_RESPONSE"
fi

# Test 8: Check authentication middleware
info "Testing authentication middleware..."
UNAUTH_RESPONSE=$(curl -s -w "%{http_code}" "$API_URL/api/devices/register" -o /dev/null)

if [ "$UNAUTH_RESPONSE" = "401" ]; then
    success "Authentication middleware working correctly"
else
    error "Authentication middleware not working (expected 401, got $UNAUTH_RESPONSE)"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo -e "${GREEN}All tests passed!${NC}"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "1. Run the IoT simulator: npm run iot-simulate"
echo "2. Open http://localhost:3000 in your browser"
echo "3. Login with: customer@example.com / Customer123"
echo "4. View your device in the dashboard"
echo "5. Access Digital Twin at: http://localhost:3000/digital-twin/$DEVICE_ID"
echo "6. Access AR View at: http://localhost:3000/ar-diagnostics/$DEVICE_ID"
echo ""
