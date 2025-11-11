<!-- a1901e9d-53af-4c37-8078-e933f9f66538 7ee10960-145f-44ef-80e3-d76566549893 -->
# Coffee Supply Chain Dashboard Implementation Plan

## Phase 1: Foundation & Infrastructure

### Prompt 1: Core Dependencies & Project Structure

Install and configure all required dependencies for the full stack application:

- Install Prisma with PostgreSQL adapter, @prisma/client
- Install NextAuth.js v5 (next-auth@beta) with Prisma adapter
- Install shadcn/ui CLI and core components (button, card, table, form, dialog, select, input, textarea, badge, alert, dropdown-menu, tabs, avatar, separator)
- Install form libraries: react-hook-form, zod, @hookform/resolvers
- Install date utilities: date-fns
- Install AWS SDK v3 (@aws-sdk/client-s3, @aws-sdk/s3-request-presigner) for file storage
- Install chart libraries: recharts for analytics
- Install icons: lucide-react
- Install additional utilities: clsx, tailwind-merge, sonner (for toast notifications)
- Create folder structure: `src/lib/`, `src/components/`, `src/app/api/`, `src/types/`, `src/hooks/`, `uploads/`

### Prompt 2: Database Schema Design

Create comprehensive Prisma schema with all entities:

- User model with roles (CEO, Purchasing, Security, Quality, Warehouse, PlantManager, ExportManager, Finance, Admin)
- Supplier model (id, name, origin, contact, certifications)
- Batch model (core entity tracking coffee batches with all fields from spec)
- VehicleWeighingRecord (security checkpoint weighing data)
- WarehouseEntry (arrival and storage details)
- QualityCheck (moisture, defects, pass/fail, samples)
- StockMovement (tracking all movements)
- ProcessingRun (input/output batches, yields)
- Contract (buyer contracts with CEO approval)
- Shipment (export shipments with documents)
- Document (file attachments linked to batches/shipments)
- AuditLog (complete audit trail)
- RepresentativeSample (quality team sample management)
- Initialize Prisma, create migrations, generate client

### Prompt 3: Authentication System with RBAC

Implement NextAuth.js with role-based access control:

- Configure NextAuth with credentials provider and Prisma adapter
- Create auth API route `/api/auth/[...nextauth]/route.ts`
- Define permission system for each role (CEO view-only except contracts, Purchasing create POs, Security weighing, etc.)
- Create middleware for protected routes
- Create auth helper utilities: `getCurrentUser()`, `hasPermission()`, `requireRole()`
- Create login page with role selection
- Seed initial admin user

### Prompt 4: File Storage System

Implement dual storage (local filesystem + AWS S3):

- Create file upload utilities supporting both local and S3
- Create API route `/api/upload` handling multipart uploads
- Implement file type validation (PDF, images for documents)
- Create presigned URL generation for secure file access
- Organize uploads by type: `/uploads/authority-docs/`, `/uploads/quality-samples/`, `/uploads/bills/`, `/uploads/contracts/`
- Create document management utilities

### Prompt 5: Core UI Components & Layout

Build reusable UI components and app shell:

- Create main layout with top navigation (role indicator, notifications bell, global search)
- Create sidebar navigation with modules: Dashboard, Purchasing, Weighing, Warehouse, Quality, Processing, Export, Finance, Reports, Admin
- Create batch progress bar component (horizontal stepper showing: Ordered → Weighing → Warehouse → Stored → Processing → Export → Shipped)
- Create document attachment panel component with preview and upload
- Create weight loss visualization component
- Create data table component with sorting, filtering, pagination
- Create CEO report toggle component
- Configure toast notifications with sonner

## Phase 2: Core Modules (MVP)

### Prompt 6: Purchasing Module

Implement purchase order creation and management:

