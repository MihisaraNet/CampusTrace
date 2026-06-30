# CampusTrace 🎒

CampusTrace is a modern, high-end, full-stack Lost & Found web application tailored for educational campuses. Built using the **MERN** stack (MongoDB, Express, React, Node.js), it connects students who have lost personal belongings with finders or administrators who have retrieved them.

---

## 🌟 Key Features

### For Students
* **Report Lost Items**: Submit detailed reports of lost belongings, including category, description, last-seen location, date, and image uploads.
* **Report Found Items**: Share details of items found on campus to help find their rightful owners.
* **Claim Management**: Submit claims for found items with verified descriptions, proof of ownership, and Student ID verification.
* **Personal Dashboard**: Track submitted lost items, found items, and claim requests in a centralized view.

### For Administrators
* **Centralized Claim Processing**: Approve, reject, or mark claims as returned.
* **Unified Metrics**: Real-time admin dashboard tracking total lost reports, active claims, resolved items, and system statistics.
* **User Management**: Monitor campus users and enforce security rules.

### Premium Design & UX
* **High-End Glassmorphic Styling**: Sleek UI designed with Outfit typography, custom scrollbars, and dynamic blurred background overlays.
* **Dual-Theme Support**: Instant transitions between sophisticated light and dark modes with customized HSL color systems.
* **Offline Mock Failover**: A robust frontend architecture that automatically falls back to an offline LocalStorage database if the Node/Express backend or MongoDB instance is unreachable.

---

## 🛠️ Technology Stack

* **Frontend**: React (Vite), React Router (v7), Context API (Auth & Theme), Vanilla CSS.
* **Backend**: Node.js, Express, MongoDB, Mongoose ODM.
* **File Uploads**: Multer, Cloudinary (Direct image streaming, scaling, and quality compression).
* **Security & Auth**: JSON Web Tokens (JWT), role-based middleware (`protect`, `isAdmin`), and bcrypt password hashing.

---

## 📁 Repository Structure

```text
CampusTrace/
├── client/                 # React SPA (Vite)
│   ├── public/             # Static icons and assets
│   ├── src/
│   │   ├── assets/         # App logos and illustrations
│   │   ├── components/     # Reusable UI components (GlassCard, ItemCard, etc.)
│   │   ├── context/        # Auth & Theme state providers
│   │   ├── pages/          # Main application views (Dashboard, Admin panel, etc.)
│   │   ├── services/       # Failover-capable API integrations
│   │   ├── App.jsx         # App router and layouts
│   │   └── index.css       # Core stylesheets and variables
├── config/                 # Database configuration
├── controllers/            # Request handlers & business logic
├── middleware/             # Authentication & media upload guards
├── models/                 # Mongoose schemas (User, LostItem, FoundItem, Claim)
├── routes/                 # API endpoints
├── server.js               # Node.js Express server entrypoint
└── package.json            # Node.js project configuration
```

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+ recommended)
* [MongoDB](https://www.mongodb.com/) (Local server or MongoDB Atlas Cluster)
* [Cloudinary](https://cloudinary.com/) Account (for image uploads)

### 1. Server Configuration
Clone the repository, navigate to the root directory, and install backend dependencies:
```bash
npm install
```

Create a `.env` file in the root folder using `.env.example` as a template:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_token
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLIENT_URL=http://localhost:5173
```

Start the backend server in development mode:
```bash
npm run dev
```
The server will run on `http://localhost:5000`.

### 2. Client Configuration
Open a new terminal window, navigate to the `client/` folder, and install dependencies:
```bash
cd client
npm install
```

Start the Vite development server:
```bash
npm run dev
```
The client app will open on `http://localhost:5173`.

---

## 🔌 Offline Failover Mode
If you wish to test or present the frontend UI without setting up a backend server or MongoDB:
1. Ensure the backend server is stopped.
2. Launch the frontend React app (`npm run dev` inside `client/`).
3. The application will automatically detect that the backend is offline and switch to the **client-side Mock Database** (persisted in LocalStorage).
4. Any registered users, reported items, or claims will save locally to your browser. Use the mock account `admin@campustrace.edu` (any password works) to access the administrator dashboard.

---

## 📄 License
This project is licensed under the **MIT License**.

Copyright (c) 2026 Isula Mihisara (MihisaraNet). All rights reserved.
