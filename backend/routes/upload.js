import express from 'express';
import multer from 'multer'; //Guarda el PDF
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from '../utils/db.js';
import authRequired from '../middleware/authRequired.js';
import { extractPdfData } from '../utils/extractPdfData.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const now = new Date();
        const dir = path.join(__dirname, '..', 'uploads', `${now.getFullYear()}`, `${String(now.getMonth() + 1).padStart(2, '0')}`);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Solo se permiten archivos PDF'));
        }
        cb(null, true);
    }
});

// POST /api/upload
router.post('/', authRequired, upload.single('file'), async (req, res) => {
    try {
        const filePath = req.file.path;
        // Extraer datos del PDF
        const { document_type, document_number, date_performed } = await extractPdfData(filePath);
        // Validar patrón de nombre de archivo, debe ser "TIPO_NUMERO.pdf"
        const expectedName = `${document_type}_${document_number}.pdf`;
        if (req.file.originalname !== expectedName) {
            return res.status(400).json({ error: `El archivo debe llamarse exactamente: ${expectedName}` });
        }
        // Guardar en BD siempre y cuando el cumple con el nombbre del archivo
        const relPath = path.relative(path.join(__dirname, '..'), filePath);
        const [result] = await pool.query(
            'INSERT INTO results (document_type, document_number, date_performed, file_name, file_path) VALUES (?, ?, ?, ?, ?)',
            [document_type, document_number, date_performed, req.file.originalname, relPath]
        );
        //Si el Insert fue exitoso, responde con un success
        res.json({ success: true, file_id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Error al procesar el archivo' });
    }
});

export default router;
