# Proyecto: ConsultaResultado

Sistema web cliente-servidor para la **consulta y carga de resultados médicos en PDF** (electrocardiogramas y estudios similares) para **Caminos IPS**. El frontend está desarrollado en **React** y el backend en **Node.js/Express** con base de datos **MySQL**.

## Estructura del repositorio

- **`backend/`**: API REST, lógica de negocio y procesamiento de PDFs.
- **`frontend/`**: SPA para pacientes y personal administrativo.
- **`.github/`**: Archivos de soporte para la documentación del proyecto.

## Funcionalidades principales

- **Carga de resultados (admin):** Subida de PDF con validación del nombre del archivo y extracción de datos del documento.
- **Consulta pública:** Búsqueda por tipo y número de documento.
- **Descarga:** Acceso al PDF almacenado en el servidor.

## Tecnologías

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS**
- **React Router**
- **Axios**

### Backend
- **Node.js / Express**
- **MySQL**
- **Multer** (subida de archivos)
- **pdfjs-dist** (extracción de datos desde PDF)
- **JWT** (autenticación)

## Configuración local

### 1. Backend
```bash
cd backend
npm install
```

Crea el archivo `backend/.env` con tus credenciales (según `backend/README.md`):
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=tu_password
DB_NAME=resultados_electro
JWT_SECRET=tu_secreto_seguro
PORT=5050
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
- Sube los archivos en lotes (máximo 30 PDFs por carga).
- Revisa el resumen de carga para identificar archivos fallidos.

## Rutas principales

- **Frontend**: `/search` (consulta), `/upload` (carga), `/login` (acceso admin)
- **Backend**: `/api/auth/*`, `/api/upload`, `/api/results`, `/api/download/:file_id`

## Notas

- La carpeta `backend/uploads/` no debe versionarse (ya está en `.gitignore`).
- En producción, `JWT_SECRET` debe ser robusto y privado.
