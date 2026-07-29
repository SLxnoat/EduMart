# EduMart Team Roles and Responsibilities

## Project Team Overview
EduMart is being developed by a team of 5 members, each owning major components as part of their individual contribution. Charuka and Malki are presenting the project, with Charuka also leading client-side development and AI integration alongside Kushmi.

## Team Members and Their Modules

### Kushmi - User Authentication, Profile Management, and AI Integration
**Primary Responsibilities**:
- Design and implement user registration system with email verification (Student/Tutor/Admin roles)
- Create secure login/logout functionality with session management
- Implement password hashing and security best practices
- Develop profile viewing and editing capabilities
- Create password reset and recovery system
- Implement role-based access control (student/tutor/admin/institute)
- Ensure data privacy and protection compliance
- Co-lead AI chatbot development with Charuka (natural language processing, training, integration)
- Implement AI chatbot FAQ handling and basic support functions

**Secondary Responsibilities**:
- Assist with integration testing of auth module with other components
- Contribute to overall security review of the application
- Help with documentation of authentication APIs
- Participate in code reviews for related components
- Support deployment and troubleshooting efforts
- Assist with AI chatbot integration with order management and user systems
- Help test and refine AI chatbot responses and accuracy

**Deliverables**:
- User registration and login system
- Profile management interface
- Secure authentication APIs
- Password reset functionality
- Role-based access control implementation
- Authentication documentation
- AI chatbot foundation and training models
- AI integration with user and order systems

### Vidula - Catalog, Search and Filtering System
**Primary Responsibilities**:
- Design material listing structure and database schema (subject, grade, exam year, type)
- Create material upload and management interface for sellers
- Implement material browsing and display functionality
- Develop full-text search across all materials
- Create advanced filtering system (by subject, grade, exam year, type, price, rating, format)
- Implement sorting options (price, date, relevance, rating, newest first)
- Create search suggestions, auto-complete, and search history features
- Ensure responsive design for catalog views
- Implement material preview functionality for digital materials
- Develop inventory management integration for physical materials

**Secondary Responsibilities**:
- Assist with integration of catalog with shopping cart
- Help with admin material moderation interface
- Participate in usability testing of search and filtering features
- Support documentation of catalog APIs
- Assist with performance optimization of search
- Contribute to material categorization and tagging systems
- Help with search relevance tuning and optimization

**Deliverables**:
- Material listing and management system
- Search engine with full-text capabilities
- Advanced filtering and sorting system
- Browse and discovery interface
- Search APIs and documentation
- Material categorization structure (by subject, grade, exam year, type)
- Search suggestion and auto-complete system
- Material preview functionality

### Bhanuka - Shopping Cart, Checkout, and Payment Integration
**Primary Responsibilities**:
- Design shopping cart data model and persistence
- Implement add/remove/update functionality in cart
- Create cart summary with subtotal, taxes, discounts, and totals
- Develop checkout process flow (multi-step, guest and user checkout)
- Implement shipping/billing information collection
- Create order review and confirmation screens
- Implement save-for-later functionality
- Ensure cart persistence across sessions
- Integrate coupon and discount application in cart
- Implement tax calculation and shipping cost estimation
- Handle multiple item checkout with quantity adjustments
- Implement cart abandonment recovery mechanisms (email reminders)

**Secondary Responsibilities**:
- Assist with integration of cart with payment system
- Contribute to order management features
- Help with cart abandonment recovery strategies
- Participate in usability testing of checkout flow
- Support documentation of cart APIs
- Assist with tax calculation implementation
- Collaborate on payment gateway integration
- Help with order validation and fraud prevention measures

**Deliverables**:
- Shopping cart system with persistence
- Add/remove/update cart functionality
- Cart summary and mini-cart display
- Checkout process implementation
- Order summary and confirmation
- Saved for later functionality
- Coupon and discount integration
- Tax and shipping calculation modules
- Cart APIs and documentation
- Abandoned cart recovery system

