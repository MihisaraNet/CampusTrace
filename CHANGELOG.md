# Changelog

All notable changes to the **CampusTrace** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-04

### 🚀 Highlights & Initial Release
CampusTrace is a full-stack campus Lost & Found management system built with Express.js, MongoDB Atlas, React 19, Vite, and Cloudinary.

### ✨ Features Added
- **Authentication & Authorization**:
  - JWT-based authentication with bcrypt password hashing.
  - Role-based access control supporting `student` and `admin` roles.
  - Protected API routes and client-side route guards.
- **Lost & Found Item Tracking**:
  - Full CRUD operations for reporting and tracking Lost and Found items.
  - Text search indexing and categorized filtering with server-side pagination.
  - Cloudinary integration with Multer for secure image uploads and asset cleanup on deletion.
- **Claims & Resolution Workflow**:
  - Student claim submission with dynamic item references (`LostItem` / `FoundItem`).
  - Administrative review workflows (approve, reject, mark returned).
- **Admin Dashboard**:
  - System metric counters (total items, claims, resolution rates).
  - Real-time activity feed and user role management.
- **Modern User Experience**:
  - Responsive glassmorphism interface with custom dark/light theme switching.
  - Live WebSocket broadcast support for real-time updates.
  - Dedicated "About App" page and transparent student-centric navigation.
- **Security & Reliability**:
  - Helmet security HTTP headers and express-rate-limit protection.
  - Strict environment variable validation on startup.
  - CORS configuration for cross-origin client integration.

### 🧪 Testing & Build
- Added Jest test suite for backend API endpoints and health checks.
- Added Vitest + React Testing Library suite for client component testing.
- Automated client build pipeline configured for production deployment.
