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
- **Multer** para manejo de carga de archivos
- **pdfjs-dist** para extracción de texto/metadatos de PDFs
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
│   ├── index.html
│   └── vite.config.js
├── backend/                  # Servidor API Express
│   ├── routes/              # Endpoints de API (auth, upload, results, download)
│   ├── middleware/          # Middleware de autenticación JWT
│   ├── utils/               # Funciones auxiliares
│   ├── uploads/             # Almacenamiento de PDFs cargados (ignorado por git)
│   ├── server.js            # Configuración de aplicación Express
│   ├── database.sql         # Inicialización de esquema
│   └── .env                 # Variables de entorno (ignorado por git)
└── README.md                # Documentación del proyecto
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
```

La URL de API del frontend está codificada en `http://localhost:5050` en instancias de axios.

## Arquitectura de API

Todos los endpoints tienen prefijo `/api/`:

| Endpoint | Método | Autenticación | Propósito |
|----------|--------|---------------|----------|
| `/auth/login` | POST | No | Autenticación de administrador (devuelve JWT) |
| `/upload` | POST | JWT | Cargar PDF con validación |
| `/results` | GET | No | Buscar resultados por tipo y número de documento |
| `/download/:file_id` | GET | No | Descargar PDF por ID de archivo |

**Autenticación JWT**: Almacena token en `localStorage` (clave: `authToken`). Pasa encabezado `Authorization: Bearer <token>` para rutas protegidas.

## Validación de Carga de PDF

El sistema de carga aplica reglas estrictas:
- **Formato de nombre**: `TIPO_NUMERO.pdf` (ej: `CC_123456789.pdf`, `TI_987654321.pdf`)
- **Contenido PDF requerido**: Tipo, número y fecha del examen extraídos del documento
- **Verificación de duplicados**: No se permiten duplicados para combinación (tipo + número + fecha)
- **Límite de lote**: Máx ~30 PDFs por carga para rendimiento de UI

Backend extrae texto PDF usando pdfjs-dist y valida contra nombre de archivo; rechaza inconsistencias.

## Esquema de Base de Datos

Tablas clave (ver `backend/database.sql` para esquema completo):
- **users**: Credenciales de administrador con hash de contraseña
- **results**: Metadatos extraídos (tipo, número, fecha, ID de archivo)
- **uploads**: Registro de auditoría de operaciones de carga

Tipos de documento: CC (Cédula), TI (Tarjeta Identidad), PA (Pasaporte), CE (Cédula Extranjería), etc.

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
- Frontend: Multer recibe archivo → backend extrae texto con pdfjs-dist
- Validación: Tipo/número extraído se compara contra nombre de archivo
- Almacenamiento: Cargas exitosas se guardan en `backend/uploads/` con nombres basados en UUID
- Recuperación: Endpoint de descarga transmite archivo desde disco

### Gestión de Estado del Frontend
Sin librería de estado global (Redux, Zustand). Cada componente de página gestiona estado local con useState/useEffect; interceptores de Axios manejan lógica HTTP común.

## Notas Importantes

- Directorio `backend/uploads/` está ignorado por git; no hagas commit de archivos cargados
- JWT_SECRET debe cambiar en producción (actualmente en README como ejemplo)
- CORS del frontend está configurado para aceptar solo `http://localhost:5173`; actualiza `server.js` para dominios de producción
- Extracción de PDF depende de capa de texto pdfjs-dist; imágenes escaneadas o PDFs corruptos pueden fallar
- Sin tests actualmente; archivos de test irían en `frontend/__tests__` y `backend/__tests__`

## Consejos de Depuración

- ¿Backend no responde? Verifica que `.env` existe y `npm run dev` está ejecutándose
- ¿Frontend no puede hacer login? Revisa consola del navegador para errores CORS; verifica puerto backend es 5050
- ¿Falla carga de PDF? Verifica que nombre de archivo coincida con `TIPO_NUMERO.pdf` y PDF contiene campos requeridos
- ¿Errores de conexión a base de datos? Verifica que MySQL está ejecutándose y credenciales en `.env` son correctas
