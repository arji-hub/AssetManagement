# CICT-AMS

Asset management system for the Bulacan State University College of Information and Communications Technology (CICT). It replaces paper-based inventory with real-time digital tracking, QR code verification, role-based access, and full asset lifecycle records.

🔗 **Live:** https://ams-cict.web.app

## Features

- **Assets**: registration wizard, QR stickers, search and condition filters
- **Audit**: room-by-room QR scanning with exportable PDF audit reports
- **Reports**: damage and missing-item tracking through to resolution
- **Transfers**: custody and room changes with acknowledgments and a chain-of-custody log
- **Rooms and Custodians**: location manifests, PAR/ICS generation
- **Dashboard**: live metrics for admins and faculty

## Tech Stack

React (Vite) · Firebase (Auth, Firestore, Storage, Hosting) · Cloud Functions (Node.js) · GitHub Actions

## Quick Start

```bash
git clone https://github.com/arji-hub/AssetManagement.git
cd AssetManagement
npm install
cp .env.example .env   # fill in your Firebase keys
npm run dev
```

Full setup, environment variables, and deployment are covered in [Getting Started](docs/getting-started.md).

## Documentation

| Doc | Description |
|---|---|
| [Getting Started](docs/getting-started.md) | Installation, environment, deployment |
| [Architecture](docs/architecture.md) | Folder structure, roles, Firestore schema |
| [Cloud Functions](docs/cloud-functions.md) | Triggers, email notifications, deployment |
| [User Guide](docs/user-guide/README.md) | How to use each tab |

## Team

BSIT 4GG2, Bulacan State University

## License

Add your license here.
