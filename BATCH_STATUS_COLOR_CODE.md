# Batch Status Color Code System

## Color Code Design Philosophy

The color system is designed to communicate batch status at a glance, following universal UX patterns:
- **Yellow/Amber** = Pending/Awaiting Action (needs attention)
- **Green** = Success/Completed/In Progress (positive state)
- **Blue** = In Process/Active (currently being worked on)
- **Red** = Error/Rejected (needs attention, negative state)
- **Gray** = Completed/Final (no action needed)
- **Purple/Indigo** = Special States (processing, export ready)

## Complete Color Code System

### Status Colors & Meanings

| Status | Color | Hex | Meaning | Action Required | Who Needs to Act |
|--------|-------|-----|---------|----------------|------------------|
| **ORDERED** | 🟡 Yellow | `#FEF3C7` | Purchase order created, awaiting delivery | Yes | Security (weighing) |
| **AT_GATE** | 🟠 Orange | `#FED7AA` | Arrived at gate, needs weighing | Yes | Security (complete weighing) |
| **AT_WAREHOUSE** | 🟢 Green | `#D1FAE5` | Weighed, ready for warehouse receipt | Yes | Warehouse (receive batch) |
| **STORED** | 🟢 Green | `#D1FAE5` | Received and stored in warehouse | Yes | Quality (inspect) or Processing |
| **PROCESSING_REQUESTED** | 🔵 Blue | `#DBEAFE` | Requested for processing | Yes | Plant Manager (start processing) |
| **IN_PROCESSING** | 🟣 Purple | `#E9D5FF` | Currently being processed | No | Plant Manager (monitoring) |
| **PROCESSED** | 🔷 Teal | `#CCFBF1` | Processing complete | Yes | Export Manager (create contract) |
| **EXPORT_READY** | 🔵 Indigo | `#E0E7FF` | Ready for export | Yes | Export Manager (ship) |
| **IN_TRANSIT** | 🔷 Cyan | `#CFFAFE` | Shipped, in transit | No | Export Manager (tracking) |
| **SHIPPED** | ⚪ Gray | `#F3F4F6` | Delivered, complete | No | None (archived) |
| **REJECTED** | 🔴 Red | `#FEE2E2` | Failed QC or rejected | Yes | CEO/Admin (review) |
| **REPROCESSING** | 🟡 Amber | `#FEF3C7` | Being reprocessed | No | Plant Manager (monitoring) |

## Visual Indicators

### In Dropdowns
- **Batch Number** appears with colored dot/badge next to it
- **Status Badge** shows status name with matching color
- **Aging Indicator** (🔴 red dot) appears if coffee is 6+ months old

### Color Intensity Guide
- **Light Background** (`-100`): For badges and backgrounds
- **Dark Text** (`-800`): For text on light backgrounds
- **Border** (`-300`): For borders and outlines

## Usability Scenarios

### Scenario 1: Security Dashboard
**View:** Dropdown shows batches to weigh
- 🟡 **Yellow (ORDERED)** = "New batch arrived, needs weighing"
- 🟠 **Orange (AT_GATE)** = "Weighing in progress"

**Action:** Security sees yellow batches, selects one, weighs it → Status changes to AT_GATE (orange) → Then to AT_WAREHOUSE (green)

### Scenario 2: Warehouse Dashboard
**View:** Dropdown shows batches to receive
- 🟠 **Orange (AT_GATE)** = "Weighed at gate, ready to receive"
- 🟡 **Yellow (ORDERED)** = "Direct delivery (bypass gate)"

**Action:** Warehouse sees orange/green batches, receives them → Status changes to STORED (green)

### Scenario 3: Quality Dashboard
**View:** Dropdown shows batches to inspect
- 🟢 **Green (STORED)** = "In warehouse, ready for QC"
- 🟢 **Green (AT_WAREHOUSE)** = "Alternative status, ready for QC"
- 🔷 **Teal (PROCESSED)** = "Post-processing QC"
- 🔵 **Indigo (EXPORT_READY)** = "Pre-export QC"

**Action:** Quality inspects batch → No status change (QC doesn't change batch status)

### Scenario 4: Processing Dashboard
**View:** Dropdown shows batches to process
- 🟢 **Green (STORED)** = "Stored in warehouse, ready to process"
- 🟢 **Green (AT_WAREHOUSE)** = "Alternative status, ready to process"

**Action:** Processing selects batch → Status changes to IN_PROCESSING (purple) → Then PROCESSED (teal)

### Scenario 5: Export Dashboard
**View:** Dropdown shows batches ready for export
- 🔷 **Teal (PROCESSED)** = "Processing complete, ready for export"
- 🔵 **Indigo (EXPORT_READY)** = "Ready to ship"

**Action:** Export creates contract → Status changes to EXPORT_READY (indigo) → Then IN_TRANSIT (cyan) → Finally SHIPPED (gray)

### Scenario 6: CEO Dashboard
**View:** All batches with status overview
- 🟡 **Yellow** = Needs attention (pending actions)
- 🔴 **Red** = Rejected, needs review
- ⚪ **Gray** = Completed, archived

**Action:** CEO reviews pending approvals, rejected batches

## Color Accessibility

All colors meet WCAG AA contrast requirements:
- Light backgrounds (`-100`) with dark text (`-800`) = 4.5:1+ contrast ratio
- Color-blind friendly: Uses both color AND text labels
- Status badges include both color and text for clarity

## Implementation

Colors are defined in `src/lib/format-utils.ts` using Tailwind CSS classes:
- Background: `bg-{color}-100`
- Text: `text-{color}-800`
- Border: `border-{color}-300`

## Status Flow with Colors

```
🟡 ORDERED (Yellow - Pending)
   ↓ Security weighs
🟠 AT_GATE (Orange - At Gate)
   ↓ Warehouse receives
🟢 STORED (Green - In Warehouse)
   ↓ Quality inspects (no status change)
   ↓ Processing starts
🟣 IN_PROCESSING (Purple - Active)
   ↓ Processing completes
🔷 PROCESSED (Teal - Ready)
   ↓ Export creates contract
🔵 EXPORT_READY (Indigo - Ready to Ship)
   ↓ Shipment
🔷 IN_TRANSIT (Cyan - Shipping)
   ↓ Delivered
⚪ SHIPPED (Gray - Complete)
```

## Error States

- 🔴 **REJECTED (Red)** = Failed QC or rejected during processing
- 🟡 **REPROCESSING (Amber)** = Being reprocessed after rejection

## Aging Indicator

- 🔴 **Red Dot** = Coffee stored 6+ months (180+ days)
- Appears alongside any status color
- Indicates urgent action needed





