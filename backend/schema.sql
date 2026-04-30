-- ============================================================
-- CATERING SERVICE SYSTEM - Database Schema
-- Run this script in your MySQL database
-- ============================================================

CREATE DATABASE IF NOT EXISTS catering_db;
USE catering_db;

-- Admin users table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inquiries / bookings table
CREATE TABLE IF NOT EXISTS inquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Customer Info
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,

    -- Event Info
    event_type ENUM('wedding','birthday','corporate','debut','reunion','anniversary','other') NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    event_venue VARCHAR(255) NOT NULL,
    guest_count INT NOT NULL,
    special_requests TEXT,

    -- Package Selections
    food_package ENUM('silver','gold','platinum','custom') NOT NULL,
    food_package_details TEXT,
    decoration_theme ENUM('elegant','rustic','modern','garden','tropical','vintage','minimalist') NOT NULL,
    flower_arrangement ENUM('classic_roses','tropical_mix','wildflower','orchid_luxury','sunflower_garden','peony_romance','none') NOT NULL,

    -- Inspiration Image (optional upload)
    inspiration_image VARCHAR(255),

    -- Status
    status ENUM('pending','approved','completed','cancelled') DEFAULT 'pending',

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed default admin account (password: admin123)
INSERT INTO admins (username, password_hash, full_name) VALUES
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator')
ON DUPLICATE KEY UPDATE id = id;