- Create `/app/purchasing/page.tsx` with purchase list table
- Create purchase form dialog (supplier, origin, quantity, cost, purchase date, containers, processing type)
- Create API routes: `POST /api/purchases`, `GET /api/purchases`, `GET /api/purchases/[id]`
- Implement supplier management: create/list suppliers
- Add document upload for purchase documents
- Show purchase status and link to batch progress
- Implement finance access gating (visible only after 1st QC for purchasing role)

### Prompt 7: Weighing Room (Security Checkpoint 1)

Build vehicle weighing and security checkpoint:

- Create `/app/weighing/page.tsx` for weighing operations
- Create weighing form: vehicle plate, gross weight in (car+coffee), timestamp
- Add Coffee & Tea Authority document upload at this checkpoint
- Create outbound weighing: gross weight out, compute net weight automatically
- Implement weight calculation logic with tare weight handling
- Generate weight loss report (compare purchased qty vs net weight)
- Create API routes: `POST /api/weighings`, `GET /api/weighings`, `PATCH /api/weighings/[id]`
- Flag discrepancies > threshold (e.g., >5% loss)

### Prompt 8: Warehouse Arrival & Management

Implement warehouse receiving and stock management:

- Create `/app/warehouse/page.tsx` with stock ledger view
- Create arrival form: assign warehouse number, record arrival weight, storage location
- Implement search by warehouse number, supplier, origin
- Create second weight loss report (purchased → weighed at gate → weighed at warehouse)
- Show stock movements table per batch
- Create aging report view (filter by days: >30, >60, >90)
- API routes: `POST /api/warehouse/arrivals`, `GET /api/warehouse/stock`, `GET /api/warehouse/aging`

### Prompt 9: Quality Check System

Build comprehensive quality control module:

- Create `/app/quality/page.tsx` for QC operations
- Create QC form: moisture %, defects score, sample photos upload, pass/fail, notes
- Implement moisture validation rules: highlight 9-12% normal, flag >12% (blocks processing)
- Create representative sample management (photo, metadata, storage location)
- Link samples to batches (one representative sample per batch)
- Create QC checkpoint tracking (1st QC at warehouse, post-processing QC, CLU QC)
- API routes: `POST /api/quality-checks`, `GET /api/quality-checks`, `POST /api/samples`
- Show QC history per batch with timeline

### Prompt 10: Batch Detail & Progress Tracking

Create comprehensive batch detail page:

- Create `/app/batches/[id]/page.tsx` showing full batch lifecycle
- Display horizontal progress bar with all states and timestamps
- Show all related records: weighings, warehouse entries, QC checks, movements
- Display current location and status
- Show weight loss summary across all checkpoints
- Show attached documents with preview
- Show representative sample details
- Create audit log section showing all changes
- Implement batch search and filter on main batches list page

### Prompt 11: Stock Movement & Audit System

Implement stock tracking and audit trail:

- Create StockMovement records for every batch state change
- Implement automatic audit logging for all create/update/delete operations
- Create `/app/admin/audit-logs/page.tsx` for audit trail viewing (Admin role only)
- Show who changed what, when, before/after values
- Create stock movement API: `POST /api/stock-movements`, `GET /api/stock-movements`
- Create audit API: `GET /api/audit-logs` with filtering by user, entity, date

### Prompt 12: CEO Dashboard (Phase 1)

Build executive dashboard with key metrics:

- Create `/app/dashboard/page.tsx` as default landing
- Implement KPI cards: Total stock (kg), Today's arrivals, Weight loss (30 days), Rejected kg, Avg moisture, Value-at-hand, Aging stock buckets
- Create pipeline view showing counts by state (At Gate, At Warehouse, Processing, Export Ready, In Transit)
- Show top performing origins/grades (best yield, lowest weight loss)
- Create "Which coffee to sell" table (ranked by weight × cost and aging days)
- Add upcoming alerts timeline (shipping dates color-coded, QC failures, permits missing)
- API routes: `GET /api/reports/dashboard-kpis`, `GET /api/reports/pipeline-status`

