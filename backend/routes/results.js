import express from 'express';
import pool from '../utils/db.js';

const router = express.Router();

// GET /api/results?document_type=CC&document_number=1234567890
router.get('/', async (req, res) => {
    const { document_type, document_number } = req.query;
    if (!document_type || !document_number) {
        return res.status(400).json({ error: 'Tipo y número de documento requeridos' });
    }
    try {
        const [rows] = await pool.query(
            'SELECT id, file_name, date_performed, file_path FROM results WHERE document_type = ? AND document_number = ? ORDER BY date_performed DESC',
            [document_type, document_number]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al consultar resultados' });
    }
});

export default router;
