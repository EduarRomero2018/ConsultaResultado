import React from 'react';
import { MdUploadFile } from 'react-icons/md';

function UploadView({
    files,
    loading,
    uploadProgress,
    uploadResults,
    dragActive,
    fileInputRef,
    onSubmit,
    onDrop,
    onDragOver,
    onDragLeave,
    onSelectClick,
    onFileChange,
    onRemoveFile,
}) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto w-full border border-[#2d2651]">
                <h2 className="text-lg font-semibold mb-4 text-center">Cargar resultados de electro (PDF)</h2>
                <form className="flex flex-col gap-4" onSubmit={onSubmit}>
                    <div
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition ${dragActive ? 'border-[#4b3fa7] bg-[#f7f5fa]' : 'border-[#e0def0]'}`}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <MdUploadFile className="text-4xl text-[#2d2651]" />
                            <p className="text-sm text-gray-600">Arrastra y suelta tus archivos PDF aquí</p>
                            <button
                                type="button"
                                className="mt-2 rounded-lg bg-[#2d2651] px-4 py-2 text-white text-sm font-semibold hover:bg-[#1a1533]"
                                onClick={onSelectClick}
                            >
                                Seleccionar archivos
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="application/pdf"
                                multiple
                                className="hidden"
                                onChange={onFileChange}
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
                                            onClick={() => onRemoveFile(file.name)}
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
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UploadView;
