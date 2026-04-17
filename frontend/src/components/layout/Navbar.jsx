import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <header className="bg-institucion-primary text-white shadow-xl">
            <div className="max-w-6xl mx-auto relative flex items-center px-4 py-3">
                <div className="flex items-center">
                    <img
                        src="/images/Caminos.png"
                        alt="Logo Caminos"
                        className="h-10 w-auto"
                    />
                    <span className="pl-[5px]  font-semibold md:text-base text-lg">
                        Caminos IPS
                    </span>
                </div>

                <h1 className="absolute left-1/2 -translate-x-1/2 text-lg md:text-xl font-bold tracking-wide text-center">
                    Consulta de Resultados
                </h1>

                <nav className="ml-auto flex items-center gap-4">
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
