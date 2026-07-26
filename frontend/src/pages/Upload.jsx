import React, { useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../utils/api';
import Swal from 'sweetalert2';
import UploadView from '../components/upload/UploadView';

// Peso máximo permitido por archivo PDF (en MB). Debe coincidir con el
// limits.fileSize configurado en Multer, backend/routes/upload.js.
const MAX_FILE_SIZE_MB = 20;

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

        const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
        const oversized = onlyPdf.filter(file => file.size > maxBytes);
        const withinLimit = onlyPdf.filter(file => file.size <= maxBytes);
        if (oversized.length > 0) {
            Swal.fire(
                'Archivo demasiado grande',
                `No se pudo cargar: ${oversized.map(file => file.name).join(', ')}. El peso supera el máximo permitido de ${MAX_FILE_SIZE_MB}MB por archivo.`,
                'warning'
            );
        }

        const unique = new Map(files.map(file => [file.name, file]));
        withinLimit.forEach(file => unique.set(file.name, file));
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
        <UploadView
            files={files}
            loading={loading}
            uploadProgress={uploadProgress}
            uploadResults={uploadResults}
            dragActive={dragActive}
            fileInputRef={fileInputRef}
            onSubmit={handleUpload}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onSelectClick={handleSelectClick}
            onFileChange={handleFileChange}
            onRemoveFile={handleRemoveFile}
        />
    );
}

export default Upload;
