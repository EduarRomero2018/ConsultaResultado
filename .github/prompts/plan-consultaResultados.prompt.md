# Plan: Herramienta de Consulta de Resultados de Electro - IPS

## Descripción General
Crear una aplicación de dos partes:
1. **Panel Administrativo** (protegido con autenticación): Carga de PDFs de ECG indexados por documento de identidad y fecha
2. **Página Pública** (sin autenticación): Consulta y descarga de resultados por número de documento

---

## Decisiones Confirmadas

- **Autenticación**: Solo para cargar PDFs; consulta pública sin login
- **Almacenamiento PDFs**: Sistema de archivos del servidor (`/uploads`)
- **Extracción de datos**: Automática del PDF mediante pdfjs-dist
- **Patrón de archivo**: `TIPO_DOCUMENTO_NUMERO_DOCUMENTO.pdf` (ej: `CC_1234567890.pdf`)
- **Tipos de documento**: CC, Pasaporte, y otros múltiples tipos

---

## Stack Técnico Confirmado

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **BD**: MySQL
- **Autenticación**: JWT (JsonWebToken)
- **Carga de archivos**: Multer
- **Extracción PDF**: pdfjs-dist
- **CORS**: cors middleware
- **Variables de entorno**: dotenv

### Frontend
- **Framework**: React con JSX
- **Bundler**: Vite
- **Estilos**: Tailwind CSS
- **HTTP Client**: Axios
- **Manejo de errores**: SweetAlert2
- **Routing**: React Router v6
- **Iconos**: (feather-icons o FontAwesome)

---

## Fases de Implementación

### Fase 1: Estructura del Proyecto y Setup
1. Crear estructura de carpetas:
   ```
   ConsultaResultado/
   ├── backend/
   ├── frontend/
   └── README.md
   ```

2. **Backend - Inicializar**:
   - `npm init -y`
   - Instalar dependencias: `express`, `dotenv`, `mysql2`, `pdfjs-dist`, `jsonwebtoken`, `multer`, `cors`, `body-parser`
   - Crear archivos base: `.env`, `server.js`, estructura de carpetas (`routes`, `middleware`, `utils`, `uploads`)

3. **Frontend - Inicializar**:
   - `npm create vite@latest . -- --template react`
   - Instalar: `tailwindcss`, `axios`, `sweetalert2`, `react-router-dom`, `feather-icons`
   - Configurar Tailwind
   - Estructura de carpetas: `src/pages`, `src/components`, `src/utils`

---

### Fase 2: Base de Datos

**Script SQL**:
```sql
CREATE DATABASE IF NOT EXISTS electro_ips;
USE electro_ips;

CREATE TABLE results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  document_type VARCHAR(50) NOT NULL,
  document_number VARCHAR(50) NOT NULL,
  date_performed DATE NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_document (document_type, document_number)
);
```

**Configuración Backend** (`backend/.env`):
```
DB_HOST=localhost
DB_USER=root
DB_PASS=tu_password
DB_NAME=electro_ips
JWT_SECRET=tu_jwt_secret_super_seguro_2026
PORT=5000
NODE_ENV=development
UPLOAD_DIR=./uploads
```

---

### Fase 3: Backend - Endpoints

#### **3A. Autenticación**
- **Endpoint**: `POST /api/auth/login`
- **Entrada**: `{ username, password }`
- **Salida**: `{ token, message }`
- **Lógica**: JWT simple con credenciales mock (`admin/admin`)
- **Archivos**: `backend/routes/auth.js`, `backend/middleware/authRequired.js`

#### **3B. Carga de PDFs** (requiere autenticación)
- **Endpoint**: `POST /api/upload`
- **Headers**: `Authorization: Bearer {token}`
- **Entrada**: Multipart form-data con archivo PDF
- **Validaciones**:
  - Usuario autenticado
  - Archivo es PDF
  - Patrón nombre válido: `TIPO_DOC_NUMERO.pdf`
  - Número documento coherente
- **Lógica**:
  - Extraer automáticamente: `document_type`, `document_number`, `date_performed` del PDF
  - Guardar archivo: `/uploads/YYYY/MM/TIPO_DOC_NUMERO.pdf`
  - Registrar en tabla `results`
- **Salida**: `{ success, message, file_id }` o `{ success: false, error }`
- **Archivos**: `backend/routes/upload.js`, `backend/utils/extractPdfData.js`

#### **3C. Búsqueda de Resultados** (público, sin autenticación)
- **Endpoint**: `GET /api/results?document_type=CC&document_number=1234567890`
- **Validaciones**: `document_type` y `document_number` no vacíos
- **Salida**:
  ```json
  [
    {
      "id": 1,
      "file_name": "CC_1234567890.pdf",
      "date_performed": "2026-03-15",
      "file_id": "abc123"
    }
  ]
  ```
- **Archivos**: `backend/routes/results.js`

#### **3D. Descarga de PDF** (público)
- **Endpoint**: `GET /api/download/:file_id`
- **Validaciones**: `file_id` existe en BD
- **Lógica**: Servir archivo PDF con header `Content-Disposition: attachment`
- **Archivos**: `backend/routes/download.js`

---

### Fase 4: Frontend - Componentes

#### **4A. Ruteo y Layout Base**
- **Archivo**: `frontend/src/App.jsx`
- **Rutas**:
  - `/` → Redirige a `/search`
  - `/upload` → Página de carga (protegida con login local)
  - `/search` → Página de consulta (pública)
- **Layout común**: Header, Footer, Container

#### **4B. Página de Carga** (`frontend/src/pages/Upload.jsx`)
Componente con dos secciones:

