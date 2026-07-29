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
  - Full-text search across materials
  - Filter by subject, grade, exam year, type, price range
  - Sorting options (price, date, relevance, rating)
  - Search suggestions and history
  - Advanced filtering UI

- **Bhanuka (Shopping Cart Basics)**:
  - Add/remove items from cart
  - Quantity updates
  - Cart persistence (session/database)
  - Cart summary (subtotal, taxes, total)
  - Save for later functionality

- **Charuka (Payment Gateway Initiation)**:
  - Payment gateway selection and setup (sandbox environment)
  - Basic payment integration framework
  - Security foundation for payment processing

### Sprint 3: Weeks 7-8
**Focus**: Core Transaction & Administration Features
- **Charuka (Payment Gateway & Order Management)**:
  - Payment gateway integration completion (live/sandbox modes)
  - Secure payment processing with PCI compliance
  - Order creation and status tracking
  - Order history for users
  - Invoice generation and receipts
  - Refund and cancellation handling
  - Digital delivery - instant download links
  - Physical delivery tracking setup

- **Malki (Admin Dashboard & Notification System)**:
  - Admin login and dashboard with key metrics
  - User management (view, suspend, activate accounts)
  - Material moderation queue (approve/reject listings)
  - Notification system - email/SMS order & upload alerts
  - System announcement capability
  - Initial review system setup

- **Kushmi & Charuka (AI Chatbot Initial Setup)**:
  - AI chatbot foundation and integration framework
  - Basic FAQ and help system
  - Initial natural language processing setup
  - Integration with user authentication system

### Sprint 4: Weeks 9-10
**Focus**: Seller Features, Reviews & Final Integration
- **Malki (Seller Dashboard & Review System)**:
  - Seller (Tutor) Dashboard - uploads, sales & earnings tracking
  - Complete review and rating system (1-5 stars with comments)
  - Review moderation tools for admins
  - Review display on product pages
  - Seller analytics and reporting

- **Vidula (Advanced Catalog & Search Features)**:
  - Enhanced search with filters and sorting
  - Material categorization improvements
  - Preview functionality for digital materials
  - Inventory management integration

- **Bhanuka (Shopping Cart & Checkout Enhancements)**:
  - Multi-item checkout optimization
  - Coupon and discount application
  - Tax calculation and shipping options
  - Order review and confirmation improvements

- **Charuka & Kushmi (AI Chatbot Enhancement & Final Integration)**:
  - AI chatbot training with FAQs and order status capabilities
  - Natural language processing improvements
  - Integration with order management system
  - 24/7 assistance functionality

### Integration, Testing & Deployment: Weeks 11-12
**Focus**: Quality Assurance, Deployment & Presentation
- **All Team Members**:
  - Module integration testing and cross-functionality verification
  - Bug fixing, issue resolution, and performance optimization
  - Security vulnerability assessment and penetration testing
  - User acceptance testing preparation and execution
  - Documentation finalization and user guides
  - Production deployment preparation and execution
  - Final system testing in production environment
  - Presentation preparation, rehearsal, and final project demo

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

### Milestone 4: Seller Features & Enhanced Functionality Complete (End of Week 8)
- Seller dashboard fully operational
- Review and rating system complete with moderation
- Digital delivery system (instant downloads) implemented
- Physical delivery tracking system integrated
- Coupon and discount management system operational
- Enhanced search and filtering capabilities

### Milestone 5: System Integration, Testing & Refinement (End of Week 10)
- All modules integrated and thoroughly tested
- Cross-module functionality verified and optimized
- Performance benchmarks met and exceeded
- Security review completed and vulnerabilities addressed
- AI chatbot enhanced with full functionality
- User acceptance testing conducted with positive feedback

### Milestone 6: Deployment, Documentation & Presentation (End of Week 12)
- Production deployment successful and stable
- Final documentation delivered (user manuals, admin guides, API docs)
- Project presentation prepared and rehearsed
- Final project demo executed successfully
- Retrospective completed and lessons learned documented

## 4. Resource Allocation

### Team Member Responsibilities:

**Kushmi - User Authentication & Profile Management, AI Integration**
- Primary: Weeks 1-2, 3-4, 7-8 (AI integration), 9-10 (AI enhancement)
- Support: Weeks 5-6, 11-12 (integration, testing, deployment)

**Vidula - Catalog, Search and Filtering System**
- Primary: Weeks 1-2, 3-4, 5-6, 9-10
- Support: Weeks 7-8, 11-12 (integration, testing)

**Bhanuka - Shopping Cart and Checkout**
- Primary: Weeks 1-2, 5-6, 7-8, 9-10
- Support: Weeks 3-4, 11-12 (integration, testing)

