CREATE DATABASE IF NOT EXISTS repair_management
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE repair_management;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  real_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'property_manager',
  phone VARCHAR(20),
  email VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS devices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_code VARCHAR(50) UNIQUE NOT NULL,
  device_name VARCHAR(200) NOT NULL,
  device_type VARCHAR(50) NOT NULL,
  floor VARCHAR(20) NOT NULL,
  area VARCHAR(50),
  location VARCHAR(200),
  status VARCHAR(20) DEFAULT 'normal',
  manufacturer VARCHAR(200),
  install_date DATE,
  last_maintenance_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_devices_floor (floor),
  INDEX idx_devices_type (device_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS repair_tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_no VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  urgency VARCHAR(20) NOT NULL DEFAULT 'medium',
  device_id INT,
  device_type VARCHAR(50) NOT NULL,
  floor VARCHAR(20) NOT NULL,
  area VARCHAR(50),
  location VARCHAR(200),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  reporter_id INT NOT NULL,
  reporter_name VARCHAR(100) NOT NULL,
  assignee_id INT,
  assignee_name VARCHAR(100),
  process_note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (device_id) REFERENCES devices(id),
  FOREIGN KEY (reporter_id) REFERENCES users(id),
  FOREIGN KEY (assignee_id) REFERENCES users(id),
  INDEX idx_tickets_status (status),
  INDEX idx_tickets_floor (floor),
  INDEX idx_tickets_device_type (device_type),
  INDEX idx_tickets_urgency (urgency),
  INDEX idx_tickets_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS repair_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  operator_id INT NOT NULL,
  operator_name VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  remark TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES repair_tickets(id),
  FOREIGN KEY (operator_id) REFERENCES users(id),
  INDEX idx_records_ticket (ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
