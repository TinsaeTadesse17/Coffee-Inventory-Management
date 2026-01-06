# Complete Notification & Email System

## Overview
The system now includes comprehensive notifications at every workflow step, with both in-app notifications and email alerts.

## Color-Coded Batch Status System

### Status Colors in Dropdowns

All batch selectors now show colored indicators:

| Status | Color | Visual Indicator | Meaning |
|--------|-------|-----------------|---------|
| **ORDERED** | 🟡 Yellow | Yellow dot + badge | Purchase order created, awaiting weighing |
| **AT_GATE** | 🟠 Orange | Orange dot + badge | Weighed at gate, ready for warehouse |
| **STORED** | 🟢 Green | Green dot + badge | In warehouse, ready for QC/processing |
| **PROCESSING_REQUESTED** | 🔵 Blue | Blue dot + badge | Requested for processing |
| **IN_PROCESSING** | 🟣 Purple | Purple dot + badge | Currently being processed |
| **PROCESSED** | 🔷 Teal | Teal dot + badge | Processing complete, ready for export |
| **EXPORT_READY** | 🔵 Indigo | Indigo dot + badge | Ready to ship |
| **IN_TRANSIT** | 🔷 Cyan | Cyan dot + badge | Shipped, in transit |
| **SHIPPED** | ⚪ Gray | Gray dot + badge | Delivered, complete |
| **REJECTED** | 🔴 Red | Red dot + badge | Failed QC or rejected |
| **REPROCESSING** | 🟡 Amber | Amber dot + badge | Being reprocessed |

### Visual Design
- **Colored Dot**: 3x3px circle with border, appears before batch number
- **Status Badge**: Colored badge with status name
- **Aging Indicator**: 🔴 Red dot if coffee is 6+ months old
- **Selected State**: Blue background with left border when selected

## Complete Notification Workflow

### 1. Purchase Order Created
**Trigger:** Purchasing creates new purchase order
**Notifies:** 🔔 Security Team
**Message:** "Batch Ready for Weighing at Gate"
**Email:** ✅ Yes
**Link:** `/dashboard?batchId={batchId}`

### 2. Batch Weighed at Gate
**Trigger:** Security completes weighing
**Notifies:** 🔔 Warehouse Team
**Message:** "Batch Ready for Warehouse Receipt"
**Email:** ✅ Yes
**Link:** `/warehouse?batchId={batchId}`

### 3. Batch Received in Warehouse
**Trigger:** Warehouse receives batch
**Notifies:** 🔔 Quality Team
**Message:** "Batch Ready for Quality Inspection"
**Email:** ✅ Yes
**Link:** `/quality?batchId={batchId}`

### 4. Processing Complete
**Trigger:** Processing run completes
**Notifies:** 🔔 Warehouse, Export Manager, CEO
**Message:** "Processing Complete"
**Email:** ✅ Yes
**Link:** `/processing?runId={runId}`

**Also Notifies:** 🔔 Export Manager (if export grade)
**Message:** "Batch Ready for Export Contract Creation"
**Email:** ✅ Yes

### 5. Contract Created
**Trigger:** Export Manager creates contract
**Notifies:** 🔔 CEO
**Message:** "Contract Approval Requested"
**Email:** ✅ Yes
**Link:** `/export?contractId={contractId}`

### 6. Contract Approved/Rejected
**Trigger:** CEO approves or rejects contract
**Notifies:** 🔔 Export Manager
**Message:** "Contract Approved" or "Contract Rejected"
**Email:** ✅ Yes
**Link:** `/export?contractId={contractId}`

### 7. Duplicate Entry Detected
**Trigger:** Warehouse attempts duplicate entry
**Notifies:** 🔔 CEO, Admin
**Message:** "Duplicate Entry Detected"
**Email:** ✅ Yes
**Link:** `/dashboard?batchId={batchId}`

### 8. Low Jute Bag Stock
**Trigger:** Jute bag inventory below threshold
**Notifies:** 🔔 Warehouse, CEO, Finance
**Message:** "Low Jute Bag Stock"
**Email:** ✅ Yes
**Link:** `/warehouse`

## Email Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Enable/disable email notifications
EMAIL_ENABLED=true
EMAIL_FROM=noreply@essetcoffee.com

# Option 1: SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Option 2: Resend API (Recommended)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Option 3: SendGrid API
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx

# App URL for email links
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Email Providers

The system supports multiple email providers:

1. **SMTP** (Gmail, Outlook, custom SMTP)
   - Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
   - Works with any SMTP server

