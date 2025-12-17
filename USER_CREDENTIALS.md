# 👤 USER CREDENTIALS - ALL ROLES

## 🔑 Default Password for ALL Users:
**Password:** `admin123`

---

## 📋 ALL USER ACCOUNTS:

### 1. **ADMIN** - System Administrator
- **Email:** `admin@esset.com`
- **Password:** `admin123`
- **Access:** Full system access (all modules)

### 2. **CEO** - Chief Executive Officer
- **Email:** `ceo@esset.com`
- **Password:** `admin123`
- **Access:** 
  - Dashboard (all KPIs)
  - Finance (financial overview)
  - Export (contract approvals)
  - All read-only access

### 3. **PURCHASING** - Purchasing Manager
- **Email:** `purchasing@esset.com`
- **Password:** `admin123`
- **Access:** 
  - Purchasing module (create purchase orders)
  - View purchasing dashboard

### 4. **SECURITY** - Security Officer
- **Email:** `security@esset.com`
- **Password:** `admin123`
- **Access:** 
  - Weighing module (gate entry/weighing records)
  - View weighing dashboard

### 5. **QUALITY** - Quality Inspector
- **Email:** `quality@esset.com`
- **Password:** `admin123`
- **Access:** 
  - Quality module (create QC checks)
  - View quality dashboard

### 6. **WAREHOUSE** - Warehouse Manager
- **Email:** `warehouse@esset.com`
- **Password:** `admin123`
- **Access:** 
  - Warehouse module (receive batches)
  - View warehouse dashboard

### 7. **PLANT_MANAGER** - Plant Manager
- **Email:** `plant@esset.com`
- **Password:** `admin123`
- **Access:** 
  - Processing module (create processing runs)
  - View processing dashboard

### 8. **EXPORT_MANAGER** - Export Manager
- **Email:** `export@esset.com`
- **Password:** `admin123`
- **Access:** 
  - Export module (create contracts)
  - View export dashboard

### 9. **FINANCE** - Finance Manager
- **Email:** `finance@esset.com`
- **Password:** `admin123`
- **Access:** 
  - Finance module (view financial reports, download CSV reports)
  - View financial dashboard

---

## 🚀 QUICK LOGIN GUIDE:

### To Test Each Role:

1. **Go to Login Page:** `http://localhost:3000/login`

2. **Enter Credentials:**
   - Email: (use any email from above)
   - Password: `admin123`

3. **Click Login** → You'll be redirected to the dashboard

4. **Navigate to Module:**
   - Each role sees different modules in the sidebar
   - Only modules they have access to will be visible

---

## 🔍 ROLE PERMISSIONS SUMMARY:

| Role | Purchasing | Weighing | Warehouse | Quality | Processing | Export | Finance |
|------|------------|----------|-----------|---------|------------|--------|---------|
| **ADMIN** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **CEO** | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ | ✅ | ✅ |
| **PURCHASING** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **SECURITY** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **QUALITY** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **WAREHOUSE** | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **PLANT_MANAGER** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **EXPORT_MANAGER** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **FINANCE** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

**Legend:**
- ✅ = Full access (create, read, update)
- 👁️ = Read-only access
- ❌ = No access

---

## 💡 TIPS:

1. **All passwords are the same:** `admin123` (for easy testing)

2. **To change a password later:**
   - You'll need to update it in the database directly
   - Or add a password change feature to the app

3. **To create more users:**
   - Run `npm run db:seed` again (it won't duplicate existing users)
   - Or manually add users via Prisma Studio: `npx prisma studio`

4. **Test Role-Based Access:**
   - Login as different roles
   - Check which modules appear in sidebar
   - Try accessing modules directly via URL
   - Should redirect if no access

---

## 🎯 TESTING SCENARIO:

### Complete Workflow Test:

1. **Login as PURCHASING** → Create Purchase Order
2. **Login as SECURITY** → Create Weighing Record (for that batch)
3. **Login as WAREHOUSE** → Receive Batch into Warehouse
4. **Login as QUALITY** → Create QC Check
5. **Login as PLANT_MANAGER** → Create Processing Run
6. **Login as EXPORT_MANAGER** → Create Contract
7. **Login as CEO** → Approve Contract
8. **Login as FINANCE** → Download Reports

---

**All set! Use any of these credentials to test the system!** 🚀



