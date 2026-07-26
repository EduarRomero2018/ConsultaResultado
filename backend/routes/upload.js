import express from 'express';
import multer from 'multer';
import pool from '../utils/db.js';
import authRequired from '../middleware/authRequired.js';
import { extractPdfData } from '../utils/extractPdfData.js';
import { uploadToS3 } from '../utils/s3.js';

const router = express.Router();

// Configuración de Multer para manejar la carga de archivos en memoria, se limita a 20MB por archivo y se filtran solo archivos PDF
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB por archivo
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

        // Se procesa secuencialmente (no en paralelo) para mantener bajo el pico de memoria del servidor.
        for (const file of req.files) {
            try {
                const { document_type, document_number, date_performed } = await extractPdfData(file.buffer);
                const expectedName = `${document_type}_${document_number}.pdf`;
                if (file.originalname !== expectedName) {
                    throw new Error(`El archivo NO cumple con el nombre esperado, debe llamarse exactamente: ${expectedName}`);
                }

                const [existing] = await pool.query(
                    'SELECT id FROM results WHERE document_type = ? AND document_number = ? AND date_performed = ? LIMIT 1',
                    [document_type, document_number, date_performed]
                );
                if (existing.length > 0) {
                    throw new Error(`Este paciente ya tiene un resultado para la fecha ${date_performed}`);
                }

                // Key determinística (tipo+numero+fecha): coincide con la combinación de duplicados,
                // evita colisiones entre distintos estudios del mismo paciente.
                const s3Key = `results/${document_type}_${document_number}_${date_performed}.pdf`;
                await uploadToS3(file.buffer, s3Key, 'application/pdf');

                const [result] = await pool.query(
                    'INSERT INTO results (document_type, document_number, date_performed, file_name, file_path) VALUES (?, ?, ?, ?, ?)',
                    [document_type, document_number, date_performed, file.originalname, s3Key]
                );

                results.push({
                    file_name: file.originalname,
                    status: 'ok',
                    file_id: result.insertId,
                });
            } catch (err) {
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

// Manejo de errores de Multer (tamaño excedido, tipo de archivo inválido)
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError || err) {
        return res.status(400).json({ error: err.message || 'Error al procesar el archivo' });
    }
    next();
});

export default router;
