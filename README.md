# Esset Coffee Dashboard

A comprehensive coffee supply chain management system tracking coffee from purchase through export.

## Features

- **Multi-Role Access Control**: CEO, Purchasing, Security, Quality, Warehouse, Plant Manager, Export Manager, Finance, Admin
- **Complete Coffee Tracking**: From purchase to export with full audit trail
- **Weight Loss Monitoring**: Track weight at every checkpoint (gate, warehouse, processing)
- **Quality Control**: Moisture monitoring, defect tracking, PSS management
- **Contract Management**: CEO approval workflow with pricing
- **Document Management**: Upload and track all certificates and documents
- **Real-time Dashboard**: KPIs, alerts, and analytics
- **Audit Logging**: Complete trail of all system changes

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **UI**: shadcn/ui + Tailwind CSS
- **Storage**: Local filesystem + AWS S3
- **Charts**: Recharts
- **Icons**: Lucide React

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- Docker (for PostgreSQL)
- npm or yarn

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Start Database (Docker)

We use Docker PostgreSQL to avoid local installation issues:

```bash
docker-compose up -d
```

The database will be available on port **5434** (to avoid conflicts with local PostgreSQL).

### 3. Setup Database Schema

Push the Prisma schema to create all tables:

```bash
npm run db:push
```

### 4. Seed User Accounts

Create initial user accounts:

```bash
npm run db:seed
```

This creates **9 user accounts** (all with password: `admin123`):

| Email | Role |
|-------|------|
| `admin@esset.com` | Administrator |
| `ceo@esset.com` | CEO |
| `purchasing@esset.com` | Purchasing Manager |
| `security@esset.com` | Security Officer |
| `quality@esset.com` | Quality Inspector |
| `warehouse@esset.com` | Warehouse Manager |
| `plant@esset.com` | Plant Manager |
| `export@esset.com` | Export Manager |
| `finance@esset.com` | Finance Manager |

### 5. Start Development Server

```bash
npm run dev
```

### 6. Login

Visit [http://localhost:3000](http://localhost:3000) and login with any account above.

---

**📖 For detailed setup instructions, see [GETTING_STARTED.md](GETTING_STARTED.md)**

## Project Structure

```
esset-dash/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Database seeding script
├── src/
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # Dashboard pages
│   │   ├── login/          # Authentication
│   │   └── ...             # Other modules
│   ├── components/
│   │   ├── layout/         # Layout components (Sidebar, Navbar)
│   │   ├── ui/             # shadcn/ui components
│   │   └── providers/      # Context providers
│   ├── lib/
│   │   ├── auth.ts         # NextAuth configuration
│   │   ├── auth-helpers.ts # Auth utility functions
│   │   ├── prisma.ts       # Prisma client
│   │   └── utils.ts        # Utility functions
│   └── types/              # TypeScript type definitions
└── uploads/                # Local file storage
```

## Database Schema

### Core Entities

- **User**: System users with role-based access
- **Supplier**: Coffee suppliers with origin and certifications
- **Batch**: Core entity tracking coffee through the pipeline
- **VehicleWeighingRecord**: Security checkpoint weighing
- **WarehouseEntry**: Arrival and storage tracking
- **QualityCheck**: QC results and sample management
- **Contract**: Buyer contracts with CEO approval
- **Shipment**: Export shipments with documents
- **ProcessingRun**: Processing operations and yields
- **Document**: File attachments
- **AuditLog**: Complete audit trail

## Workflows

### Purchase to Export Flow

1. **Purchase**: Purchasing team creates purchase order
2. **Weighing**: Security weighs truck at gate, uploads authority docs
3. **Warehouse**: Warehouse receives and assigns storage location
4. **Quality Check**: QC team inspects, records moisture, takes samples
5. **Storage**: Coffee waits for buyer contract
6. **Contract**: Export manager creates contract, CEO approves
7. **Processing**: Plant manager processes coffee (export/reject/jotbag)
8. **PSS**: Quality sends pre-shipment sample to buyer
9. **Export**: If approved, moves to export warehouse
10. **CLU Check**: Government quality inspection
11. **Shipping**: Documents uploaded, shipment tracked
12. **Payment**: Finance records bank receipt

## Roles & Permissions

- **CEO**: View all data, approve contracts, set prices
- **Purchasing**: Create purchases, view suppliers
- **Security**: Record weighings, upload authority documents
- **Quality**: Perform QC checks, manage samples, send PSS
- **Warehouse**: Receive batches, manage stock, track aging
- **Plant Manager**: Schedule and execute processing runs
- **Export Manager**: Create contracts, request processing, manage shipments
- **Finance**: Track payments, upload receipts
- **Admin**: Full system access, user management

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio (database GUI)

## Next Steps

After basic setup, you can:

1. Create sample suppliers
2. Create purchase orders
3. Track coffee through the pipeline
4. Generate reports and analytics
5. Configure AWS S3 for cloud storage (optional)
6. Set up email notifications (optional)

## 📚 Documentation

- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Complete getting started guide
- **[DOCKER_SETUP.md](DOCKER_SETUP.md)** - Docker PostgreSQL guide and commands
- **[DATABASE_SETUP_COMPLETE.md](DATABASE_SETUP_COMPLETE.md)** - Current setup status

## Troubleshooting

### Database Connection Issues

Make sure Docker PostgreSQL is running:

```bash
docker ps --filter name=esset-postgres
```

If not running, start it:

```bash
docker-compose up -d
```

### Port Already in Use

If port 5434 is already in use, edit `docker-compose.yml` and `.env` to use a different port.

### Reset Everything

To start fresh (deletes all data):

```bash
docker-compose down -v
docker-compose up -d
npm run db:push
npm run db:seed
```

### Dependency Issues

Use `--legacy-peer-deps` flag when installing packages:

```bash
npm install --legacy-peer-deps
```

### Authentication Issues

Clear cookies and try logging in again. Ensure `.env` file exists and has correct settings.

## 🛠️ Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Database
npm run db:push          # Update database schema
npm run db:seed          # Seed user accounts
npm run db:studio        # Open Prisma Studio GUI

# Docker
docker-compose up -d     # Start PostgreSQL
docker-compose down      # Stop PostgreSQL
docker-compose down -v   # Stop and delete data
docker logs esset-postgres # View PostgreSQL logs
```

## Support

For issues or questions, contact the development team.

## License

Proprietary - Esset Coffee
