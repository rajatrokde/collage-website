-- Database initialization script for Apex Institute of Technology & Advanced Engineering (AITAE)
CREATE DATABASE IF NOT EXISTS logindb;
USE logindb;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'student',
  full_name VARCHAR(100) NOT NULL,
  roll_number VARCHAR(50) DEFAULT NULL,
  department VARCHAR(100) DEFAULT NULL,
  degree VARCHAR(50) DEFAULT 'B.Tech',
  semester INT DEFAULT 6,
  section VARCHAR(20) DEFAULT 'CSE-A',
  cgpa DECIMAL(3,2) DEFAULT 9.14,
  avatar VARCHAR(255) DEFAULT NULL,
  hostel VARCHAR(100) DEFAULT NULL,
  advisor VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Default Engineering Student (Aarav Sharma - B.Tech CSE)
INSERT INTO users (username, email, password_hash, role, full_name, roll_number, department, degree, semester, section, cgpa, avatar, hostel, advisor)
SELECT '2023BCSE0842', 'aarav.sharma@aitae.edu.in', '$2a$10$Q7Yl9i89.b51rR5c4V8q3eGj1oK9pS1hHj5uF2qB4gN0mE8kP6rT2', 'student', 'Aarav Sharma', '2023BCSE0842', 'Computer Science & Engineering', 'B.Tech', 6, 'CSE-A', 9.14, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'CV Raman Hall of Residence - Room B-402', 'Dr. Rajeshwari Ramanujan'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = '2023BCSE0842');

-- Seed Default Faculty (Dr. Rajeshwari Ramanujan)
INSERT INTO users (username, email, password_hash, role, full_name, roll_number, department, degree, semester, section, cgpa, avatar, hostel, advisor)
SELECT 'FAC-CSE-4092', 'r.ramanujan@aitae.edu.in', '$2a$10$Q7Yl9i89.b51rR5c4V8q3eGj1oK9pS1hHj5uF2qB4gN0mE8kP6rT2', 'faculty', 'Dr. Rajeshwari Ramanujan, Ph.D.', 'FAC-CSE-4092', 'Computer Science & Artificial Intelligence', 'Faculty - Associate Professor', NULL, NULL, NULL, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', 'Staff Quarters Type-IV #12', 'Dean of Faculty Affairs'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'FAC-CSE-4092');

-- Seed Default Dean / Admin (Dr. K. V. S. Murthy)
INSERT INTO users (username, email, password_hash, role, full_name, roll_number, department, degree, semester, section, cgpa, avatar, hostel, advisor)
SELECT 'admin', 'dean.academic@aitae.edu.in', '$2a$10$Q7Yl9i89.b51rR5c4V8q3eGj1oK9pS1hHj5uF2qB4gN0mE8kP6rT2', 'admin', 'Dr. K. V. S. Murthy', 'ADM-HQ-101', 'Office of Academic Affairs & Registrar', 'Registrar & Chief Academic Officer', NULL, NULL, NULL, 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80', 'Administrative Block - Suite 101', 'Board of Governors'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');
