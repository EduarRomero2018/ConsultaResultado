import React, { useState } from 'react';
import api from '../utils/api';
import Swal from 'sweetalert2';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { MdUploadFile, MdVerifiedUser } from 'react-icons/md';
import { RiLockPasswordLine } from 'react-icons/ri';

function Upload() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState(sessionStorage.getItem('token') || '');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/api/auth/login', { email, password });
            setToken(data.token);
            sessionStorage.setItem('token', data.token);
            Swal.fire('Éxito', 'Sesión iniciada', 'success');
        } catch (err) {
            Swal.fire('Error', err.response?.data?.error || 'Error de autenticación', 'error');
        }
    };

    const handleLogout = () => {
        setToken('');
        sessionStorage.removeItem('token');
        setFile(null);
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            Swal.fire('Error', 'Selecciona un archivo PDF', 'error');
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const { data } = await api.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            Swal.fire('Éxito', `Archivo subido correctamente (ID: ${data.file_id})`, 'success');
            setFile(null);
        } catch (err) {
            Swal.fire('Error', err.response?.data?.error || 'Error al subir archivo', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <div className="flex w-full max-w-7xl min-h-[50vh] rounded-3xl shadow-2xl overflow-hidden bg-white/0">
                    {/* Lado izquierdo: branding e ilustración */}
                    <section className="hidden md:flex w-[52%] bg-[#2d2651] relative flex-col justify-center px-20 text-white min-h-full">
                        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#4b3fa7] opacity-60 blur-3xl" />
                        <div className="absolute -bottom-48 -right-24 w-[32rem] h-[32rem] rounded-full bg-[#1a1533] opacity-30 blur-3xl" />
                        <div className="relative z-10 max-w-lg">
                            <div className="mb-8 inline-flex items-center justify-center p-4 rounded-xl bg-white/10 backdrop-blur-md">
                                <MdUploadFile className="text-5xl text-white" />
                            </div>
                            <h1 className="text-5xl font-bold leading-tight mb-6 font-sans">
                                Portal de Carga de Resultados
                            </h1>
                            <p className="text-base text-white/80 leading-relaxed max-w-md font-sans">
                                Suba los resultados en formato PDF, posterior al cargue, los pacientes podrán acceder a sus resultados de manera segura.
                            </p>
                            <div className="mt-16 grid grid-cols-2 gap-8 opacity-80">
                                <div className="flex items-center gap-2">
                                    <MdVerifiedUser className="text-lg text-white" />
                                    <span className="text-xs font-medium">Caminos IPS</span>
                                </div>
                                {/* <div className="flex items-center gap-2">
                                    <RiLockPasswordLine className="text-lg text-white" />
                                    <span className="text-xs font-medium">Cifrado AES-256</span>
                                </div> */}
                            </div>
                        </div>
                    </section>
                    {/* Lado derecho: formulario de login */}
                    <section className="w-full md:w-[48%] bg-[#f7f5fa] flex items-center justify-center p-12 md:p-20 relative min-h-full">
                        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-12">
                            <div className="mb-10">
                                <h2 className="text-3xl font-bold text-[#2d2651] mb-2 font-sans">
                                    Bienvenido
                                </h2>
                                <p className="text-gray-500 font-sans">
                                    Acceda a su cuenta para cargar resultados.
                                </p>
                            </div>
                            <form className="space-y-6" onSubmit={handleLogin}>
                                <div className="space-y-2">
                                    <label
                                        className="block text-sm font-semibold text-[#2d2651] font-sans"
                                        htmlFor="email"
                                    >
                                        Email Address
                                    </label>
                                    <div className="relative group">
                                        <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b3b0c7] text-lg" />
                                        <input
                                            className="w-full bg-[#f3f1fa] border border-[#e0def0] rounded-lg px-10 py-3 text-[#2d2651] focus:ring-2 focus:ring-[#4b3fa7] focus:bg-white transition-all duration-300 peer outline-none placeholder:text-[#b3b0c7]"
                                            id="email"
                                            name="email"
                                            placeholder="name@medcore.com"
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label
                                            className="block text-sm font-semibold text-[#2d2651] font-sans"
                                            htmlFor="password"
                                        >
                                            Password
                                        </label>
                                        <a
                                            className="text-xs font-semibold text-[#4b3fa7] hover:underline underline-offset-4 transition-all"
                                            href="#"
                                        >
                                            Olvidó la contraseña?
                                        </a>
                                    </div>
                                    <div className="relative group">
                                        <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b3b0c7] text-lg" />
                                        <input
                                            className="w-full bg-[#f3f1fa] border border-[#e0def0] rounded-lg px-10 py-3 text-[#2d2651] focus:ring-2 focus:ring-[#4b3fa7] focus:bg-white transition-all duration-300 peer outline-none placeholder:text-[#b3b0c7]"
                                            id="password"
                                            name="password"
                                            placeholder="••••••••"
                                            type="password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button
                                        className="w-full bg-[#2d2651] text-white py-4 rounded-lg font-bold text-base tracking-widest uppercase hover:bg-[#1a1533] active:scale-[0.98] transition-all shadow-lg"
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? 'Ingresando...' : 'Ingresar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>
                </div>
            </main>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow max-w-md mx-auto">
                <h2 className="text-lg font-semibold mb-4">Cargar resultado de electro (PDF)</h2>
                <form className="flex flex-col gap-4" onSubmit={handleUpload}>
                    <input
                        className="border rounded p-2"
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                    />
                    <button
                        type="submit"
                        className="bg-blue-700 text-white rounded px-4 py-2 hover:bg-blue-800"
                        disabled={loading}
                    >
                        {loading ? 'Subiendo...' : 'Subir PDF'}
                    </button>
                </form>
                <button
                    className="mt-4 text-red-600 underline"
                    onClick={handleLogout}
                >
                    Cerrar sesión
                </button>
            </div>
        </div>
    );
}

export default Upload;
