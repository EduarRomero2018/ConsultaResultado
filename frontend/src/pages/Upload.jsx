import React, { useState } from 'react';
import api from '../utils/api';
import Swal from 'sweetalert2';
import { FaEnvelope, FaLock } from 'react-icons/fa';

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
            <div className="min-h-screen flex items-center justify-center ">
                <div className="bg-white p-6 rounded shadow max-w-md mx-auto">
                    <h2 className="text-lg font-semibold mb-4 justify-center flex items-center">Iniciar sesión</h2>
                    <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <FaEnvelope />
                            </span>
                            <input
                                className="border rounded p-2 pl-10 w-full"
                                type="email"
                                placeholder="Correo electrónico"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <FaLock />
                            </span>
                            <input
                                className="border rounded p-2 pl-10 w-full"
                                type="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-700 text-white rounded px-4 py-2 hover:bg-blue-800"
                            disabled={loading}
                        >
                            {loading ? 'Ingresando...' : 'Ingresar'}
                        </button>
                    </form>
                </div>
            </div>
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
