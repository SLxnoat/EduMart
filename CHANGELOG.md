# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Created SQL schema documentation (docs/sql_schema.md) with ERD, table definitions, queries, and Sequelize guidance
- Created executable SQL database file (sql/database_schema.sql) for MySQL 8.0+ with all 16 tables
- Fixed Mermaid diagram syntax errors in technical_architecture.md:
    * 3.2.4 Seller Product Upload Flow: Fixed escaped quotes in node label
    * 3.3.1 Payment Processing Flow: Removed invalid arrow sequences and fixed participant definitions
    * 3.3.2 AI Chatbot Interaction Flow: Changed entity to participant and fixed missing closing fence
    * 3.4.1 Product Catalog Data Flow: Fixed line breaks in node labels
    * 3.5.2 Data Protection and Encryption: Fixed parentheses in node labels (bcrypt cost)
    * 3.5.3 Payment Security Flow: Fixed participant definitions and Note syntax
- Updated documentation references:
    * docs/SUMMARY.md: Added SQL schema documentation entries
    * docs/README.md: Added SQL schema to document index
    * README.md: Added SQL schema to documentation list and project artifacts
### Changed
- Updated team roles (docs/team_roles.md) to include client-side development and AI integration for Charuka
- Updated project timeline to 8 weeks with 2-week sprints in:
    * docs/project_charter.md
    * docs/project_plan.md
    * docs/requirements.md
    * docs/README.md
    * README.md
- Enhanced core features documentation in:
    * docs/requirements.md: Added all requested features (User Auth, Search/Filtering, Payment Gateway, Digital Delivery, Review/Rating, Admin Dashboard, AI Chatbot, Product Catalog, Shopping Cart, Order Management, Physical Delivery Tracking, Notification System, Seller Dashboard, Coupon/Discount Management)
    * docs/project_plan.md: Updated sprint breakdown for 8-week timeline