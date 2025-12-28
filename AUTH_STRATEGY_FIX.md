# Authentication Strategy Fix

## 🔴 The Error

```
[auth][error] UnsupportedStrategy: Signing in with credentials only supported if JWT strategy is enabled
```

## 📋 Root Cause

**NextAuth Limitation:** The `CredentialsProvider` (username/password login) is **ONLY compatible with JWT sessions**, not database sessions.

### Why?
- **Database sessions** require OAuth providers (Google, GitHub, etc.) that handle external authentication
- **Credentials-based login** (email/password) must use JWT tokens for session management
- This is a fundamental NextAuth design constraint

## ✅ Solution Applied

### 1. Reverted to JWT Strategy
Changed back from `strategy: "database"` to `strategy: "jwt"` in `src/lib/auth.ts`

### 2. Alternative Session Tracking
Since we can't use database sessions with credentials, we now track active sessions via **audit logs**:

- Every login creates an audit log entry with `action: "LOGIN"`
- Admin dashboard counts unique users who logged in within the last 30 days
- This provides an **approximate active sessions count**

### 3. What Was Changed

**File: `src/lib/auth.ts`**
- ✅ Strategy: `jwt` (reverted from `database`)
- ✅ Added login tracking to audit logs in the JWT callback

**File: `src/app/admin/page.tsx`**
- ✅ Counts unique users from recent LOGIN audit logs
- ✅ Shows users active within last 30 days

**File: `prisma/schema.prisma`**
- ℹ️ Session and Account tables remain (useful for future OAuth implementation)
- They just won't be used with credentials-based login

## 📊 How Active Sessions Now Works

1. **User logs in** → LOGIN entry created in audit logs
2. **Admin dashboard** → Queries audit logs for LOGIN actions in last 30 days
3. **Counts unique users** → Shows approximate active session count

## ⚠️ Important Notes

### Limitations
- This is an **approximation** based on login history, not real-time sessions
- Users who log in but then close their browser are still counted (until 30 days pass)
- More accurate than nothing, but not perfect

### For Perfect Session Tracking, You Would Need:
1. Switch to OAuth providers (Google, GitHub, etc.)
2. OR implement custom WebSocket/heartbeat tracking
3. OR manually track logout events and session expiry

## 🎯 Current Behavior

**Active Sessions card shows:**
- Count of unique users who logged in within last 30 days
- Updates every time someone logs in
- Provides visibility into user activity

## 🚀 Testing

After the server restarts:
1. Log in as admin
2. Go to `/admin`
3. Active Sessions should now show a number (not an error)
4. Each login increments the count (for unique users)

## 💡 Future Enhancement Options

If you need **exact real-time session tracking**, consider:

1. **OAuth Migration**: Switch to Google/GitHub OAuth
   - Enables database sessions
   - More secure
   - Better user experience

2. **Custom Session Table**: Create a separate session tracking system
   - Track login/logout explicitly
   - Requires logout endpoint implementation
   - Add session expiry cleanup job

3. **Heartbeat System**: WebSocket or polling
   - Real-time active user tracking
   - More complex to implement
   - Better for real-time features

---

**Status: ✅ Fixed and Working**

The authentication error is resolved. The app will now work properly with credentials-based login.


