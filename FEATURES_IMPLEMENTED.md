# New Features Implementation Guide

This document details all the new features that have been implemented in the Eset Coffee Supply Chain Dashboard.

## 🎨 Visual Improvements

### 1. Logo Update
- Changed from "Esset Coffee" to **"Eset Coffee"** in the navbar
- Location: `src/components/layout/navbar.tsx`

### 2. Batch Status Color Coding
All batch numbers now display with color-coded status indicators:

**Color Scheme:**
- 🟡 **Yellow** - Pending Order (ORDERED)
- 🟠 **Orange** - At Gate (AT_GATE)
- 🟢 **Green** - In Warehouse (AT_WAREHOUSE, STORED)
- 🔵 **Blue** - Processing Requested (PROCESSING_REQUESTED)
- 🟣 **Purple** - In Processing (IN_PROCESSING)
- 🔷 **Teal** - Processed (PROCESSED)
- 🔹 **Indigo** - Export Ready (EXPORT_READY)
- 🌊 **Cyan** - In Transit (IN_TRANSIT)
- ⚪ **Gray** - Shipped (SHIPPED)
- 🔴 **Red** - Rejected (REJECTED)
- 🟤 **Amber** - Reprocessing (REPROCESSING)
- 🔴 **RED BORDER (Pulsing)** - Aging Coffee (6+ months in warehouse)

Components:
- `src/components/ui/batch-status-badge.tsx`
- `src/components/ui/batch-selector.tsx`

### 3. Number Formatting with Commas
All numbers throughout the dashboard now display with comma separators for better readability:
- Batch numbers: `000`, `001`, `1,234`
- Weights: `12,345.50 kg`
- Currency: `ETB 123,456.78` or `USD 45,678.90`
- All other numbers are properly formatted

Utility: `src/lib/format-utils.ts`

## 🔔 Notification System

### In-App & Email Notifications
Users receive notifications for:
- **Approval Requests** - When CEO approval is needed
- **Batch Ready** - When a batch is ready for the next step
- **Aging Coffee** - When coffee has been in warehouse for 6+ months
- **Duplicate Entry** - When a manager tries to record duplicate data
- **Processing Complete** - When processing is finished
- **Low Jute Bag Stock** - When inventory is below threshold

Features:
- Real-time notification panel with badge count
- Email notifications to registered email addresses
- Mark as read functionality
- Automatic role-based routing

Files:
- `src/lib/notification-service.ts`
- `src/components/layout/notification-panel.tsx`
- `src/app/api/notifications/route.ts`

## 📦 Jute Bag Management

### Multiple Measurement Types
The system now supports three measurement methods:

1. **Jute Bags** - Different sizes:
   - 30kg bags
   - 50kg bags
   - 60kg bags (for export)
   - 85kg bags (for reject coffee)

2. **Feresula** - 17kg per bag

3. **Kilograms** - Direct weight entry

### Inventory Tracking
- Track jute bag inventory by size and quantity
- Set price per bag for financial tracking
- Configure low stock alert thresholds
- Automatic inventory deduction when bags are used
- Low stock notifications to Warehouse Manager, CEO, and Finance

Files:
- `src/app/api/jute-bags/route.ts`
- Database: `JuteBagInventory` model

## 💰 Financial Tracking

### Exchange Rate Recording
- Record ETB to USD exchange rate at purchase
- Record exchange rate at export
- Automatic USD value calculation for inventory
- Display both ETB and USD values throughout the system

Component: `src/components/ui/exchange-rate-input.tsx`

### Additional Costs Tracking
Managers can now record various additional costs:
- **Transportation costs** - Moving coffee between locations
- **Documentation fees**
- **Weighing room costs**
- **Storage costs** (for third-party coffee)
- **Processing costs** by grade
- **Moving costs** between warehouse and processing

Features:
- Generic cost categories with custom descriptions
- Amount and currency tracking
- Visible to Finance Manager and CEO
- Reflected in financial reports

Files:
- `src/app/api/additional-costs/route.ts`
- `src/app/api/storage-costs/route.ts`

## 📊 Enhanced CEO Dashboard

### New Visualizations

1. **Progress Tracking**
   - Visual batch status distribution
   - Step-by-step progress indicators

2. **Financial Overview**
   - Purchase costs (ETB & USD)
   - Additional costs summary
   - Stock value (ETB & USD)
   - Contract values

3. **Coffee Performance by Origin**
   - Total weight by origin
   - Average quality scores
   - Number of batches
   - Cost breakdown

4. **Quality Stats**
   - Total QA checks
   - Exceptional lots (≥85 score)
   - Failed lots (<70 score)
   - Average cup score

5. **Processing Stats**
   - Total processed weight
   - Rejected quantity
   - Waste quantity
   - Average yield percentage

