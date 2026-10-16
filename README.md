# EduMart - Online Learning Material Store

![EduMart Stack](https://img.shields.io/badge/Docker-Enabled-blue?logo=docker)
![Node.js](https://img.shields.io/badge/Node.js-v20%2Fv22-green?logo=node.js)
![React](https://img.shields.io/badge/React-18.x-61dafb?logo=react)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)
![Tests](https://img.shields.io/badge/Tests-30%20Passing-brightgreen)

## Project Overview

EduMart is an online learning material store — a web-based e-commerce platform for buying and selling educational materials including past papers, e-books, model papers, revision notes, and recorded lecture packs. The platform creates a centralized, trusted marketplace connecting students, tutors, and educational institutes.

This repository contains the **complete source code and verified documentation** for EduMart, featuring a fully containerized architecture (MySQL DB, Node.js/Express API, and React/Nginx frontend), user authentication with JWT & session revocation, role-based access control (RBAC), a 24/7 AI-powered customer support chatbot, and automated testing suites.

---

## ✨ Key Implemented Features

### 1. User Authentication, Session Management & Security
- **Multi-Role Registration & Login**: Role-specific onboarding for **Students**, **Tutors**, **Institutes**, and **Admins** with live password strength meter and "Remember Me" storage persistence (`localStorage` vs `sessionStorage`).
- **Email Verification & Recovery (`emailService.js`)**:
  - Tokenized email verification (`POST /api/auth/verify-email`), Resend Verification Email (`POST /api/auth/resend-verification`), Forgot Password (`POST /api/auth/forgot-password`), and Reset Password (`POST /api/auth/reset-password`).
  - **Strict Inbox Verification via SMTP**: Sends styled HTML verification & password-reset emails via TLS/STARTTLS SMTP (`465`/`587`) directly to the user's registered email address. The account is marked verified only after the email holder clicks the verification link (`http://localhost:3000/verify-email?token=...`) in their email.
- **Session Tracking & Token Revocation**: Active JWT sessions recorded in the `sessions` table (`Session` model) and invalidated immediately upon logout (`POST /api/auth/logout`).
- **OWASP Security Hardening**: 12-round `bcryptjs` password hashing, `validator.escape()` XSS input sanitization, 8+ character password complexity enforcement, and IP-based rate limiting (`authRateLimiter` & `apiRateLimiter`).

### 2. Profile Management & Role-Based Access Control (RBAC)
- **Dynamic Profile Completeness Engine**: Real-time profile completion score (`0–100%`) with actionable next-step tips (email verification, phone number, school/institution).
- **3-Tab Material-UI Profile Dashboard**:
  - **Personal Details**: Update first name, last name, phone number, and school/university/institute.
  - **Security & Password**: Self-service password change (`PUT /api/users/change-password`).
  - **Account Information**: Verification status badge, role badge, User ID, Joined Date, and Last Login timestamp.
- **End-to-End RBAC**: Backend middleware (`protect`, `admin`, `seller`, `institute`, `adminOrSelf`, `authorize`) and frontend route guards (`<Guard roles={['admin']}>` & `PrivateRoute`) with role-aware navigation in `Header.js`.

### 3. 24/7 AI Chatbot Assistant
- **Collapsible Floating Chat Widget**: Built with Material-UI (`ChatWidget.js`, `MessageItem.js`, `QuickReplies.js`), persistently accessible across all public and private pages.
- **NLP Intent Classification & Knowledge Base**: Instant answers for digital downloads, tutor registration, commission rates, payment help, shipping/delivery, refund policy, and account/password self-service.
- **Live Order Tracking & Catalog Search Bridges**:
  - Queries the `Order` model in real time when users ask about an order (e.g., `ORD-2026-0001` or *"Track My Order"*).
  - Queries the `Product` catalog when users search for subjects or study materials (e.g., *"Find Mathematics past papers"*).
- **Conversation Persistence & Feedback**: Saves chat history in `sessionStorage` and hydrates from `GET /api/chatbot/history`, with in-chat Thumbs Up/Down and 1–5 Star ratings (`POST /api/chatbot/feedback`).

---

## Project Team

- **Kushmi (Kaushini Ekanayake)**: User Authentication, Profile Management, Role-Based Access Control (RBAC), and **AI Chatbot Integration**
- **Vidula**: Catalog, Search and Filtering System (by subject, grade, exam year, price)
- **Bhanuka**: Shopping Cart and Checkout (with coupons & multi-item)
- **Charuka**: Payment Gateway, Order Management, Backend & Client-Side Development, **AI Integration**
- **Malki**: Admin Dashboard, Reviews, Notifications & Seller Dashboard

---

## Technology Stack

- **Frontend**: React.js 18 with Material UI (MUI), Tailwind CSS, Notistack, Context API, Axios, react-router-dom v6
- **Backend**: Node.js (v20/v22) with Express.js, RESTful API architecture
- **Database**: MySQL 8.0+ (with SQLite local dev & test support) via Sequelize ORM 6.x
- **Validation & Security**: Joi validation schemas, `validator` XSS sanitization, `bcryptjs` (12 salt rounds), JWT authentication (RFC 7519), IP rate limiting, CORS configuration
- **Containerization & Web Server**: Docker & Docker Compose, Nginx (Alpine) for static frontend serving & `/api` reverse proxy
- **CI/CD & Testing**: GitHub Actions pipeline, Jest test runner, SuperTest, React Testing Library

---

## 🚀 Quick Start with Docker (Recommended)

The easiest way to run the entire EduMart stack (MySQL 8.0 Database with all 15 tables, Express Backend API, and React/Nginx Frontend) is using Docker Compose:

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine (v20+) with Docker Compose plugin.

### Run Stack

```bash
# 1. Clone the repository
git clone https://github.com/SLxnoat/EduMart
cd EduMart

# 2. Configure your SMTP email credentials in .env (see below)
cp .env.example .env

# 3. Build and start all services in detached mode
docker compose up --build -d
```

### Access Services
- **Frontend App**: [http://localhost:3000](http://localhost:3000) (Port 3000)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api) (Port 5000)
- **Health Check**: [http://localhost:5000/health](http://localhost:5000/health)
- **MySQL Database**: `localhost:3306` (Default Credentials: `DB_NAME=edumart`, `DB_USER=edumart_user`, `DB_PASSWORD=your_password`)

### Configure Outbound SMTP Email Delivery (`.env`)
To send real verification and password-reset emails to users' inboxes (e.g., via a Gmail App Password), open `.env` in the project root and set:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_char_app_password
SMTP_FROM=your_email@gmail.com
```
Then apply the configuration with `docker compose up -d`.

### Stop & Reset Stack

```bash
# Stop containers and reset database volume
docker compose down -v
```

---

## 🛠️ Local Development Setup (Without Docker)

### Option A: Zero-Config Local Run with SQLite (No MySQL Required)
If you do not have MySQL running locally, you can run the backend immediately using SQLite:
```powershell
# Terminal 1 - Start Backend API on http://localhost:5000
cd server
npm install
$env:DB_DIALECT='sqlite'; node server.js

# Terminal 2 - Start React Frontend on http://localhost:3000
cd client
npm install
npm start
```

### Option B: Local Run with MySQL 8.0+
1. **Initialize MySQL Schema**:
   ```bash
   mysql -u root -p < sql/database_schema.sql
   ```
2. **Backend Setup (`/server`)**:
   ```bash
   cd server
   npm install
   npm run dev
   ```
   *Environment variables (`.env` in `/server` or project root):*
   ```env
   PORT=5000
   DB_DIALECT=mysql
   DB_NAME=edumart
   DB_USER=root
   DB_PASSWORD=rootpassword
   DB_HOST=localhost
   DB_PORT=3306
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=24h
   FRONTEND_URL=http://localhost:3000
   ```
3. **Frontend Setup (`/client`)**:
   ```bash
   cd client
   npm install
   npm start
   ```
   *Access frontend at [http://localhost:3000](http://localhost:3000).*

---

## 🧪 Testing

Both backend and frontend contain automated unit and integration test suites that run in isolated environments.

### Backend Tests (3 Suites, 25 Passing Tests)
Uses an in-memory SQLite database connection mocked via `jest.setup.js` covering authentication, XSS sanitization, session revocation on logout, rate limiting (`429`), email verification/resend, password reset, profile completeness, RBAC (`GET /api/users/:id`), and AI Chatbot (`faq.*`, `product.search`, `order.status`, feedback, and history):
```bash
cd server
npm test
```

### Frontend Tests (5 Passing Tests)
Uses Jest and React Testing Library (`App.test.js`) covering app rendering, loading states, RBAC `<Guard roles={['admin']}>` redirection, `Profile` unverified banner & completion tips, and `ChatWidget` interactions:
```bash
cd client
npm test -- --watchAll=false
```

---

## 📦 Project Architecture & Structure

```
EduMart/
├── client/                      # React 18 Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/            # ChatWidget.js, MessageItem.js, QuickReplies.js
│   │   │   ├── layout/          # Header.js (role-aware), Footer.js
│   │   │   └── routing/         # PrivateRoute.js (RBAC guard)
│   │   ├── context/             # AuthContext.js (JWT, Remember Me, Profile sync)
│   │   ├── pages/
│   │   │   ├── auth/            # Login, Register, ForgotPassword, ResetPassword, VerifyEmail
│   │   │   ├── profile/         # Profile.js (3-tab dashboard & completion meter)
│   │   │   ├── products/        # ProductList, ProductDetail
│   │   │   ├── cart/ & checkout/# Cart, Checkout
│   │   │   └── admin/           # AdminDashboard
│   │   ├── services/            # api.js (Axios interceptors), authService.js
│   │   └── __tests__/           # App.test.js (Frontend test suite)
│   ├── public/                  # Static assets & index.html
│   ├── .dockerignore            # Excludes local node_modules & build from Docker context
│   ├── nginx.conf               # Nginx routing configuration for production container
│   └── Dockerfile               # Multi-stage build Dockerfile (Node build -> Nginx serving)
├── server/                      # Express Backend API Application
│   ├── src/
│   │   ├── config/              # database.js (MySQL + SQLite fallback)
│   │   ├── controllers/         # authController.js, chatbotController.js, paymentController.js
│   │   ├── middleware/          # authMiddleware.js (protect, RBAC, revocation), rateLimiter.js
│   │   ├── models/              # User, Session, AiInteraction, Product, Category, Order, Payment
│   │   ├── routes/              # authRoutes, userRoutes, chatbotRoutes, paymentRoutes
│   │   ├── services/            # chatbotService.js (NLP + Order & Product bridges), paymentService.js
│   │   ├── utils/               # emailService.js (SMTP email dispatcher & local link fallback)
│   │   └── validators/          # userValidator.js (8 Joi validation schemas)
│   ├── __tests__/               # authController.test.js, chatbotController.test.js, server.test.js
│   ├── .dockerignore            # Excludes local node_modules & test artifacts from Docker context
│   ├── server.js                # Express app entry point
│   ├── jest.config.js           # Jest configuration
│   ├── jest.setup.js            # SQLite in-memory test DB setup
│   └── Dockerfile               # Node.js Alpine container configuration
├── sql/                         # Database Initialization Scripts
│   └── database_schema.sql      # Executable MySQL DDL & DML schema script
├── docs/                        # Complete Project Documentation
│   ├── project_summary.md       # Comprehensive Project Summary & Architectural Report
│   ├── technical_architecture.md# Full architecture specification with Mermaid DFDs
│   ├── API_ENDPOINTS.md         # Comprehensive REST API specifications
│   ├── sql_schema.md            # Database ERD & schema guide
│   ├── sql_implementation_guide.md # Detailed SQL setup and migration guide
│   ├── requirements.md          # Functional & non-functional requirements
│   ├── project_plan.md          # 8-week sprint roadmap
│   ├── project_charter.md       # Vision, objectives, and scope
│   ├── team_roles.md            # Team responsibility breakdown
│   ├── wireframes.md            # UI/UX design guidelines
│   └── SUMMARY.md               # High-level documentation overview
├── .github/workflows/           # CI/CD Automation
│   └── ci-cd.yml                # GitHub Actions workflow (Node 22.x test & Docker build)
└── docker-compose.yml           # Production-ready multi-container orchestration file
```

---

## 📚 Documentation Index

1. [Project Summary Report](docs/project_summary.md) — Comprehensive platform summary, architecture analysis, and implementation report
2. [Project Charter](docs/project_charter.md) — Vision, objectives, scope, and stakeholders
3. [Requirements Document](docs/requirements.md) — Functional and non-functional specifications
4. [Project Plan](docs/project_plan.md) — 8-week timeline, sprint breakdown, and milestones
5. [Team Roles and Responsibilities](docs/team_roles.md) — Team member assignments and module matrix
6. [Technical Architecture](docs/technical_architecture.md) — System architecture, Mermaid diagrams, API specs, security, and container design
7. [API Endpoints Reference](docs/API_ENDPOINTS.md) — RESTful endpoint documentation
8. [Database Schema](docs/sql_schema.md) — ERD diagrams, SQL tables, and Sequelize models
9. [SQL Implementation Guide](docs/sql_implementation_guide.md) — Detailed guide on database setup and schema execution
10. [Wireframes Plan](docs/wireframes.md) — UI/UX wireframe planning and screen flows
11. [Documentation Overview](docs/SUMMARY.md) — High-level summary of project documentation suite

---

## 📄 License

This project is created for educational purposes as part of an academic course.