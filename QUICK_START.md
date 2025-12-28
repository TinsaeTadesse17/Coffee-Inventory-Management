# Quick Start Guide - New Features

Get up and running with the new features in under 10 minutes!

## 🚀 Step-by-Step Setup

### 1. Apply Database Changes (2 minutes)

```bash
# Navigate to your project directory
cd esset-dash

# Apply database migrations
npx prisma migrate dev --name add_new_features

# Generate Prisma client
npx prisma generate
```

### 2. Update Environment Variables (1 minute)

Add to your `.env` file:

```env
# Optional but recommended
EMAIL_ENABLED=false
EMAIL_FROM=noreply@esetcoffee.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start the Application (1 minute)

```bash
# Development mode
npm run dev

# Or build and start
npm run build
npm start
```

### 4. Initialize Jute Bag Inventory (2 minutes)

Open Prisma Studio:

```bash
npx prisma studio
```

Create records in `JuteBagInventory` table:

| Size   | Quantity | Price Per Bag | Low Stock Alert |
|--------|----------|---------------|-----------------|
| KG_30  | 500      | 120.00        | 50              |
| KG_50  | 800      | 180.00        | 50              |
| KG_60  | 1000     | 200.00        | 50              |
| KG_85  | 200      | 250.00        | 30              |

Or use SQL directly:

```sql
INSERT INTO "jute_bag_inventory" ("id", "size", "quantity", "pricePerBag", "lowStockAlert", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'KG_30', 500, 120.00, 50, NOW(), NOW()),
  (gen_random_uuid(), 'KG_50', 800, 180.00, 50, NOW(), NOW()),
  (gen_random_uuid(), 'KG_60', 1000, 200.00, 50, NOW(), NOW()),
  (gen_random_uuid(), 'KG_85', 200, 250.00, 30, NOW(), NOW());
