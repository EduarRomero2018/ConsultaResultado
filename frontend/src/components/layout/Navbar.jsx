import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <header className="bg-institucion-primary text-white shadow-lg">
            <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
                <h1 className="text-xl font-bold tracking-wide">
                    Consulta de Resultados de Electro
                </h1>
                <nav className="flex gap-4">
                    <Link
                        to="/search"
                        className={`px-3 py-1 rounded transition-colors ${isActive('/search')
                            ? 'bg-white text-blue-700 font-semibold'
                            : 'hover:bg-indigo-600'
                            }`}
                    >
                        Buscar
                    </Link>
                    <Link
                        to="/upload"
                        className={`px-3 py-1 rounded transition-colors ${isActive('/upload')
                            ? 'bg-white text-blue-700 font-semibold'
                            : 'hover:bg-blue-600'
                            }`}
                    >
                        Subir
                    </Link>
                </nav>
            </div>
        </header>
    );
}

export default Navbar;