2. **Resend** (Recommended for production)
   - Set `RESEND_API_KEY`
   - Free tier: 3,000 emails/month
   - Best deliverability

3. **SendGrid**
   - Set `SENDGRID_API_KEY`
   - Free tier: 100 emails/day
   - Enterprise-grade

### Email Template

All emails include:
- **Subject:** "Eset Coffee - {Notification Title}"
- **HTML Body:** Styled email with:
  - Title
  - Message
  - "View Details" button (links to dashboard)
  - Footer disclaimer
- **From:** Configured email address

## Notification Display

### In-App Notifications
- **Bell Icon** in navbar with red badge showing unread count
- **Dropdown Panel** shows recent notifications
- **Color-coded** by notification type
- **Clickable** - navigates to relevant page
- **Mark as Read** - individual or bulk
- **Auto-refresh** every 30 seconds

### Email Notifications
- **Sent immediately** when notification is created
- **Includes batch/contract details**
- **Direct link** to relevant page
- **Professional HTML formatting**

## User Experience Flow

### Example: Complete Coffee Journey

1. **Purchasing creates order**
   - Batch created: `BTH-1234567890` (🟡 Yellow - ORDERED)
   - 🔔 Security gets notification + email
   - Email: "Batch BTH-1234567890 is ready for Weighing at Gate"

2. **Security weighs batch**
   - Opens notification or dropdown
   - Sees 🟡 Yellow batch in dropdown
   - Selects batch, records weights
   - Status → 🟠 Orange (AT_GATE)
   - 🔔 Warehouse gets notification + email

3. **Warehouse receives batch**
   - Sees 🟠 Orange batch in dropdown
   - Receives batch, records storage
   - Status → 🟢 Green (STORED)
   - 🔔 Quality gets notification + email

4. **Quality inspects**
   - Sees 🟢 Green batch in dropdown
   - Performs QC check
   - No status change (QC doesn't change batch status)

5. **Processing processes batch**
   - Sees 🟢 Green batch in dropdown
   - Processes batch
   - Status → 🟣 Purple (IN_PROCESSING) → 🔷 Teal (PROCESSED)
   - 🔔 Export Manager gets notification + email

6. **Export creates contract**
   - Creates contract for processed batch
   - 🔔 CEO gets notification + email: "Contract Approval Requested"

7. **CEO approves contract**
   - Reviews contract
   - Approves or rejects
   - 🔔 Export Manager gets notification + email: "Contract Approved"

## Color Code Reference

### Quick Visual Guide

```
🟡 ORDERED          = Yellow   = Pending action (Security)
🟠 AT_GATE          = Orange   = At gate (Warehouse)
🟢 STORED           = Green    = In warehouse (Quality/Processing)
🔵 PROCESSING_REQ   = Blue     = Requested (Plant Manager)
🟣 IN_PROCESSING    = Purple   = Active processing
🔷 PROCESSED        = Teal     = Ready for export
🔵 EXPORT_READY     = Indigo   = Ready to ship
🔷 IN_TRANSIT       = Cyan     = Shipping
⚪ SHIPPED          = Gray     = Complete
🔴 REJECTED         = Red      = Needs review
🟡 REPROCESSING     = Amber    = Being reprocessed
```

## Benefits

✅ **Visual Status Recognition** - Colors communicate status instantly
✅ **No Missed Actions** - Notifications ensure nothing falls through cracks
✅ **Email Backup** - Users get emails even if they're not logged in
✅ **Complete Traceability** - Every step tracked with notifications
✅ **Role-Based Alerts** - Right people notified at right time
✅ **Professional Communication** - Styled emails with clear CTAs

## Testing Notifications

### Test Purchase → Security Flow:
1. Create purchase order
2. Check Security user's notification bell (should show badge)
3. Check Security user's email inbox
4. Click notification → goes to dashboard
5. See yellow batch in weighing dropdown

### Test Email:
1. Set `EMAIL_ENABLED=true` in `.env`
2. Configure SMTP/Resend/SendGrid
3. Create purchase order
4. Check user's email inbox
5. Click "View Details" button → opens dashboard

## Troubleshooting

### Emails Not Sending?
- Check `EMAIL_ENABLED=true` in `.env`
- Verify SMTP/Resend/SendGrid credentials
- Check server logs for email errors
- Emails fail silently (won't break app)

### Notifications Not Showing?
- Check user is logged in
- Verify user has correct role
- Check browser console for errors
- Refresh page (notifications poll every 30s)

### Wrong Batch Colors?
- Verify batch status in database
- Check `getBatchStatusColor()` function
- Ensure status matches enum values






