# EduMart - Online Learning Material Store

![EduMart Stack](https://img.shields.io/badge/Docker-Enabled-blue?logo=docker)
![Node.js](https://img.shields.io/badge/Node.js-v20%2Fv22-green?logo=node.js)
![React](https://img.shields.io/badge/React-18.x-61dafb?logo=react)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)
![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen)

## Project Overview

EduMart is an online learning material store — a web-based e-commerce platform for buying and selling educational materials including past papers, e-books, model papers, revision notes, and recorded lecture packs. The platform creates a centralized, trusted marketplace connecting students, tutors, and educational institutes.

This repository contains the **complete source code and verified documentation** for EduMart, featuring a fully containerized architecture (MySQL DB, Node.js/Express API, and React/Nginx frontend), user authentication with JWT, role-based access control (RBAC), and automated testing suites.

---

## Project Team

- **Kushmi**: User Authentication and Profile Management, **AI Integration**
- **Vidula**: Catalog, Search and Filtering System (by subject, grade, exam year, price)
- **Bhanuka**: Shopping Cart and Checkout (with coupons & multi-item)
- **Charuka**: Payment Gateway, Order Management, Backend & Client-Side Development, **AI Integration**
- **Malki**: Admin Dashboard, Reviews, Notifications & Seller Dashboard

---

## Technology Stack

- **Frontend**: React.js 18 with Material UI (MUI), Context API, Axios, react-router-dom v6
- **Backend**: Node.js (v20/v22) with Express.js, RESTful API architecture
- **Database**: MySQL 8.0+ with Sequelize ORM 6.x
- **Validation & Security**: Joi validation schemas, bcryptjs password hashing, JWT authentication (RFC 7519), CORS configuration
- **Containerization & Web Server**: Docker & Docker Compose, Nginx (Alpine) for static frontend serving
- **CI/CD & Testing**: GitHub Actions pipeline, Jest test runner, SuperTest, SQLite in-memory DB for unit/integration testing

---

## 🚀 Quick Start with Docker (Recommended)

The easiest way to run the entire EduMart stack (MySQL Database, Express Backend API, and React/Nginx Frontend) is using Docker Compose:

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine (v20+) with Docker Compose plugin.

### Run Stack

```bash
# 1. Clone the repository
git clone <repository-url>
cd EduMart

# 2. Build and start all services in detached mode
docker compose up --build -d
```

### Access Services
- **Frontend App**: [http://localhost](http://localhost) (Port 80)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api) (Port 5000)
- **Health Check**: [http://localhost:5000/health](http://localhost:5000/health)
- **MySQL Database**: `localhost:3306` (Default Credentials: `DB_NAME=edumart`, `DB_USER=edumart_user`, `DB_PASSWORD=your_password`)

### Stop Stack

```bash
docker compose down -v
```

---

## 🛠️ Local Development Setup (Without Docker)

### 1. Database Setup
Ensure MySQL 8.0+ is running locally:
```bash
mysql -u root -p < sql/database_schema.sql
```

### 2. Backend Setup (`/server`)
```bash
cd server
npm install
npm run dev
```
*Environment file `.env` in project root:*
```env
PORT=5000
DB_NAME=edumart
DB_USER=root
DB_PASSWORD=rootpassword
DB_HOST=localhost
DB_PORT=3306
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup (`/client`)
```bash
cd client
npm install
npm start
```
*Access frontend at [http://localhost:3000](http://localhost:3000).*

---

## 🧪 Testing

Both backend and frontend contain unit & integration tests that run cleanly in isolated environments.

### Backend Tests (9 Passing)
Uses an in-memory SQLite database connection mocked via `jest.setup.js`:
```bash
cd server
npm test
```

### Frontend Tests (2 Passing)
Uses React Testing Library with mocked `AuthContext`:
```bash
cd client
npm test -- --watchAll=false
```

---

## 📦 Project Architecture & Structure

```
EduMart/
├── client/                      # React Frontend Application
│   ├── src/                     # React components, context, services, routes, styles
│   ├── public/                  # Static assets & index.html
│   ├── nginx.conf               # Nginx routing configuration for production container
│   └── Dockerfile               # Multi-stage build Dockerfile (Node build -> Nginx serving)
├── server/                      # Express Backend API Application
│   ├── src/                     # Controllers, models, routes, middleware, validators, config
│   ├── __tests__/               # Integration & unit test suites (authController, server)
│   ├── server.js                # Express app entry point
│   ├── jest.config.js           # Jest configuration
│   ├── jest.setup.js            # SQLite in-memory test DB setup
│   └── Dockerfile               # Node.js Alpine container configuration
├── sql/                         # Database Initialization Scripts
│   └── database_schema.sql      # Executable MySQL DDL & DML schema script
├── docs/                        # Complete Project Documentation
│   ├── technical_architecture.md# Full architecture specification with Mermaid DFDs
│   ├── API_ENDPOINTS.md         # Comprehensive REST API specifications
│   ├── sql_schema.md            # Database ERD & schema guide
│   ├── requirements.md          # Functional & non-functional requirements
│   ├── project_plan.md          # 8-week sprint roadmap
│   ├── team_roles.md            # Team responsibility breakdown
│   └── wireframes.md            # UI/UX design guidelines
├── .github/workflows/           # CI/CD Automation
│   └── ci-cd.yml                # GitHub Actions workflow (Node 22.x test & Docker build)
└── docker-compose.yml           # Production-ready multi-container orchestration file
```

---

## 📚 Documentation Index

1. [Project Charter](docs/project_charter.md) — Vision, objectives, scope, and stakeholders
2. [Requirements Document](docs/requirements.md) — Functional and non-functional specifications
3. [Project Plan](docs/project_plan.md) — 8-week timeline, sprint breakdown, and milestones
4. [Team Roles and Responsibilities](docs/team_roles.md) — Team member assignments
5. [Technical Architecture](docs/technical_architecture.md) — System architecture, Mermaid diagrams, API specs, security, and container design
6. [API Endpoints Reference](docs/API_ENDPOINTS.md) — RESTful endpoint documentation
7. [Database Schema](docs/sql_schema.md) — ERD diagrams, SQL tables, and Sequelize models
8. [Wireframes Plan](docs/wireframes.md) — UI/UX wireframe planning and screen flows
9. [Documentation Overview](docs/README.md) — Index and quick reference for all project docs
10. [Project Summary](docs/SUMMARY.md) — High-level summary of project documentation and implementation status
11. [SQL Implementation Guide](docs/sql_implementation_guide.md) — Detailed guide on database setup and schema execution

---

## 📄 License

This project is created for educational purposes as part of an academic course.