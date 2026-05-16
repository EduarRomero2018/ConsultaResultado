import React, { useState } from 'react';
import api from '../utils/api';
import Swal from 'sweetalert2';
import SearchView from '../components/search/SearchView';

function Search() {
    const [documentType, setDocumentType] = useState('CC');
    const [documentNumber, setDocumentNumber] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // Ejecuta la busqueda con los parametros del documento.
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!documentNumber) {
            Swal.fire('Error', 'Debes ingresar el número de documento', 'error');
            return;
        }
        setLoading(true);
        setResults([]);
        try {
            // Consulta el backend con el tipo y numero de documento.
            const { data } = await api.get('/api/results', {
                params: { document_type: documentType, document_number: documentNumber }
            });
            setResults(data);
            if (data.length === 0) {

                // Notifica que no se encontraron resultados.
                Swal.fire({
                    icon: 'info',
                    title: 'Sin resultados',
                    text: 'No se encontraron resultados para este documento',
                    timer: 5000,
                    timerProgressBar: true,
                    // showConfirmButton: true,
                    // confirmButtonText: 'OK',
                });
            }
        } catch (err) {
            Swal.fire('Error', err.response?.data?.error || 'Error al buscar resultados', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        // Renderiza la vista de busqueda con los resultados y estados correspondientes.
        <SearchView
            documentType={documentType}
            documentNumber={documentNumber}
            results={results}
            loading={loading}
            onDocumentTypeChange={(e) => setDocumentType(e.target.value)}
            onDocumentNumberChange={(e) => setDocumentNumber(e.target.value)}
            onSubmit={handleSearch}
        />
    );
}

export default Search;
