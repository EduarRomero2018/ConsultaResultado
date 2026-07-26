import React from 'react';
import Swal from 'sweetalert2';
import api from '../utils/api';

function ResultsTable({ results }) {
    if (!results || results.length === 0) return null;

    const formatDate = (value) => {
        if (!value) return '';
        const datePart = String(value).split('T')[0];
        return datePart;
    };

    const handleDownload = async (file_id) => {
        try {
            const { data } = await api.get(`/api/download/${file_id}`);
            window.location.href = data.url;
        } catch (err) {
            Swal.fire('Error', 'No se pudo descargar el archivo', 'error');
        }
    };

    return (
        <div className="overflow-hidden rounded-xl border border-[#e7e2f5]">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="bg-[#f3f1fa] text-[#2d2651]">
                        <th className="border border-[#e7e2f5] px-4 py-3 text-left font-semibold">Archivo</th>
                        <th className="border border-[#e7e2f5] px-4 py-3 text-left font-semibold">Fecha de realización</th>
                        <th className="border border-[#e7e2f5] px-4 py-3 text-center font-semibold">Descargar</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map((r, index) => (
                        <tr key={r.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#fcfbff]'}>
                            <td className="border border-[#f0ecfa] px-4 py-3 text-[#2d2651]">{r.file_name}</td>
                            <td className="border border-[#f0ecfa] px-4 py-3 text-[#4b4860]">{formatDate(r.date_performed)}</td>
                            <td className="border border-[#f0ecfa] px-4 py-3 text-center">
                                <button
                                    className="mx-auto inline-flex items-center gap-2 rounded-lg border border-[#d8d1f0] bg-[#f7f5fc] px-3 py-2 text-sm font-semibold text-[#2d2651] transition-all hover:bg-[#ece7fa] hover:border-[#c8bee9]"
                                    onClick={() => handleDownload(r.id)}
                                    title="Descargar PDF"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
                                    Descargar PDF
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ResultsTable;
