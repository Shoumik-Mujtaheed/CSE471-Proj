# Hospital Management System - Complete Setup Guide for New Device/Database

## Prerequisites

### Required Software
- **Node.js** (v16 or higher)
- **MongoDB** (v5 or higher)
- **Git** (for cloning the repository)
- **Code Editor** (VS Code recommended)

### System Requirements
- **RAM**: Minimum 4GB, Recommended 8GB
- **Storage**: At least 2GB free space
- **OS**: Windows 10/11, macOS 10.15+, or Ubuntu 18.04+

## Step 1: Environment Setup

### Install Node.js
1. Download from [nodejs.org](https://nodejs.org/)
2. Install with default settings
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Install MongoDB
1. **Windows**: Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. **macOS**: Use Homebrew: `brew install mongodb-community`
3. **Ubuntu**: Follow [MongoDB installation guide](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)
4. Start MongoDB service
5. Verify installation: `mongod --version`

### Install Git
1. Download from [git-scm.com](https://git-scm.com/)
2. Install with default settings
3. Verify: `git --version`

## Step 2: Project Setup

### Clone Repository
```bash
git clone <your-repository-url>
cd v3
```

### Install Dependencies
```bash
# Backend dependencies
cd server
npm install

# Frontend dependencies
cd ../client
npm install
```

## Step 3: Database Configuration

### Create Database
1. Start MongoDB service
2. Open MongoDB Compass or mongo shell
3. Create new database named `HospitalDB`

### Update Database Connection
1. Navigate to `server/config/database.js`
2. Verify connection string:
   ```javascript
   const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/HospitalDB';
   ```
3. Update if using different MongoDB instance or credentials

## Step 4: Initialize Database

### Run Initialization Scripts
```bash
cd server

# 1. Initialize Time Slots (creates 28 slots: 7 days × 4 time slots)
npm run init:time-slots

# 2. Create Admin User
npm run create:admin

# 3. Create Test Doctor User
node scripts/createDoctorUser.js

# 4. Create Test Patient User
node scripts/createPatientUser.js
```

### Verify Database Setup
```bash
# Check time slots
node scripts/checkTimeSlots.js

# Check admin users
node scripts/checkAdmins.js

# Check specific time slot
node scripts/checkSpecificTimeSlot.js
```

## Step 5: Environment Variables

### Create .env File
```bash
cd server
touch .env
```

### Add Environment Variables
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/HospitalDB

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d

# Optional: External Services
# EMAIL_SERVICE=gmail
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password
```

## Step 6: Start Application

### Start Backend Server
```bash
cd server
npm run dev
```
**Expected Output**: Server running on port 5000, Database connected successfully

### Start Frontend Application
```bash
cd client
npm run dev
```
**Expected Output**: Vite dev server running, usually on port 5173

## Step 7: Verify Setup

### Test Admin Access
1. Open browser: `http://localhost:5173/admin-login`
2. Login with: `admin2` / `admin2pass`
3. Should see admin dashboard with time slot management

### Test Doctor Access
1. Open: `http://localhost:5173/doctor-login`
2. Login with: `doctor12@gmail.com` / `doctor12`
3. Should see doctor dashboard with time slot request form

### Test Patient Access
1. Open: `http://localhost:5173/login`
2. Login with: `patient10@gmail.com` / `patient10`
3. Should see patient dashboard

## Step 8: Initial Workflow Test

### Complete Time Slot Workflow
1. **Doctor Request**: Login as doctor12, request time slots
2. **Admin Approval**: Login as admin2, approve pending requests
3. **Patient Booking**: Login as patient10, search for doctors, book appointment

## Troubleshooting

### Common Issues

#### MongoDB Connection Failed
```bash
# Check if MongoDB is running
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod

# Check connection string in database.js
```

#### Port Already in Use
```bash
# Check what's using port 5000
netstat -an | findstr :5000  # Windows
lsof -i :5000                 # macOS/Linux

# Kill process or change port in server.js
```

#### Module Not Found Errors
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### JWT Token Issues
```bash
# Check JWT_SECRET in .env
# Ensure it's a strong, unique string
# Restart server after changing .env
```

### Database Reset (If Needed)
```bash
cd server

# Drop and recreate database
node scripts/deleteTimeSlotCollections.js

# Reinitialize everything
npm run init:time-slots
npm run create:admin
node scripts/createDoctorUser.js
node scripts/createPatientUser.js
```

## Project Structure

```
v3/
├── server/                 # Backend Node.js/Express
│   ├── config/            # Database configuration
│   ├── controllers/       # Business logic
│   ├── middleware/        # Authentication middleware
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API endpoints
│   ├── scripts/           # Database scripts
│   └── server.js          # Main server file
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx        # Main app component
│   └── package.json
└── README.md
```

## API Endpoints

### Public Endpoints
- `GET /api/time-slots/available` - Get available time slots
- `GET /api/time-slots/doctor/:doctorId/available` - Get doctor's available slots

### Protected Endpoints (Require JWT)
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/time-slots/request` - Doctor request time slot
- `GET /api/time-slots/doctor/me` - Get current doctor's slots

### Admin Endpoints (Require Admin JWT)
- `GET /api/time-slots` - Get all time slots
- `PATCH /api/time-slots/:id/approve` - Approve time slot request
- `PATCH /api/time-slots/:id/reject` - Reject time slot request

## Development Workflow

### Making Changes
1. **Backend**: Edit files in `server/` folder
2. **Frontend**: Edit files in `client/src/` folder
3. **Database**: Use scripts in `server/scripts/` for data changes

### Testing Changes
1. **API Testing**: Use Postman or curl for backend testing
2. **Frontend Testing**: Browser dev tools for frontend debugging
3. **Database Testing**: MongoDB Compass or mongo shell

### Deployment Preparation
1. Set `NODE_ENV=production` in .env
2. Update MongoDB connection for production
3. Set strong JWT_SECRET
4. Configure CORS for production domain

## Support

### Logs and Debugging
- **Backend**: Check console output and server logs
- **Frontend**: Check browser console and network tab
- **Database**: Use MongoDB Compass for data inspection

### Useful Commands
```bash
# Check running processes
netstat -an | findstr :5000    # Windows
lsof -i :5000                  # macOS/Linux

# Monitor logs
npm run dev                    # Backend logs
npm run dev                    # Frontend logs (in client folder)

# Database operations
mongo                          # MongoDB shell
mongodump                      # Database backup
mongorestore                   # Database restore
```

## Notes

- **Time Slots**: System creates 28 slots (7 days × 4 time slots: 8-12, 12-4, 4-8, 20-00)
- **Authentication**: Uses JWT tokens with role-based access
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: React with Vite build tool
- **Backend**: Node.js with Express framework

This setup guide should get you from zero to a fully functional hospital management system with time slot management, user authentication, and appointment booking capabilities.
