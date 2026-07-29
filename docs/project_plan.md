# EduMart Project Plan

## 1. Project Overview

**Project Name**: EduMart  
**Project Description**: An online learning material store - a web-based e-commerce platform for buying and selling study materials  
**Team**: 5 members (Kushmi, Vidula, Bhanuka, Charuka, Malki)  
**Methodology**: Agile with 2-week sprints  
**Total Duration**: 8 weeks

## 2-8 Week Timeline Overview

| Week | Phase | Activities | Team Members Involved |
|------|-------|------------|----------------------|
| 1-2 | Planning & Design | System architecture, database design, UI/UX wireframes, task allocation | All team members |
| 3-4 | Sprint 1 | User Authentication & Profile Management (Kushmi); Basic Catalog Setup (Vidula) | Kushmi, Vidula |
| 5-6 | Sprint 2 | Search & Filtering System (Vidula); Shopping Cart Basics (Bhanuka); Payment Gateway Initiation (Charuka) | Vidula, Bhanuka, Charuka |
| 7-8 | Sprint 3 | Payment Gateway & Order Management (Charuka); Admin Dashboard & Notification System (Malki); Initial AI Chatbot Setup (Kushmi & Charuka) | Charuka, Malki, Kushmi, Charuka |

## 2. Detailed Sprint Breakdown

### Sprint 1: Weeks 3-4
**Focus**: User Foundation & Basic Catalog

- **Kushmi (User Authentication & Profile Management)**:
  - User registration with email verification (Student/Tutor/Admin roles)
  - Secure login/logout with JWT/session management
  - Password hashing and security
  - Profile viewing and editing
  - Password reset functionality

- **Vidula (Basic Catalog Setup)**:
  - Material listing creation interface
  - Basic material listing display
  - Category/subcategory structure (by subject, grade, exam year, type)
  - Image upload for materials
  - Initial search functionality setup

### Sprint 2: Weeks 5-6
**Focus**: Discovery, Cart & Payment Initiation

- **Vidula (Search & Filtering System)**:
  - Advanced filtering (by subject, grade, exam year, price, material type)
  - Search optimization and performance tuning
  - Search suggestions and auto-complete
  - Search history and saved searches

- **Bhanuka (Shopping Cart & Checkout)**:
  - Shopping cart data model and persistence
  - Add/remove/update functionality in cart
  - Cart summary with subtotal, taxes, and totals
  - Guest and user checkout flows
  - Basic coupon code validation and application

- **Charuka (Payment Gateway Initiation)**:
  - Payment gateway selection and integration (Stripe/PayPal)
  - Basic payment processing setup
  - Secure payment form development
  - Initial order management structure
  - Webhook endpoint for payment notifications

### Sprint 3: Weeks 7-8
**Focus**: Transaction Completion & Core Features

- **Charuka (Payment Gateway & Order Management)**:
  - Complete payment processing with transaction verification
  - Order lifecycle management (pending, processing, completed, failed)
  - Order history and tracking for users
  - Invoice/receipt generation and distribution
  - Refund and cancellation handling
  - Integration with cart and user systems

- **Malki (Admin Dashboard & Notification System)**:
  - Admin authentication and role-based access control
  - Dashboard with key metrics (sales, users, revenue, activity)
  - User management (view, search, role management)
  - Product moderation queue (approve/reject with feedback)
  - Basic notification system (email/SMS for order status)
  - Initial review and rating system framework

- **Kushmi & Charuka (AI Chatbot Setup)**:
  - Basic chatbot interface and integration
  - FAQ knowledge base setup
  - Simple intent recognition for common queries
  - Integration with user system for personalized assistance
  - Basic response generation and delivery

## 3. Milestones & Deliverables

### Milestone 1: Project Kickoff & Planning Complete (End of Week 2)
- Project charter completed
- Requirements documented
- Architecture designed
- Sprint planning completed
- Development environment set up

### Milestone 2: Foundation & Core Features Complete (End of Week 4)
- User authentication system functional (all roles)
- Basic material catalog and search implemented
- Initial UI framework and navigation established
- Payment gateway foundation completed

### Milestone 3: Transaction & Administration Systems Complete (End of Week 6)
- Payment processing fully integrated and tested
- Order management system operational
- Shopping cart and checkout functionality complete
- Admin dashboard and notification system operational
- Initial AI chatbot functionality deployed

### Milestone 4: MVP Completion & Release Readiness (End of Week 8)
- All core e-commerce functionality working end-to-end
- User authentication, catalog, cart, checkout, payment, order management
- Admin dashboard for oversight and basic management
- Notification system for key events (order status, etc.)
- Basic AI chatbot for user assistance
- Basic security measures implemented (input validation, basic auth)
- Responsive design implemented for mobile/tablet/desktop
- User acceptance testing conducted with positive feedback
- Final documentation completed (user guides, API documentation)
- Ready for beta release or demonstration

## 4. Resource Allocation

### Team Member Responsibilities:

**Kushmi - User Authentication & Profile Management, AI Integration**
- Primary: Weeks 1-2 (Planning), 3-4 (Auth), 7-8 (AI Integration)
- Support: Weeks 5-6 (Testing, Integration)

**Vidula - Catalog, Search and Filtering System**
- Primary: Weeks 1-2 (Planning), 3-4 (Catalog Setup), 5-6 (Search & Filtering)
- Support: Weeks 7-8 (Testing, Integration, UI refinement)

**Bhanuka - Shopping Cart & Checkout**
- Primary: Weeks 1-2 (Planning), 5-6 (Cart & Checkout)
- Support: Weeks 3-4 (UI/UX input), 7-8 (Testing, Integration, Payment flow)

**Charuka - Payment Gateway, Order Management, Backend, Client-Side Development, AI Integration**
- Primary: Weeks 1-2 (Planning), 5-6 (Payment Initiation), 7-8 (Payment Completion, Order Management, Backend Dev)
- Support: Weeks 3-4 (API design input), 7-8 (AI integration with Chatbot)

**Malki - Admin Dashboard, Reviews, Notifications & Seller Dashboard**
- Primary: Weeks 1-2 (Planning), 7-8 (Admin Dashboard, Notifications)
- Support: Weeks 3-6 (Requirements input, testing, feedback)