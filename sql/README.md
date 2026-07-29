# SQL Schema Files

This directory contains the SQL schema files for the EduMart e-commerce platform database.

## Files

- `database_schema.sql` - Complete MySQL database schema with all tables, indexes, and relationships

## Usage

To create the database schema:

```bash
# Create the database (if not exists)
CREATE DATABASE edumart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE edumart;

# Execute the schema
SOURCE /path/to/database_schema.sql;
```

Or alternatively:

```bash
mysql -u username -p edumart < /path/to/database_schema.sql
```

## Features

- Supports MySQL 8.0+
- Uses UTF-8 (utf8mb4) encoding for full Unicode support
- Includes proper indexing for query performance
- Defines foreign key relationships with appropriate ON DELETE behaviors
- Includes generated columns for computed values
- Contains sample data sections (commented out) for development/testing
- Follows normalization principles (3NF where appropriate)

## Tables

1. `users` - All user accounts (students, tutors, admins, institutes)
2. `product_categories` - Hierarchical product categorization
3. `products` - Core product/listing information
4. `digital_assets` - Files associated with digital products
5. `orders` - Customer purchase records
6. `order_items` - Line items within orders
7. `payments` - Transaction records for order payments
8. `reviews` - Product feedback from users
9. `notifications` - System notifications for users
10. `coupons` - Promotional code management
11. `coupon_usage` - Tracking coupon usage by users
12. `seller_earnings` - Tracking revenue and payouts for sellers
13. `shipments` - Tracking physical product deliveries
14. `ai_interactions` - Logging chatbot interactions
15. `sessions` - Alternative to JWT for server-side sessions
16. `admin_actions` - Audit trail for administrative activities

## Notes

- Primary keys use UUID (CHAR(36)) for distributed systems compatibility
- All tables use InnoDB engine for transaction support and foreign key constraints
- Proper indexes are defined for common query patterns
- Check constraints ensure data integrity (MySQL 8.0.16+)
- JSON columns used for flexible storage of structured data (addresses, gateway responses, etc.)