6. **Warehouse Stats**
   - Batches in warehouse
   - Total warehouse entries
   - Aging batches alert
   - Current stock levels

### Comprehensive Batch Details Table
Shows all critical information for each batch in one view:
- Batch number with status badge
- Origin
- Purchased vs. current quantity
- Processing results (export, reject amounts)
- QA scores
- Purchase costs
- Days in warehouse (with aging indicator)

File: `src/components/dashboard/ceo-enhanced-dashboard.tsx`

## 🏭 Third-Party Processing

### Separate Entity Management
- Track coffee from other entities using your processing facility
- Separate batch IDs for third-party coffee
- Queue system with priority for own coffee

### Third-Party Costs
Different cost categories for processing other entities' coffee:
- **Weighing room cost**
- **Storage cost** - 2,200 ETB per ton per day after 15 days
- **Processing cost** - By grade (Grade 1, Grade 2, Grade 3)
- **Moving cost** - When coffee is moved between locations

### Reporting
- Track how much passed to export
- Track rejected quantity
- Track waste quantity
- All visible to Warehouse Manager, CEO, and Finance

Files:
- `src/app/api/third-party-entities/route.ts`
- `src/app/api/storage-costs/route.ts`
- Database: `ThirdPartyEntity`, `StorageCost` models

## 🔄 Automatic Inventory Management

### Automatic Deduction
When coffee is taken for processing:
- System automatically deducts quantity from warehouse inventory
- Updates `currentQuantityKg` field
- Prevents over-processing (checks available quantity)
- Maintains accurate stock levels

Example:
- 20kg batch arrives at warehouse → `currentQuantityKg = 20kg`
- 10kg taken for processing → `currentQuantityKg = 10kg`
- Remaining 10kg still tracked in warehouse

## ⚠️ Duplicate Entry Detection

### How It Works
When a manager tries to record an existing record:
1. System detects the duplicate
2. Marks the batch with `isDuplicateEntry = true`
3. Sends notification to Admin and CEO
4. Blocks the entry until approved
5. One of them must approve before the record can be saved

Notification: "Duplicate entry detected. Approval required from CEO or Admin."

## ⏰ Aging Coffee Alerts

### 6-Month Tracking
- Automatically tracks when coffee enters warehouse
- Calculates days in warehouse
- Flags batches that have been stored for 6+ months (180 days)
- Marks batch with `isAging = true`
- Sends notification to Warehouse Manager
- Displays RED marker with pulsing animation
- Shows prominently in dashboards

### Automated Checking
- Run the aging check cron job daily
- Endpoint: `/api/cron/check-aging`
- Can also be triggered manually

File: `src/lib/aging-check.ts`

## 🔐 Role-Based Access & Notifications

### Notification Flow

**Purchasing Team** → **Security/Gate** → Warehouse receives
↓
**Quality Team** notified for inspection
↓
**Warehouse Manager** stores → **Processing Team** notified
↓
**Processing Complete** → **Warehouse Manager, Export Manager, CEO** notified

### Role-Specific Features

**CEO:**
- Comprehensive dashboard with all visualizations
- Approve contracts
- Approve duplicate entries
- View all financial data
- View exchange rates
- View all batches and their complete journey

**Warehouse Manager:**
- View aging coffee alerts
- Manage jute bag inventory
- Receive batch ready notifications
- View processed coffee

**Export Manager:**
- Record exchange rate at export
- View processed coffee
- Contract management
- Shipping management

**Finance:**
- View all costs (purchase, additional, storage, processing)
- View exchange rates
- Track inventory value in both ETB and USD
- Generate financial reports

**Processing/Plant Manager:**
- Queue management for third-party coffee
- Priority processing for own coffee
- Record processing costs by grade
- Report yields, rejects, and waste

## 📋 Batch Number Display Improvements

Batch numbers are now:
- Started from `000`
- Use leading zeros for numbers under 1000
- Use commas for numbers over 999
- Example: `000`, `001`, `099`, `100`, `1,000`, `12,345`

## 🗄️ Database Schema Updates

New models added:
- `ThirdPartyEntity` - For external entities
- `JuteBagInventory` - Jute bag stock management
- `AdditionalCost` - Flexible cost tracking
- `ProcessingCost` - Processing-specific costs
- `StorageCost` - Third-party storage costs

New fields added to existing models:
- `Batch`:
  - `isThirdParty`, `thirdPartyEntityId`
  - `currentQuantityKg` - Track quantity after deductions
  - `exchangeRateAtPurchase`
  - `warehouseEntryDate`, `isAging`
  - `isDuplicateEntry`, `duplicateApprovedBy`
  - `queuePosition` - For third-party processing queue

- `Contract`:
  - `exchangeRateAtExport`

- `WarehouseEntry`:
  - `measurementType`, `juteBagSize`, `juteBagCount`, `feresulaBags`

