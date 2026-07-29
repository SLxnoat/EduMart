# EduMart Wireframes Plan

This document outlines the wireframe planning approach for the EduMart e-commerce platform, detailing key screens, user flows, and documentation standards for the UI/UX design phase.

## 1. Wireframe Objectives

- Visualize user interface layouts and interactions
- Establish consistent design language and component library
- Define responsive breakpoints for mobile, tablet, and desktop
- Map user journeys to interface elements
- Facilitate communication between designers, developers, and stakeholders
- Serve as blueprint for frontend implementation in React.js

## 2. Wireframe Principles

- **Mobile-First Approach**: Design for smallest screen first, then enhance for larger screens
- **Component Consistency**: Reuse UI components across screens (buttons, forms, cards, etc.)
- **Accessibility First**: Ensure WCAG 2.1 AA compliance in all wireframes
- **Clear Visual Hierarchy**: Guide users' attention to primary actions
- **Minimal Cognitive Load**: Progressive disclosure and clear information architecture
- **Platform Conventions**: Follow established e-commerce patterns where appropriate
- **Brand Alignment**: Incorporate EduMart's visual identity (to be defined)

## 3. Key User Flows and Screens

### 3.1 User Authentication Flow (Kushmi)
- Landing/Homepage
- Login/Register modal/page
- Email verification flow
- Password reset flow
- Profile view/edit page
- Role selection during registration (Student/Tutor/Admin)

### 3.2 Product Discovery Flow (Vidula)
- Homepage with featured categories and recommendations
- Category browsing page
- Search results page with filters
- Product listing/grid view
- Product detail page (with images, description, pricing, reviews)
- Related products)
- Save for later/wishlist functionality
- Related products section

### 3.3 Shopping Cart & Checkout Flow (Bhanuka & Charuka)
- Mini cart (accessible from header)
- Full cart page (edit quantities, apply coupons, estimate shipping)
- Checkout flow (multi-step):
  1. Cart review
  2. Shipping information (for physical items)
  3. Payment method selection
  4. Order review and confirmation
- Order confirmation page
- Order history page
- Order detail page (with tracking/status)

### 3.4 Payment Processing (Charuka)
- Payment form (credit card, digital wallet options)
- Payment processing modal/spinner
- Payment success/error states
- 3D Secure authentication flow (if applicable)

### 3.5 Seller Dashboard Flow (Malki & Charuka)
- Seller dashboard overview (sales, pending orders, performance)
- Product upload/create flow (multi-step):
  1. Basic information (title, description, price)
  2. File upload (digital assets)
  3. Categorization (subject, grade, exam year)
  4. Preview and submit
