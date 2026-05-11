import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../utils/api';
import { FaEnvelope, FaLock } from 'react-icons/fa';

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

            // Swal.fire('Bienvenido',
            //     'Inicio de sesión exitoso',
            //     'success');

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
        <main className="flex flex-col items-center justify-start px-4 py-8">
            <div className="flex max-w-6xl min-h-[64vh] overflow-hidden rounded-3xl shadow-2xl bg-white/0">
                <section className="flex min-h-full w-full items-center justify-center bg-institucion-primary p-6 md:w-[48%] md:p-8 lg:p-10 relative">
                    <div className="w-full max-w-lg rounded-2xl bg-white/10 backdrop-blur-md p-8 shadow-xl md:p-12">
                        <div className="mb-10">
                            <h2 className="mb-2 text-3xl font-bold text-white font-sans">
                                Acceso Administrativo
                            </h2>
                            <p className="text-white/80 font-sans">
                                Ingrese sus credenciales para cargar resultados.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-white font-sans">
                                    Correo electrónico
                                </label>
                                <div className="relative group">
                                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-lg" />
                                    <input
                                        type="email"
                                        className="w-full rounded-lg border border-white/20 bg-white/10 px-10 py-3 text-white outline-none transition-all duration-300 placeholder:text-white/50 focus:bg-white/20 focus:ring-2 focus:ring-[#4b3fa7]"
                                        placeholder="admin@ejemplo.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-white font-sans">
                                    Contraseña
                                </label>
                                <div className="relative group">
                                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-lg" />
                                    <input
                                        type="password"
                                        className="w-full rounded-lg border border-white/20 bg-white/10 px-10 py-3 text-white outline-none transition-all duration-300 placeholder:text-white/50 focus:bg-white/20 focus:ring-2 focus:ring-[#4b3fa7]"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full rounded-lg bg-white text-[#2d2651] py-4 text-base font-bold uppercase tracking-widest shadow-lg transition-all hover:bg-gray-100 active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Validando...' : 'Iniciar Sesión'}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

                <section className="hidden md:flex w-[52%] bg-white relative flex-col items-center justify-center text-[#2d2651] min-h-full overflow-hidden">

                    <div className="relative z-10 px-10">
                        <img
                            src="/images/Cargue.png"
                            alt="Cargue de archivos"
                            className="h-auto max-w-full object-contain"
                        />
                    </div>
                </section>
            </div>
        </main>
    );
}

export default Login;