## Phase 3: Advanced Modules (Processing & Export)

### Prompt 13: Processing Module

Implement coffee processing workflows:

- Create `/app/processing/page.tsx` for processing runs
- Create processing form: select input batches, define output split (export/reject/jotbag)
- Implement weight checkpoint before processing (third weight loss report)
- Create processing run with start/end time, yield calculations
- Generate output batches: export batch(es), reject batch(es), jotbag
- Track reprocessing count when batches fail QC
- Create post-processing QC workflow
- API routes: `POST /api/processing`, `GET /api/processing`, `PATCH /api/processing/[id]`
- Block processing if no buyer contract exists for export batches

### Prompt 14: Contract Management & CEO Approval

Build buyer contract system:

- Create `/app/contracts/page.tsx` with contract list
- Create contract form: contract number, buyer, destination, coffee type, grade, quantity, price, shipping date
- Implement CEO approval workflow (contracts show pending until CEO approves)
- Add CEO price-setting capability
- Link contracts to batches (required before processing)
- Show contract status badges (Pending, Approved, In Progress, Completed)
- API routes: `POST /api/contracts`, `GET /api/contracts`, `PATCH /api/contracts/[id]/approve` (CEO only)
- Send notification to export manager on approval

### Prompt 15: PSS (Pre-Shipment Sample) Workflow

Implement PSS buyer confirmation system:

- Create PSS management in quality module
- After processing, QC team sends PSS to buyer for approval
- Create PSS record with buyer email, sent date, status (Pending, Accepted, Rejected)
- If PSS rejected, mark batch for reprocessing (move back to arrival warehouse)
- If accepted, unlock export warehouse workflow
- Create email integration stub (manual for now, integration in Phase 3)
- API routes: `POST /api/pss`, `PATCH /api/pss/[id]/buyer-response`
- Track PSS attempts and buyer feedback

### Prompt 16: Export Warehouse & Booking

Build export preparation module:

- Create `/app/export/page.tsx` for export management
- Move approved batches to export warehouse (after PSS approval)
- Create booking form: shipping line, booking number, container details
- Implement payment method selection (TT, LC, CAD)
- Create CLU quality check workflow (government inspection)
- If CLU fails, mark for reprocessing
- Track permit requests to Revenue Ministry and Banks
- API routes: `POST /api/export/bookings`, `POST /api/export/clu-checks`

### Prompt 17: Shipment Tracking & Documentation

Implement shipment lifecycle management:

- Create `/app/shipments/page.tsx` with shipment list
- Create shipment detail page with document uploads
- Upload draft bill of lading, original bill, export certificates
- Implement shipping date color coding (green >14 days, yellow 7-14, red ≤7 days)
- Track shipment states: Booked → Documents Ready → In Transit → Arrived → Paid
- Create port/transit status updates
- API routes: `POST /api/shipments`, `PATCH /api/shipments/[id]`, `POST /api/shipments/[id]/documents`

### Prompt 18: Finance Module

Build financial tracking system:

- Create `/app/finance/page.tsx` with payables/receivables ledger
- Link payments to purchase records (purchasing sees this after 1st QC)
- Create payment approval workflow for Finance role
- Upload bank receipt documents
- Mark shipments as paid when bank receipt received
- Track payment methods (TT, LC, CAD) and status
- Calculate revenue by contract and margin estimates
- API routes: `POST /api/finance/payments`, `GET /api/finance/ledger`, `POST /api/finance/receipts`

## Phase 4: Analytics, Reports & Integrations

### Prompt 19: Advanced Weight Loss Analytics

Build comprehensive weight loss reporting:

- Create `/app/reports/weight-loss/page.tsx`
- Show weight loss per checkpoint (gate, warehouse, processing)
- Aggregate by batch, supplier, origin, grade
- Create sparkline + histogram visualizations
- Calculate cumulative weight loss percentage
- Show comparison: expected vs actual across pipeline
- Export weight loss reports as CSV/PDF
- API route: `GET /api/reports/weight-loss`

