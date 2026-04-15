import express from 'express';
import pool from '../utils/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET /api/download/:file_id
router.get('/:file_id', async (req, res) => {
    const { file_id } = req.params;
    try {
        const [rows] = await pool.query('SELECT file_name, file_path FROM results WHERE id = ?', [file_id]);
        if (!rows.length) return res.status(404).json({ error: 'Archivo no encontrado' });
        const { file_name, file_path } = rows[0];
        const absolutePath = path.join(__dirname, '..', file_path);
        res.download(absolutePath, file_name);
    } catch (err) {
        res.status(500).json({ error: 'Error al descargar archivo' });
    }
});

export default router;
