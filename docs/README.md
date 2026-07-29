# EduMart Documentation & Architecture Suite

This directory contains the complete technical specifications, requirements, project management documents, and architecture guides for the **EduMart** e-commerce platform.

---

## 📑 Document Index

| Document | Description |
|----------|-------------|
| 📖 [SUMMARY.md](SUMMARY.md) | High-level summary of all project documentation |
| 📜 [project_charter.md](project_charter.md) | Vision, objectives, scope, constraints, and success criteria |
| 📋 [requirements.md](requirements.md) | Functional & non-functional system requirements |
| 📅 [project_plan.md](project_plan.md) | 8-week timeline with 2-week Agile sprint milestones |
| 👥 [team_roles.md](team_roles.md) | Detailed responsibility matrix for all 5 team members |
| 🏗️ [technical_architecture.md](technical_architecture.md) | Tech stack, system architecture, Mermaid diagrams, API specs, and Docker infrastructure |
| 🔌 [API_ENDPOINTS.md](API_ENDPOINTS.md) | Comprehensive RESTful API endpoint specifications |
| 🗄️ [sql_schema.md](sql_schema.md) | Database ERD, SQL schema definitions, and ORM guidelines |
| 🎨 [wireframes.md](wireframes.md) | UI/UX design specifications, screen layouts, and user flows |

---

## 🚀 Application & Container Deployment Quick Reference

The EduMart platform source code and infrastructure are fully containerized using Docker Compose:

### 1. Run Containerized Stack
```bash
docker compose up --build -d
```
- **Frontend App**: [http://localhost](http://localhost) (Port 80)
- **Backend Express API**: [http://localhost:5000/api](http://localhost:5000/api) (Port 5000)
- **MySQL Database**: `localhost:3306` (Initializes schema automatically from `sql/database_schema.sql`)

### 2. Run Automated Test Suites
- **Backend Tests (Jest + SQLite)**: `cd server && npm test` (9/9 tests passing)
- **Frontend Tests (React Testing Library)**: `cd client && npm test -- --watchAll=false` (2/2 tests passing)

---

## 👥 Team Responsibilities Summary

- **Charuka**: Payment Gateway, Order Management, Backend API & Client Development, Docker Orchestration, **AI Integration**
- **Kushmi**: User Authentication, Profile Management, **AI Integration**
- **Vidula**: Product Catalog, Search & Filtering Engine
- **Bhanuka**: Shopping Cart, Multi-item Checkout, Coupon Engine
- **Malki**: Admin Dashboard, Review System, Notifications, Seller Dashboard

---

*Last Updated & Verified: 2026-07-30*