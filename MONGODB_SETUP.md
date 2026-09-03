# MongoDB Setup Guide for ServiceDesk

## Option 1: MongoDB Atlas (Recommended for Quick Start - Cloud Database)

### Steps:
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account (no credit card needed)
3. Create a free M0 cluster
4. Click "Connect" → "Drivers" → "Node.js"
5. Copy the connection string
6. In `.env` file, replace the MONGODB_URI with your connection string:
   ```
   MONGODB_URI=mongodb+srv://yourUsername:yourPassword@yourCluster.mongodb.net/servicedesk
   ```
7. Restart the backend: `npm run dev`

**Time to setup: 5-10 minutes**

---

## Option 2: Local MongoDB Installation

### On Windows:

#### Using MongoDB Community Edition Installer:
1. Download MongoDB Community Edition from: https://www.mongodb.com/try/download/community
2. Run the installer (`.msi` file)
3. Choose "Install MongoDB as a Service" during installation
4. Complete the installation
5. MongoDB will start automatically on `localhost:27017`
6. The `.env` file already points to `mongodb://localhost:27017/servicedesk`
7. Restart the backend: `npm run dev`

#### Using Windows Subsystem for Linux (WSL) + apt:
```bash
wsl
sudo apt update
sudo apt install -y mongodb
sudo systemctl start mongodb
```

#### Using Docker (if Docker is installed):
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Time to setup: 10-15 minutes**

---

## Verify MongoDB Connection

Once you've set up MongoDB, restart the backend:
```bash
cd servicedesk\backend
npm run dev
```

You should see:
```
MongoDB connected successfully
ServiceDesk API running on port 3000
```

If you see `MongoDB connection error`, check:
1. Is your connection string correct in `.env`?
2. Is MongoDB running?
3. Is the database accessible (firewall/network)?

---

## Testing the Application

Once MongoDB is running and backend is connected:

1. **Frontend**: Open http://localhost:5173
2. **Login** with demo credentials:
   - Admin: `admin@example.com` / `password`
   - Agent: `agent@example.com` / `password`
   - Customer: `customer@example.com` / `password`

3. **API Health Check**: Open http://localhost:3000/api/v1/health
   - Should return: `{ "success": true, "message": "ServiceDesk API is running" }`

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| `ECONNREFUSED ::1:27017` | MongoDB not running locally. Use Atlas or install local MongoDB. |
| `querySrv ENOTFOUND` | Invalid Atlas connection string. Copy it directly from your cluster settings. |
| `MongoNetworkError` | Firewall blocking connection. Check network settings or IP whitelist in Atlas. |
| `Authentication failed` | Wrong username/password in connection string. |

---

## Quick Recommendation

For development and testing purposes, **MongoDB Atlas is recommended** because:
- ✅ No local installation required
- ✅ Free tier (512 MB storage)
- ✅ Accessible from anywhere
- ✅ Automatic backups
- ✅ 5-minute setup

For production, consider:
- Self-hosted MongoDB with proper security
- MongoDB Atlas paid tier with better resources
- Other database alternatives
