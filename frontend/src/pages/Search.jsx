import React, { useState } from 'react';
import { FaIdCard, FaHashtag } from 'react-icons/fa';
import api from '../utils/api';
import { DOCUMENT_TYPES } from '../utils/constants';
import ResultsTable from '../components/ResultsTable';
import Swal from 'sweetalert2';

function Search() {
    const [documentType, setDocumentType] = useState('CC');
    const [documentNumber, setDocumentNumber] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!documentNumber) {
            Swal.fire('Error', 'Debes ingresar el número de documento', 'error');
            return;
        }
        setLoading(true);
        setResults([]);
        try {
            const { data } = await api.get('/api/results', {
                params: { document_type: documentType, document_number: documentNumber }
            });
            setResults(data);
            if (data.length === 0) {
                Swal.fire('Sin resultados', 'No se encontraron resultados para este documento', 'info');
            }
        } catch (err) {
            Swal.fire('Error', err.response?.data?.error || 'Error al buscar resultados', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white p-6 principal rounded shadow">
                <h2 className="text-lg font-semibold mb-4">Consulta de Resultados</h2>
                <form className="flex flex-col gap-4 mb-6" onSubmit={handleSearch}>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <FaIdCard />
                            </span>
                            <select
                                className="border rounded p-2 pl-10 w-full"
                                value={documentType}
                                onChange={e => setDocumentType(e.target.value)}
                            >
                                {DOCUMENT_TYPES.map(dt => (
                                    <option key={dt.value} value={dt.value}>{dt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <FaHashtag />
                            </span>
                            <input
                                className="border rounded p-2 pl-10 w-full"
                                type="text"
                                placeholder="Número de documento"
                                value={documentNumber}
                                onChange={e => setDocumentNumber(e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-700 text-white rounded px-4 py-2 hover:bg-blue-800"
                        disabled={loading}
                    >
                        {loading ? 'Buscando...' : 'Buscar'}
                    </button>
                </form>
                <ResultsTable results={results} />
            </div>
        </div>
    );
}

export default Search;