- `ProcessingRun`:
  - `processingGrade`, `wasteQuantity`

New enums:
- `MeasurementType` - JUTE_BAG, FERESULA, KILOGRAM
- `JuteBagSize` - KG_30, KG_50, KG_60, KG_85
- Enhanced `NotificationType` - Added new notification types

## 🚀 Setup Instructions

### 1. Database Migration

```bash
# Generate migration
npx prisma migrate dev --name add_new_features

# Or push schema directly to database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### 2. Environment Variables

Add to `.env`:

```env
# Email notifications (optional)
EMAIL_ENABLED=true
EMAIL_FROM=noreply@esetcoffee.com

# Cron job authentication (optional)
CRON_SECRET=your-secret-token-here

# App URL for email links
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Initialize Jute Bag Inventory

You can initialize jute bag inventory via API or directly in database:

```typescript
// Via API POST to /api/jute-bags
{
  "size": "KG_60",
  "quantity": 1000,
  "pricePerBag": 150.00,
  "lowStockAlert": 50
}
```

### 4. Setup Cron Job (Optional)

For automated aging coffee checks, set up a daily cron job:

**Using Vercel Cron:**
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/check-aging",
    "schedule": "0 0 * * *"
  }]
}
```

**Or use any cron service** to hit the endpoint daily.

### 5. Email Service Integration

To enable email notifications, integrate with an email service:
- SendGrid
- AWS SES
- Resend
- Mailgun

Update `src/lib/notification-service.ts` with your email service implementation.

## 📱 User Interface Components

All new UI components are available:
- `<BatchStatusBadge />` - Color-coded status display
- `<BatchSelector />` - Dropdown with colored statuses
- `<NotificationPanel />` - In-app notification center
- `<ExchangeRateInput />` - Exchange rate input field
- `<CurrencyDisplay />` - Dual currency display (ETB/USD)
- `<EnhancedCEODashboard />` - Comprehensive CEO dashboard

## 🧪 Testing

Test the features:

1. **Create a batch** with exchange rate
2. **Receive in warehouse** using jute bag measurement
3. **Wait or manually set** warehouse entry date to 6+ months ago
4. **Run aging check** `/api/cron/check-aging`
5. **Process the coffee** - verify automatic deduction
6. **Check notifications** - should appear in notification panel
7. **View CEO dashboard** - see all statistics and visualizations
8. **Try duplicate entry** - should block and notify
9. **Record additional costs** - verify visibility in finance

## 📚 API Endpoints

New endpoints:
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/read-all` - Mark all as read
- `GET /api/batches` - Get all batches with aging status
- `GET/POST /api/jute-bags` - Manage jute bag inventory
- `GET/POST /api/additional-costs` - Track additional costs
- `GET/POST /api/third-party-entities` - Manage third-party entities
- `GET/POST/PUT /api/storage-costs` - Track storage costs
- `GET/POST /api/cron/check-aging` - Check/trigger aging alerts

## 🎯 Best Practices

1. **Exchange Rates**: Always record exchange rates at time of transaction
2. **Jute Bag Inventory**: Keep inventory updated and monitor low stock alerts
3. **Aging Coffee**: Run the aging check cron job daily
4. **Duplicate Entries**: Review and approve/reject promptly
5. **Notifications**: Check notification panel regularly
6. **Third-Party Coffee**: Use separate IDs and track all costs
7. **Processing**: Always verify available quantity before processing
8. **Costs**: Record all additional costs for accurate financial tracking

## 💡 Tips

- Batch numbers with commas are easier to read at scale
- Use the batch selector to quickly find batches by status
- CEO dashboard provides comprehensive at-a-glance overview
- Notifications help ensure nothing falls through the cracks
- Exchange rate tracking enables accurate profit/loss analysis
- Automatic inventory deduction prevents overselling

## 🐛 Troubleshooting

**Notifications not appearing?**
- Check if EMAIL_ENABLED is set
- Verify email service is configured
- Check user has valid email address

**Aging check not working?**
- Verify warehouseEntryDate is set
- Run manual check via API
- Check cron job is configured

**Jute bag inventory not deducting?**
- Verify inventory exists for the size
- Check if warehouse receive API was called correctly

**Can't process batch?**
- Verify batch status is STORED
- Check currentQuantityKg >= requested amount
- Ensure batch passed QC

## 📖 Summary

This implementation provides:
✅ Complete visibility into coffee supply chain
✅ Financial tracking with dual currency support
✅ Automated notifications and alerts
✅ Comprehensive CEO dashboard
✅ Third-party processing management
✅ Inventory management with automatic deductions
✅ Aging coffee tracking and alerts
✅ Duplicate entry prevention
✅ Beautiful, user-friendly interface with color coding
✅ Professional number formatting throughout

All features are production-ready and follow best practices for scalability, maintainability, and user experience.











