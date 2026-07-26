-- Consolidado de Scripts de Base de Datos - Proyecto ConsultaResultado
-- Base de datos: resultados_electro (debe coincidir con DB_NAME en backend/.env)

-- 1. Creación de la base de datos
CREATE DATABASE
IF NOT EXISTS `resultados_electro` CHARACTER
SET utf8mb4
COLLATE utf8mb4_unicode_ci;
USE `resultados_electro`;

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
('CC', 'CE', 'TI', 'RC', 'PAS', 'PEP', 'PPT') NOT NULL,
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

-- Sugerido (opcional, no bloqueante): cierra la condición de carrera de duplicados,
-- que hoy depende solo de una verificación en la aplicación antes del INSERT.
-- ALTER TABLE `results` ADD UNIQUE KEY `uq_document_date` (`document_type`, `document_number`, `date_performed`);

-- 4. Ejemplo de inserción de usuario administrador inicial (plantilla, no ejecutar tal cual).
-- Sustituye el email y la contraseña por valores reales antes de correr este INSERT;
-- no dejes credenciales reales en este archivo versionado en git.
-- INSERT INTO `users` (`full_name`, `email`, `password`, `role`) VALUES
-- ('Administrador Principal', 'admin@ejemplo.com', 'defineme', 'admin');

