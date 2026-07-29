# EduMart Server

This is the backend of the EduMart e-commerce platform, built with Node.js and Express.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL 8.0+ (as specified in project documentation)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the server directory: `cd server`
3. Install dependencies: `npm install`

### Environment Variables

Create a `.env` file in the server directory with the following variables:

```
PORT=5000
DB_NAME=edumart
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
```

For production, you might also want to add:

```
NODE_ENV=production
```

### Database Setup

1. Install and start MySQL Server
2. Create a database named 'edumart'
3. Execute the schema using the provided SQL file: `sql/database_schema.sql`
4. The server will automatically synchronize models on startup in development mode.

### Available Scripts

Scren-shots:
- `npm start` - Starts the server in production mode
- `npm run dev` - Starts the server in development mode with nodemon
- `npm test` - Runs the test suite

### Project Structure

```
src/
├── controllers/    # Request handlers
├── services/       # Business logic
├── modelsS/         # Database models (Sequelize)
├── routes/         # API route definitions
├── middleware/     # Custom Express middleware
├── utils/          # Utility functions
├── config/         # Configuration files
└── validators/     # Request validation schemas
```

### API Documentation

API endpoints are documented in the `docs/API_ENDPOINTS.md` file in the main documentation directory.

### Deployment

For production deployment, consider using:
- Heroku
- AWS Elastic Beanstalk
- DigitalOcean App Platform
- Docker/Kubernetes

See the DevOps section in `technical_architecture.md` for more details.