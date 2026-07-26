# CLAUDE.md

Este archivo proporciona orientación a Claude Code (claude.ai/code) al trabajar con código en este repositorio.

## Descripción General del Proyecto

**ConsultaResultado** es un sistema de gestión de resultados médicos para Caminos IPS. Permite:
- **Usuarios administradores** cargar PDFs médicos (electrocardiogramas y estudios similares) con validación estricta
- **Pacientes** buscar y descargar sus resultados por tipo y número de documento
- **Extracción de contenido** de documentos PDF cargados para validación de metadatos

Esta es una aplicación full-stack dividida en directorios frontend (React/Vite) y backend (Node.js/Express).

## Stack Tecnológico

### Frontend
- **React 18** + **Vite** (herramienta de construcción)
- **Tailwind CSS** para estilos
- **React Router v6** para navegación
- **Axios** para comunicación con API
- **SweetAlert2** para notificaciones
- **React Icons** para iconos de UI

### Backend
- **Node.js** con **Express.js** (módulos ES)
- Base de datos **MySQL** con driver mysql2
- **JWT** (jsonwebtoken) para autenticación
- **Multer** para manejo de carga de archivos (memoria, sin escribir a disco)
- **pdfjs-dist** para extracción de texto/metadatos de PDFs
- **AWS SDK v3** (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`) para almacenamiento de PDFs en S3
- **dotenv** para configuración de entorno

## Estructura de Directorios

```
root/
├── frontend/                 # SPA React
│   ├── src/
│   │   ├── pages/           # Componentes de página: Login, Upload, Search
│   │   ├── components/      # Componentes reutilizables (Navbar, Footer, ResultsTable)
│   │   ├── utils/           # Utilidades compartidas
│   │   └── App.jsx          # Configuración de rutas
│   └── index.html
├── backend/                  # Servidor API Express
│   ├── routes/              # Endpoints de API (auth, upload, results, download)
│   ├── middleware/          # Middleware de autenticación JWT
│   ├── utils/               # Funciones auxiliares (db.js, extractPdfData.js, s3.js)
│   ├── ecosystem.config.cjs # Configuración de PM2 para producción
│   ├── server.js            # Configuración de aplicación Express
│   ├── database.sql         # Inicialización de esquema
│   └── .env                 # Variables de entorno (ignorado por git)
├── deploy/                   # Configuración de referencia de Nginx para producción
├── .github/workflows/        # Pipeline de despliegue automático (CI/CD)
└── README.md                 # Documentación del proyecto
```

## Tareas Comunes de Desarrollo

### Configuración e Instalación
```bash
# Configuración del frontend
cd frontend
npm install
npm run dev                  # Inicia servidor Vite en puerto 5173

# Configuración del backend
cd backend
npm install
cp .env.example .env        # Configura base de datos y JWT_SECRET
npm run dev                 # Inicia servidor Express en puerto 5050 (nodemon vigila cambios)

# Configuración de base de datos
mysql -u root -p < backend/database.sql
```

### Ejecutar la Aplicación
- **Solo backend**: `cd backend && npm run dev` (API en http://localhost:5050)
- **Solo frontend**: `cd frontend && npm run dev` (UI en http://localhost:5173)
- **Ambos**: Ejecuta cada uno en terminales separadas; frontend hace proxy de solicitudes a API backend

### Construcción
```bash
cd frontend
npm run build               # Produce carpeta dist/ optimizada
npm run preview            # Vista previa de construcción de producción localmente
```

### Configuración de Entorno
Backend requiere `backend/.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=<contraseña>
DB_NAME=resultados_electro
JWT_SECRET=<clave-secreta-robusta>
PORT=5050
NODE_ENV=development

# AWS S3
AWS_REGION=us-east-1
AWS_S3_BUCKET=<nombre-del-bucket>
# Solo si no hay IAM role asociado a la instancia:
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
```

La URL de API del frontend está codificada en `http://localhost:5050` en instancias de axios.

## Arquitectura de API

Todos los endpoints tienen prefijo `/api/`:

| Endpoint | Método | Autenticación | Propósito |
|----------|--------|---------------|----------|
| `/auth/login` | POST | No | Autenticación de administrador (devuelve JWT) |
| `/upload` | POST | JWT | Cargar PDF con validación |
| `/results` | GET | No | Buscar resultados por tipo y número de documento |
| `/download/:file_id` | GET | No | Genera y devuelve una URL prefirmada de S3 (`{ url, file_name }`), no el binario |

**Autenticación JWT**: Almacena token en `localStorage` (clave: `authToken`). Pasa encabezado `Authorization: Bearer <token>` para rutas protegidas.

## Validación de Carga de PDF

El sistema de carga aplica reglas estrictas:
- **Formato de nombre**: `TIPO_NUMERO.pdf` (ej: `CC_123456789.pdf`, `TI_987654321.pdf`)
- **Contenido PDF requerido**: Tipo, número y fecha del examen extraídos del documento
- **Verificación de duplicados**: No se permiten duplicados para combinación (tipo + número + fecha)
- **Límite de lote**: Máx 30 PDFs por carga, 20MB por archivo (`limits.fileSize` en Multer)

Backend extrae texto PDF usando pdfjs-dist (desde el buffer en memoria, sin tocar disco) y valida contra nombre de archivo; rechaza inconsistencias. Solo si la validación y la verificación de duplicados pasan, el archivo se sube a S3.

## Esquema de Base de Datos

Tablas clave (ver `backend/database.sql` para esquema completo):
- **users**: Credenciales de administrador (actualmente comparadas en texto plano, no hasheadas pese al comentario del script — ver `routes/auth.js`)
- **results**: Metadatos extraídos (tipo, número, fecha, nombre de archivo, key de S3 en la columna `file_path`)

Tipos de documento: CC, CE, TI, RC, PAS, PEP, PPT (ENUM en la tabla `results`).

## Rutas del Frontend

- `/login` — Formulario de login de administrador
- `/upload` — Interfaz de carga de archivos (requiere JWT)
- `/search` — Búsqueda pública por tipo y número de documento
- `/` — Redirige a `/search`

Navbar muestra login/logout según presencia de token en localStorage.

## Detalles de Implementación Clave

### Flujo de Autenticación
1. Administrador envía credenciales en `/login`
2. Backend valida contra tabla `users`, devuelve JWT
3. Token almacenado en localStorage, adjunto a solicitudes de carga
4. Middleware `authRequired` en backend valida token en endpoint de carga

### Procesamiento de PDF
- Multer recibe el archivo en memoria (`memoryStorage`, sin escribir a disco) → backend extrae texto con pdfjs-dist desde el buffer
- Validación: tipo/número extraído se compara contra nombre de archivo; se verifica duplicado en BD
- Almacenamiento: solo si pasa validación y no es duplicado, se sube a S3 con key `results/{tipo}_{numero}_{fecha}.pdf` (determinística, evita colisiones entre distintos estudios del mismo paciente)
- Recuperación: el endpoint de descarga genera una URL prefirmada de S3 (expiración corta) en vez de transmitir el binario

### Gestión de Estado del Frontend
Sin librería de estado global (Redux, Zustand). Cada componente de página gestiona estado local con useState/useEffect; interceptores de Axios manejan lógica HTTP común.

## Despliegue

Cada push a `main` dispara `.github/workflows/deploy.yml`: construye el frontend en el runner de GitHub, lo copia por SCP al servidor, y por SSH hace `git pull` + `npm ci --omit=dev` + `pm2 restart consulta-resultado-api` en el backend. Requiere los secrets `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY` en el repo. En producción, Nginx sirve el frontend estático y hace proxy reverso de `/api/*` al backend (mismo origen, ver `deploy/nginx.conf.example`) — por eso `VITE_API_URL` se deja vacío en el build de producción (rutas relativas).

## Notas Importantes

- JWT_SECRET y credenciales AWS deben ser robustas y privadas en producción (nunca comprometidas en git; `.env` está ignorado)
- CORS del backend está configurado para aceptar solo `http://localhost:5173` (dev); en producción no aplica porque Nginx sirve frontend y backend bajo el mismo origen
- Extracción de PDF depende de capa de texto pdfjs-dist; imágenes escaneadas o PDFs corruptos pueden fallar
- `client_max_body_size` en Nginx debe cubrir un LOTE completo (hasta 30 archivos), no solo un PDF individual — ver el comentario en `deploy/nginx.conf.example`
- Sin tests actualmente; archivos de test irían en `frontend/__tests__` y `backend/__tests__`

## Consejos de Depuración

- ¿Backend no responde? Verifica que `.env` existe y `npm run dev` está ejecutándose (local) o `pm2 status` (producción)
- ¿Frontend no puede hacer login? Revisa consola del navegador para errores CORS; verifica puerto backend es 5050
- ¿Falla carga de PDF? Verifica que nombre de archivo coincida con `TIPO_NUMERO.pdf` y PDF contiene campos requeridos
- ¿Carga falla sin ningún log en el backend? Revisa `client_max_body_size` en Nginx — un request rechazado ahí nunca llega a Express
- ¿Errores de conexión a base de datos? Verifica que MySQL está ejecutándose y credenciales en `.env` son correctas
