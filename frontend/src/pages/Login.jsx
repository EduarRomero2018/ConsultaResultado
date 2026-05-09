import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../utils/api';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Valida que el correo tenga un formato valido antes de enviar la peticion.
    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    // Envía credenciales al backend y guarda el token unificado.
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Validar que no este vacio
        if (!email.trim()) {
            Swal.fire('Error', 'El correo electrónico es obligatorio', 'error');
            return;
        }

        // 2. Validar formato de correo
        if (!validateEmail(email)) {
            Swal.fire('Error', 'Por favor ingresa un correo electrónico válido (ejemplo@correo.com)', 'error');
            return;
        }

        if (!password.trim()) {
            Swal.fire('Error', 'La contraseña es obligatoria', 'error');
            return;
        }

        setLoading(true);
        try {
            // Intentar login con el backend
            const { data } = await api.post('/api/auth/login', { email, password });

            // Guardar token en sessionStorage para expirar al cerrar la pestaña.
            sessionStorage.setItem('token', data.token);

            Swal.fire('Bienvenido', 'Inicio de sesión exitoso', 'success');
            navigate('/upload');
        } catch (err) {
            Swal.fire('Error', err.response?.data?.error || 'Credenciales incorrectas', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded shadow-md max-w-sm mx-auto mt-20">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Acceso Administrativo</h2>
            <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                    <input
                        type="email"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="admin@ejemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                    <input
                        type="password"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Validando...' : 'Iniciar Sesión'}
                </button>
            </form>
        </div>
    );
}

export default Login;
