# EduMart Requirements Document

## 1. Introduction

### 1.1 Purpose
This document outlines the functional and non-functional requirements for EduMart, an online learning material store e-commerce platform.

### 1.2 Scope
EduMart is a web-based e-commerce platform enabling students, tutors, and educational institutes to buy, sell, and access learning materials in a centralized, trusted marketplace.

### 1.3 Definitions, Acronyms, and Abbreviations
- **LMS**: Learning Management System
- **A/L**: Advanced Level (Sri Lankan education system)
- **API**: Application Programming Interface

### 1.4 References
- Project Charter: EduMart Project Charter
- Presentation: EduMart Project Proposal Presentation

## 2. Overall Description

### 2.1 Product Perspective
EduMart is a standalone web application that integrates frontend, backend, and database components to provide a complete e-commerce solution for educational materials.

### 2.2 Product Functions
- User registration, authentication, and profile management
- Material listing, browsing, search, and filtering
- Shopping cart management
- Secure payment processing
- Order placement and tracking
- Administrative oversight and content approval
- User reviews and ratings
- Notification system

### 2.3 User Classes and Characteristics
1. **Students** (A/L and University): Primary buyers of study materials
2. **School/Tuition Students**: Secondary education students purchasing materials
3. **Tutors/Content Creators**: Sellers who create and upload educational content
4. **Institutes/Bookshops**: Organizations selling educational materials in bulk

### 2.4 Operating Environment
- **Platform**: Web-based (accessible via web browsers)
- **Devices**: Desktop computers, tablets, mobile phones
- **Browsers**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Internet Connection**: Required for access

### 2.5 Design and Implementation Constraints
- **Technologies**: React.js (frontend), Node.js/Express (backend), MySQL (database)
- **Timeline**: 8-week development cycle with Agile 2-week sprints
- **Team**: 5 developers with assigned module responsibilities
- **Deployment**: Web deployment (specific platform to be determined)

### 2.6 User Documentation
- User guide for buyers and sellers
- Admin dashboard user manuals
- API documentation for developers
- Deployment and installation guide

## 3. Functional Requirements

### 3.1 User Authentication and Profile Management (Kushmi)
**FR-1.1**: User Registration
- Users can register as student, tutor, institute, or admin
- Email verification required
- Profile information collection (name, contact details, institution, role)

**FR-1.2**: User Authentication
- Secure login/logout functionality
- Password recovery/reset mechanism
- Session management

**FR-1.3**: Profile Management
- Users can view and edit profile information
- Ability to change password
- Profile completion tracking

### 3.2 Catalog, Search and Filtering System (Vidula)
**FR-2.1**: Material Catalog
- Sellers can list materials for sale
- Materials categorized by subject, grade level, exam year, and type
- Each listing includes title, description, price, preview images, and file information

**FR-2.2**: Search Functionality
- Keyword-based search across all materials
- Search suggestions and auto-complete
- Search history (optional)

**FR-2.3**: Filtering System
- Filter by subject (Mathematics, Science, Languages, etc.)
- Filter by grade/level (Grade 6-13, A/L, University)
- Filter by exam year (e.g., 2020, 2021, 2022)
- Filter by material type (Past Papers, E-books, Model Papers, Notes, Videos)
- Filter by price range
- Filter by seller rating
- Filter by format (Digital/Physical)

**FR-2.4**: Sorting Options
- Sort by relevance, price (low-high, high-low), newest first, highest rated

### 3.3 Shopping Cart and Checkout (Bhanuka)
**FR-3.1**: Shopping Cart
- Add/remove items from cart
- Update quantities
- View cart summary (items, subtotal, taxes, total)
- Save cart for later

**FR-3.2**: Checkout Process
- Shipping/billing information collection
- Delivery method selection (digital download, pickup, delivery)
- Order review before payment
- Order confirmation and summary

### 3.4 Payment Gateway, Order Management, Client-Side Development, and AI Integration (Charuka & Kushmi & Kushmi)
**FR-4.1**: Payment Processing
- Integration with secure payment gateway(s)
- Support for credit/debit cards
- Secure payment processing (PCI compliance considerations)
- Payment confirmation and receipt generation

**FR-4.2**: Order Management
- Order status tracking (Pending, Processing, Shipped, Delivered, Cancelled)
- Order history for buyers and sellers
- Invoice generation
- Refund and cancellation handling
- Purchase history tracking

**FR-4.3**: Client-Side Development
- Implement user interface for payment processing (checkout page, payment form)
- Implement user interface for order history and tracking
- Ensure responsive design for payment and order pages
- Collaborate with Vidula on overall frontend consistency

**FR-4.4**: Digital Delivery
- Generate instant download links for purchased e-materials
- Secure file delivery system with access controls
- Download link expiration and access limits

**FR-4.5**: Physical Delivery Tracking
- Integration
- Tracking number generation and updates
- Delivery status notifications
- Integration with shipping carriers for tracking updates
- Delivery status updates for physical materials

**FR-4.6**: AI Chatbot Integration (with Kushmi)
- 24/7 intelligent chatbot for user assistance
- FAQ handling and automated responses
- Order status queries and tracking assistance
- Natural language processing for user inquiries

**FR-4.7**: Coupon & Discount Management
- Create and manage promotional codes
- Discount validation and application
- Usage tracking and analytics
- Expiration date and usage limit controls

### 3.5 Admin Dashboard, Reviews, Notifications, and Seller Dashboard (Malki)
**FR-5.1**: Admin Dashboard
- Admin login and authentication
- Dashboard overview (sales, users, pending approvals, revenue metrics)
- User management (view, suspend, activate accounts, role management)
- Material moderation (approve/reject listings, bulk actions)
- Order management (view all orders, update status, refund processing)
- System configuration and settings

