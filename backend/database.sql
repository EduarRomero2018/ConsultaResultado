-- Consolidado de Scripts de Base de Datos - Proyecto ConsultaResultado
-- Base de datos: electro_ips

-- 1. Creación de la base de datos
CREATE DATABASE
IF NOT EXISTS `electro_ips` CHARACTER
SET utf8mb4
COLLATE utf8mb4_unicode_ci;
USE `electro_ips`;

-- 2. Tabla de Usuarios (Administradores/Staff)
-- Esta tabla permite que los administradores se autentiquen para cargar archivos.
CREATE TABLE
IF NOT EXISTS `users`
(
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR
(100) NOT NULL,
  `email` VARCHAR
(150) NOT NULL UNIQUE,
  `password` VARCHAR
(255) NOT NULL, -- Almacenará el hash (bcrypt)
  `role` ENUM
('admin', 'staff') DEFAULT 'staff',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON
UPDATE CURRENT_TIMESTAMP,

  -- Índices para mejorar rendimiento en búsquedas por email
  INDEX idx_user_email (`email`)
) ENGINE
=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de Resultados (Metadatos de PDFs)
-- Almacena la información extraída de los documentos y la ruta al archivo físico.
CREATE TABLE
IF NOT EXISTS `results`
(
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `document_type` ENUM
('CC', 'PAS', 'TI', 'CE') NOT NULL,
  `document_number` VARCHAR
(20) NOT NULL,
  `date_performed` DATE NOT NULL,
  `file_name` VARCHAR
(255) NOT NULL,
  `file_path` VARCHAR
(500) NOT NULL,
  `uploaded_by` INT DEFAULT NULL, -- Relación opcional con el usuario que cargó el archivo
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Índices para optimizar la consulta de pacientes
  INDEX idx_document
(`document_type`, `document_number`),
  -- Integridad referencial con la tabla de usuarios
  CONSTRAINT fk_results_user FOREIGN KEY
(`uploaded_by`) REFERENCES `users`
(`id`) ON
DELETE
SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

//
INSERT INTO results (document_type, document_number, date_performed, file_name, file_path, uploaded_by) VALUES
//
    ('CC', '123456789', '2024-01-15', 'resultado_123456789.pdf', '/uploads/resultado_123456789.pdf', 1)
;

-- 4. Ejemplo de inserción de usuario administrador inicial (sin hash)
INSERT INTO `users` (`
full_name`,
`email
`, `password`, `role`) VALUES
('Administrador Principal', 'admin@ejemplo.com', 'Caminos2026', 'admin');

-- Puedes generar tu propio hash con bcrypt para mayor seguridad.

