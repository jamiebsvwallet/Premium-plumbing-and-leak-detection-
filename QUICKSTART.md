# Quick Start Guide

## Getting Started in 5 Minutes

### Step 1: Install Dependencies

Install backend dependencies:
```bash
npm install
```

Install client dependencies:
```bash
cd client
npm install
cd ..
```

### Step 2: Set Up Environment

Copy the example environment file:
```bash
cp .env.example .env
```

For quick testing, create a minimal `.env` file:
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/plumbing-leak-detection
JWT_SECRET=your_secret_key_change_this
BSV_NETWORK=testnet
CORS_ORIGIN=http://localhost:3000
```

### Step 3: Start MongoDB

Make sure MongoDB is running. If you have Docker:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

Or start your local MongoDB service:
```bash
# On Ubuntu/Debian
sudo systemctl start mongodb

# On macOS with Homebrew
brew services start mongodb-community
```

### Step 4: Start the Backend

```bash
npm start
```

The server will start on http://localhost:5000

### Step 5: Start the Frontend

In a new terminal:
```bash
cd client
npm start
```

The application will open at http://localhost:3000

## First Time Usage

1. **Register an Account**
   - Navigate to http://localhost:3000
   - Click "Register"
   - Fill in your details
   - A BSV address will be automatically generated for you

2. **Explore the Dashboard**
   - View your BSV address
   - Check job reports
   - Manage IoT devices
   - Configure consent settings

3. **Register an IoT Device** (as customer)
   - Go to "IoT Devices" tab
   - Note: You'll need to use the API directly for now
   - Use curl or Postman to POST to `/api/iot/register`

4. **Test IoT Data Recording**
   - Send data via API to `/api/iot/data`
   - Data will be hashed and recorded
   - Check blockchain transaction ID in response

## API Testing with curl

### Register a user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the token from the response for authenticated requests.

### Register an IoT device:
```bash
curl -X POST http://localhost:5000/api/iot/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "deviceId": "SENSOR-001",
    "deviceName": "Kitchen Leak Sensor",
    "deviceType": "leak-sensor",
    "location": {
      "room": "Kitchen"
    }
  }'
```

### Record IoT data:
```bash
curl -X POST http://localhost:5000/api/iot/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "deviceId": "DEVICE_ID_FROM_REGISTRATION",
    "reading": {
      "value": 2.5,
      "unit": "liters/min",
      "type": "flow"
    },
    "alert": false
  }'
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check the connection string in `.env`
- Default: `mongodb://localhost:27017/plumbing-leak-detection`

### Port Already in Use
- Change `PORT` in `.env` for backend
- Frontend runs on port 3000 by default

### CORS Issues
- Ensure `CORS_ORIGIN` in `.env` matches your frontend URL
- Default: `http://localhost:3000`

### Authentication Errors
- Make sure you include the JWT token in the Authorization header
- Format: `Bearer YOUR_TOKEN_HERE`

## Next Steps

- Explore the heat map visualization
- Try the digital twin 3D view
- Play the plumbing game
- Configure consent settings for data sharing
- View BSV blockchain transaction IDs for your data

## Production Deployment

See the main README.md for production deployment instructions.
