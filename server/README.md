# EduMart Express API Server

The backend service for the EduMart platform built with Node.js, Express.js, Sequelize ORM, and MySQL 8.0.

---

## 🛠️ Prerequisites

- **Node.js**: v20 LTS or v22 LTS
- **Database**: MySQL 8.0+ (or Docker Compose)
- **Package Manager**: npm v9+

---

## ⚡ Quick Start Options

### Option A: Via Docker Compose (Recommended)
From the project root:
```bash
docker compose up --build -d db backend
```

### Option B: Local Node.js Execution
1. Ensure MySQL is running locally and database `edumart` exists.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set environment variables in `.env` (or set env variables directly):
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
4. Start development server:
   ```bash
   npm run dev
   ```

---

## 🧪 Testing

The server includes automated unit and integration tests using **Jest** and **SuperTest**. Tests run against an isolated **SQLite in-memory database** so no live MySQL instance is required to run tests.

```bash
# Run test suite once
npm test

# Run tests in watch mode
npm run dev:test
```

### Verified Test Suite
- `authController.test.js`: User registration, payload validation, duplicate email prevention, login credential verification.
- `server.test.js`: Root welcome route `/`, `/health` endpoint, `404` route handler.

---

## 📁 Directory Structure

```
server/
├── __tests__/              # Jest integration & unit test cases
│   ├── authController.test.js
│   └── server.test.js
├── src/
│   ├── config/             # Sequelize database connection configuration
│   ├── controllers/        # Request handling logic (authController)
│   ├── middleware/         # Auth verification (protect, admin, seller)
│   ├── models/             # Sequelize ORM models (User)
│   ├── routes/             # Express routing (authRoutes, userRoutes)
│   ├── services/           # Reusable business logic services
│   ├── utils/              # Helper utilities
│   └── validators/         # Joi request body validation schemas
├── Dockerfile              # Production Node 20/22 Alpine container file
├── jest.config.js          # Jest test runner configuration
├── jest.setup.js           # Test environment database mocking (SQLite memory)
├── server.js               # Application entry point & server listener
└── package.json            # Dependencies & scripts
```

---

## 🌐 API Routes Overview

- `POST /api/auth/register`: Public — Register new user (`student`, `tutor`, `institute`, `admin`)
- `POST /api/auth/login`: Public — Authenticate user and receive JWT token
- `GET /api/users/profile`: Private — Fetch authenticated user profile details
- `PUT /api/users/profile`: Private — Update user profile details
- `GET /health`: Public — Healthcheck status endpoint