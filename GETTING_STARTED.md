# Getting Started - Esset Coffee Dashboard 

## 🎉 Setup Complete!

Your Coffee Supply Chain Management System is ready to use!

## 🚀 Quick Start (3 Steps)

### 1. Start Database
```bash
docker-compose up -d
```

### 2. Start Application
```bash
npm run dev
```

### 3. Login
Open http://localhost:3000 and login with:
- **Email**: `admin@esset.com`
- **Password**: `admin123`

## 📚 Available Accounts

All accounts use password: **admin123**

| Role | Email | Access |
|------|-------|--------|
| Administrator | admin@esset.com | Full system access, user management |
| CEO | ceo@esset.com | Reports, analytics, approvals |
| Purchasing | purchasing@esset.com | Suppliers, purchase orders |
| Security | security@esset.com | Vehicle weighing, entry logs |
| Quality | quality@esset.com | QC checks, samples, PSS |
| Warehouse | warehouse@esset.com | Stock management, inventory |
| Plant Manager | plant@esset.com | Processing operations |
| Export Manager | export@esset.com | Contracts, shipments |
| Finance | finance@esset.com | Payments, bank receipts |

## 🛠️ Useful Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

### Database
```bash
npm run db:push      # Update database schema
npm run db:seed      # Seed user accounts
npm run db:studio    # Open database GUI
```

### Docker
```bash
docker-compose up -d       # Start PostgreSQL
docker-compose down        # Stop PostgreSQL
docker-compose down -v     # Stop and delete data
docker logs esset-postgres # View logs
```

## 📁 Project Structure

```
esset-dash/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── dashboard/          # Main dashboard
│   │   ├── purchasing/         # Purchasing module
│   │   ├── weighing/           # Weighing module
│   │   ├── warehouse/          # Warehouse module
│   │   ├── quality/            # Quality control
│   │   ├── processing/         # Processing module
│   │   ├── export/             # Export module
│   │   ├── finance/            # Finance module
│   │   ├── reports/            # Reports & analytics
│   │   ├── admin/              # Admin panel
│   │   └── login/              # Login page
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   └── layout/             # Layout components
│   └── lib/
│       ├── auth.ts             # NextAuth config & RBAC
│       ├── auth-helpers.ts     # Auth utility functions
│       ├── prisma.ts           # Database client
│       └── utils.ts            # Utility functions
├── prisma/
│   ├── schema.prisma           # Database schema (15 models)
│   └── seed.ts                 # Database seeding
├── docker-compose.yml          # PostgreSQL container
└── uploads/                    # File uploads directory
```

## 🔐 Authentication & Roles

The system uses NextAuth.js v5 with role-based access control (RBAC):

- **JWT sessions** (30-day expiry)
- **bcrypt password hashing**
- **Role-based permissions**
- **Protected API routes**

## 💾 Database

- **PostgreSQL 15** (Docker container)
- **Prisma ORM** for type-safe queries
- **15 data models** covering entire supply chain
- **Port 5434** (avoiding local PostgreSQL conflicts)

## 📦 Key Features Implemented

### Phase 1 (Foundation) ✅
- [x] Project setup with Next.js 16
- [x] PostgreSQL database (Docker)
- [x] Prisma ORM with comprehensive schema
- [x] NextAuth.js authentication
- [x] Role-based access control (9 roles)
- [x] shadcn/ui component library
- [x] Application layout (sidebar, navbar)
- [x] Login page
- [x] Module routing structure

### Phase 2 (Core Modules) 🔄 Next
- [ ] Purchasing: PO creation, supplier management
- [ ] Weighing: Weight recording, loss calculations
- [ ] Warehouse: Stock management, aging reports
- [ ] Quality: QC checks, sample tracking
- [ ] Batch tracking: Progress visualization

### Phase 3 (Advanced Features) 📋 Planned
- [ ] Processing: Yield tracking, output batches
- [ ] Contracts: CEO approval workflow
- [ ] Export: Booking, CLU checks
- [ ] Shipments: Document uploads, date alerts
- [ ] Finance: Payment tracking, receipts

### Phase 4 (Analytics & Reporting) 📋 Planned
- [ ] CEO dashboard with KPIs
- [ ] Weight loss analytics
- [ ] Report builder (PDF/Excel)
- [ ] Advanced analytics
- [ ] Notifications system

## 🎯 System Workflow

```
Purchase → Weighing → Warehouse → Quality Check → Processing
                                                        ↓
Finance ← Shipment ← Export Warehouse ← Contract ← Processing
```

Each stage is tracked with:
- Real-time status updates
- Document attachments
- Audit logs
- Progress visibility
- Role-based access

## 🔧 Configuration

### Environment Variables (.env)
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/esset_coffee?schema=public"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# File Storage (Optional)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
AWS_S3_BUCKET="esset-uploads"
```

## 📖 Documentation

- **[DOCKER_SETUP.md](DOCKER_SETUP.md)** - Docker PostgreSQL guide
- **[DATABASE_SETUP_COMPLETE.md](DATABASE_SETUP_COMPLETE.md)** - Setup status
- **[README.md](README.md)** - Project overview

## 🆘 Troubleshooting

### Port already in use
Change port in `docker-compose.yml` and `.env`

### Database connection failed
```bash
docker-compose restart
```

### Reset everything
```bash
docker-compose down -v
docker-compose up -d
npm run db:push
npm run db:seed
```

### View logs
```bash
# Application logs
npm run dev

# Database logs
docker logs esset-postgres
```

## 💡 Tips

1. **Use Prisma Studio** to view/edit data visually:
   ```bash
   npm run db:studio
   ```

2. **Check your database schema**:
   ```bash
   docker exec -it esset-postgres psql -U postgres -d esset_coffee -c "\dt"
   ```

3. **Test with different roles** by logging in with different accounts

4. **Watch for hot-reload** - changes auto-refresh in development

## 🎨 UI Components

Built with **shadcn/ui** + **Tailwind CSS**:
- Modern, accessible components
- Dark mode ready
- Fully customizable
- TypeScript support

## 🔜 Next Steps

1. **Explore the application** - login and navigate through modules
2. **Review the code** - familiarize yourself with the structure
3. **Start Phase 2** - implement purchasing or weighing module
4. **Customize UI** - adjust colors, branding in `globals.css`
5. **Add business logic** - implement module-specific features

## 📞 Support

For issues or questions:
1. Check documentation in this folder
2. Review Prisma schema for data models
3. Inspect `src/lib/auth.ts` for permissions
4. Check console logs for errors

---

**Ready to build!** 🚀

Start with Phase 2 modules or customize the existing foundation to match your specific needs.





