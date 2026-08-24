CREATE DATABASE towncare;

USE towncare;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    house_no VARCHAR(10) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL,
    phone_no VARCHAR(15) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('resident', 'admin') NOT NULL DEFAULT 'resident',
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);