### Prompt 20: CEO Report Builder

Implement executive reporting system:

- Create `/app/reports/ceo/page.tsx` with report templates
- Pre-built reports: Daily Executive Summary, Weekly Weight Loss, Aging Inventory, Revenue by Origin
- Create ad-hoc report builder with filters (date range, origin, supplier, grade)
- Implement PDF export for all reports
- Add Excel/CSV export capability
- Create report scheduling system (future: email digest)
- API routes: `GET /api/reports/ceo-daily`, `GET /api/reports/export-pdf`, `GET /api/reports/export-excel`

### Prompt 21: Alerts & Notifications System

Build automated alerting:

- Create notification model and API
- Implement alert rules: weight loss >threshold, moisture >12%, shipping date <7 days, PSS rejected, QC failures
- Create notification bell in top nav showing unread count
- Create notifications panel with mark-as-read functionality
- Add email notification templates (for future integration)
- Create notification preferences per user/role
- API routes: `GET /api/notifications`, `PATCH /api/notifications/[id]/read`

### Prompt 22: Advanced Analytics Dashboard

Enhance dashboard with detailed analytics:

- Add moisture distribution chart (histogram showing 9-10%, 10-12%, >12%)
- Create reject rate analysis by origin/grade
- Add processing yield rate trends over time
- Show time-to-process metrics (arrival → export ready)
- Create revenue exposure chart (stock value by origin)
- Add interactive date range filters
- Implement real-time data refresh

### Prompt 23: Admin Panel & User Management

Build administration interface:

- Create `/app/admin/page.tsx` for system administration
- Create user management: add/edit/deactivate users
- Assign roles and permissions
- View system settings
- Create data export controls (toggle CSV export for non-admin roles)
- View audit logs with advanced filtering
- API routes: `POST /api/admin/users`, `PATCH /api/admin/users/[id]`, `GET /api/admin/settings`

### Prompt 24: Email Integration (PSS & Notifications)

Implement email functionality:

- Set up email service (nodemailer or similar)
- Create email templates for PSS buyer confirmation
- Send PSS email with sample photos and details
- Create buyer confirmation link (trackable)
- Implement notification emails for CEO and managers
- Create scheduled report email digest
- API route: `POST /api/email/send-pss`, `POST /api/email/notify`

### Prompt 25: AWS S3 Integration

Configure cloud storage for production:

- Set up AWS S3 bucket configuration
- Implement S3 upload for all document types
- Create presigned URLs for secure downloads
- Set up file retention policies
- Configure CORS for direct uploads
- Create migration script for local → S3
- Add environment variables for AWS credentials

## Phase 5: Sample Data & Testing

### Prompt 26: Sample Data Population

Create realistic test data:

- Create seed script with sample suppliers (Ethiopian origins: Yirgacheffe, Sidama, Guji, etc.)
- Create 20-30 sample batches at various pipeline stages
- Generate historical weighing records with realistic weight loss
- Create QC records with varied moisture levels
- Add sample contracts (some pending CEO approval, some approved)
- Create processing runs with yields
- Add sample shipments at different states
- Seed representative samples
- Create 5-10 users with different roles

### Prompt 27: Testing & Refinement

Implement testing and bug fixes:

