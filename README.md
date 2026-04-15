# Proyecto: Consulta de Resultados de Electro

Este es un sistema web (Cliente-Servidor) diseñado para permitir la carga y consulta de resultados médicos (específicamente electrocardiogramas o estudios similares en formato PDF). Está compuesto por un **Frontend** desarrollado en React y un **Backend** desarrollado con Node.js y Express apoyado por una base de datos MySQL.

## Arquitectura del Proyecto

El repositorio está dividido en tres carpetas principales:

- **`backend/`**: Contiene todo el código del servidor, la API RESTful y la lógica de negocio.
- **`frontend/`**: Contiene la interfaz de usuario interactiva (SPA) orientada tanto a administradores como a pacientes.
- **`.github/`**: Puede contener configuraciones para acciones de GitHub (CI/CD) si aplica en el futuro.

## Funcionalidades Principales

1. **Autenticación (Admin):** Permite a un administrador loguearse en el sistema utilizando credenciales JWT.
2. **Carga de Resultados:** Interfaz protegida para cargar documentos PDF asociados a un paciente (mediante el tipo y número de documento).
3. **Consulta Libre de Resultados:** Una página pública (`Search.jsx`) donde el usuario final puede buscar sus resultados introduciendo su tipo y número de documento.
4. **Descarga Segura:** Endpoint para que los usuarios puedan previsualizar y descargar el documento PDF original que fue cargado por la IPS o médico.

## Tecnologías Utilizadas

### Frontend (User Interface)
- **React (v18.2):** Biblioteca principal para construir la interfaz.
- **Vite:** Herramienta de compilación rápida (Build tool) y servidor de desarrollo.
- **Tailwind CSS:** Framework utilitario para los estilos responsivos e interfaz moderna.
- **React Router Dom:** Manejo de rutas internas (`Search`, `Upload`, etc).
- **Axios:** Para el consumo de endpoints del backend.
- **SweetAlert2:** Para notificaciones visuales (alertas) hermosas e interactivas.

### Backend (API REST)
- **Node.js & Express:** Entorno de ejecución y framework minimalista para las rutas del servidor.
- **MySQL:** Base de datos relacional para almacenar las referencias y metadatos de los resultados médicos.
- **JSON Web Token (JWT):** Para manejar la protección de las rutas (como la vista de uploader).
- **Multer / body-parser:** Para poder receptar los archivos en formato multipart y guardarlos localmente en `uploads/`.

## Requisitos Previos

- Node.js (v16.x o superior recomendado).
- npm o yarn.
- Base de datos MySQL funcionando en tu máquina o red local.

## Configuración y Despliegue Local

### 1. Backend
En una terminal, dirígete a la carpeta `backend/` y realiza los siguientes pasos:
```bash
cd backend
npm install
```
Asegúrate de revisar/crear el archivo `.env` configurando tus accesos de base de datos MySQL y el puerto:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=electro_ips
JWT_SECRET=tu_secreto_seguro
PORT=5000
```
Crea la base de datos `electro_ips` y la tabla en MySQL de acuerdo con el `backend/README.md`. Luego, lanza el servidor local en desarrollo:
```bash
npm run dev
```

### 2. Frontend
En otra terminal, ve a la carpeta `frontend/`:
```bash
cd frontend
npm install
```
Levanta el servidor con Vite (por defecto corre en `http://localhost:5173`):
```bash
npm run dev
```

## Estructura de Rutas
* **Frontend:** `/` (Búsqueda de resultados), `/upload` (Carga de resultados protegida).
* **Backend:** `/api/auth/*` (Manejo de acceso admin), `/api/upload` (subida de archivos), `/api/results` (búsqueda de pacientes), `/api/download/:file_id` (Stream y descarga de PDF).

## Notas Adicionales
- Asegurate de mantener la carpeta `backend/uploads/` libre de seguimiento de versionado en tu `.gitignore` principal.
- Por seguridad y en entornos de producción, el secreto en `JWT_SECRET` debe ser aleatorio y robusto.