```

### 5. Test the Features (4 minutes)

1. **Login** to the application
2. **Check the navbar** - should say "Eset Coffee"
3. **Click the bell icon** - notification panel should open
4. **Go to Dashboard** - see enhanced visualizations (especially for CEO role)
5. **View any batch** - should see color-coded status
6. **Check numbers** - should have commas (1,234 instead of 1234)

## ✅ What You'll See Immediately

### 🎨 Visual Changes
- ✅ Logo changed to "Eset Coffee"
- ✅ Batch numbers have color-coded status badges
- ✅ All numbers formatted with commas
- ✅ Notification bell with badge count in navbar

### 📊 Dashboard Updates
- ✅ CEO dashboard shows comprehensive visualizations
- ✅ Financial overview with ETB and USD
- ✅ Coffee performance by origin
- ✅ Detailed batch table with all information
- ✅ Processing, QA, and warehouse statistics

### 🔔 Notification System
- ✅ Notification panel accessible from navbar
- ✅ Real-time notification count
- ✅ Mark as read functionality

## 🎯 Quick Feature Tests

### Test 1: Batch Status Colors (30 seconds)

1. Go to Dashboard
2. Look at any batch listing
3. You should see colored badges:
   - Yellow = Pending
   - Green = In Warehouse
   - Purple = Processing
   - Red = Rejected
   - etc.

### Test 2: Number Formatting (30 seconds)

1. Check any dashboard card
2. Numbers should have commas: `12,345 kg` instead of `12345 kg`
3. Currency should be formatted: `ETB 123,456.78`

### Test 3: Notification Panel (1 minute)

1. Click the bell icon in the navbar
2. Panel should open showing notifications
3. If empty, you'll see "No notifications yet"
4. Badge count should appear when there are unread notifications

### Test 4: CEO Dashboard (1 minute)

1. Login as CEO (or user with CEO role)
2. Go to Dashboard
3. You should see:
   - Key metrics cards at top
   - Financial overview section
   - Coffee performance by origin
   - Processing, QA, and warehouse stats
   - Comprehensive batch details table

### Test 5: Warehouse Receive with Jute Bags (2 minutes)

1. Go to Warehouse page
2. Click "Receive Batch"
3. You should now see measurement type options:
   - Kilogram (direct entry)
   - Jute Bag (with size selection)
   - Feresula
4. Select "Jute Bag", choose size, enter count
5. Submit - inventory should deduct automatically

## 🔧 Optional: Setup Aging Coffee Alerts

### Manual Test (1 minute)

```bash
# Trigger aging check manually
curl -X POST http://localhost:3000/api/cron/check-aging
```

### Setup Daily Cron (2 minutes)

If using Vercel, create `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/check-aging",
    "schedule": "0 0 * * *"
  }]
}
```

Or use any external cron service to hit the endpoint daily.

## 📧 Optional: Email Notifications

### Quick Test Without Email Service

Leave `EMAIL_ENABLED=false` in `.env`. Notifications will still work in-app, just no emails sent.

### Enable Email (5 minutes)

1. Sign up for SendGrid (free tier)
2. Get API key
3. Install package:
   ```bash
   npm install @sendgrid/mail
   ```
4. Update `.env`:
   ```env
   EMAIL_ENABLED=true
   SENDGRID_API_KEY=your-api-key
   EMAIL_FROM=noreply@esetcoffee.com
   ```
5. Update `src/lib/notification-service.ts` with SendGrid integration

## 🎓 Understanding the Color Scheme

Memorize these for quick identification:

| Color | Status | Meaning |
|-------|--------|---------|
| 🟡 Yellow | ORDERED | Pending order |
| 🟠 Orange | AT_GATE | Arrived at gate |
| 🟢 Green | AT_WAREHOUSE / STORED | In warehouse |
| 🔵 Blue | PROCESSING_REQUESTED | Waiting for processing |
| 🟣 Purple | IN_PROCESSING | Currently being processed |
| 🔷 Teal | PROCESSED | Processing complete |
| 🔹 Indigo | EXPORT_READY | Ready for export |
| 🌊 Cyan | IN_TRANSIT | Shipping |
| ⚪ Gray | SHIPPED | Delivered |
| 🔴 Red | REJECTED | Failed QC |
| 🟤 Amber | REPROCESSING | Being reprocessed |
| 🔴 RED BORDER (Pulsing) | AGING | 6+ months in warehouse |

## 📋 Common Operations

### Record Exchange Rate

When creating a purchase or export:
1. Look for "Exchange Rate" field
2. Enter current ETB to USD rate (e.g., 56.50)
3. System will calculate USD value automatically

### Add Additional Cost

1. Go to Finance or use Additional Costs API
2. Specify:
   - Cost Type (Transportation, Documentation, etc.)
   - Description
   - Amount
   - Currency
3. Will appear in CEO and Finance dashboards

### Check Aging Coffee

1. Go to Warehouse dashboard
2. Look for batches with RED border
3. Or check "Aging (6+ months)" stat
4. Click to see details

### View Processed Coffee

Available to:
- Warehouse Manager
- Export Manager
- CEO

1. Go to Dashboard
2. Look for "Processed" section
3. Shows all batches that completed processing

## 🆘 Quick Troubleshooting

**Issue: Migration fails**
```bash
npx prisma migrate reset  # ⚠️ Only in development!
npx prisma migrate dev
```

**Issue: Colors not showing**
```bash
# Clear cache and rebuild
rm -rf .next
npm run dev
```

**Issue: Notification bell not appearing**
- Check that `NotificationPanel` is imported in navbar
- Clear browser cache
- Check browser console for errors

**Issue: Numbers not formatted**
- Verify `formatNumber`, `formatCurrency`, `formatWeight` are imported
- Check that components are using these functions

## ✨ Pro Tips

1. **Batch Numbers**: Use the batch selector dropdown to quickly find batches by status
2. **CEO Dashboard**: Bookmark it - it's your command center
3. **Notifications**: Check daily to stay on top of operations
4. **Exchange Rates**: Record them at time of transaction for accurate reporting
5. **Jute Bags**: Monitor inventory to avoid running out
6. **Aging Coffee**: Set up daily cron to never miss an aging batch

## 📞 Need Help?

1. Check `FEATURES_IMPLEMENTED.md` for detailed feature documentation
2. Check `DEPLOYMENT_CHECKLIST.md` for comprehensive deployment guide
3. Check browser console for error messages
4. Check server logs in terminal
5. Review Prisma schema: `prisma/schema.prisma`

## 🎉 You're Ready!

All features are now active and ready to use. The system will:
- ✅ Show color-coded batch statuses
- ✅ Format numbers with commas
- ✅ Track notifications
- ✅ Manage jute bag inventory
- ✅ Deduct inventory automatically
- ✅ Track exchange rates
- ✅ Alert on aging coffee
- ✅ Prevent duplicate entries
- ✅ Provide comprehensive CEO dashboard

Start using the system and explore all the new features!

---

**Total Setup Time: ~10 minutes**

**Difficulty: Easy** ⭐

**Next Steps:** Read `FEATURES_IMPLEMENTED.md` for detailed feature documentation.









