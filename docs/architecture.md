# Architecture

## Stack

| Layer | Technology |
|---|---|
| Frontend | React with Vite |
| Auth | Firebase Auth (email/password, Google, Microsoft Entra ID) |
| Database | Cloud Firestore |
| File storage | Firebase Storage |
| Backend | Cloud Functions (Node.js, `asia-southeast1`) |
| Hosting | Firebase Hosting |
| CI/CD | GitHub Actions |
| PDF generation | `@react-pdf/renderer` |
| QR codes | `qr-code-styling` (generate), `jsQR` (decode) |

## Code organization

The frontend follows a **services → hooks → components** layering:

- **Services**: all Firestore and Firebase calls. No React.
- **Hooks**: state, subscriptions, and derived data built on services.
- **Components and pages**: rendering only.

```
src/
├── services/      Firestore/Auth access
├── hooks/         Data and form logic
├── components/    Reusable UI (Table, Card, Pagination, panels)
├── pages/         Route-level screens
├── data/          Constants and table column definitions
├── context/       AuthContext and dashboard contexts
└── utils/         Formatting and text helpers

functions/src/
├── https/         Callable and HTTP functions
├── triggers/      Firestore triggers
├── utils/         Shared helpers (email)
├── config/
├── data/
└── script/        One-off admin scripts
```

## Roles

| Role | Access |
|---|---|
| `admin` | Full access; approves transfers, manages custodians and rooms |
| `fulltime` | Faculty; sees assets assigned to them |
| `parttime` | Part-time faculty; sees assets assigned to them |

Roles are stored on the Firestore `user` document and read server-side. Firestore Security Rules check admin status with a `get()` on that document. Routing is guarded by `ProtectedRoute` and `RoleRoute`.

## Firestore collections

| Collection | Purpose |
|---|---|
| `asset` | Registered equipment (`cict-{number}` IDs) |
| `user` | Custodian and staff profiles with roles |
| `room` | Rooms and laboratories |
| `category` | Asset categories |
| `report` | Damage and missing-item reports |
| `transfer_request` | Custody transfer requests |
| `transfer_room` | Admin-only room moves |
| `audit_room` | Room audit sessions |
| `audit_report` | Consolidated audit report logs |
| `counters` | Sequential ID counters |

### Subcollections

- `audit_room/{id}/audit_item`: scanned items (asset ID as document ID, so writes are idempotent)
- `audit_room/{id}/discrepancy_item`: assets found in the wrong room

### ID formats

| Entity | Format |
|---|---|
| Asset | `cict-{number}` |
| Room audit | `AR…` |
| Audit report log | `ASM…` |
| Incident report | `RPT-…` |

Sequential IDs are generated in Firestore transactions against the `counters` collection.

## Key workflows

### Transfer requests

Types: `assign_custodian`, `transfer_custodian`, `assign_local_mr`, `remove_custodian`, `remove_local_mr`.

Status flow: `pending` → `for_approval` → `completed` or `denied`. Admin-initiated requests skip `for_approval`.

Completion requires acknowledgment from the `admin`, `from`, and `to` parties. A party with a `null` uid needs no acknowledgment.

### Incident reports

Lifecycle: `damaged` or `missing` → `for_repair` or `found` → `working` or `condemned`. Each report keeps a `status_log` array recording every change with its date, note, and optional photo.

### Audit discrepancies

Types: `missing`, `misplaced`, `unexpected`. A missing item can create a linked report.

### Depreciation

Computed on read, not stored. Uses the COA straight-line method with 10% salvage value. Useful life depends on category (for example IT equipment 5 years, furniture 10 years, buildings 30 years). Assets at or above ₱50,000 are classed as PAR; below that, ICS.

## Public QR route

`/asset/:assetId` is a public preview page for scanned QR codes. It reads from the `assetPreviews` collection, which the `syncAssetPreview` Cloud Function keeps in sync. Authenticated users are routed to `/asset/info/:assetId` for the full record.

## Branding

Maroon `#860100`, gold `#f5aa2c`, font Sansation. Firestore field names use `snake_case`. Dark theme is driven by `[data-theme="dark"]` on the layout wrapper.

[← Back to README](../README.md)
