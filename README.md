# EduMart - Online Learning Material Store

## Project Overview

EduMart is an online learning material store - a web-based e-commerce platform for buying and selling study materials including past papers, e-books, model papers, revision notes, and recorded lecture packs. The platform aims to create a centralized, trusted marketplace connecting students, tutors, and educational institutes.

This repository contains the complete documentation for the EduMart project with enhanced features including AI chatbot, digital/physical delivery, coupon system, and seller dashboard. The actual source code would be in a separate repository or would be developed as part of the academic project.

## Project Team

- **Kushmi**: User Authentication and Profile Management, **AI Integration**
- **Vidula**: Catalog, Search and Filtering System (by subject, grade, exam year, price)
- **Bhanuka**: Shopping Cart and Checkout (with coupons & multi-item)
- **Charuka**: Payment Gateway, Order Management, Backend & Client-Side Development, **AI Integration**
- **Malki**: Admin Dashboard, Reviews, Notifications & Seller Dashboard

## Technology Stack

- **Frontend**: React.js with Vite, CSS Modules
- **Backend**: Node.js with Express.js, RESTful API / GraphQL
- **Database**: MySQL 8.0+ with Sequelize ORM
- **Additional Services**: 
  - Redis (caching & sessions)
  - AWS S3/Local Storage (file storage)
  - Cloudflare/AWS CloudFront (CDN)
  - Stripe/PayPal (payment processing)
  - SendGrid/Nodemailer (email)
  - Twilio/Nexmo (SMS)
  - TensorFlow.js/Natural (AI chatbot NLP)
  - Elasticsearch/Apache Solr (optional advanced search)
  - RabbitMQ/Apache Kafka (optional message queue)
- **Additional Features**: JWT authentication, responsive design, AI chatbot, coupon system, digital/physical delivery

## Documentation

This documentation repository contains the following key documents:

1. [Project Charter](docs/project_charter.md) - Project vision, objectives, scope, and stakeholders
2. [Requirements Document](docs/requirements.md) - Functional and non-functional requirements
3. [Project Plan](docs/project_plan.md) - Timeline, milestones, sprint breakdown, and resource allocation
4. [Team Roles and Responsibilities](docs/team_roles.md) - Detailed breakdown of each team member's responsibilities
5. [Technical Architecture](docs/technical_architecture.md) - System design with Mermaid diagrams, architecture, API specifications, security considerations, and data flow diagrams
6. [Database Schema](docs/sql_schema.md) - Database design, SQL schema, and implementation guidelines

## Project Timeline (8 Weeks - Agile with 2-week Sprints)

- **Weeks 1-2**: Planning & Design - System architecture, database design, UI/UX wireframes
- **Weeks 3-4**: Sprint 1 - User Authentication (all roles), Basic Catalog Setup, Initial Search
- **Weeks 5-6**: Sprint 2 - Enhanced Search/Filtering, Shopping Cart Basics, Payment Gateway Initiation
- **Weeks 7-8**: Sprint 3 - Payment & Order Management, Admin Dashboard & Notifications, Initial AI Chatbot Setup
- **Weeks 9-10**: Sprint 4 - Seller Dashboard & Reviews, Enhanced Catalog Features, Shopping Cart Enhancements, AI Chatbot Enhancement
- **Weeks 11-12**: Integration, Testing, Deployment & Presentation - Full system integration, QA, UAT, production deployment, final presentation

## Key Features

- **User Authentication**: Student/Tutor/Admin roles with secure password handling
- **Advanced Catalog**: Search & filtering by subject, grade, exam year, price, material type
- **Smart Shopping Cart**: Multi-item checkout, coupon application, save-for-later
- **Secure Payments**: PCI-compliant payment gateway integration with fraud protection
- **Digital Delivery**: Instant secure download links for e-materials
- **Physical Delivery**: Tracking integration for printed materials
- **Review System**: 1-5 star ratings with comments and moderation
- **Admin Dashboard**: User/order management, product approval, analytics
- **Seller Dashboard**: Upload management, sales analytics, earnings tracking
- **AI Chatbot**: 24/7 instant help for FAQs, order status, and product inquiries
- **Coupon System**: Promotional code management with usage limits
- **Notification System**: Email/SMS alerts for orders, uploads, and promotions
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## Getting Started

*Note: As this is a documentation repository for an academic project, actual setup instructions would be provided in the source code repository.*

For actual development setup, you would need to:

1. Clone the source code repository
2. Set up backend:
   - Install Node.js dependencies
   - Configure MySQL database with schema migrations
   - Set up Redis for caching and sessions
   - Configure environment variables (API keys, secrets, etc.)
   - Set up file storage (S3/local)
   - Configure email/SMS services
   - Configure AI services (if using)
   - Start the development server

3. Set up frontend:
   - Install Node.js dependencies
   - Configure API endpoint (and WebSocket if using chat)
   - Set up build tools (Vite/CRA)
   - Start the development server

4. Set up supporting services:
   - Configure message queue (if using)
   - Configure search engine (if using)
   - Set up monitoring and logging
   - Configure CI/CD pipeline

5. Run tests:
   - Execute unit and integration tests
   - Run end-to-end tests (Cypress/Playwright)
   - Perform security scans (Snyk, OWASP ZAP)
   - Conduct performance testing (k6, Artillery)
   - Execute user acceptance testing

## Project Artifacts

In addition to this documentation, the complete project would include:

- Source code repository (frontend and backend)
- Database schema and migration scripts
- API documentation (Swagger/OpenAPI) with endpoint examples
- User manuals (buyer/seller guides)
- Administrator guide (dashboard operations)
- Test plans and test cases (unit, integration, E2E, security, performance)
- Deployment scripts and configuration (Docker, Kubernetes, CI/CD)
- Presentation materials, demo videos, and slide decks
- System architecture diagrams (included in technical documentation)
- Data flow diagrams and component interaction diagrams
- **SQL Database Schema** (`sql/database_schema.sql`) - Executable SQL file to create the database

## Visual Documentation

The technical documentation includes Mermaid diagrams for:
- System architecture and component interactions
- User journey flows (registration, purchase, checkout)
- Data flow diagrams (product catalog, order processing, digital delivery)
- Security architecture (authentication, data protection, payment security)
- Deployment architectures (development, staging, production)
- Component communication matrix
- Data model/entity relationship diagrams

## License

This project is created for educational purposes as part of an academic course.

## Contact

For questions about this project, please contact the project team through your academic institution's channels.