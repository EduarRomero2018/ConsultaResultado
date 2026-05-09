import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../utils/api';
import Swal from 'sweetalert2';

function Upload() {
    // Estado de autenticacion: se lee desde sessionStorage para expirar al cerrar pestaña.
    const [token, setToken] = useState(sessionStorage.getItem('token') || '');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    // Cierra la sesion limpiando el token y el archivo seleccionado.
    const handleLogout = () => {
        setToken('');
        sessionStorage.removeItem('token');
        setFile(null);
    };

    // Guarda el archivo PDF elegido por el usuario.
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Envia el PDF al backend usando multipart/form-data.
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
            if (err.response?.status === 409) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Resultado duplicado',
                    text: err.response?.data?.error || 'Ya existe un resultado para esa fecha',
                    timer: 10000,
                    timerProgressBar: true,
                    showConfirmButton: true,
                    confirmButtonText: 'OK',
                });
                return;
            }
            Swal.fire('Error', err.response?.data?.error || 'Error al subir archivo', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Si no hay token, se redirige al login unificado.
    if (!token) {
        return <Navigate to="/login" replace />;
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
