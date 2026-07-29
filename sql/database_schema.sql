-- EduMart Database Schema
-- MySQL 8.0+ Compatible
-- Generated for EduMart E-learning Materials E-commerce Platform

-- Set SQL mode and character set
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET NAMES utf8mb4;

-- Drop existing database if exists (for development)
-- DROP DATABASE IF EXISTS edumart;
-- CREATE DATABASE edumart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE edumart;

-- =============================================
-- TABLES
-- =============================================

-- Users table - stores all user accounts
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('student', 'tutor', 'admin', 'institute') NOT NULL DEFAULT 'student',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_expires DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login DATETIME NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product Categories - hierarchical categorization
CREATE TABLE product_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    parent_id INT NULL,
    description TEXT,
    level INT NOT NULL DEFAULT 0,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL,
    INDEX idx_parent_id (parent_id),
    INDEX idx_level (level),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products - core product/listing information
CREATE TABLE products (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    seller_id CHAR(36) NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(500),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    original_price DECIMAL(10, 2) NULL CHECK (original_price >= 0),
    sku VARCHAR(100) UNIQUE,
    subject VARCHAR(100) NOT NULL,
    grade_level VARCHAR(50) NOT NULL,
    exam_year YEAR NULL,
    product_type ENUM('past_paper', 'ebook', 'model_paper', 'revision_notes', 'lecture_pack', 'other') NOT NULL,
    format ENUM('digital', 'physical', 'both') NOT NULL DEFAULT 'digital',
    is_downloadable BOOLEAN NOT NULL DEFAULT FALSE,
    is_shippable BOOLEAN NOT NULL DEFAULT FALSE,
    file_size INT NULL, -- in KB for digital products
    pages INT NULL,
    language VARCHAR(50) DEFAULT 'English',
    isbn VARCHAR(20),
    publisher VARCHAR(255),
    publication_date DATE,
    condition ENUM('new', 'like_new', 'good', 'fair', 'poor') NULL,
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    reserve_stock INT NOT NULL DEFAULT 0 CHECK (reserve_stock >= 0),
    rating_average DECIMAL(3, 2) DEFAULT 0.00 CHECK (rating_average BETWEEN 0 AND 5),
    rating_count INT NOT NULL DEFAULT 0 CHECK (rating_count >= 0),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    approved_at TIMESTAMP NULL,
    approved_by CHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_seller_id (seller_id),
    INDEX idx_category_id (category_id),
    INDEX idx_subject_grade (subject, grade_level),
    INDEX idx_exam_year (exam_year),
    INDEX idx_product_type (product_type),
    INDEX idx_format (format),
    INDEX idx_price (price),
    INDEX idx_is_active (is_active),
    INDEX idx_is_approved (is_approved),
    INDEX idx_created_at (created_at),
    FULLTEXT INDEX ft_title_description (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Digital Assets - files associated with digital products
CREATE TABLE digital_assets (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_id CHAR(36) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_size INT NOT NULL, -- in KB
    mime_type VARCHAR(100) NOT NULL,
    is_preview BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    download_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_is_preview (is_preview)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders - customer purchase records
CREATE TABLE orders (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    status ENUM('pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded', 'failed') NOT NULL DEFAULT 'pending',
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    payment_status ENUM('pending', 'processing', 'paid', 'failed', 'refunded', 'partially_refunded') NOT NULL DEFAULT 'pending',
    shipping_address JSON,
    billing_address JSON,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_user_id (user_id),
    INDEX idx_order_number (order_number),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created_at (created_at),
    INDEX idx_completed_at (completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Items - line items within orders
CREATE TABLE order_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
    product_title VARCHAR(255) NOT NULL, -- denormalized for historical accuracy
    product_subject VARCHAR(100) NOT NULL,
    product_grade_level VARCHAR(50) NOT NULL,
    is_digital BOOLEAN NOT NULL,
    is_physical BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id),
    INDEX idx_order_product (order_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments - transaction records for order payments
CREATE TABLE payments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    payment_method ENUM('credit_card', 'paypal', 'bank_transfer', 'digital_wallet') NOT NULL,
    provider VARCHAR(50) NOT NULL, -- e.g., 'stripe', 'paypal'
    provider_payment_id VARCHAR(255) UNIQUE,
    provider_fee DECIMAL(10, 2) DEFAULT 0,
    net_amount DECIMAL(10, 2) GENERATED ALWAYS AS (amount - provider_fee) STORED,
    status ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded') NOT NULL DEFAULT 'pending',
    gateway_response JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_order_id (order_id),
    INDEX idx_user_id (user_id),
    INDEX idx_provider_payment_id (provider_payment_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reviews and Ratings - product feedback from users
CREATE TABLE reviews (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    order_id CHAR(36) NULL, -- optional link to verifying purchase
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
    helpful_votes INT NOT NULL DEFAULT 0 CHECK (helpful_votes >= 0),
    total_votes INT NOT NULL DEFAULT 0 CHECK (total_votes >= 0),
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    approved_at TIMESTAMP NULL,
    approved_by CHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_product_id (product_id),
    INDEX idx_user_id (user_id),
    INDEX idx_order_id (order_id),
    INDEX idx_rating (rating),
    INDEX idx_is_approved (is_approved),
    INDEX idx_created_at (created_at),
    INDEX idx_helpful_votes (helpful_votes)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications - system notifications for users
CREATE TABLE notifications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    type ENUM('order_status', 'payment_status', 'shipping_update', 'new_product', 'promotion', 'review_reply', 'system_announcement', 'password_change', 'security_alert') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    related_id CHAR(36) NULL, -- polymorphic reference to order_id, product_id, etc.
    related_type VARCHAR(50) NULL, -- e.g., 'order', 'product'
    priority ENUM('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal',
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_type (type),
    INDEX idx_priority (priority),
    INDEX idx_expires_at (expires_at),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Coupons and Discounts - promotional code management
CREATE TABLE coupons (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    discount_type ENUM('percentage', 'fixed_amount', 'free_shipping') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL CHECK (
        (discount_type = 'percentage' AND discount_value BETWEEN 0 AND 100) OR
        (discount_type = 'fixed_amount' AND discount_value >= 0) OR
        (discount_type = 'free_shipping')
    ),
    minimum_purchase DECIMAL(10, 2) DEFAULT 0 CHECK (minimum_purchase >= 0),
    maximum_discount DECIMAL(10, 2) NULL CHECK (maximum_discount >= 0),
    usage_limit INT NULL CHECK (usage_limit >= 0),
    usage_count INT NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
    per_user_limit INT NULL CHECK (per_user_limit >= 0),
    starts_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    applicable_to ENUM('all', 'specific_products', 'specific_categories') NOT NULL DEFAULT 'all',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_is_active (is_active),
    INDEX idx_starts_at (starts_at),
    INDEX idx_expires_at (expires_at),
    INDEX idx_applicable_to (applicable_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Coupon Usage - tracking coupon usage by users
CREATE TABLE coupon_usage (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    coupon_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    order_id CHAR(36) NOT NULL,
    discount_amount DECIMAL(10, 2) NOT NULL CHECK (discount_amount >= 0),
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_user_coupon_order (user_id, coupon_id, order_id),
    INDEX idx_coupon_id (coupon_id),
    INDEX idx_user_id (user_id),
    INDEX idx_order_id (order_id),
    INDEX idx_used_at (used_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seller Earnings - tracking revenue and payouts for sellers
CREATE TABLE seller_earnings (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    seller_id CHAR(36) NOT NULL,
    order_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    sale_amount DECIMAL(10, 2) NOT NULL CHECK (sale_amount >= 0),
    platform_fee DECIMAL(10, 2) NOT NULL CHECK (platform_fee >= 0),
    payment_processing_fee DECIMAL(10, 2) NOT NULL CHECK (payment_processing_fee >= 0),
    net_earnings DECIMAL(10, 2) GENERATED ALWAYS AS (sale_amount - platform_fee - payment_processing_fee) STORED,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status ENUM('pending', 'available', 'paid', 'held', 'refunded') NOT NULL DEFAULT 'pending',
    available_at TIMESTAMP NULL, -- when funds become available for withdrawal
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_seller_id (seller_id),
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id),
    INDEX idx_status (status),
    INDEX idx_available_at (available_at),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Shipments - tracking physical product deliveries
CREATE TABLE shipments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_id CHAR(36) NOT NULL,
    tracking_number VARCHAR(100) UNIQUE,
    carrier VARCHAR(100) NOT NULL,
    service_type VARCHAR(100),
    shipped_at TIMESTAMP NULL,
    estimated_delivery TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    status ENUM('pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'failed', 'returned_to_sender') NOT NULL DEFAULT 'pending',
    shipping_cost DECIMAL(10, 2) NOT NULL CHECK (shipping_cost >= 0),
    insurance_amount DECIMAL(10, 2) DEFAULT 0,
    customs_value DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_tracking_number (tracking_number),
    INDEX idx_carrier (carrier),
    INDEX idx_status (status),
    INDEX idx_shipped_at (shipped_at),
    INDEX idx_delivered_at (delivered_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI Interactions - logging chatbot interactions for improvement and analytics
CREATE TABLE ai_interactions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NULL, -- nullable for anonymous users
    session_id VARCHAR(255) NOT NULL,
    message_text TEXT NOT NULL,
    response_text TEXT NOT NULL,
    intent VARCHAR(100) NOT NULL,
    confidence_score DECIMAL(3, 2) NULL CHECK (confidence_score BETWEEN 0 AND 1),
    language VARCHAR(10) DEFAULT 'en',
    is_helpful BOOLEAN NULL,
    feedback_rating TINYINT NULL CHECK (feedback_rating BETWEEN 1 AND 5),
    response_time_ms INT NOT NULL CHECK (response_time_ms >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_intent (intent),
    INDEX idx_created_at (created_at),
    INDEX idx_is_helpful (is_helpful)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions (Alternative to JWT) - if using server-side sessions
CREATE TABLE sessions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin Actions - audit trail for administrative activities
CREATE TABLE admin_actions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    admin_id CHAR(36) NOT NULL,
    action_type ENUM('product_approval', 'product_rejection', 'user_ban', 'user_activation', 'order_modification', 'refund_approval', 'coupon_creation', 'system_setting_change') NOT NULL,
    target_id CHAR(36) NULL, -- references product_id, user_id, order_id, etc.
    target_type VARCHAR(50) NULL,
    description TEXT NOT NULL,
    metadata JSON,
    ip_address VARCHAR(45) NULL,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_admin_id (admin_id),
    INDEX idx_action_type (action_type),
    INDEX idx_target_id (target_id),
    INDEX idx_performed_at (performed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- SAMPLE DATA (OPTIONAL - FOR DEVELOPMENT/TESTING)
-- =============================================

-- Uncomment the following sections to insert sample data

-- /*
-- INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_verified, is_active)
-- VALUES
-- ('11111111-1111-1111-1111-111111111111', 'admin@edumart.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.Q0bb3u', 'System', 'Administrator', 'admin', TRUE, TRUE),
-- ('22222222-2222-2222-2222-222222222222', 'tutor@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.Q0bb3u', 'John', 'Tutor', 'tutor', TRUE, TRUE),
-- ('33333333-3333-3333-3333-333333333333', 'student@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.Q0bb3u', 'Jane', 'Student', 'student', TRUE, TRUE);
-- */

-- /*
-- INSERT INTO product_categories (id, name, description, level, is_active)
-- VALUES
-- (1, 'Past Papers', 'Previous examination papers', 0, TRUE),
-- (2, 'E-books', 'Digital textbooks and study guides', 0, TRUE),
-- (3, 'Model Papers', 'Sample papers with solutions', 0, TRUE),
-- (4, 'Revision Notes', 'Concise study notes', 0, TRUE),
-- (5, 'Lecture Packs', 'Recorded lectures and materials', 0, TRUE);
-- */

-- /*
-- INSERT INTO products (id, seller_id, category_id, title, description, price, subject, grade_level, exam_year, product_type, format, is_downloadable, is_shippable, is_active, is_approved)
-- VALUES
-- ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 1, 'Mathematics Past Paper 2023', 'Official mathematics past paper for 2023 examinations', 5.99, 'Mathematics', 'Grade 12', 2023, 'past_paper', 'digital', TRUE, FALSE, TRUE, TRUE),
-- ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 2, 'Physics Study Guide', 'Comprehensive physics study guide for exam preparation', 12.99, 'Physics', 'Grade 11', NULL, 'ebook', 'digital', TRUE, FALSE, TRUE, TRUE);
-- */