- Test complete end-to-end flow: purchase → weighing → arrival → QC → processing → export
- Verify role-based access control (CEO can't edit except contracts, purchasing sees finance after QC)
- Test weight calculations and loss reports
- Verify moisture validation (>12% blocks processing)
- Test contract approval workflow
- Verify document uploads and retrieval
- Test PSS rejection → reprocessing flow
- Check audit logs are capturing all changes
- Verify shipping date color coding
- Test all reports and exports

### Prompt 28: UI/UX Polish & Mobile Responsiveness

Final polish and optimization:

- Ensure all pages are mobile-responsive
- Add loading states and skeletons
- Implement error boundaries and error handling
- Add confirmation dialogs for destructive actions
- Improve form validation messages
- Add tooltips and help text
- Optimize table performance for large datasets
- Add keyboard shortcuts for power users
- Implement dark mode (if desired)
- Create user onboarding tour

## Phase 6: Documentation & Deployment

### Prompt 29: Documentation

Create project documentation:

- Update README with system overview, setup instructions
- Document environment variables needed
- Create user guide for each role
- Document API endpoints (OpenAPI spec)
- Create deployment guide
- Document database schema
- Add troubleshooting guide

### Prompt 30: Deployment Preparation

Prepare for production deployment:

- Create Docker configuration (Dockerfile, docker-compose.yml)
- Set up production environment variables template
- Configure database backup strategy
- Set up file retention policies
- Create health check endpoints
- Configure logging and monitoring
- Create deployment checklist

---

## Implementation Notes

**Key Technical Decisions:**

- Next.js 14+ App Router with Server Components
- PostgreSQL for relational data integrity
- Prisma ORM for type-safe database access
- NextAuth.js v5 for authentication
- shadcn/ui + Tailwind CSS for modern, accessible UI
- Local filesystem + AWS S3 for flexible file storage
- Server Actions for mutations, API routes for complex operations

**Critical Business Rules to Enforce:**

- Moisture >12% blocks processing
- Finance access for purchasing only after 1st QC
- Processing requires buyer contract
- CEO approval required for contracts
- Weight calculations must be audited
- All state changes logged
- Documents required at specific checkpoints

**Performance Considerations:**

- Implement pagination for large tables
- Use database indexes on frequently queried fields (batch_number, supplier_id, warehouse_number)
- Optimize file uploads with chunking for large documents
- Cache dashboard KPIs with appropriate TTL

### To-dos

- [ ] Install all dependencies (Prisma, NextAuth, shadcn/ui, AWS SDK, charts, forms)
- [ ] Create Prisma schema with all 12+ models and relationships
- [ ] Implement NextAuth.js with role-based access control system
- [ ] Set up dual file storage (local + S3) with upload API
- [ ] Build main layout, navigation, and core reusable components
- [ ] Implement purchasing module with PO creation and supplier management
- [ ] Build weighing room with weight calculations and loss reporting
- [ ] Create warehouse arrival, stock management, and aging reports
- [ ] Implement QC system with moisture validation and sample management
- [ ] Build batch detail page with progress bar and full lifecycle view
- [ ] Implement stock movements and audit logging system
- [ ] Create CEO dashboard with KPIs, pipeline view, and top performers
- [ ] Build processing module with yield tracking and output batches
- [ ] Implement contract system with CEO approval workflow
- [ ] Create PSS workflow with buyer confirmation and reprocessing
- [ ] Build export warehouse and booking system with CLU checks
- [ ] Implement shipment tracking with document uploads and date alerts
- [ ] Create finance ledger with payment tracking and bank receipts
- [ ] Build comprehensive weight loss analytics and visualizations
- [ ] Implement CEO report builder with PDF/Excel exports
- [ ] Build alerts and notifications system with rules engine
- [ ] Add advanced analytics (moisture distribution, yields, time-to-process)
- [ ] Create admin panel for user and system management
- [ ] Implement email service for PSS and notifications
- [ ] Configure AWS S3 with presigned URLs and retention policies
- [ ] Create seed script with realistic sample data (suppliers, batches, users)
- [ ] Test end-to-end flows, RBAC, validations, and business rules
- [ ] Polish UI/UX, add mobile responsiveness, loading states, error handling
- [ ] Create comprehensive documentation (README, API docs, user guides)
- [ ] Prepare production deployment (Docker, env config, monitoring)