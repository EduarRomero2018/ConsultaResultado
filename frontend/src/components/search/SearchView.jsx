import React from 'react';
import { FaIdCard, FaHashtag } from 'react-icons/fa';
import ResultsTable from '../../components/ResultsTable';
import { DOCUMENT_TYPES } from '../../utils/constants';

function SearchView({
    documentType,
    documentNumber,
    results,
    loading,
    onDocumentTypeChange,
    onDocumentNumberChange,
    onSubmit,
}) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-start px-4 py-8">
            <div className="flex w-full max-w-7xl min-h-[72vh] overflow-hidden rounded-3xl shadow-2xl bg-white/0">
                <section className="hidden md:flex w-[52%] bg-white relative flex-col items-center justify-center text-[#2d2651] min-h-full overflow-hidden">
                    <div className="absolute -bottom-48 -right-24 w-[32rem] h-[32rem] rounded-full bg-[#f3f1fa] opacity-20 blur-3xl" />
                    <div className="relative z-10">
                        <img
                            src="/images/Prueba.png"
                            alt="Electro Caminos"
                            className="block h-[320px] w-auto object-contain md:h-[360px]"
                        />
                    </div>
                </section>

                <section className="flex min-h-full w-full items-center justify-center bg-institucion-primary p-6 md:w-[48%] md:p-12 lg:p-20 relative">
                    <div className="w-full max-w-lg rounded-2xl bg-white/10 backdrop-blur-md p-8 shadow-xl md:p-12">
                        <div className="mb-10">
                            <h2 className="mb-2 text-3xl font-bold text-white font-sans">
                                Consulta de Electrocardiogramas
                            </h2>
                            <p className="text-white/80 font-sans">
                                Seleccione el documento y digite el número para encontrar su resultado.
                            </p>
                        </div>

                        <form className="space-y-6" onSubmit={onSubmit}>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-white font-sans">
                                    Tipo de documento
                                </label>
                                <div className="relative group">
                                    <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-lg" />
                                    <select
                                        className="w-full appearance-none rounded-lg border border-white/20 bg-white/10 px-10 py-3 text-white outline-none transition-all duration-300 focus:bg-white/20 focus:ring-2 focus:ring-[#4b3fa7] placeholder:text-white/50"
                                        value={documentType}
                                        onChange={onDocumentTypeChange}
                                    >
                                        {DOCUMENT_TYPES.map(dt => (
                                            <option key={dt.value} value={dt.value}>
                                                {`${dt.value}: ${dt.label}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-white font-sans">
                                    Número de documento
                                </label>
                                <div className="relative group">
                                    <FaHashtag className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-lg" />
                                    <input
                                        className="w-full rounded-lg border border-white/20 bg-white/10 px-10 py-3 text-white outline-none transition-all duration-300 placeholder:text-white/50 focus:bg-white/20 focus:ring-2 focus:ring-[#4b3fa7]"
                                        type="text"
                                        placeholder="Digite el número de documento"
                                        value={documentNumber}
                                        onChange={onDocumentNumberChange}
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full rounded-lg bg-white text-[#2d2651] py-4 text-base font-bold uppercase tracking-widest shadow-lg transition-all hover:bg-gray-100 active:scale-[0.98]"
                                    disabled={loading}
                                >
                                    {loading ? 'Buscando...' : 'Buscar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            </div>

            <div className="mt-3 w-full max-w-7xl">
                {results.length > 0 && (
                    <section className="bg-[#f7f5fa]">
                        <div className="mx-auto w-full max-w-7xl rounded-2xl border border-[#e0def0] bg-white p-6 shadow-xl md:p-8">
                            <div className="mb-4 border-b border-[#ece9f7] pb-4">
                                <h3 className="text-2xl font-bold text-[#2d2651] font-sans">Resultados encontrados</h3>
                                <p className="mt-1 text-sm text-gray-500">Descargue el archivo PDF correspondiente al resultado del paciente.</p>
                            </div>
                            <ResultsTable results={results} />
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}

export default SearchView;
