import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../utils/api';
import LoginView from '../components/login/LoginView';

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

            // Notifica el inicio de sesion exitoso.
            Swal.fire({
                icon: 'success',
                title: 'Bienvenido',
                text: 'Inicio de sesión exitoso',
                timer: 2000,
                timerProgressBar: true,
                // showConfirmButton: true,
                // confirmButtonText: 'OK',
            });

            navigate('/upload');
        } catch (err) {
            Swal.fire('Error', err.response?.data?.error || 'Credenciales incorrectas', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LoginView
            email={email}
            password={password}
            loading={loading}
            onEmailChange={(e) => setEmail(e.target.value)}
            onPasswordChange={(e) => setPassword(e.target.value)}
            onSubmit={handleSubmit}
        />
    );
}

export default Login;
