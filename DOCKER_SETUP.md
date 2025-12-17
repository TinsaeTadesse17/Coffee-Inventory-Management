# Docker PostgreSQL Setup - Esset Coffee Dashboard

## Overview
The project uses Docker for PostgreSQL to avoid local installation issues and ensure consistency across development environments.

## Quick Start

1. **Start PostgreSQL**:
```bash
docker-compose up -d
```

2. **Create Database Tables**:
```bash
npm run db:push
```

3. **Seed User Accounts**:
```bash
npm run db:seed
```

4. **Start Development Server**:
```bash
npm run dev
```

## Database Configuration

- **Host**: localhost
- **Port**: 5434 (to avoid conflicts with local PostgreSQL on 5432)
- **Database**: esset_coffee
- **User**: postgres
- **Password**: postgres

## Connection String
```
postgresql://postgres:postgres@localhost:5434/esset_coffee?schema=public
```

## User Accounts (After Seeding)

All users have the password: **admin123**

| Email | Role | Access Level |
|-------|------|--------------|
| admin@esset.com | Administrator | Full system access |
| ceo@esset.com | CEO | All reports, approvals, analytics |
| purchasing@esset.com | Purchasing | Supplier & PO management |
| security@esset.com | Security | Weighing & vehicle records |
| quality@esset.com | Quality Control | QC checks, samples, PSS |
| warehouse@esset.com | Warehouse | Stock management, aging |
| plant@esset.com | Plant Manager | Processing operations |
| export@esset.com | Export Manager | Contracts, shipments |
| finance@esset.com | Finance | Payments, receipts |

## Docker Commands

### View Logs
```bash
docker logs esset-postgres
```

### Access PostgreSQL CLI
```bash
docker exec -it esset-postgres psql -U postgres -d esset_coffee
```

### Stop PostgreSQL
```bash
docker-compose down
```

### Reset Database (Delete All Data)
```bash
docker-compose down -v
docker-compose up -d
npm run db:push
npm run db:seed
```

### View Running Containers
```bash
docker ps
```

## Prisma Commands

### Open Prisma Studio (Database GUI)
```bash
npm run db:studio
```

### Reset Database Schema
```bash
npx prisma db push --force-reset
npm run db:seed
```

### Generate Prisma Client (After Schema Changes)
```bash
npx prisma generate
```

## Troubleshooting

### Port Already in Use
If port 5434 is already in use, edit `docker-compose.yml`:
```yaml
ports:
  - "5435:5432"  # Change 5434 to another port
```

Then update `.env`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5435/esset_coffee?schema=public"
```

### Connection Refused
1. Check if container is running: `docker ps`
2. Check container logs: `docker logs esset-postgres`
3. Restart container: `docker-compose restart`

### Authentication Failed
1. Stop and recreate with fresh volume:
```bash
docker-compose down -v
docker-compose up -d
```

## Production Considerations

For production, update `docker-compose.yml`:
- Use strong passwords
- Enable SSL/TLS
- Set up backups
- Use managed PostgreSQL service (AWS RDS, Azure Database, etc.)

## Next Steps

After setup is complete:
1. Access the application at http://localhost:3000
2. Login with any of the seeded user accounts
3. Start building modules according to the implementation plan