**Charuka - Payment Gateway, Order Management, Backend, Client-Side Development, AI Integration**
- Primary: Weeks 1-2, 3-4 (payment initiation), 5-6 (payment cont.), 7-8 (payment completion), 9-10 (client-side), 11-12 (AI integration/final)
- Support: Weeks (integration, testing throughout)
- Additional: Overall backend architecture coordination, client-side leadership

**Malki - Admin Dashboard, Reviews, Notifications, Seller Dashboard**
- Primary: Weeks 1-2, 3-4 (admin/init), 5-6 (notification), 7-8 (admin cont.), 9-10 (seller/review)
- Support: Weeks 11-12 (integration, testing)

### Shared Responsibilities (All Team Members):
- Weeks 1-2: Planning and design participation
- Weeks 11-12: Integration, testing, deployment, documentation
- Weekly: Stand-up meetings, progress reporting
- Ongoing: Code reviews, knowledge sharing, cross-team collaboration

## 5. Risk Management

### Identified Risks:

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| Payment gateway integration complexity | Medium | High | Start integration early in sandbox mode; have fallback options |
| Search performance with large datasets | Medium | Medium | Implement proper indexing; consider search optimization techniques |
| User adoption and trust | Low | High | Implement strong security measures; clear policies; review system |
| Scope creep during development | Medium | Medium | Strict adherence to sprint goals; change control process |
| Technical debt accumulation | Medium | Medium | Regular refactoring sprints; code reviews; documentation |
| Team member availability | Low | High | Cross-training; documentation; flexible task allocation |

### Risk Monitoring:
- Weekly risk review during stand-ups
- Monthly risk assessment review
- Mitigation task tracking in sprint backlog

## 6. Communication Plan

### Regular Meetings:
- **Daily Stand-ups**: 15-minute daily sync (time TBD)
- **Sprint Planning**: Every 2 weeks (start of sprint)
- **Sprint Review/Demo**: End of each 2-week sprint
- **Sprint Retrospective**: End of each 2-week sprint
- **Weekly Progress Report**: Email summary to stakeholders
- **Ad-hoc Meetings**: As needed for blockers or decisions

### Communication Channels:
- **Primary**: Team messaging platform (to be determined)
- **Code Repository**: GitHub with branching strategy
- **Documentation**: Shared drive/wiki (to be determined)
- **Meetings**: Video conferencing or in-person as appropriate
- **Issue Tracking**: GitHub Issues or similar tool

### Stakeholder Communication:
- **Weekly Updates**: Progress summary sent to stakeholders
- **Sprint Demos**: Invitation to sprint review meetings
- **Final Presentation**: Invitation to final project demo
- **Ad-hoc Updates**: As needed for significant changes/issues

## 7. Success Criteria

### Project Success Metrics:
1. **Functional Completeness**: All core features implemented per requirements
2. **Quality Standards**: 
   - < 5 critical bugs post-release
   - Code review pass rate > 90%
   - Unit test coverage > 80% for critical paths
3. **Performance**:
   - Page load < 3 seconds for 90% of pages
   - Search response < 2 seconds
   - Support 100+ concurrent users
4. **User Satisfaction**:
   - Positive feedback from user testing
   - System usability rated > 4/5
5. **Project Management**:
   - Delivered within 2-week tolerance of timeline
   - Budget adherence (if applicable)
   - Team satisfaction > 4/5

### Exit Criteria:
- All core features functional and tested
- Security assessment passed
- Performance benchmarks met
- Documentation completed and approved
- Final presentation delivered successfully
- Team retrospective completed and lessons learned documented

## 8. Appendices

### Appendix A: Technology Stack Details
- **Frontend**: React.js 18+, React Router v6, Redux Toolkit or Context API
- **Backend**: Node.js 18+, Express.js 4+, Sequelize ORM
- **Database**: MySQL 8+
- **Authentication**: JWT (JSON Web Tokens) with bcrypt hashing
- **Payment**: Stripe/PayPal sandbox integration (to be determined)
- **Deployment**: Docker containerization considered
- **Testing**: Jest, React Testing Library, SuperTest, Cypress (considered)
- **CI/CD**: GitHub Actions (considered)

### Appendix B: Definition of Done
- Code implemented and reviewed
- Unit tests written and passing
- Integration tested
- Documentation updated
- Deployed to staging environment
- Acceptance criteria met
- No critical or high severity bugs

### Appendix C: Sprint Artifacts
- Sprint Backlog (GitHub Issues/Project Board)
- Burndown Chart (to be maintained)
- Definition of Done checklist
- Sprint Review Demo script
- Retrospective action items

---
*Document Version: 1.0*
*Last Updated: $(date +%Y-%m-%d)*
*Prepared by: Charuka (Project Manager Role)*