**FR-5.2**: Review and Rating System
- Buyers can rate and review purchased materials
- Rating system (1-5 stars)
- Written reviews with moderation capability
- Review display on product pages
- Review helpfulness voting
- Report inappropriate reviews

**FR-5.3**: Notification System
- Email notifications for order status changes
- SMS notifications for order updates (optional)
- Notifications for new messages/comments
- Promotional notifications (opt-in)
- System announcements from admin
- Upload approval/rejection notifications
- Low stock alerts for physical items

**FR-5.4**: Seller (Tutor) Dashboard
- Seller login and authentication
- Dashboard overview (sales, earnings, inventory)
- Product upload and management interface
- Sales analytics and reports
- Earnings tracking and payout information
- Order fulfillment tracking for physical items
- Inventory management for physical materials
- Performance metrics and customer feedback

### 3.6 Additional Features
**FR-6.1**: Responsive Design
- Application accessible on desktop, tablet, and mobile browsers
- Adaptive layout for different screen sizes

**FR-6.2**: Material Previews
- Ability to preview digital materials before purchase
- Limited preview for copyright protection

**FR-6.3**: Seller Dashboard
- Sales analytics and reports
- Inventory management
- Order fulfillment tracking

## 4. Non-Functional Requirements

### 4.1 Performance Requirements
- Page load time: < 3 seconds for main pages
- Search response time: < 2 seconds
- Support concurrent users: Minimum 100 simultaneous users

### 4.2 Security Requirements
- Secure authentication (hashed passwords)
- HTTPS encryption for all data transmission
- PCI DSS compliance for payment processing
- Input validation to prevent SQL injection and XSS
- Secure file upload handling for material uploads

### 4.3 Usability Requirements
- Intuitive user interface with clear navigation
- Consistent design language across all pages
- Accessibility considerations (WCAG 2.1 AA compliance goal)
- Clear error messages and validation feedback

### 4.4 Reliability and Availability
- System uptime target: 99% monthly uptime
- Graceful error handling and recovery
- Data backup and recovery procedures

### 4.5 Scalability Requirements
- Database designed for horizontal scaling
- Caching strategy for frequently accessed data
- Modular architecture for feature expansion

### 4.6 Maintainability and Portability
- Well-documented code with clear commenting
- Modular architecture following separation of concerns
- Use of industry-standard frameworks and libraries
- Environment-specific configuration management

## 5. System Architecture

### 5.1 High-Level Architecture
- **Frontend**: React.js single-page application
- **Backend**: Node.js with Express.js RESTful API
- **Database**: MySQL relational database
- **Communication**: RESTful API over HTTPS
- **Authentication**: JWT (JSON Web Tokens) or session-based

### 5.2 Key Components
1. **Client Layer**: React.js application with Redux for state management
2. **API Layer**: Express.js REST controllers
3. **Business Logic Layer**: Service layer handling business rules
4. **Data Access Layer**: MySQL database with ORM (Sequelize or similar)
5. **External Services**: Payment gateway integration, email service

### 5.3 Data Model Overview
- **Users**: User profiles, roles, authentication data
- **Materials**: Product listings with metadata, pricing, seller info
- **Orders**: Purchase transactions, status tracking
- **Cart**: Temporary storage for selected items
- **Reviews**: User ratings and comments on materials
- **Notifications**: System messages to users
- **Admins**: Administrative users with elevated privileges

## 6. Implementation Plan

### 6.1 Technology Stack
- **Frontend**: React.js, React Router, Redux (or Context API), Axios
- **Backend**: Node.js, Express.js, Sequelize ORM, JWT/bcrypt for auth
- **Database**: MySQL
- **Development Tools**: Git, GitHub, npm/yarn, ESLint, Prettier
- **Testing**: Jest, React Testing Library, SuperTest
- **Deployment**: To be determined (Heroku, AWS, or similar)

### 6.2 Development Approach
- Agile methodology with 2-week sprints
- Daily stand-up meetings
- Sprint planning and retrospectives
- Continuous integration and deployment practices

## 7. Acceptance Criteria

### 7.1 User Acceptance Testing (UAT)
- All core features functional and tested
- User interface intuitive and easy to navigate
- Payment processing secure and reliable
- Admin functions working correctly
- System responsive across device types

### 7.2 Performance Benchmarks
- Homepage load time < 3 seconds
- Search results returned < 2 seconds
- Checkout process completion < 2 minutes
- Concurrent user support validated

### 7.3 Quality Standards
- Code review completion for all features
- Unit test coverage > 80% for critical paths
- Security vulnerability scan passed
- Cross-browser compatibility verified

## 8. Appendices

### 8.1 Glossary
- **Past Papers**: Previous examination papers
- **Model Papers**: Sample papers designed to mimic exam format
- **Revision Notes**: Study notes for exam preparation
- **Recorded Lecture Packs**: Video/audio recordings of lectures

### 8.2 References
- React.js Documentation: https://reactjs.org/
- Node.js Documentation: https://nodejs.org/
- Express.js Documentation: https://expressjs.com/
- MySQL Documentation: https://dev.mysql.com/doc/
- Project Charter: project_charter.md
- Project Plan: project_plan.md
- Team Roles and Responsibilities: team_roles.md
- Technical Architecture: technical_architecture.md
- Database Schema: sql_schema.md
- Wireframes: wireframes.md

---
*Document Version: 1.0*
*Last Updated: $(date +%Y-%m-%d)*