### Charuka - Payment Gateway, Order Management, Backend, Client-Side Development, and AI Integration
**Primary Responsibilities**:
- Select and integrate payment gateway(s) (Stripe/PayPal/etc.)
- Implement secure payment processing with PCI compliance
- Create comprehensive order management system
- Develop order status tracking (pending, processing, shipped, delivered, cancelled, refunded)
- Implement order history and purchase history for buyers and sellers
- Create invoice, receipt, and payment confirmation generation
- Handle refund and cancellation processing with audit trails
- Develop overall backend architecture and API design (RESTful)
- Design and optimize database schema (shared responsibility)
- Prepare server setup and deployment configurations
- Lead client-side development for payment processing (checkout UI, payment forms)
- Implement user interface for order history, tracking, and purchase history
- Ensure responsive design for all payment and order-related pages
- Develop digital delivery system - instant download links for e-materials
- Implement physical delivery tracking system for printed materials
- Create coupon and discount management system
- Co-lead AI chatbot development with Kushni (natural language processing, training, integration)
- Implement AI chatbot for order status queries, FAQs, and 24/7 support
- Ensure overall system security and performance optimization
- Provide technical leadership and coordination across frontend and backend teams

**Secondary Responsibilities**:
- Assist with authentication integration (OAuth, JWT, session management)
- Contribute to admin order management views and bulk operations
- Help with seller dashboard sales reporting and analytics
- Participate in security audit of payment systems and data protection
- Support documentation of payment, order, and user APIs
- Assist with performance optimization of backend and frontend
- Collaborate on payment gateway integration and testing
- Help with order validation, fraud prevention, and security measures
- Ensure cross-browser compatibility for client-side components
- Lead overall technical architecture decisions and implementation

**Deliverables**:
- Payment gateway integration (multiple providers)
- Secure payment processing system with fraud protection
- Comprehensive order management system
- Order status tracking and history functionality
- Invoice, receipt, and payment confirmation generation
- Refund and cancellation processing with audit trails
- RESTful APIs for frontend consumption
- Database schema and optimization
- Backend documentation
- Client-side payment interface components
- Order history and tracking user interface
- Digital delivery system (secure download links)
- Physical delivery tracking system
- Coupon and discount management system
- AI chatbot core functionality and training models
- Technical architecture documentation

### Malki - Admin Dashboard, Reviews, Notifications, and Seller Dashboard
**Primary Responsibilities**:
- Design and implement admin login and authentication with role-based access
- Create comprehensive admin dashboard with key metrics (sales, users, revenue, activity)
- Develop user management interface (view, search, suspend, activate accounts, role management)
- Implement material moderation queue (approve/reject listings, bulk actions, moderation history)
- Create review and rating system (1-5 stars with comments, helpfulness voting)
- Develop review moderation tools for admins (approve/reject, flag inappropriate, response capabilities)
- Design and implement multi-channel notification system (email, SMS, in-app)
- Create promotional notification system (opt-in, campaign management, scheduling)
- Implement system announcement capability (global notifications, maintenance alerts)
- Develop comprehensive seller dashboard with sales analytics and performance metrics
- Implement inventory management for physical materials (stock tracking, low-stock alerts)
- Create seller productivity tools (bulk upload, pricing management, promotion creation)
- Develop seller earnings tracking and payout management system
- Create seller performance metrics and customer feedback integration

**Secondary Responsibilities**:
- Assist with integration of notifications with order system
- Contribute to user profile management features
- Help with admin analytics and reporting
- Participate in usability testing of admin interfaces
- Support documentation of admin APIs
- Assist with admin security and access controls
- Help with seller dashboard implementation
- Collaborate on review system integration with catalog
- Assist with notification template design and localization
- Help with system health monitoring and alerting
- Contribute to GDPR and data privacy compliance efforts

**Deliverables**:
- Admin authentication and authorization system
- Admin dashboard with real-time metrics and reporting
- User management system with role-based access control
- Material moderation interface with approval workflow
- Review and rating system with moderation capabilities
- Review moderation tools and administrative interface
- Multi-channel notification system (email, SMS, in-app)
- Notification template management system
- Promotional campaign management system
- System announcement and alerting system
- Seller dashboard with sales analytics and performance metrics
- Seller inventory management system
- Seller productivity and management tools
- Seller earnings tracking and payout system
- Admin and seller APIs documentation
- System configuration and settings management

## Collaboration and Integration Points

### Cross-Module Dependencies:

1. **Authentication ↔ All Modules**
   - All modules require user authentication
   - Role-based access affects module functionality (Student/Tutor/Admin/Seller)
   - Profile data and preferences shared across modules
   - Session management and security coordination

2. **Catalog ↔ Shopping Cart**
   - Cart adds items from catalog with variant selection
   - Cart displays catalog item details, pricing, and availability
   - Inventory checks for physical items
   - Wishlist and save-for-later functionality
   - Related items and recommendations

3. **Catalog ↔ Admin Dashboard**
   - Admin moderates catalog listings (approve/reject with feedback)
   - Approved items appear in catalog search and browse
   - Rejected items hidden from users with notification to seller
   - Admin bulk operations on catalog items
   - Catalog analytics and reporting in admin dashboard

4. **Shopping Cart ↔ Payment/Order Management**
   - Cart creates order for payment with itemized details
   - Order details derived from cart contents (quantities, prices, discounts)
   - Payment confirmation updates cart status and clears cart
   - Cart recovery for abandoned carts
   - Coupon and discount application in cart validation

5. **Payment/Order Management ↔ Admin Dashboard**
   - Admin views order statistics, revenue metrics, and trends
   - Admin can modify order status (processing, shipped, delivered, refunded)
   - Financial reporting, tax calculations, and payout management
   - Dispute and chargeback handling
   - Refund and return processing

6. **Payment/Order Management ↔ Seller Dashboard**
   - Seller views their order history and sales performance
   - Order fulfillment notifications and shipping updates
   - Payment settlement and earnings tracking
   - Return and refund management for seller items
   - Sales analytics and customer insights

7. **Review System ↔ Catalog**
   - Reviews displayed on material pages with ratings and comments
   - Ratings affect sorting/filtering options (top-rated, most reviewed)
   - Admin moderates reviews (approve/reject, flag inappropriate)
   - Review notifications to sellers
   - Review analytics and sentiment analysis

8. **Review System ↔ Seller Dashboard**
   - Seller views reviews for their products
   - Review response capability for sellers
   - Review analytics in seller dashboard
   - Reputation and rating impact on seller ranking

9. **Notification System ↔ All Modules**
   - Order status notifications from order management (confirmation, shipping, delivery)
   - Payment status notifications (success, failure, refund)
   - New material notifications from catalog (follow sellers, categories)
   - Review notifications from review system (new reviews, responses)
   - Promotional notifications from admin (sales, discounts, new arrivals)
   - Inventory alerts (low stock for physical items)
   - Account security notifications (password changes, login attempts)
   - System maintenance and announcement notifications

10. **AI Chatbot ↔ All Modules**
    - Order status inquiries from order management system
    - Product information and search assistance from catalog
    - Account help and troubleshooting from user management
    - Returns and refunds guidance from order management
    - Shipping and delivery questions from logistics
    - Payment assistance from payment system
    - Technical support and troubleshooting
    - FAQ handling and knowledge base access

### Integration Strategy:
- **API-First Approach**: All modules communicate via well-defined REST APIs and GraphQL where appropriate
- **Event-Driven Architecture**: Use of message queues for asynchronous communication (order events, notifications)
- **Regular Integration**: Continuous integration of modules as they're completed with automated testing
- **Interface Contracts**: OpenAPI/Swagger specifications agreed upon before development
- **Mock Services**: Use of mock APIs and services during development for independent work
- **Integration Testing**: Dedicated time for end-to-end testing of module interactions and user journeys
- **Contract Testing**: API contract testing to ensure compatibility between services
- **Performance Testing**: Load and stress testing for critical paths (checkout, search, payment)

## Communication and Coordination

### Regular Coordination:
- **Daily Stand-ups**: 15-minute sync to discuss progress, blockers, plans
- **Weekly Sync**: Longer meeting to review integration progress and adjust plans
- **Sprint Planning**: Bi-weekly planning sessions for upcoming work
- **Code Reviews**: Mandatory peer review before merging code
- **Demo Sessions**: End-of-sprint demonstrations of completed work

### Communication Channels:
- **Primary**: Team chat platform (Slack/Discord/etc.)
- **Code Collaboration**: GitHub with pull requests and code reviews
- **Documentation**: Shared documentation space (Notion/Google Docs/wiki)
- **Task Tracking**: GitHub Issues or project management tool
- **Meetings**: Video conferencing or in-person as needed

