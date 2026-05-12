import React, { useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../utils/api';
import Swal from 'sweetalert2';
import { MdUploadFile } from 'react-icons/md';

function Upload() {
    // Estado de autenticacion: se lee desde sessionStorage para expirar al cerrar pestaña.
    const [token, setToken] = useState(sessionStorage.getItem('token') || '');
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadResults, setUploadResults] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    // Cierra la sesion limpiando el token y el archivo seleccionado.
    const handleLogout = () => {
        setToken('');
        sessionStorage.removeItem('token');
        setFiles([]);
        setUploadResults([]);
        setUploadProgress(0);
    };

    const normalizeFiles = (fileList) => {
        const incoming = Array.from(fileList || []);
        const onlyPdf = incoming.filter(file => file.type === 'application/pdf');
        const unique = new Map(files.map(file => [file.name, file]));
        onlyPdf.forEach(file => unique.set(file.name, file));
        const merged = Array.from(unique.values());
        if (merged.length > 30) {
            Swal.fire('Límite excedido', 'Solo se permiten hasta 30 archivos por lote', 'warning');
            return files;
        }
        return merged;
    };

    // Guarda los archivos PDF elegidos por el usuario.
    const handleFileChange = (e) => {
        const nextFiles = normalizeFiles(e.target.files);
        setFiles(nextFiles);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const nextFiles = normalizeFiles(e.dataTransfer.files);
        setFiles(nextFiles);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = () => {
        setDragActive(false);
    };

    const handleRemoveFile = (name) => {
        setFiles(prev => prev.filter(file => file.name !== name));
    };

    const handleSelectClick = () => {
        fileInputRef.current?.click();
    };

    // Envia el PDF al backend usando multipart/form-data.
    const handleUpload = async (e) => {
        e.preventDefault();
        if (files.length === 0) {
            Swal.fire('Error', 'Selecciona al menos un archivo PDF', 'error');
            return;
        }
        setLoading(true);
        setUploadProgress(0);
        setUploadResults([]);
        try {
            const formData = new FormData();
            files.forEach(file => formData.append('files', file));
            const { data } = await api.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (event) => {
                    if (!event.total) {
                        return;
                    }
                    const percent = Math.round((event.loaded * 100) / event.total);
                    setUploadProgress(percent);
                }
            });

            setUploadResults(data.results || []);
            const summary = data.summary || { total: 0, success: 0, failed: 0 };
            if (summary.failed > 0) {
                Swal.fire(
                    'Carga parcial',
                    `Subidos: ${summary.success}, Fallidos: ${summary.failed}`,
                    'warning'
                );
            } else {

                Swal.fire({
                    icon: 'Success',
                    title: 'Éxito',
                    text: '`Archivos subidos: ${summary.success}`',
                    timer: 5000,
                    timerProgressBar: true,
                    // showConfirmButton: true,
                    // confirmButtonText: 'OK',
                });

            }
            if (summary.failed === 0) {
                setFiles([]);
            }
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
            <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto w-full">
                <h2 className="text-lg font-semibold mb-4">Cargar resultados de electro (PDF)</h2>
                <form className="flex flex-col gap-4" onSubmit={handleUpload}>
                    <div
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition ${dragActive ? 'border-[#4b3fa7] bg-[#f7f5fa]' : 'border-[#e0def0]'}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <MdUploadFile className="text-4xl text-[#2d2651]" />
                            <p className="text-sm text-gray-600">Arrastra y suelta tus archivos PDF aquí</p>
                            <button
                                type="button"
                                className="mt-2 rounded-lg bg-[#2d2651] px-4 py-2 text-white text-sm font-semibold hover:bg-[#1a1533]"
                                onClick={handleSelectClick}
                            >
                                Seleccionar archivos
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="application/pdf"
                                multiple
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <p className="text-xs text-gray-500">Máximo 30 archivos por lote</p>
                        </div>
                    </div>

                    {files.length > 0 && (
                        <div className="rounded-xl border border-[#ece9f7]">
                            <div className="flex items-center justify-between px-4 py-2 bg-[#f7f5fa]">
                                <span className="text-sm font-semibold text-[#2d2651]">Archivos seleccionados</span>
                                <span className="text-xs text-gray-500">{files.length} archivo(s)</span>
                            </div>
                            <ul className="max-h-48 overflow-auto divide-y divide-[#ece9f7]">
                                {files.map(file => (
                                    <li key={file.name} className="flex items-center justify-between px-4 py-2 text-sm">
                                        <span className="text-gray-700 truncate pr-2">{file.name}</span>
                                        <button
                                            type="button"
                                            className="text-red-600 text-xs hover:underline"
                                            onClick={() => handleRemoveFile(file.name)}
                                        >
                                            Quitar
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {loading && (
                        <div className="w-full">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                <span>Subiendo archivos</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-[#ece9f7]">
                                <div
                                    className="h-2 rounded-full bg-[#2d2651] transition-all"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {uploadResults.length > 0 && (
                        <div className="rounded-xl border border-[#ece9f7]">
                            <div className="px-4 py-2 bg-[#f7f5fa]">
                                <span className="text-sm font-semibold text-[#2d2651]">Resumen de carga</span>
                            </div>
                            <ul className="max-h-48 overflow-auto divide-y divide-[#ece9f7]">
                                {uploadResults.map(item => (
                                    <li key={item.file_name} className="px-4 py-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-700 truncate pr-2">{item.file_name}</span>
                                            <span className={item.status === 'ok' ? 'text-green-600' : 'text-red-600'}>
                                                {item.status === 'ok' ? 'Cargado' : 'Error'}
                                            </span>
                                        </div>
                                        {item.status === 'error' && (
                                            <p className="text-xs text-red-500 mt-1">{item.message}</p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            className="bg-institucion-primary text-white rounded px-4 py-2 hover:bg-institucion-secondary transition disabled:opacity-20"
                            disabled={loading}
                        >
                            {loading ? 'Subiendo...' : 'Subir PDFs'}
                        </button>
                        <button
                            type="button"
                            className="text-red-600 text-sm underline"
                            onClick={handleLogout}
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Upload;
