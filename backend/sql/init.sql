CREATE DATABASE planit
DEFAULT CHARACTER SET utf8
COLLATE utf8_hungarian_ci;

CREATE TABLE locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    link VARCHAR(255) 
);

CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    capacity INT NOT NULL,
    location_id INT NOT NULL,
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO locations (name, latitude, longitude, link) VALUES
('proba', 48.858370, 2.294481, 'https://www.toureiffel.paris/en');

INSERT INTO events (type, description, category, title, date, capacity, location_id) VALUES
('concert', 'proba proba proba', 'music', 'Proba probaja', '2026-05-02', 100, 1);

INSERT INTO users (username, email, password, role, full_name) VALUES
('admin', 'admin@gmail.com', 'admin123', 'admin', 'Admin User'),
('Proba Peter', 'proba@gmail.com', 'proba123', 'user', 'Proba Peter');