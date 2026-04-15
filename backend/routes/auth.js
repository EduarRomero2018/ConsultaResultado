import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../utils/db.js';

const router = express.Router();

/**
 * Endpoint de Login (POST /api/auth/login)
 * Valida email y contraseña en texto plano y retorna un JWT
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // 1. Validaciones básicas en backend
    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    try {
        // 2. Buscar usuario por email en la base de datos
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            console.error(`[LOGIN ERROR] Intento con email no registrado: ${email}`);
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = rows[0];

        // 3. Comparar contraseña en texto plano
        if (password !== user.password) {
            console.error(`[LOGIN ERROR] Contraseña incorrecta para: ${email}`);
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // 4. Generar Token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '8h' }
        );

        console.log(`[LOGIN SUCCESS] Sesión iniciada para: ${email}`);
        res.json({
            token,
            user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
            message: 'Autenticación exitosa'
        });

    } catch (err) {
        console.error('[LOGIN SYSTEM ERROR]', err);
        res.status(500).json({ error: 'Error interno del servidor al autenticar, Valida la conexión de la base de datos' });
    }
});

export default router;
