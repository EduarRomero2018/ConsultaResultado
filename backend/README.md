# Backend - Consulta de Resultados de Electro

Este backend forma parte del sistema ConsultaResultado. Para instrucciones completas de instalación, configuración y uso, consulta el [README principal del proyecto](../README.md).

## Instrucciones rápidas

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Configura el archivo `.env` con tus credenciales de MySQL y JWT.
3. Configura la base de datos ejecutando el archivo centralizado:
   ```bash
   mysql -u tu_usuario -p < database.sql
   ```
4. Inicia el servidor:
   ```bash
   npm run dev
   ```

## Endpoints principales
- POST `/api/auth/login` — Login admin
- POST `/api/upload` — Cargar PDF (requiere JWT)
- GET `/api/results?document_type=CC&document_number=1234567890` — Buscar resultados
- GET `/api/download/:file_id` — Descargar PDF

Para detalles de endpoints, estructura de base de datos y arquitectura, revisa el README principal.
