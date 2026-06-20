<div align="center">

<img src="https://firebasestorage.googleapis.com/v0/b/ams-cict.firebasestorage.app/o/images%2Fcictlogo.jfif?alt=media&token=5ce68321-b3ef-40a4-86b5-6bcc42d7735e" width="90" alt="CICT Logo" />

# CICT Asset Management System

**Bulacan State University**
College of Information and Communications Technology
BSIT 3G — G2, Group 5

A web-based capstone project for tracking, registering, and monitoring institutional assets — built to replace manual, paper-based asset records with a fast, auditable digital system.

[![Status](https://img.shields.io/badge/status-testing%20phase-f5aa2c?style=flat-square&labelColor=860100)](#project-status)
[![React](https://img.shields.io/badge/React-Vite-f5aa2c?style=flat-square&labelColor=860100)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%7C%20Auth%20%7C%20Storage-f5aa2c?style=flat-square&labelColor=860100)](https://firebase.google.com/)
[![Deployed](https://img.shields.io/badge/Live-ams--cict.web.app-f5aa2c?style=flat-square&labelColor=860100)](https://ams-cict.web.app)

</div>

---

## About the Project

The **CICT Asset Management System (CICT-AMS)** is designed to give the College of Information and Communications Technology a centralized, role-aware platform for managing physical assets — from registration and room assignment to custodian accountability and condition reporting. Every asset carries a traceable history, so administrators and custodians always know what exists, where it is, who's responsible for it, and what condition it's in.

> 📌 This repository is currently in its **testing phase**. Features are functional but actively being refined ahead of final deployment.

---

## ✨ Features

- **Asset Registration** — Multi-step registration wizard with image uploads, auto-generated asset IDs (`cict-XXXX`), and custodian assignment
- **QR-Based Asset Lookup** — Each asset gets a scannable QR code linking to a public info view, no login required for quick lookups
- **Custodian Management** — Admins can onboard custodians with automated welcome emails and secure password setup
- **Room Management** — Assets are organized by room with live asset counts per room
- **Condition Reporting** — Status logs track an asset's condition history over time, separate from the core asset record
- **Role-Based Access Control** — Tailored views and permissions for **Admin**, **Full-time**, and **Part-time** custodians
- **Smart Filtering & Search** — Filter assets by status, category, room, and custodian, with context-aware filter visibility based on role

---

## 🛠️ Tech Stack

| Layer                 | Technology                    |
| --------------------- | ----------------------------- |
| Frontend              | React + Vite                  |
| Styling               | Custom CSS                    |
| Backend / Database    | Firebase Firestore            |
| Authentication        | Firebase Auth                 |
| File Storage          | Firebase Storage              |
| Serverless Functions  | Firebase Cloud Functions (v2) |
| Email Delivery        | Resend                        |
| Component Development | Storybook                     |
| Hosting               | Firebase Hosting & Vercel     |

---

## 🔗 Live Demo

🌐 **[ams-cict.web.app](https://ams-cict.web.app)**

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/arji-hub/AssetManagement.git
cd AssetManagement

# Install dependencies
npm install

# Run the development server
npm run dev
```

> A Firebase project configuration (`.env`) is required to run the app with live data. Contact a project maintainer for access to development credentials.

---

## 📂 Project Status

| Phase                | Status         |
| -------------------- | -------------- |
| Core Architecture    | ✅ Complete    |
| Asset Registration   | ✅ Complete    |
| Custodian Management | ✅ Complete    |
| Room Management      | ✅ Complete    |
| QR Code Integration  | ✅ Complete    |
| Report Management    | 🔧 In Progress |
| System-Wide Testing  | 🔧 In Progress |

---

## 👥 Team

Developed by **Group #5 BSIT 3G — G4**
College of Information and Communications Technology
Bulacan State University

---

<div align="center">

<sub>© 2026 CICT Asset Management System. Capstone Project — Bulacan State University.</sub>

</div>
