# Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Git (optional)

## Installation (5 minutes)

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment
Create `.env` file (copy from env.template):
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/esset_coffee?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
```

### 3. Setup Database
```bash
# Create database in PostgreSQL
createdb esset_coffee

# Push schema
npm run db:push

# Seed users
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Login
Visit http://localhost:3000

**Default Accounts** (password: `admin123`):
- `admin@esset.com` - Full system access
- `ceo@esset.com` - CEO dashboard and contract approval
- `purchasing@esset.com` - Purchase orders
- `quality@esset.com` - Quality control
- `warehouse@esset.com` - Warehouse management
- And more...

## What You Can Do Now

✅ **Login** with any role  
✅ **Navigate** between modules via sidebar  
✅ **View** dashboard with KPIs  
✅ **Access** role-specific pages  
✅ **Logout** and switch users  

## What's Coming Next

The following features are planned for implementation:

📋 **Phase 2** - Core Modules
- Create purchase orders
- Record vehicle weighing
- Manage warehouse arrivals
- Perform quality checks
- Track batches through pipeline
- View detailed batch progress

📊 **Phase 3** - Advanced Features  
- Processing operations
- Contract management with CEO approval
- Pre-shipment samples (PSS)
- Export and shipment tracking
- Financial ledger

📈 **Phase 4** - Analytics & Reports
- Weight loss analysis
- Executive reports
- Alerts and notifications
- Advanced dashboard analytics

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:push         # Push schema changes
npm run db:seed         # Seed initial data
npm run db:studio       # Open Prisma Studio (DB GUI)

# View database
npm run db:studio       # Opens at http://localhost:5555
```

## Troubleshooting

### "Missing script: dev"
Run `npm install --legacy-peer-deps` again

### Database connection errors
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in `.env`
3. Create database: `createdb esset_coffee`

### Authentication errors
1. Ensure NEXTAUTH_SECRET is set in `.env`
2. Clear browser cookies
3. Restart dev server

### Port 3000 already in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

## Project Structure

```
esset-dash/
├── prisma/
│   ├── schema.prisma    # Database models
│   └── seed.ts          # Sample data
├── src/
│   ├── app/
│   │   ├── api/         # API endpoints
│   │   ├── dashboard/   # Dashboard page
│   │   ├── purchasing/  # Purchasing module
│   │   ├── warehouse/   # Warehouse module
│   │   └── ...          # Other modules
│   ├── components/
│   │   ├── layout/      # Layout components
│   │   └── ui/          # UI components
│   ├── lib/
│   │   ├── auth.ts      # Auth configuration
│   │   ├── prisma.ts    # Database client
│   │   └── utils.ts     # Utilities
│   └── types/           # TypeScript types
├── uploads/             # File storage
└── README.md            # Full documentation
```

## Need Help?

- Check `README.md` for detailed documentation
- Check `SETUP_STATUS.md` for implementation progress
- Review the plan in `.cursor/plans/` folder
- Database schema: `prisma/schema.prisma`

## Next Steps

Ready to implement core features? Follow the implementation plan:

1. **Purchasing Module** - Create purchase orders
2. **Weighing Room** - Record vehicle weights
3. **Warehouse** - Track arrivals and stock
4. **Quality Control** - Perform inspections
5. **And more...**

See the full plan in the `.cursor/plans/` directory.

---

🎉 **You're all set!** The foundation is complete and ready for feature development.








