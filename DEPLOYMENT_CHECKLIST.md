# Deployment Checklist for New Features

This checklist will help you deploy all the new features to your Eset Coffee Dashboard.

## ✅ Pre-Deployment Steps

### 1. Database Migration

The Prisma schema has been significantly updated. You need to apply these changes:

```bash
# Step 1: Generate a new migration
npx prisma migrate dev --name add_comprehensive_features

# Step 2: Apply migration to production database (when ready)
npx prisma migrate deploy

# Step 3: Generate updated Prisma Client
npx prisma generate
```

### 2. Environment Variables

Update your `.env` file with these new variables:

```env
# Existing variables (keep these)
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="..."

# NEW: Email Notifications (optional but recommended)
EMAIL_ENABLED=true
EMAIL_FROM=noreply@esetcoffee.com

# NEW: Cron Job Security (optional)
CRON_SECRET=your-random-secret-token

# NEW: Application URL for email links
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 3. Install Dependencies

No new dependencies are required! All features use existing packages.

```bash
npm install  # Just to ensure everything is up to date
```

## 🚀 Deployment Steps

### Step 1: Review Changes

**Files Modified:**
- ✅ `prisma/schema.prisma` - Database schema updates
- ✅ `src/components/layout/navbar.tsx` - Logo update and notification panel
- ✅ `src/components/dashboard/role-dashboards.tsx` - Updated with formatting
- ✅ `src/app/dashboard/page.tsx` - Fetch additional data
- ✅ `src/app/api/warehouse/receive/route.ts` - Enhanced with new features
- ✅ `src/app/api/processing/run/route.ts` - Auto deduction and notifications

**New Files Created:**
- ✅ `src/lib/format-utils.ts` - Number formatting utilities
- ✅ `src/lib/notification-service.ts` - Notification system
- ✅ `src/lib/aging-check.ts` - Aging coffee checker
- ✅ `src/components/ui/batch-status-badge.tsx` - Status badge component
- ✅ `src/components/ui/batch-selector.tsx` - Batch dropdown with colors
- ✅ `src/components/ui/exchange-rate-input.tsx` - Exchange rate input
- ✅ `src/components/layout/notification-panel.tsx` - Notification UI
- ✅ `src/components/dashboard/ceo-enhanced-dashboard.tsx` - Enhanced CEO dashboard
- ✅ `src/app/api/notifications/route.ts` - Notification API
- ✅ `src/app/api/notifications/[id]/read/route.ts` - Mark as read
- ✅ `src/app/api/notifications/read-all/route.ts` - Mark all as read
- ✅ `src/app/api/batches/route.ts` - Batch listing API
- ✅ `src/app/api/jute-bags/route.ts` - Jute bag inventory API
- ✅ `src/app/api/additional-costs/route.ts` - Additional costs API
- ✅ `src/app/api/third-party-entities/route.ts` - Third-party entities API
- ✅ `src/app/api/storage-costs/route.ts` - Storage costs API
- ✅ `src/app/api/cron/check-aging/route.ts` - Aging check cron job

### Step 2: Build and Test Locally

```bash
# Build the application
npm run build

# Test the build
npm run start

# Run in development mode for testing
npm run dev
```

**Test Checklist:**
- [ ] Login works
- [ ] Dashboard loads without errors
- [ ] Notification bell appears in navbar
- [ ] Logo says "Eset Coffee" (not "Esset Coffee")
- [ ] Numbers display with commas
- [ ] Batch status colors appear
- [ ] CEO dashboard shows all new visualizations

### Step 3: Database Initialization

After deploying, initialize the required data:

**Initialize Jute Bag Inventory:**

Use the API or directly insert into database:

```bash
# Call the API (after deployment)
curl -X POST https://your-domain.com/api/jute-bags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "size": "KG_30",
    "quantity": 500,
    "pricePerBag": 120.00,
    "lowStockAlert": 50
  }'

# Repeat for other sizes: KG_50, KG_60, KG_85
```

Or use Prisma Studio:
```bash
npx prisma studio
```

### Step 4: Configure Cron Job (Optional but Recommended)

Set up a daily cron job to check for aging coffee.

**Option A: Vercel Cron (if hosting on Vercel)**

Create `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-aging",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**Option B: External Cron Service**

Use services like:
- **cron-job.org**
- **EasyCron**
- **UptimeRobot**

Configure to hit: `https://your-domain.com/api/cron/check-aging`

Add header if using CRON_SECRET:
```
Authorization: Bearer YOUR_CRON_SECRET
```

**Option C: Manual Trigger**

You can manually trigger the aging check anytime:
```bash
curl -X POST https://your-domain.com/api/cron/check-aging
```

### Step 5: Email Service Integration (Optional)

To enable email notifications, integrate an email service:

**Recommended Services:**
1. **SendGrid** - Free tier available
2. **Resend** - Modern, developer-friendly
3. **AWS SES** - Cost-effective for high volume
4. **Mailgun** - Reliable and popular

**Integration Steps:**

1. Sign up for an email service
2. Get your API key
3. Update `src/lib/notification-service.ts`:

```typescript
// Example with SendGrid
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  if (!emailConfig.enabled) {
    console.log(`[EMAIL DISABLED] To: ${to}, Subject: ${subject}`);
    return;
  }

  await sgMail.send({
    to,
    from: emailConfig.from,
    subject,
    html: body,
  });
}
```

4. Add to `.env`:
```env
SENDGRID_API_KEY=your-api-key-here
EMAIL_ENABLED=true
EMAIL_FROM=noreply@esetcoffee.com
```

5. Install the package:
```bash
npm install @sendgrid/mail
```

