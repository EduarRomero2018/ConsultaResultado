# Proyecto: ConsultaResultado

Sistema web cliente-servidor para la **consulta y carga de resultados médicos en PDF** (electrocardiogramas y estudios similares) para **Caminos IPS**. El frontend está desarrollado en **React** y el backend en **Node.js/Express** con base de datos **MySQL**, y los PDFs se almacenan en **AWS S3**.

En producción corre en un servidor AWS Lightsail, con despliegue automático vía GitHub Actions en cada push a `main` (ver `.github/workflows/deploy.yml` y `deploy/nginx.conf.example`).

## Estructura del repositorio

- **`backend/`**: API REST, lógica de negocio y procesamiento de PDFs.
- **`frontend/`**: SPA para pacientes y personal administrativo.
- **`deploy/`**: configuración de referencia de Nginx para producción.
- **`.github/workflows/`**: pipeline de despliegue automático (CI/CD).

## Funcionalidades principales

- **Carga de resultados (admin):** Subida de PDF con validación del nombre del archivo y extracción de datos del documento.
- **Consulta pública:** Búsqueda por tipo y número de documento.
- **Descarga:** El backend genera una URL prefirmada de S3 con expiración corta; el PDF nunca se almacena ni se sirve desde disco local.

## Tecnologías

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS**
- **React Router**
- **Axios**

### Backend
- **Node.js / Express**
- **MySQL**
- **Multer** (recepción de archivos en memoria, sin escribir a disco)
- **pdfjs-dist** (extracción de datos desde PDF)
- **AWS SDK v3** (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`) — almacenamiento en S3
- **JWT** (autenticación)

## Configuración local

### 1. Backend
```bash
cd backend
npm install
```

Crea el archivo `backend/.env` con tus credenciales:
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=tu_password
DB_NAME=resultados_electro
JWT_SECRET=tu_secreto_seguro
PORT=5050

# AWS S3
AWS_REGION=us-east-1
AWS_S3_BUCKET=nombre-de-tu-bucket
# Solo si no usas un IAM role asociado a la instancia:
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
```

Importa el esquema de base de datos:
```bash
mysql -u tu_usuario -p < database.sql
```

Inicia el servidor:
```bash
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

Vite corre por defecto en `http://localhost:5173` y consume la API en `http://localhost:5050`.

## Reglas para el cargue de PDFs (modo estricto)

- **Nombre obligatorio:** el archivo debe llamarse exactamente `TIPO_NUMERO.pdf`.
  - Ejemplos válidos: `CC_123456789.pdf`, `TI_987654321.pdf`.
  - Si el nombre no coincide con los datos del PDF, el cargue es rechazado.
- **Contenido mínimo del PDF:** debe incluir como mínimo:
  - **Tipo de documento**
  - **Número de documento**
  - **Fecha de realización**
- **Validación de duplicados:** no se permite más de un resultado con la misma combinación:
  - **tipo + número + fecha de realización**
  - Si existe un registro igual, el sistema mostrará una alerta y no cargará el archivo.

## Buenas prácticas de operación

- Verifica que el nombre del archivo coincida con el tipo y número reales del PDF.
- Sube los archivos en lotes (máximo 30 PDFs por carga, 20MB por archivo).
- Revisa el resumen de carga para identificar archivos fallidos.

## Rutas principales

- **Frontend**: `/search` (consulta), `/upload` (carga), `/login` (acceso admin)
- **Backend**: `/api/auth/*`, `/api/upload`, `/api/results`, `/api/download/:file_id`

## Despliegue en producción

Cada push a `main` dispara `.github/workflows/deploy.yml`: construye el frontend, lo copia al servidor y reinicia el backend con PM2 vía SSH. Requiere los secrets `SSH_HOST`, `SSH_USER` y `SSH_PRIVATE_KEY` configurados en el repositorio. La configuración de Nginx de referencia (proxy `/api` al backend, estático + fallback SPA para el frontend) está en `deploy/nginx.conf.example`.

## Notas

- En producción, `JWT_SECRET` debe ser robusto y privado, igual que las credenciales de AWS.
- El bucket de S3 solo necesita permisos `s3:PutObject`/`s3:GetObject` sobre el prefijo `results/*`.
