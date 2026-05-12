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
router.post('/', authRequired, upload.array('files', 30), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No se recibieron archivos' });
        }

        const results = [];

        for (const file of req.files) {
            const filePath = file.path;
            try {

                //Valida que el PDF tenga el mismo nombre que el formato esperado, si no es así se borra el archivo y se devuelve un error específico para ese archivo.
                const { document_type, document_number, date_performed } = await extractPdfData(filePath);
                const expectedName = `${document_type}_${document_number}.pdf`;
                if (file.originalname !== expectedName) {
                    throw new Error(`El archivo NO cumple con el nombre esperado, debe llamarse exactamente: ${expectedName}`);
                }
                // Valida que no exista un resultado previo para el mismo paciente y fecha de realizacion, si existe se borra el archivo y se devuelve un error específico para ese archivo.
                const [existing] = await pool.query(
                    'SELECT id FROM results WHERE document_type = ? AND document_number = ? AND date_performed = ? LIMIT 1',
                    [document_type, document_number, date_performed]
                );
                //Si la busqueda es mayor a 0, significa que ya existe un resultado para ese paciente y fecha, por lo tanto se lanza un error.
                if (existing.length > 0) {
                    throw new Error(`Este paciente ya tiene un resultado para la fecha ${date_performed}`);
                }

                const relPath = path.relative(path.join(__dirname, '..'), filePath);
                const [result] = await pool.query(
                    'INSERT INTO results (document_type, document_number, date_performed, file_name, file_path) VALUES (?, ?, ?, ?, ?)',
                    [document_type, document_number, date_performed, file.originalname, relPath]
                );

                results.push({
                    file_name: file.originalname,
                    status: 'ok',
                    file_id: result.insertId,
                });
            } catch (err) {
                try {
                    fs.unlinkSync(filePath);
                } catch (unlinkError) {
                    // Si no se puede borrar el archivo, se continua sin bloquear la respuesta.
                }

                const message = err.code === 'ER_DUP_ENTRY'
                    ? 'Este paciente ya tiene un resultado para esa fecha de realizacion'
                    : err.message || 'Error al procesar el archivo';

                results.push({
                    file_name: file.originalname,
                    status: 'error',
                    message,
                });
            }
        }

        const summary = results.reduce(
            (acc, item) => {
                acc.total += 1;
                if (item.status === 'ok') {
                    acc.success += 1;
                } else {
                    acc.failed += 1;
                }
                return acc;
            },
            { total: 0, success: 0, failed: 0 }
        );

        res.json({ results, summary });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Error al procesar los archivos' });
    }
});

export default router;