- Product management page (list of seller's products with actions)
- Order management for sellers (pending, completed)
- Earnings and payouts page
- Sales analytics and reporting

### 3.6 Admin Dashboard Flow (Malki)
- Admin dashboard overview (key metrics, alerts)
- User management (list, search, role management)
- Product moderation queue (approve/reject with feedback)
- Order management (filter by status, date, etc.)
- Review moderation tools
- Notification/campaign management
- System settings and configuration

### 3.7 Review & Rating System (Malki)
- Product review display (on product detail page)
- Review submission form (rating, title, comment, photos)
- Helpful voting system
- Review response capability (for sellers)
- Moderated review display

### 3.8 AI Chatbot Flow (Kushmi & Charuka)
- Chat widget (collapsible, persistent)
- Chat conversation view
- Suggested quick replies/FAQ buttons
- Typing indicators
- Message status (sent, delivered, read)
- Feedback/rating after conversation

### 3.9 Notification System (Malki)
- Notification center/bell icon
- Notification dropdown/list
- Individual notification detail view
- Notification preferences/settings
- Promotional banner/modal (for site-wide announcements)

### 3.10 Coupon & Discount System (Charuka & Vidula)
- Coupon code field in cart/checkout
- Discount application and validation messages
- Coupon management interface (for admins)
- Promotional badges on products (when applicable)

## 4. Wireframe Documentation Standards

### 4.1 Annotation Convention
- Use numbered callouts ([1], [2], etc.) for interactive elements
- Provide brief descriptions for each callout in a legend
- Annotate responsive behavior changes
- Note accessibility considerations (ARIA labels, keyboard navigation)
- Specify component states (default, hover, active, disabled, loading, error)

### 4.2 State Documentation
For each interactive element, document:
- Default state
- Hover/focus state
- Active/selected state
- Disabled state
- Loading state
- Error/validation state
- Success state

### 4.3 Responsive Breakpoints
Document behavior at these breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px
- Note any layout changes, component visibility, or interaction differences

### 4.4 Component Library Reference
Wireframes should reference and document:
- Reused components (buttons, inputs, cards, modals, etc.)
- Component variations (primary/secondary buttons, icon-only buttons, etc.)
- Spacing and layout grids
- Typography hierarchy
- Color usage (to be defined in design system)

### 4.5 File Naming and Organization
- Use descriptive names: `01-homepage-mobile.wireframe`, `02-product-detail-tablet.wireframe`
- Group by user flow or feature
- Include version numbers or dates for iterations
- Store in `/design/wireframes/` directory in the repository

## 5. Tools and Process Recommendations

### 5.1 Recommended Tools
- **Primary**: Figma (for collaborative design, prototyping, and design system)
- **Alternatives**: Adobe XD, Sketch, or Penpot (open source)
- **Prototyping**: Figma's built-in prototyping or Framer for advanced interactions
- **Design System**: Figma variables and styles for tokens (colors, spacing, typography)
- **Version Control**: Git for design files (using Figma's version history or separate file versioning)

### 5.2 Workflow
1. **Research & Sketching**: Low-fidelity paper/digital sketches for initial concepts
2. **Low-Fidelity Wireframes**: Focus on layout and structure (using grayscale, basic shapes)
3. **High-Fidelity Wireframes**: Add typography, spacing, and basic styling
4. **Interactive Prototyping**: Link screens to demonstrate user flows
5. **Review & Feedback**: Share with stakeholders for input
6. **Iteration**: Refine based on feedback
7. **Handoff**: Prepare for development with specs, assets, and component documentation

### 5.3 Deliverables per Screen
- Wireframe file (Figma/Sketch/XD)
- Annotation layer or separate documentation file
- Component specifications (states, variations, usage guidelines)
- Responsive behavior notes
- Accessibility considerations
- Interaction notes (transitions, micro-interactions where relevant)

## 6. Integration with Existing Documentation

### 6.1 Connection to User Journey Diagrams
Wireframes should directly correspond to the user journeys documented in:
- `technical_architecture.md` sections 3.2.1-3.2.4 (User Registration, Product Browse, Shopping Cart, Seller Upload)
- Each wireframe should be traceable to specific steps in these journeys

### 6.2 Connection to Component Interaction Diagrams
Wireframes should reflect the component interactions documented in:
- `technical_architecture.md` section 3.3 (Payment Processing, AI Chatbot, Notification System)
- Interface elements should map to participants in sequence diagrams

### 6.3 Connection to Data Flow Diagrams
Wireframes should indicate where data is:
- Entered (forms, inputs)
- Displayed (lists, cards, details)
- Submitted (buttons, actions)
- Retrieved (loading states, empty states)

## 7. Wireframe Schedule (Aligned with Project Plan)

### Weeks 1-2: Planning & Design Phase
- **Week 1**: 
  - Establish design system foundations (typography, color palette, spacing)
  - Create low-fidelity wireframes for core user flows:
    - User authentication (login/register)
    - Product discovery (homepage, search, product detail)
    - Shopping cart (mini cart, cart page)
    - Checkout flow (shipping, payment, confirmation)
- **Week 2**:
  - Create high-fidelity wireframes for:
    - Seller dashboard (upload, product management, earnings)
    - Admin dashboard (moderation, user management, analytics)
    - Review system (display, submission, moderation)
    - AI chatbot interface
    - Notification system
    - Coupon/discount application
  - Review and iterate based on stakeholder feedback
  - Prepare wireframe handoff documentation for development

### Weeks 3-12: Development Phase
- Use wireframes as reference during frontend implementation
- Update wireframes as needed based on technical constraints or user feedback
- Maintain living document that evolves with the implementation

## 8. Accessibility Considerations (WCAG 2.1 AA)

All wireframes must address:
- **Keyboard Navigation**: Logical tab order, visible focus indicators
- **Screen Reader Support**: Logical reading order, ARIA labels for icons/buttons
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Touch Targets**: Minimum 44x44px for interactive elements
- **Form Labels**: Associated labels for all inputs
- **Error Identification**: Clear error messages and suggestions
- **Responsive Text**: Ability to resize text without loss of content/functionality
- **Alternative Text**: For meaningful images (product photos, etc.)
- **Landmark Elements**: Proper use of header, nav, main, section, footer

## 9. Performance Considerations

Wireframes should consider:
- **Lazy Loading**: For images and below-the-fold content
- **Placeholder States**: Skeletons or low-res previews while loading
- **Pagination/Infinite Scroll**: For long lists (products, orders, reviews)
- **Optimized Asset Delivery**: Appropriate image sizes for different breakpoints
- **Minimizing Critical Rendering Path**: Prioritizing above-the-fold content

## 10. Deliverables

By end of Week 2, deliver:
1. Complete set of wireframes for all key user flows (mobile, tablet, desktop breakpoints)
2. Wireframe annotation documentation (separate file or layered in design tool)
3. Component library documentation (reused elements with states and variations)
4. Responsive behavior specification document
5. Accessibility compliance checklist for each wireframe
6. Interactive prototype demonstrating core user flows
7. Style guide foundation (typography, spacing, color usage - to be expanded in design system)

## 11. Maintenance and Evolution

- Wireframes should be treated as living documents
- Update during development as needed based on:
  - Technical feasibility discoveries
  - User testing feedback
  - Stakeholder input
  - Design system evolution
- Maintain version history
- Reference wireframes in development documentation and tickets

## 12. Related Documentation

- [Database Schema Documentation](../sql_schema.md) - Complete database design with ERD
- [Technical Architecture](../technical_architecture.md) - System design with component interactions
- [Project Plan](../project_plan.md) - Timeline and sprint alignment
- [Team Roles](../team_roles.md) - Responsibilities for UI/UX implementation
- [Requirements](../requirements.md) - Functional and non-functional requirements guiding wireframe design

---
*Document Version: 1.0*
*Last Updated: 2026-07-29*
*Prepared for: EduMart Project Team*