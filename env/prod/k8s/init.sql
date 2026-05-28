CREATE DATABASE IF NOT EXISTS employees;

USE employees;

CREATE TABLE IF NOT EXISTS employees (
  id INT PRIMARY KEY,
  name VARCHAR(100)
);

INSERT INTO employees VALUES
(1,'John'),
(2,'Alice'),
(3,'David');