import React from 'react';
import Swal from 'sweetalert2';
import api from '../utils/api';

function ResultsTable({ results }) {
    if (!results || results.length === 0) return null;

    const handleDownload = async (file_id, file_name) => {
        try {
            const response = await api.get(`/api/download/${file_id}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file_name);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            Swal.fire('Error', 'No se pudo descargar el archivo', 'error');
        }
    };

    return (
        <table className="w-full border mt-4 text-sm">
            <thead>
                <tr className="bg-gray-100">
                    <th className="p-2 border">Archivo</th>
                    <th className="p-2 border">Fecha de realización</th>
                    <th className="p-2 border">Descargar</th>
                </tr>
            </thead>
            <tbody>
                {results.map(r => (
                    <tr key={r.id} className="text-center">
                        <td className="border p-2">{r.file_name}</td>
                        <td className="border p-2">{r.date_performed}</td>
                        <td className="border p-2">
                            <button
                                className="text-blue-700 hover:underline flex items-center gap-1 mx-auto"
                                onClick={() => handleDownload(r.id, r.file_name)}
                                title="Descargar PDF"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
                                PDF
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default ResultsTable;