## 🧪 Post-Deployment Testing

### Critical Paths to Test

1. **Notification System**
   - [ ] Create a contract (should notify CEO)
   - [ ] Check notification bell shows count
   - [ ] Click notification, verify it marks as read
   - [ ] Check email was sent (if configured)

2. **Batch Status Colors**
   - [ ] View dashboard with batches
   - [ ] Verify colors match status
   - [ ] Check batch selector dropdown shows colors

3. **Number Formatting**
   - [ ] All weights show with commas
   - [ ] All currency values formatted correctly
   - [ ] Batch numbers formatted (000, 001, 1,234)

4. **Warehouse Receive**
   - [ ] Receive a batch using jute bags
   - [ ] Verify inventory deducts
   - [ ] Try receiving same batch again (should detect duplicate)
   - [ ] Verify notification sent to CEO/Admin

5. **Processing**
   - [ ] Process a batch
   - [ ] Verify warehouse quantity decreases
   - [ ] Verify notifications sent
   - [ ] Check CEO can see processed batch

6. **CEO Dashboard**
   - [ ] Login as CEO
   - [ ] Verify all sections load
   - [ ] Check financial overview displays
   - [ ] Verify batch details table shows
   - [ ] Check coffee performance by origin

7. **Aging Coffee**
   - [ ] Set a batch warehouse entry date to 7 months ago
   - [ ] Run aging check (manual or cron)
   - [ ] Verify batch marked as aging
   - [ ] Check RED marker appears
   - [ ] Verify notification sent to warehouse manager

8. **Exchange Rates**
   - [ ] Add exchange rate when creating purchase
   - [ ] Verify USD value calculated
   - [ ] Check CEO dashboard shows both currencies

9. **Additional Costs**
   - [ ] Add a transportation cost
   - [ ] Verify it appears in CEO dashboard
   - [ ] Check finance role can see it

10. **Third-Party Coffee**
    - [ ] Create a third-party entity
    - [ ] Create a batch for that entity
    - [ ] Record storage cost
    - [ ] Process with priority queue
    - [ ] Verify costs tracked separately

## 📊 Database Health Check

After deployment, verify database:

```bash
# Check migrations applied
npx prisma migrate status

# Verify new tables exist
# Open Prisma Studio and check for:
# - JuteBagInventory
# - ThirdPartyEntity
# - AdditionalCost
# - ProcessingCost
# - StorageCost
npx prisma studio
```

## 🐛 Troubleshooting

### Common Issues

**1. Migration Fails**
```bash
# Reset database (⚠️ WARNING: Only for development!)
npx prisma migrate reset

# Or create a new migration
npx prisma migrate dev --create-only
# Then edit the migration file before applying
npx prisma migrate dev
```

**2. Prisma Client Out of Sync**
```bash
npx prisma generate
```

**3. Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**4. Notifications Not Working**
- Check user has valid email in database
- Verify EMAIL_ENABLED=true
- Check email service is configured
- Look at server logs for errors

**5. Colors Not Showing**
- Clear browser cache
- Check Tailwind CSS is building correctly
- Verify imports are correct

## 🔒 Security Considerations

1. **Cron Endpoint**: Use `CRON_SECRET` to protect the aging check endpoint
2. **Email Service**: Use environment variables for API keys
3. **Database**: Ensure connection string is secure
4. **Role Permissions**: All APIs check user roles before allowing actions

## 📈 Monitoring

After deployment, monitor:
- [ ] Error logs for any runtime errors
- [ ] Notification delivery success rate
- [ ] Cron job execution (check logs daily)
- [ ] Database performance with new queries
- [ ] User feedback on new features

## 🎉 Feature Launch Communication

Inform your users about:
1. **New color-coded batch statuses** - easier to identify batch progress
2. **Notification system** - stay updated on important events
3. **Enhanced CEO dashboard** - comprehensive business insights
4. **Jute bag inventory** - better stock management
5. **Aging coffee alerts** - never lose track of old inventory
6. **Exchange rate tracking** - accurate financial reporting
7. **Automatic inventory deduction** - real-time stock levels

## 📚 Training Materials

Consider creating:
- [ ] User guide for notification panel
- [ ] Tutorial for jute bag management
- [ ] Video walkthrough of CEO dashboard
- [ ] Documentation for third-party processing
- [ ] FAQ for common operations

## 🔄 Rollback Plan

If issues arise:

1. **Revert code changes:**
```bash
git revert HEAD
git push
```

2. **Rollback database migration:**
```bash
npx prisma migrate resolve --rolled-back MIGRATION_NAME
```

3. **Redeploy previous version**

## ✅ Final Checklist

Before marking deployment complete:

- [ ] Database migrated successfully
- [ ] All environment variables set
- [ ] Application builds without errors
- [ ] All critical paths tested
- [ ] Cron job configured (if using)
- [ ] Email service integrated (if using)
- [ ] Jute bag inventory initialized
- [ ] User documentation updated
- [ ] Team trained on new features
- [ ] Monitoring alerts configured
- [ ] Rollback plan understood

## 🎯 Success Metrics

Track these metrics to measure success:
- Notification delivery rate
- User engagement with notification panel
- Aging coffee caught and processed
- Duplicate entries prevented
- Time saved with automatic inventory deduction
- CEO dashboard usage
- Accuracy of financial tracking

---

**Questions or Issues?**

Refer to:
- `FEATURES_IMPLEMENTED.md` - Detailed feature documentation
- `prisma/schema.prisma` - Database schema reference
- `src/lib/` - Utility functions and services
- Console logs - Check for any error messages

**Happy Deploying! 🚀**









