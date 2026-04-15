import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Cargar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
// Configurar CORS para permitir solicitudes desde el frontend
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Importar rutas
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import resultsRoutes from './routes/results.js';
import downloadRoutes from './routes/download.js';

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/download', downloadRoutes);

// Servir archivos estáticos (PDFs)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Eduar, Servidor backend escuchando en puerto ${PORT}`);
});
