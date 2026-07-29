# EduMart Project Documentation - Summary

This directory contains all the professional documentation created for the EduMart e-commerce platform project based on the provided presentation script and requirements.

## Documents Created

1. **Project Charter** (`project_charter.md`)
   - Project overview, objectives, scope, and constraints
   - Stakeholder identification and success criteria
   - High-level project description and deliverables
   - Updated to reflect 8-week timeline and expanded Charuka role

2. **Requirements Document** (`requirements.md`)
   - Detailed functional requirements for all modules
   - Non-functional requirements (performance, security, usability, etc.)
   - System architecture overview
   - Implementation approach and acceptance criteria
   - Updated with all core features: User Auth, Catalog/Search, Shopping Cart, Payment/Order Management, Admin Dashboard, Reviews, Notifications, Seller Dashboard, AI Chatbot, Coupon System, Digital/Physical Delivery

3. **Project Plan** (`project_plan.md`)
   - **8-week timeline with 2-week sprints** (updated from 12 weeks)
   - Detailed sprint breakdown and activities
   - Milestones and deliverables
   - Resource allocation and risk management
   - Communication plan and success criteria

4. **Team Roles and Responsibilities** (`team_roles.md`)
   - Detailed responsibilities for each team member:
     - **Kushmi**: User Authentication and Profile Management, **AI Integration**
     - **Vidula**: Catalog, Search and Filtering System (by subject, grade, exam year, price)
     - **Bhanuka**: Shopping Cart and Checkout (with coupons & multi-item)
     - **Charuka**: Payment Gateway, Order Management, Backend & Client-Side Development, **AI Integration**
     - **Malki**: Admin Dashboard, Reviews, Notifications & Seller Dashboard
   - Collaboration points and integration strategies
   - Communication protocols and quality assurance standards

5. **Technical Architecture** (`technical_architecture.md`)
   - Complete technology stack specification
   - Architectural layers and components
   - Detailed database design with entities and relationships
   - API design with RESTful endpoints
   - Security considerations and future enhancements
   - **Enhanced with Mermaid diagrams** for:
     - System context and component interactions
     - User journey flows (registration, purchase, checkout)
     - Data flow diagrams (product catalog, order processing, digital delivery)
     - Security architecture (authentication, data protection, payment security)
     - Deployment architectures (development, staging, production)
     - Component communication matrix
     - Data model/entity relationship diagrams

6. **Database Schema** (`sql_schema.md`)
   - Complete MySQL database schema design
   - Entity relationship diagram using Mermaid syntax
   - Detailed table definitions with columns, data types, constraints, and indexes
   - Common query examples for product browsing, order processing, analytics
   - Sequelize ORM guidance with model definitions and associations
   - Migration strategy using Sequelize CLI
   - Performance optimization and security considerations
   - Backup and recovery guidelines

7. **SQL Database File** (`sql/database_schema.sql`)
   - Executable SQL file to create the complete database schema
   - Includes all CREATE TABLE statements with proper ordering
   - Contains indexes, constraints, and sample data setup instructions
   - Compatible with MySQL 8.0+

8. **Wireframes Plan** (`wireframes.md`)
   - Wireframe planning approach for UI/UX design
   - Key screens and user flows for each user type
   - Wireframe documentation standards and conventions
   - Tools and process recommendations
   - Integration with existing documentation (user journeys, component interactions)
   - Accessibility and performance considerations
   - Deliverables and timeline alignment

9. **README** (`README.md`)
   - Project overview and team information
   - Documentation index and getting started instructions
   - Updated to reflect 8-week timeline and enhanced feature set
   - Includes diagram legend and visualization guide

## Key Project Information

- **Project Name**: EduMart
- **Team Size**: 5 members
- **Duration**: 8 weeks (Agile with 2-week sprints)
- **Technical Stack**: React.js (frontend), Node.js/Express (backend), MySQL (database)
- **Core Modules**: 
  - User Authentication & Profile Management (Kushmi, with AI integration)
  - Catalog, Search & Filtering System (Vidula)
  - Shopping Cart & Checkout (Bhanuka)
  - Payment Gateway, Order Management, Backend & Client-Side Development (Charuka, with AI integration)
  - Admin Dashboard, Reviews, Notifications & Seller Dashboard (Malki)

## Presentation Basis

All documentation is based on the provided presentation script from Charuka and Malki, which outlined:
- Project concept as an online learning material store
- Updated team member responsibilities (including AI integration for Charuka and Kushmi)
- Enhanced core modules with additional features (AI chatbot, coupon system, digital/physical delivery, etc.)
- Technical stack decisions
- Revised development timeline (8 weeks with Agile 2-week sprints)
- Updated approach reflecting new requirements

## Usage

These documents provide a complete foundation for:
- Project initiation and planning
- Development team onboarding
- Technical implementation guidance
- Quality assurance and testing frameworks
- Project tracking and management
- Stakeholder communication and reporting

Each document can be used independently or as part of the complete project documentation suite.

---
*Document Version: 1.0*
*Last Updated: 2026-07-29*
*Prepared for: EduMart Project Team*