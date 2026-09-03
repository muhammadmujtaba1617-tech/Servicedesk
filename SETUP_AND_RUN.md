# ServiceDesk Application - Complete Setup & Run Guide

## 📋 Current Status

- **Frontend**: Ready (can run with demo data fallback)
- **Backend**: Waiting for MongoDB connection
- **Database**: Requires setup (MongoDB local OR Atlas cloud)

---

## 🚀 Quick Start Options

### Option A: Demo Mode (No Database Setup Required)
Perfect for UI/UX testing without backend

```bash
cd frontend
npm run dev
```

Then open http://localhost:5173 and log in with:
- Email: `admin@example.com`
- Password: `password`

**Note**: You'll see demo data only (no real data persistence)

---

### Option B: Full Setup with MongoDB (Recommended for Complete Testing)

#### Step 1: Set Up MongoDB

Choose ONE of these:

**A1. MongoDB Atlas (Cloud - Recommended)**
- Go to https://www.mongodb.com/cloud/atlas
- Create free account
- Create M0 free cluster
- Get connection string
- Update `.env` in `servicedesk/backend/`:
  ```
  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/servicedesk
  ```

**A2. Local MongoDB**
- Download: https://www.mongodb.com/try/download/community
- Install and run
- Default: `mongodb://localhost:27017/servicedesk` (already in `.env`)

**A3. Docker MongoDB**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Step 2: Install Backend Dependencies
```bash
cd servicedesk/backend
npm install
```

#### Step 3: Start Backend
```bash
cd servicedesk/backend
npm run dev
```

You should see:
```
MongoDB connected successfully
ServiceDesk API running on port 3000
```

#### Step 4: Start Frontend (in new terminal)
```bash
cd frontend
npm run dev
```

#### Step 5: Open Application
- Frontend: http://localhost:5173
- API Health: http://localhost:3000/api/v1/health

---

## 🧪 Manual Browser Testing

### Test Scenarios:

#### 1. **Authentication Flow**
- Navigate to Login page
- Try demo credentials:
  - Admin: `admin@example.com` / `password`
  - Agent: `agent@example.com` / `password`
  - Customer: `customer@example.com` / `password`
- Verify login success and redirect to dashboard

#### 2. **Dashboard (Admin View)**
- After login as admin, dashboard shows:
  - Total tickets count
  - Average resolution time
  - Customer satisfaction rate
  - Recent tickets

#### 3. **Ticket Management**
- Click "Tickets" in sidebar
- View ticket list
- Create new ticket (if backend is running)
- Update ticket status
- Add comments

#### 4. **User Management (Admin Only)**
- Click "Users" in sidebar
- View all users
- Update user roles

#### 5. **Reports & Analytics**
- Click "Analytics" in sidebar
- View support metrics
- View SLA policies

#### 6. **Role-Based Access**
- Test each role to verify page access:
  - Admin: Can access all pages
  - Agent: Can access tickets, analytics, profile
  - Customer: Can access own tickets, profile

---

## 🔧 Environment Variables (.env)

Located in: `servicedesk/backend/.env`

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/servicedesk

# Server
PORT=3000
CLIENT_URL=http://localhost:5173

# JWT Secret (change for production!)
JWT_SECRET=your_jwt_secret_key_here_change_in_production
```

---

## 📊 Project Architecture

```
Frontend (React + Vite)
    ↓ (HTTP Requests)
API Gateway (Express.js Port 3000)
    ↓
Middleware (CORS, Auth)
    ↓
Routes (authRoutes, ticketRoutes, etc.)
    ↓
Controllers (Request Handlers)
    ↓
Services (Business Logic)
    ↓
Repositories (Data Access)
    ↓
Models (Mongoose Schemas)
    ↓
MongoDB Database
```

---

## 📝 API Endpoints Reference

### Authentication
- `POST /api/v1/auth/register` - Create new account
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user (requires auth)

### Tickets
- `GET /api/v1/tickets` - List tickets
- `POST /api/v1/tickets` - Create ticket
- `PUT /api/v1/tickets/:id` - Update ticket
- `GET /api/v1/tickets/:id` - Get ticket details

### Dashboard
- `GET /api/v1/dashboard` - Get dashboard summary

### Users
- `GET /api/v1/users` - List users (admin only)
- `PUT /api/v1/users/:id` - Update user role (admin only)

### Analytics
- `GET /api/v1/analytics` - Get analytics summary

### Reports
- `GET /api/v1/audit-logs` - Get audit logs (admin only)
- `GET /api/v1/sla` - Get SLA policies

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Frontend won't start | Run `npm install` in `frontend/` folder |
| Backend won't connect | MongoDB not running - follow Option B Step 1 |
| Port 3000 already in use | Change PORT in `.env` or kill process using port |
| Port 5173 already in use | Frontend will auto-increment to 5174, etc. |
| CORS errors | Check `CLIENT_URL` in `.env` matches frontend URL |
| Login not working | Backend must be running with MongoDB connected |

---

## 📚 File Structure

```
ServiceDesk/
├── frontend/                 # React Vite app
│   ├── src/
│   │   ├── pages/           # Dashboard, Tickets, Users, etc.
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # Auth context
│   │   └── services/        # API client
│   └── package.json
│
└── servicedesk/
    └── backend/             # Express.js API
        ├── src/
        │   ├── models/      # Mongoose schemas
        │   ├── routes/      # API routes
        │   ├── controllers/ # Request handlers
        │   ├── services/    # Business logic
        │   ├── repositories/# Data access
        │   ├── middleware/  # Auth, validation
        │   └── config/      # Database config
        ├── server.js        # Entry point
        └── package.json
```

---

## ✅ Success Checklist

- [ ] MongoDB is running (local or Atlas)
- [ ] Backend started: `npm run dev`
- [ ] Backend logs show: "MongoDB connected successfully"
- [ ] Frontend started: `npm run dev`
- [ ] Frontend loads at http://localhost:5173
- [ ] Can login with demo credentials
- [ ] Dashboard displays data
- [ ] Can navigate to all pages based on role

---

## 🎯 Next Steps

1. **Set up MongoDB** (see MongoDB_SETUP.md for details)
2. **Start backend**: `npm run dev`
3. **Start frontend**: `npm run dev`
4. **Test flows** using checklist above
5. **Review SRS**: Check SAAS/ServiceDesk/SRS-Traceability.md for requirements

---

Need help? Refer to individual setup files:
- MongoDB Setup: See `MONGODB_SETUP.md`
- Architecture: See project folders and comments in code
- SRS Coverage: See `SRS-Traceability.md`
