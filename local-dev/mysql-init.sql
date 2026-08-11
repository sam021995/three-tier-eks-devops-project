-- Mirrors helm/employee-app-chart/templates/mysql-initdb-config.yaml
-- Used only for local Docker-based testing, not deployed anywhere.

CREATE DATABASE IF NOT EXISTS employees;

USE employees;

CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150),
  department VARCHAR(100)
);

INSERT INTO employees (name, email, department) VALUES
('John', 'john@example.com', 'Engineering'),
('Alice', 'alice@example.com', 'Product'),
('David', 'david@example.com', 'Sales');
