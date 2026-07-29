# EduMart Server

This is the backend of the EduMart e-commerce platform, built with Node.js and Express.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (or modify to use MySQL as per project documentation)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the server directory: `cd server`
3. Install dependencies: `npm install`

### Environment Variables

Create a `.env` file in the server directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/edumart
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
```

For production, you might also want to add:

```
NODE_ENV=production
```

### Available Scripts

In the project directory, you can run:

- `npm start` - Starts the server in production mode
- `npm run dev` - Starts the server in development mode with nodemon
- `npm test` - Runs the test suite

### Database Setup

If using MongoDB:
1. Install and start MongoDB
2. The database will be created automatically when the application starts

If using MySQL (as per project documentation):
1. Install MySQL
2. Create a database named 'edumart'
3. Update the connection configuration in `/src/config/database.js`
4. Run the schema migration scripts

### Project Structure

```
src/
├── controllers/    # Request handlers
├── services/       # Business logic
├── models/         # Database models
├── routes/         # API route definitions
├── middleware/     # Custom Express middleware
├── utils/          # Utility functions
├── config/         # Configuration files
└── validators/     # Request validation schemas
```

### API Documentation

API endpoints are documented in the `technical_architecture.md` file in the main documentation directory.

### Deployment

For production deployment, consider using:
- Heroku
- AWS Elastic Beanstalk
- DigitalOcean App Platform
- Docker/Kubernetes

See the DevOps section in `technical_architecture.md` for more details.