**Sección 1 - Login**:
- Input: username
- Input: password (type="password")
- Botón: "Iniciar Sesión"
- Almacenar token en sessionStorage
- SweetAlert2 para feedback

**Sección 2 - Upload** (visible después de login):
- Drag & drop zone + file input
- Validación en frontend: formato PDF + patrón nombre
- Progreso de carga
- SweetAlert2 feedback (éxito/error)
- Botón limpiar/nueva carga
- Botón cerrar sesión

#### **4C. Página de Búsqueda** (`frontend/src/pages/Search.jsx`)
- **Form**:
  - Dropdown: Seleccionar tipo de documento (CC, Pasaporte, etc.)
  - Input: Número de documento
  - Botón: Buscar
- **Resultados**:
  - Mostrar `<ResultsTable>` si hay datos
  - Mostrar "No hay resultados" si la búsqueda retorna array vacío
  - SweetAlert2 para errores (servidor, validación)
- **Estado**: Loading spinner mientras se invoca API

#### **4D. Componente ResultsTable** (`frontend/src/components/ResultsTable.jsx`)
- **Props**: `results` (array de objetos)
- **Estructura**:
  - Tabla HTML con thead/tbody
  - Columnas: Archivo | Fecha Realización | Descargar
  - Icono descarga (feather-icons o SVG inline)
  - Al hacer click en icono: GET `/api/download/:file_id`
  - Descargar PDF automáticamente
  - SweetAlert2 si hay error en descarga

#### **4E. Estilos Tailwind** (`frontend/src/index.css`, `frontend/tailwind.config.js`)
- Tema personalizado (colores IPS, si aplica)
- Responsive table para mobile
- Form styling consistente
- Botones, inputs, modales

#### **4F. Utils**
- **`frontend/src/utils/api.js`**: Cliente Axios pre-configurado
  - Base URL del backend (desde `.env`)
  - Interceptores para Authorization header con JWT
  - Error handling centralizado
- **`frontend/src/utils/constants.js`**: Tipos de documento, URLs, constantes
- **`frontend/.env`**: `VITE_API_URL=http://localhost:5000`

---

### Fase 5: Validación y Testing

**Backend**:
1. Verificar servidor Express escuchando en puerto 5000
2. Crear índice `/uploads` con permisos de escritura
3. Testing con Postman:
   - `POST /api/auth/login` → obtener token
   - `POST /api/upload` con PDF válido → verificar BD y filesystem
   - `GET /api/results?document_type=CC&document_number=1234567890` → retorna resultados
   - `GET /api/download/:file_id` → descarga PDF

**Frontend**:
1. Verificar Vite dev server en puerto 5173
2. Navegar a `http://localhost:5173`
3. Testing manual:
   - `/search` → formulario carga, búsqueda funciona sin autenticación
   - `/upload` → login requerido, upload funciona después de autenticarse
   - Descargas de PDF desde tabla
   - SweetAlert2 mostrando errores/éxitos

**Base de Datos**:
1. Conectar a MySQL y verificar tabla `results` creada
2. Verificar registros se insertan después de cada upload
3. Verificar índices creados

---

## Archivos Clave a Crear

### Backend Structure
```
backend/
├── server.js                    # Configuración principal Express
├── .env                         # Variables de entorno
├── package.json
├── routes/
│   ├── auth.js                  # POST /api/auth/login
│   ├── upload.js                # POST /api/upload
│   ├── results.js               # GET /api/results
│   └── download.js              # GET /api/download/:file_id
├── middleware/
│   └── authRequired.js          # Validar JWT
├── utils/
│   ├── db.js                    # Configuración pool MySQL
│   └── extractPdfData.js        # Extraer datos del PDF
└── uploads/                     # Carpeta almacenamiento (crear)
    └── .gitkeep
```

### Frontend Structure
```
frontend/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env
├── package.json
├── public/
├── src/
│   ├── App.jsx                  # React Router
│   ├── index.css                # Tailwind imports
│   ├── main.jsx                 # Entry point
│   ├── pages/
│   │   ├── Upload.jsx           # Panel upload (protegido)
│   │   └── Search.jsx           # Consulta pública
│   ├── components/
│   │   └── ResultsTable.jsx     # Tabla resultados
│   └── utils/
│       ├── api.js               # Cliente Axios
│       └── constants.js         # Constantes
```

---

## Checklist de Verificación

- [ ] Backend: Express escuchando en puerto 5000
- [ ] Frontend: Vite dev server en puerto 5173
- [ ] Base de datos: Tabla `results` creada y accesible
- [ ] Upload: Cargar PDF, extraer documento/fecha automáticamente
- [ ] Upload: Archivo guardado en `/uploads` con patrón correcto
- [ ] Upload: Registro insertado en BD
- [ ] Search: Búsqueda sin autenticación
- [ ] Search: Resultados mostrados en tabla
- [ ] Download: Descargar PDF desde tabla
- [ ] Errores: SweetAlert2 mostrando mensajes claros
- [ ] CORS: Backend permitiendo requests del frontend
- [ ] JWT: Token válido requerido para upload, token inválido rechazado

---

## Consideraciones Futuras

1. **Autenticación mejorada**: Pasar de credenciales hardcoded a BD de usuarios
2. **Paginación**: Si hay muchos resultados por documento
3. **Búsqueda avanzada**: Por rango de fechas, etc.
4. **Admin panel**: Para gestionar archivos, usuarios, auditoría
5. **Email**: Notificar al paciente cuando se suben sus resultados
6. **Backup automático**: De PDFs y BD
7. **Cifrado**: De PDFs almacenados
8. **Logs de auditoría**: Quién descargó qué y cuándo
