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

USE towncare;

CREATE TABLE complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    photo VARCHAR(500) DEFAULT NULL,
    provider_name VARCHAR(100) DEFAULT NULL,
    provider_phone VARCHAR(15) DEFAULT NULL,
    status ENUM('Pending', 'Assigned', 'In Progress', 'Resolved')
        NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

USE towncare;

CREATE TABLE visitors (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    visitor_name VARCHAR(100) NOT NULL,

    mobile VARCHAR(15) NOT NULL,

    vehicle VARCHAR(30) DEFAULT NULL,

    visit_date DATE NOT NULL,

    expected_time TIME NOT NULL,

    purpose VARCHAR(100) NOT NULL,

    valid_till TIME NOT NULL,

    otp VARCHAR(6) NOT NULL,

    status ENUM('upcoming', 'completed')
        NOT NULL DEFAULT 'upcoming',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

USE towncare;

CREATE TABLE lost_found (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    type ENUM('Lost', 'Found') NOT NULL,

    item_name VARCHAR(150) NOT NULL,

    location VARCHAR(255) NOT NULL,

    item_date DATE NOT NULL,

    description TEXT NOT NULL,

    photo VARCHAR(500) DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

USE towncare;

CREATE TABLE bills (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    bill_type VARCHAR(100) NOT NULL,

    month VARCHAR(20) NOT NULL,

    year INT NOT NULL,

    amount DECIMAL(10,2) NOT NULL,

    due_date DATE NOT NULL,

    payment_date DATE DEFAULT NULL,

    status ENUM('Pending', 'Paid') NOT NULL DEFAULT 'Pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

USE towncare;

CREATE TABLE notices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    published_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (published_by)
        REFERENCES users(id)
        ON DELETE CASCADE
);

USE towncare;

ALTER TABLE notices
ADD COLUMN attachment VARCHAR(500) DEFAULT NULL;

USE towncare;

ALTER TABLE visitors
MODIFY COLUMN status
ENUM('upcoming', 'inside', 'completed')
NOT NULL DEFAULT 'upcoming';