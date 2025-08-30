# 🏥 Admin Creation Scripts

This directory contains scripts to forcefully create admin users in the database.

## 📁 Available Scripts

### 1. `createAdminSimple.js` - Command Line Arguments
**Usage:** `npm run create:admin <name> <email> <password> [--force]`

**Examples:**
```bash
# Create new admin
npm run create:admin "John Admin" "admin@hospital.com" "admin123"

# Update existing admin (force)
npm run create:admin "John Admin" "admin@hospital.com" "newpassword123" --force
```

**Features:**
- ✅ Quick command line usage
- ✅ Automatic password hashing
- ✅ Check for existing admin
- ✅ Force update option
- ✅ Input validation

---

### 2. `createAdminForce.js` - Interactive Input
**Usage:** `npm run create:admin:interactive`

**Features:**
- ✅ Interactive prompts for name, email, password
- ✅ User-friendly interface
- ✅ Automatic conflict resolution
- ✅ Option to update existing admin
- ✅ Detailed feedback

---

## 🚀 Quick Start

### Option 1: Quick Command Line
```bash
cd server
npm run create:admin "Super Admin" "admin@hospital.com" "admin123"
```

### Option 2: Interactive Mode
```bash
cd server
npm run create:admin:interactive
```

---

## 🔧 Requirements

- ✅ MongoDB connection (via .env file)
- ✅ Node.js with ES modules support
- ✅ bcryptjs package installed
- ✅ dotenv package installed

---

## 📋 What Happens

1. **Connects** to MongoDB (HospitalDB)
2. **Checks** if admin already exists
3. **Hashes** password securely (bcrypt)
4. **Creates/Updates** admin in database
5. **Disconnects** from MongoDB

---

## 🎯 Use Cases

- 🆕 **First-time setup** - Create initial admin
- 🔄 **Password reset** - Update admin password
- 👥 **Add new admin** - Create additional admin users
- 🛠️ **Development** - Quick admin creation for testing

---

## ⚠️ Security Notes

- 🔒 Passwords are automatically hashed using bcrypt
- 🚫 Never store plain text passwords
- 🔐 Use strong passwords (minimum 6 characters)
- 🎭 Admin role is immutable (cannot be changed)

---

## 🐛 Troubleshooting

**Error: "Admin with email already exists"**
```bash
# Use --force flag to update
npm run create:admin "Name" "email@example.com" "password" --force
```

**Error: "Password must be at least 6 characters"**
- Ensure password is 6+ characters long

**Error: "MongoDB connection failed"**
- Check your .env file has correct MONGODB_URI
- Ensure MongoDB is running and accessible