### Decision Making:
- **Technical Decisions**: Made by relevant module owner with team input
- **Architectural Decisions**: Collaborative discussion with Charuka (backend lead)
- **UX/UI Decisions**: Collaborative with Vidula (frontend/catalog focus)
- **Process Decisions**: Team consensus with project manager facilitation
- **Escalation Path**: Unresolved issues → team discussion → mentor/advisor if needed

## Quality Assurance and Standards

### Coding Standards:
- **Language**: JavaScript/ES6+ for frontend, Node.js for backend
- **Style Guide**: Airbnb or standard JS styleguide with team-specific additions
- **Linting**: ESLint with pre-commit hooks
- **Formatting**: Prettier for consistent code formatting
- **Comments**: Clear, concise commenting for complex logic
- **Naming**: Consistent, descriptive naming conventions

### Development Practices:
- **Version Control**: Git with feature branching strategy
- **Commit Messages**: Clear, descriptive commits following conventional format
- **Pull Requests**: Detailed PR descriptions with testing instructions
- **Code Review**: Minimum 1 approval required before merge
- **Testing**: Unit tests for critical functions, integration tests for key flows
- **Documentation**: Inline code comments + external API documentation

### Quality Gates:
- **Definition of Done**: Code reviewed, tested, documented, integrated
- **Security Review**: Special focus on auth, payment, and data protection
- **Performance Testing**: Regular benchmarking as features develop
- **User Acceptance Testing**: End-of-sprint feedback from potential users
- **Regression Testing**: Before each major integration or release

## Individual Contribution Tracking

Each team member's individual contribution will be assessed based on:
1. **Module Completion**: Fully functional implementation of assigned module
2. **Code Quality**: Adherence to standards, review feedback, test coverage
3. **Integration Support**: Assistance with integrating module with others
4. **Documentation**: Quality of technical and user documentation
5. **Team Collaboration**: Participation in meetings, code reviews, helping others
6. **Problem Solving**: Ability to overcome technical challenges
7. **Timeliness**: Completion of work within sprint timelines

### Assessment Methods:
- Code repository analysis (commits, PRs, issues)
- Module functionality testing
- Peer reviews and feedback
- Documentation quality assessment
- Team feedback and self-assessment
- Demo presentations and sprint reviews

## Risk Mitigation for Individual Contributions

### Contingency Planning:
- **Cross-Training**: Basic understanding of adjacent modules
- **Documentation**: Clear knowledge transfer through docs and comments
- **Pair Programming**: Occasional pairing for complex features
- **Knowledge Sharing**: Regular tech talks or brown bag sessions
- **Backup Coverage**: Identified backup for critical paths

### Blockers and Escalation:
- **Self-Resolution**: Attempt to solve independently first
- **Peer Help**: Ask team members for assistance
- **Technical Spike**: Time-boxed research for complex problems
- **Mentor Consultation**: Escalate to project advisor/mentor if needed
- **Scope Adjustment**: Discuss with team if estimates prove inaccurate

## Success Criteria for Team

### Team Success Metrics:
1. **Module Completion**: All 5 modules fully functional and integrated
2. **System Performance**: Meets all non-functional requirements
3. **Quality Standards**: Low defect density, high code quality
4. **User Satisfaction**: Positive feedback from testing and demo
5. **Timeline Adherence**: Delivered within agreed schedule
6. **Team Satisfaction**: Positive team retrospective feedback
7. **Learning Outcomes**: Skill development and knowledge gain for all members

### Individual Success Indicators:
- Kushmi: Secure, usable authentication system with full profile management
- Vidula: Powerful search and filtering with intuitive catalog browsing
- Bhanuka: Smooth shopping cart and checkout experience
- Charuka: Reliable payment processing and robust order management
- Malki: Effective admin controls and engaging community features

---
*Document Version: 1.0*
*Last Updated: $(date +%Y-%m-%d)*
*Prepared for: EduMart Project Team*

## References

- Project Charter: project_charter.md
- Requirements Document: requirements.md
- Project Plan: project_plan.md
- Technical Architecture: technical_architecture.md
- Database Schema: sql_schema.md
- Wireframes: wireframes.md